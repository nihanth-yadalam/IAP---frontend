import axios from "axios";

// ─────────────────────────────────────────────────────────────────────────────
// Axios Instance
// ─────────────────────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Auth token management ────────────────────────────────────────────────────

let authToken: string | null = localStorage.getItem("aap_token");
if (authToken) {
  axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
}

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem("aap_token", token);
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("aap_token");
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
}

// ── 401 interceptor & Offline Fallback ───────────────────────────────────────────

let mockTasks: any[] = [
    { id: 101, title: "Math Assignment", category: "Assignment", status: "Pending", priority: "High", deadline: new Date(Date.now() + 86400000).toISOString() },
    { id: 102, title: "Physics Lab", category: "Assignment", status: "Completed", priority: "Medium", deadline: new Date(Date.now() - 86400000).toISOString() }
];
let mockCourses: any[] = [];
let mockFixedSlots: any[] = [];

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      setAuthToken(null);
      localStorage.removeItem("schedora-auth-storage");
      const path = window.location.pathname;
      if (!["/login", "/signup", "/forgot-password", "/reset-password"].includes(path)) {
        window.location.href = "/login";
      }
      return Promise.reject(err);
    }
    
    if (err.code === 'ECONNABORTED' || err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
      console.warn(`[Offline Mode] Intercepted network error for ${err.config.method?.toUpperCase()} ${err.config.url}. Returning stateful mock data.`);
      
      let mockData: any = {};
      const url = err.config.url || "";
      const method = err.config.method?.toUpperCase() || "";
      const isUrlForm = err.config.headers?.['Content-Type']?.toString().includes('x-www-form-urlencoded');
      
      let body: any = {};
      try { if (err.config.data && !isUrlForm) body = typeof err.config.data === 'string' ? JSON.parse(err.config.data) : err.config.data; } catch (e) {}

      if (url.includes('/login')) mockData = { access_token: "mock-token-123", token_type: "bearer" };
      else if (url.includes('/users/') && method === 'POST') mockData = { id: 1, email: body.email || "mock@example.com", username: body.username || "mock", profile: {} };
      else if (url.includes('/users/me')) mockData = { id: 1, email: "mock@example.com", username: "mockuser", profile: { full_name: "Mock User" }, onboarding_data: {}, google_linked: false };
      else if (url.includes('/tasks') && method === 'GET') mockData = mockTasks;
      else if (url.includes('/tasks') && method === 'POST' && url.includes('complete')) {
          const idMatch = url.match(/\/tasks\/([^/]+)\/complete/);
          if (idMatch) {
              const t = mockTasks.find(x => String(x.id) === String(idMatch[1]));
              if (t) Object.assign(t, { status: "Completed" });
              mockData = t || { id: idMatch[1], status: "Completed" };
          }
      }
      else if (url.includes('/tasks') && method === 'POST') {
          const newTask = { id: Math.floor(Math.random() * 100000), ...body, status: body.status || "Pending" };
          mockTasks.push(newTask);
          mockData = newTask;
      }
      else if (url.includes('/tasks') && (method === 'PUT' || method === 'PATCH')) {
          const idMatch = url.match(/\/tasks\/([^/]+)/);
          if (idMatch) {
              const t = mockTasks.find(x => String(x.id) === String(idMatch[1]));
              if (t) Object.assign(t, body);
              mockData = t || { id: idMatch[1], ...body };
          }
      }
      else if (url.includes('/tasks') && method === 'DELETE') {
          const idMatch = url.match(/\/tasks\/([^/]+)/);
          if (idMatch) mockTasks = mockTasks.filter(x => String(x.id) !== String(idMatch[1]));
          mockData = { ok: true };
      }
      else if (url.includes('/courses') && method === 'GET') mockData = mockCourses;
      else if (url.includes('/courses') && method === 'POST') {
          const newCourse = { id: Math.floor(Math.random() * 1000), ...body };
          mockCourses.push(newCourse); mockData = newCourse;
      }
      else if (url.includes('/courses') && method === 'DELETE') { mockData = { ok: true }; }
      else if (url.includes('/schedule/fixed') && method === 'GET') mockData = mockFixedSlots;
      else if (url.includes('/tasks') && method === 'POST' && url.includes('estimate-duration')) {
          mockData = { estimated_duration_mins: body.estimated_duration_mins || 60, reasoning: "This is a mock AI duration estimation based on the title and description provided." };
      }
      else if (url.includes('/tasks') && method === 'POST' && url.includes('recommend-slots')) {
          const slotDate = new Date(); slotDate.setDate(slotDate.getDate() + 1);
          mockData = {
              recommendations: [
                  { date: slotDate.toISOString().split('T')[0], day: "Tomorrow", start_time: "10:00:00", end_time: "12:00:00", reasoning: "Mock optimal morning slot." },
                  { date: slotDate.toISOString().split('T')[0], day: "Tomorrow", start_time: "14:00:00", end_time: "16:00:00", reasoning: "Mock optimal afternoon slot." }
              ]
          };
      }
      else if (url.includes('/tasks') && method === 'POST' && url.includes('confirm-slot')) {
          const t = mockTasks.find(x => String(x.id) === String(body.task_id));
          if (t) {
              t.planned_start = `${body.scheduled_date}T${body.scheduled_start_time}Z`;
              t.planned_end = `${body.scheduled_date}T${body.scheduled_end_time}Z`;
          }
          mockData = t || { id: body.task_id, status: "Pending" };
      }
      else if (url.includes('/onboarding/status')) mockData = { is_complete: true };
      else mockData = { ok: true, status: "mocked" };

      return Promise.resolve({ data: mockData, status: 200, statusText: 'OK', headers: {}, config: err.config });
    }
    return Promise.reject(err);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Data Transformation Helpers
// ─────────────────────────────────────────────────────────────────────────────

// ── Task enums ───────────────────────────────────────────────────────────────

const PRIORITY_TO_BACKEND: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};
const PRIORITY_TO_FRONTEND: Record<string, string> = {
  High: "high",
  Medium: "medium",
  Low: "low",
};

const CATEGORY_TO_BACKEND: Record<string, string> = {
  assignment: "Assignment",
  exam: "Exam",
  extra: "Study", // frontend "extra" → backend "Study"
};
const CATEGORY_TO_FRONTEND: Record<string, string> = {
  Assignment: "assignment",
  Exam: "exam",
  Study: "extra",
  Project: "extra",
  Other: "extra",
};

const STATUS_TO_BACKEND: Record<string, string> = {
  pending: "Pending",
  completed: "Completed",
  dropped: "Pending", // backend has no "dropped"; map to Pending
};
const STATUS_TO_FRONTEND: Record<string, string> = {
  Pending: "pending",
  "In Progress": "pending",
  "In_Progress": "pending",
  Blocked: "pending",
  Completed: "completed",
};

// ── Day-of-week mapping ──────────────────────────────────────────────────────

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// ── Transform a backend task → frontend task ─────────────────────────────────

function taskFromBackend(t: any): any {
  return {
    id: String(t.id),
    title: t.title,
    description: t.description ?? null,
    deadline: t.deadline,
    category: CATEGORY_TO_FRONTEND[t.category] ?? "assignment",
    status: STATUS_TO_FRONTEND[t.status] ?? "pending",
    priority: PRIORITY_TO_FRONTEND[t.priority] ?? "medium",
    planned_start: t.scheduled_start_time ?? null,
    planned_end: t.scheduled_end_time ?? null,
    course_id: t.course_id ?? null,
    course: t.course ?? null,
    estimated_duration_mins: t.estimated_duration_mins ?? null,
    actual_duration_mins: t.actual_duration_mins ?? null,
    drain_intensity: t.drain_intensity ?? null,
    completed_at: t.completed_at ?? null,
  };
}

// ── Transform a frontend task → backend task ─────────────────────────────────

function taskToBackend(t: any): any {
  const out: any = {};
  if (t.title !== undefined) out.title = t.title;
  if (t.description !== undefined) out.description = t.description;
  if (t.deadline !== undefined) out.deadline = t.deadline;
  if (t.priority !== undefined)
    out.priority = PRIORITY_TO_BACKEND[t.priority] ?? "Medium";
  if (t.category !== undefined)
    out.category = CATEGORY_TO_BACKEND[t.category] ?? "Assignment";
  if (t.status !== undefined)
    out.status = STATUS_TO_BACKEND[t.status] ?? "Pending";

  // Backend requires both scheduled_start_time and scheduled_end_time, or neither
  if (t.planned_start) {
    out.scheduled_start_time = t.planned_start;
    // If planned_end isn't provided, use deadline as end time
    out.scheduled_end_time = t.planned_end || t.deadline || null;
  } else if (t.planned_end) {
    out.scheduled_end_time = t.planned_end;
  }

  if (t.estimated_duration_mins !== undefined)
    out.estimated_duration_mins = t.estimated_duration_mins;

  // course_id must be an integer or null — frontend sends string IDs
  if (t.course_id !== undefined && t.course_id !== null && t.course_id !== "other") {
    const parsed = parseInt(t.course_id, 10);
    out.course_id = isNaN(parsed) ? null : parsed;
  }

  if (t.actual_duration_mins !== undefined) out.actual_duration_mins = t.actual_duration_mins;
  if (t.drain_intensity !== undefined) out.drain_intensity = t.drain_intensity;
  if (t.completed_at !== undefined) out.completed_at = t.completed_at;

  return out;
}

// ── Transform a backend course → frontend course ────────────────────────────

function courseFromBackend(c: any): any {
  return {
    id: String(c.id),
    name: c.name,
    code: c.code ?? c.name
      ?.split(/\s+/)
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 4) ?? "",
    color: c.color_code ?? "#6366f1",
    term: c.term ?? "",
    is_archived: c.is_archived ?? false,
  };
}

// ── Transform a frontend course → backend course ────────────────────────────

function courseToBackend(c: any): any {
  const out: any = {};
  if (c.name !== undefined) out.name = c.name;
  if (c.code !== undefined) out.code = c.code;
  if (c.color !== undefined) out.color_code = c.color;
  if (c.term !== undefined) out.term = c.term;
  if (c.is_archived !== undefined) out.is_archived = c.is_archived;
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API — drop-in replacement for the old mock
// ─────────────────────────────────────────────────────────────────────────────

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type ApiRes<T = any> = { data: T };

export const api = {
  get: (path: string) => route("GET", path),
  post: (path: string, body?: any) => route("POST", path, body),
  put: (path: string, body?: any) => route("PUT", path, body),
  patch: (path: string, body?: any) => route("PATCH", path, body),
  delete: (path: string) => route("DELETE", path),
};

// ─────────────────────────────────────────────────────────────────────────────
// Internal Router — maps frontend paths → real backend endpoints
// ─────────────────────────────────────────────────────────────────────────────

async function route(
  method: HttpMethod,
  path: string,
  body?: any
): Promise<ApiRes<any>> {
  // ━━━ AUTH ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // [M1] Login
  if (method === "POST" && path === "/auth/login") {
    const form = new URLSearchParams();
    form.append("username", body.login); 
    form.append("password", body.password);
    const res = await axiosInstance.post("/auth/login/access-token", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    // OTP step — backend returns {status:"otp_pending", email} instead of a token
    if (res.data?.status === "otp_pending") {
      return { data: res.data };
    }
    // Normal token response (should not happen now, but keep as fallback)
    try {
      const res = await axiosInstance.post("/auth/login/access-token", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const token = res.data?.access_token;
        if (tz && token) {
          await axiosInstance.put("/users/me/timezone", { tz }, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } catch (e) {
        console.warn("Auto-detect timezone failed", e);
      }

      return { data: res.data };
    } catch (e: any) {
      if (e.code === 'ECONNABORTED' || e.message === 'Network Error' || e.code === 'ERR_NETWORK') {
        console.warn("Backend unreachable. Falling back to mock login.");
        return { data: { access_token: "mock-token-123", token_type: "bearer" } };
      }
      throw e;
    }
  }

  // [M2] Register
  if (method === "POST" && path === "/auth/signup") {
    try {
      const res = await axiosInstance.post("/users/", {
        email: body.email,
        username: body.username,
        password: body.password,
      });
      return { data: res.data };
    } catch (e: any) {
      if (e.code === 'ECONNABORTED' || e.message === 'Network Error' || e.code === 'ERR_NETWORK') {
        console.warn("Backend unreachable. Falling back to mock signup.");
        return { data: { id: "mock-new-user-1", email: body.email, username: body.username } };
      }
      throw e;
    }
  }

  // Confirm email
  if (method === "POST" && path === "/auth/confirm-email") {
    const res = await axiosInstance.post("/auth/confirm-email", { token: body.token });
    return { data: res.data };
  }

  // Resend confirmation email
  if (method === "POST" && path === "/auth/resend-confirmation") {
    const res = await axiosInstance.post(`/auth/resend-confirmation?email=${encodeURIComponent(body.email)}`);
    return { data: res.data };
  }

  // [M5] Get current user — flatten profile into top-level fields
  if (method === "GET" && path === "/auth/me") {
    try {
      const res = await axiosInstance.get("/users/me");
      const u = res.data;
      const profile = u.profile ?? {};
      const onboarding = profile.onboarding_data ?? {};
      return {
        data: {
          id: String(u.id),
          email: u.email,
          username: u.username,
          name: profile.full_name || u.username,
          university: profile.university || "",
          major: profile.major || "",
          chronotype: onboarding.chronotype || "balanced",
          work_style: onboarding.work_style || "mixed",
          preferred_session_mins: onboarding.preferred_session_mins || 60,
          avatar_url: null,
          google_linked: u.google_linked ?? false,
          profile: profile,
        },
      };
    } catch (e: any) {
      if (e.code === 'ECONNABORTED' || e.message === 'Network Error' || e.code === 'ERR_NETWORK') {
        console.warn("Backend unreachable. Falling back to mock user.");
        return {
          data: {
            id: "mock-user-1", email: "mock@example.com", username: "mockuser",
            name: "Mock User", university: "", major: "", chronotype: "balanced",
            work_style: "mixed", preferred_session_mins: 60, avatar_url: null, google_linked: false, profile: {}
          }
        };
      }
      throw e;
    }
  }

  // [M8] Password recovery
  if (method === "POST" && path === "/auth/forgot-password") {
    const email = body.email;
    const res = await axiosInstance.post(
      `/users/password-recovery/${encodeURIComponent(email)}`
    );
    return { data: res.data };
  }

  // [M9] Reset password (via email token)
  if (method === "POST" && path === "/auth/reset-password") {
    const res = await axiosInstance.post("/users/reset-password", {
      token: body.token,
      new_password: body.new_password,
    });
    return { data: res.data };
  }

  // [M7] Change password (authenticated, from Settings)
  if (method === "POST" && path === "/auth/change-password") {
    const res = await axiosInstance.post("/users/me/password", {
      current_password: body.current_password,
      new_password: body.new_password,
    });
    return { data: res.data };
  }

  // ━━━ ONBOARDING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // [M11] Onboarding status
  if (method === "GET" && path === "/onboarding/status") {
    const res = await axiosInstance.get("/onboarding/status");
    return { data: res.data };
  }

  // [M12] Submit questionnaire
  if (method === "POST" && path === "/profile/baseline") {
    const res = await axiosInstance.post(
      "/onboarding/questionnaire",
      body
    );
    return { data: res.data };
  }

  // ━━━ BUSY / FIXED SLOTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // [M21] List fixed slots
  if (method === "GET" && path === "/schedule/fixed") {
    const res = await axiosInstance.get("/schedule/fixed");
    return { data: res.data };
  }

  // [M22] Bulk-create recurring slots (onboarding)
  if (method === "POST" && path === "/busy-slots/bulk") {
    const slots = (body.slots ?? []).map((s: any) => ({
      day_of_week: DAY_NAMES[s.day_of_week] ?? "Monday",
      start_time: `${String(s.start_hour).padStart(2, "0")}:00:00`,
      end_time: `${String(s.end_hour).padStart(2, "0")}:00:00`,
      label: s.title || "Busy",
    }));
    const res = await axiosInstance.post("/schedule/fixed", slots);
    return { data: res.data };
  }

  // ━━━ TASKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // [M17] List tasks
  if (method === "GET" && path === "/tasks") {
    const res = await axiosInstance.get("/tasks/");
    return { data: (res.data ?? []).map(taskFromBackend) };
  }

  // [M18] Create task
  if (method === "POST" && path === "/tasks") {
    const payload = taskToBackend(body);
    const res = await axiosInstance.post("/tasks/", payload);
    return { data: taskFromBackend(res.data) };
  }

  // [M28] Estimate Duration
  if (method === "POST" && path === "/tasks/estimate-duration") {
    const res = await axiosInstance.post("/tasks/estimate-duration", body);
    return { data: res.data }; // returns {"estimated_duration_mins": ..., "reasoning": ...}
  }

  // [M29] Recommend Slots
  if (method === "POST" && path === "/tasks/recommend-slots") {
    const res = await axiosInstance.post("/tasks/recommend-slots", body);
    return { data: res.data }; // returns {"recommendations": [...]}
  }

  // [M20] Delete task  (check before update so regex doesn't capture first)
  const taskIdMatch = path.match(/^\/tasks\/([^/]+)$/);

  if (method === "DELETE" && taskIdMatch) {
    const id = taskIdMatch[1];
    const res = await axiosInstance.delete(`/tasks/${id}`);
    return { data: res.data };
  }

  // [M19] Update task  (frontend calls PUT, backend is PATCH)
  if ((method === "PUT" || method === "PATCH") && taskIdMatch) {
    const id = taskIdMatch[1];
    const payload = taskToBackend(body);
    const res = await axiosInstance.patch(`/tasks/${id}`, payload);
    return { data: taskFromBackend(res.data) };
  }

  // Complete task → PATCH status to Completed
  const completeMatch = path.match(/^\/tasks\/([^/]+)\/complete$/);
  if (method === "POST" && completeMatch) {
    const id = completeMatch[1];
    const res = await axiosInstance.patch(`/tasks/${id}`, {
      status: "Completed",
      actual_duration_mins: body.actualMinutes,
      drain_intensity: body.drainIntensity,
      completed_at: new Date().toISOString()
    });
    return { data: taskFromBackend(res.data) };
  }

  // [M30] Confirm AI Slot
  if (method === "POST" && path === "/tasks/confirm-slot") {
    const res = await axiosInstance.post("/tasks/confirm-slot", body);
    return { data: taskFromBackend(res.data) };
  }

  // ━━━ COURSES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // [M13] List courses
  if (method === "GET" && path === "/courses") {
    const res = await axiosInstance.get("/courses/");
    return { data: (res.data ?? []).map(courseFromBackend) };
  }

  // [M14] Create course
  if (method === "POST" && path === "/courses") {
    const payload = courseToBackend(body);
    const res = await axiosInstance.post("/courses/", payload);
    return { data: courseFromBackend(res.data) };
  }

  // Course update / delete
  const courseIdMatch = path.match(/^\/courses\/([^/]+)$/);

  // [M16] Delete course
  if (method === "DELETE" && courseIdMatch) {
    const id = courseIdMatch[1];
    const res = await axiosInstance.delete(`/courses/${id}`);
    return { data: res.data };
  }

  // [M15] Update course (frontend calls PUT, backend is PATCH)
  if ((method === "PUT" || method === "PATCH") && courseIdMatch) {
    const id = courseIdMatch[1];
    const payload = courseToBackend(body);
    const res = await axiosInstance.patch(`/courses/${id}`, payload);
    return { data: courseFromBackend(res.data) };
  }

  // ━━━ SCHEDULE / SYNC ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Schedule run — no-op (backend scheduler runs in background)
  if (method === "POST" && path === "/schedule/run") {
    console.info("[api] Schedule run is handled by backend background service");
    return { data: { ok: true } };
  }

  // [M3] Google OAuth — get authorization URL
  if (method === "GET" && path === "/auth/google/authorize") {
    const res = await axiosInstance.get("/auth/google/authorize");
    return { data: res.data };
  }

  // [M26] Trigger manual Google sync
  if (method === "POST" && path === "/sync/trigger") {
    const res = await axiosInstance.post("/sync/trigger");
    return { data: res.data };
  }

  // [M28] Sync status
  if (method === "GET" && path === "/sync/status") {
    const res = await axiosInstance.get("/sync/status");
    return { data: res.data };
  }

  // [M30] Push all un-synced slots to Google
  if (method === "POST" && path === "/sync/push-all") {
    const res = await axiosInstance.post("/sync/push-all");
    return { data: res.data };
  }

  // [M31] Initialize calendar sync
  if (method === "POST" && path === "/sync/initialize") {
    const res = await axiosInstance.post("/sync/initialize");
    return { data: res.data };
  }

  // ━━━ FALLBACK ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Any unmatched path → forward directly
  console.warn(`[api] Unmatched route: ${method} ${path} — forwarding as-is`);
  const res = await axiosInstance({ method, url: path, data: body });
  return { data: res.data };
}
