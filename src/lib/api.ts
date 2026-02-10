// Frontend-only mock API (no backend required)
// Stores everything in localStorage to let the UI work end-to-end.
// When you connect a real backend later, you can replace this file with axios calls.

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type ApiResponse<T = any> = { data: T };

type User = { id: string; email: string; password: string; name?: string | null };
type Profile = {
  name?: string;
  university?: string;
  major?: string;
  chronotype?: "morning" | "balanced" | "night";
  work_style?: "deep" | "mixed" | "sprints";
  preferred_session_mins?: number;
  calendar_write_enabled?: boolean;
};

type BusySlot = { day_of_week: number; start_hour: number; end_hour: number; title?: string; slot_type: string };

type Task = {
  id: string;
  category: "exam" | "assignment" | "extra";
  title: string;
  description?: string | null;
  deadline: string; // ISO
  status: "pending" | "completed" | "dropped";
  priority: "low" | "medium" | "high";
  planned_start?: string | null;
  planned_end?: string | null;
};

type Feedback = { id: string; task_id: string; actual_duration_mins: number; drain_intensity: number; note?: string; created_at: string };

const LS = {
  users: "aap_users_v1",
  token: "aap_token",
  profile: "aap_profile_v1",
  busy: "aap_busy_v1",
  tasks: "aap_tasks_v1",
  feedback: "aap_feedback_v1",
} as const;

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid() {
  // Avoid crypto dependency for older browsers
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

function getUserIdFromToken(t: string | null): string | null {
  if (!t) return null;
  const parts = t.split(".");
  // token format: aap.<userId>.<random>
  if (parts.length >= 3 && parts[0] === "aap") return parts[1];
  return null;
}

function requireUserId(): string {
  const userId = getUserIdFromToken(authToken) ?? getUserIdFromToken(localStorage.getItem(LS.token));
  if (!userId) throw { response: { data: { detail: "Not authenticated" } } };
  return userId;
}

function getAllUsers(): User[] {
  return readJSON<User[]>(LS.users, []);
}

function saveUsers(users: User[]) {
  writeJSON(LS.users, users);
}

function getProfileMap(): Record<string, Profile> {
  return readJSON<Record<string, Profile>>(LS.profile, {});
}
function saveProfileMap(m: Record<string, Profile>) {
  writeJSON(LS.profile, m);
}

function getBusyMap(): Record<string, BusySlot[]> {
  return readJSON<Record<string, BusySlot[]>>(LS.busy, {});
}
function saveBusyMap(m: Record<string, BusySlot[]>) {
  writeJSON(LS.busy, m);
}

function getTaskMap(): Record<string, Task[]> {
  return readJSON<Record<string, Task[]>>(LS.tasks, {});
}
function saveTaskMap(m: Record<string, Task[]>) {
  writeJSON(LS.tasks, m);
}

function getFeedbackMap(): Record<string, Feedback[]> {
  return readJSON<Record<string, Feedback[]>>(LS.feedback, {});
}
function saveFeedbackMap(m: Record<string, Feedback[]>) {
  writeJSON(LS.feedback, m);
}

function ok<T>(data: T): ApiResponse<T> {
  return Promise.resolve({ data });
}

function nowISO() {
  return new Date().toISOString();
}

function scheduleTasksHeuristic(userId: string) {
  const taskMap = getTaskMap();
  const tasks = (taskMap[userId] ?? []).slice();
  const busyMap = getBusyMap();
  const busy = busyMap[userId] ?? [];

  const profile = getProfileMap()[userId] ?? {};
  const session = profile.preferred_session_mins ?? 60;

  // Simple heuristic:
  // - Sort pending tasks by deadline
  // - Place sessions in next available hours (08:00-22:00), skipping fixed busy slots (hour granularity)
  const pending = tasks
    .filter(t => t.status === "pending")
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  // Build busy lookup: day(0-6)-hour => busy
  const busySet = new Set<string>();
  for (const s of busy) {
    for (let h = s.start_hour; h < s.end_hour; h++) busySet.add(`${s.day_of_week}-${h}`);
  }

  const start = new Date();
  start.setMinutes(0, 0, 0);

  function isBusy(dt: Date) {
    const d = dt.getDay(); // 0 Sunday
    const dow = (d + 6) % 7; // convert to 0 Monday ... 6 Sunday
    const h = dt.getHours();
    return busySet.has(`${dow}-${h}`);
  }

  // pick start hour based on chronotype
  const chrono = profile.chronotype ?? "balanced";
  const preferredStart = chrono === "morning" ? 8 : chrono === "night" ? 12 : 10;

  let cursor = new Date(start);
  if (cursor.getHours() < preferredStart) cursor.setHours(preferredStart);

  for (const t of pending) {
    // allocate one block for now (MVP). planned_end = start + session minutes
    // Find next available hour slot that isn't busy and within 08-22
    while (true) {
      const h = cursor.getHours();
      if (h < 8) cursor.setHours(8);
      if (h >= 22) {
        cursor.setDate(cursor.getDate() + 1);
        cursor.setHours(preferredStart, 0, 0, 0);
        continue;
      }
      if (isBusy(cursor)) {
        cursor.setHours(cursor.getHours() + 1);
        continue;
      }
      break;
    }
    const plannedStart = new Date(cursor);
    const plannedEnd = new Date(cursor);
    plannedEnd.setMinutes(plannedEnd.getMinutes() + session);

    // store
    t.planned_start = plannedStart.toISOString();
    t.planned_end = plannedEnd.toISOString();

    // move cursor forward
    cursor = new Date(plannedEnd);
    cursor.setMinutes(0, 0, 0);
  }

  taskMap[userId] = tasks;
  saveTaskMap(taskMap);
}

async function handle(method: HttpMethod, path: string, body?: any): Promise<ApiResponse<any>> {
  // Auth endpoints
  if (method === "POST" && path === "/auth/signup") {
    const { name, email, password } = body ?? {};
    if (!email || !password) throw { response: { data: { detail: "Email and password required" } } };
    const users = getAllUsers();
    if (users.some(u => u.email.toLowerCase() === String(email).toLowerCase())) {
      throw { response: { data: { detail: "Email already exists" } } };
    }
    const u: User = { id: uid(), email, password, name: name ?? null };
    users.push(u);
    saveUsers(users);
    return ok({ id: u.id });
  }

  if (method === "POST" && path === "/auth/login") {
    const { email, password } = body ?? {};
    const users = getAllUsers();
    const u = users.find(x => x.email.toLowerCase() === String(email).toLowerCase());
    if (!u || u.password !== password) {
      throw { response: { data: { detail: "Invalid credentials" } } };
    }
    const token = `aap.${u.id}.${uid()}`;
    localStorage.setItem(LS.token, token);
    setAuthToken(token);
    return ok({ access_token: token, token_type: "bearer" });
  }

  if (method === "GET" && path === "/auth/me") {
    const userId = requireUserId();
    const users = getAllUsers();
    const u = users.find(x => x.id === userId);
    if (!u) throw { response: { data: { detail: "User not found" } } };
    const profile = getProfileMap()[userId] ?? {};
    return ok({ id: u.id, email: u.email, name: profile.name ?? u.name ?? null });
  }

  if (method === "POST" && path === "/auth/forgot-password") {
    // UI-only stub; in real app, send email
    return ok({ ok: true });
  }

  // Profile / onboarding
  if (method === "POST" && path === "/profile/baseline") {
    const userId = requireUserId();
    const m = getProfileMap();
    m[userId] = { ...(m[userId] ?? {}), ...(body ?? {}) };
    saveProfileMap(m);
    return ok({ ok: true });
  }

  // Busy slots
  if (method === "POST" && path === "/busy-slots/bulk") {
    const userId = requireUserId();
    const { slots } = body ?? { slots: [] };
    const m = getBusyMap();
    m[userId] = Array.isArray(slots) ? slots : [];
    saveBusyMap(m);
    return ok({ ok: true });
  }

  // Calendar prefs + connect
  if (method === "POST" && path === "/calendar/prefs") {
    const userId = requireUserId();
    const m = getProfileMap();
    m[userId] = { ...(m[userId] ?? {}), calendar_write_enabled: !!body?.write_enabled };
    saveProfileMap(m);
    return ok({ ok: true });
  }
  if (method === "GET" && path === "/calendar/google/connect-url") {
    // UI stub — just return a fake URL
    return ok({ url: "#" });
  }

  // Tasks
  if (method === "GET" && path === "/tasks") {
    const userId = requireUserId();
    const tasks = getTaskMap()[userId] ?? [];
    return ok(tasks);
  }

  if (method === "POST" && path === "/tasks") {
    const userId = requireUserId();
    const t: Task = {
      id: uid(),
      category: body?.category ?? "assignment",
      title: body?.title ?? "Untitled",
      description: body?.description ?? null,
      deadline: body?.deadline ?? nowISO(),
      status: "pending",
      priority: body?.priority ?? "medium",
      planned_start: null,
      planned_end: null,
    };
    const m = getTaskMap();
    m[userId] = [...(m[userId] ?? []), t];
    saveTaskMap(m);
    return ok(t);
  }

  // complete task endpoint: /tasks/{id}/complete
  const completeMatch = path.match(/^\/tasks\/([^/]+)\/complete$/);
  if (method === "POST" && completeMatch) {
    const userId = requireUserId();
    const id = completeMatch[1];
    const taskMap = getTaskMap();
    const tasks = taskMap[userId] ?? [];
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) throw { response: { data: { detail: "Task not found" } } };
    tasks[idx] = { ...tasks[idx], status: "completed" };
    taskMap[userId] = tasks;
    saveTaskMap(taskMap);

    const fbMap = getFeedbackMap();
    const fb: Feedback = {
      id: uid(),
      task_id: id,
      actual_duration_mins: Number(body?.actual_duration_mins ?? 60),
      drain_intensity: Number(body?.drain_intensity ?? 3),
      note: body?.note,
      created_at: nowISO(),
    };
    fbMap[userId] = [...(fbMap[userId] ?? []), fb];
    saveFeedbackMap(fbMap);

    return ok({ ok: true });
  }

  // schedule
  if (method === "POST" && path === "/schedule/run") {
    const userId = requireUserId();
    scheduleTasksHeuristic(userId);
    return ok({ ok: true });
  }

  throw { response: { data: { detail: `Mock API: Unhandled route ${method} ${path}` } } };
}

export const api = {
  get: (path: string) => handle("GET", path),
  post: (path: string, body?: any) => handle("POST", path, body),
  put: (path: string, body?: any) => handle("PUT", path, body),
  delete: (path: string) => handle("DELETE", path),
};
