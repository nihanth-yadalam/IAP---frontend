import axios, { AxiosError } from "axios";

// -----------------------------------------------------------------------------
// Types (Matched to Backend Models)
// -----------------------------------------------------------------------------

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type ApiResponse<T = any> = { data: T };

export type User = {
  id: string; // Backend uses int, but frontend treats as string mostly. Keep uniform.
  email: string;
  username: string;
  name?: string | null; // Mapped from profile.full_name
  avatar_url?: string;
  chronotype?: "morning" | "balanced" | "night"; // Mapped from profile.onboarding_data
};

type LoginResponse = {
  access_token: string;
  token_type: string;
};

// -----------------------------------------------------------------------------
// Axios Instance
// -----------------------------------------------------------------------------

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth Interceptor
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

// -----------------------------------------------------------------------------
// Helpers: Enum & Data Transformation
// -----------------------------------------------------------------------------

function mapTaskFromBackend(t: any): any {
  return {
    id: String(t.id),
    category: t.category === "Study" || t.category === "Project" ? "extra" : t.category?.toLowerCase() || "assignment",
    title: t.title,
    description: t.description,
    deadline: t.deadline,
    status: t.status === "In_Progress" ? "pending" : t.status?.toLowerCase() || "pending",
    priority: t.priority?.toLowerCase() || "medium",
    planned_start: t.scheduled_start_time,
    planned_end: t.scheduled_end_time,
    course_id: t.course_id,
  };
}

function mapTaskToBackend(t: any): any {
  let category = "Assignment";
  if (t.category === "exam") category = "Exam";
  if (t.category === "extra") category = "Study"; // Defaulting 'extra' to 'Study'

  let priority = "Medium";
  if (t.priority === "high") priority = "High";
  if (t.priority === "low") priority = "Low";

  let status = "Pending";
  if (t.status === "completed") status = "Completed";
  // 'dropped' -> keep valid status or ignore. Backend doesn't support 'dropped' explicitly.

  return {
    title: t.title,
    description: t.description,
    priority,
    category,
    status,
    deadline: t.deadline,
    scheduled_start_time: t.planned_start,
    scheduled_end_time: t.planned_end,
    estimated_duration_mins: 60, // Default or calculate
    course_id: t.course_id,
  };
}

// -----------------------------------------------------------------------------
// API Interface
// -----------------------------------------------------------------------------

async function handleRequest<T>(
  method: HttpMethod,
  path: string,
  data?: any,
  params?: any
): Promise<ApiResponse<T>> {
  try {
    const response = await axiosInstance({
      method,
      url: path,
      data,
      params,
    });
    return { data: response.data };
  } catch (error: any) {
    console.error(`API Error ${method} ${path}:`, error.response?.data || error.message);
    throw error;
  }
}

export const api = {
  get: (path: string) => handle("GET", path),
  post: (path: string, body?: any) => handle("POST", path, body),
  put: (path: string, body?: any) => handle("PUT", path, body),
  delete: (path: string) => handle("DELETE", path),
  patch: (path: string, body?: any) => handle("PATCH", path, body),
};

// Internal router to handle legacy calls from useAuthStore/useTaskStore
// and route them to correct backend endpoints.
async function handle(method: HttpMethod, path: string, body?: any): Promise<ApiResponse<any>> {
  
  // --- AUTH ---
  
  if (method === "POST" && path === "/auth/login") {
    // Backend: POST /auth/login/access-token (Form Data)
    const formData = new URLSearchParams();
    // frontend sends { login, password }
    formData.append("username", body.login);
    formData.append("password", body.password);
    
    const res = await axiosInstance.post<LoginResponse>("/auth/login/access-token", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return { data: res.data };
  }

  if (method === "POST" && path === "/auth/signup") {
    // Backend: POST /users/
    const res = await axiosInstance.post("/users/", {
      email: body.email,
      username: body.username,
      password: body.password,
    });
    return { data: res.data };
  }

  if (method === "GET" && path === "/auth/me") {
    // Backend: GET /users/me
    const res = await axiosInstance.get("/users/me");
    const u = res.data;
    // Transform: flatten profile name
    const transformed = {
        id: String(u.id),
        email: u.email,
        username: u.username,
        name: u.profile?.full_name || u.username,
        chronotype: u.profile?.onboarding_data?.chronotype || "balanced",
        avatar_url: null
    };
    return { data: transformed };
  }

  if (method === "POST" && path === "/auth/forgot-password") {
      // Backend: POST /users/password-recovery/{email}
      const email = body.email;
      await axiosInstance.post(`/users/password-recovery/${email}`);
      return { data: { ok: true } };
  }

  if (method === "POST" && path === "/auth/reset-password") {
      // Backend: POST /users/reset-password/
      await axiosInstance.post("/users/reset-password/", {
          token: body.token,
          new_password: body.new_password
      });
      return { data: { ok: true } };
  }
  
  // --- PROFILE ---

  if (method === "POST" && path === "/profile/baseline") {
    // Backend: POST /onboarding/questionnaire
    // Body is OnboardingAnswers, which matches frontend payload mostly.
    // Frontend sends: { name, university, major, chronotype, work_style, preferred_session_mins }
    const res = await axiosInstance.post("/onboarding/questionnaire", body);
    return { data: res.data };
  }

  // --- BUSY SLOTS ---
  
  if (method === "POST" && path === "/busy-slots/bulk") {
    // Backend: POST /schedule/fixed (Bulk)
    // Frontend: { slots: [...] }
    const slots = body.slots.map((s: any) => ({
        day_of_week: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][s.day_of_week] || "Monday",
        start_time: `${String(s.start_hour).padStart(2,'0')}:00:00`,
        end_time: `${String(s.end_hour).padStart(2,'0')}:00:00`,
        label: s.title || "Busy"
    }));
    const res = await axiosInstance.post("/schedule/fixed", slots);
    return { data: res.data };
  }

  // --- TASKS ---

  if (method === "GET" && path === "/tasks") {
    // Backend: GET /tasks/
    const res = await axiosInstance.get("/tasks/");
    const tasks = res.data.map(mapTaskFromBackend);
    return { data: tasks };
  }

  if (method === "POST" && path === "/tasks") {
    // Backend: POST /tasks/
    const payload = mapTaskToBackend(body);
    const res = await axiosInstance.post("/tasks/", payload);
    const t = mapTaskFromBackend(res.data);
    return { data: t };
  }
  
  // PUT /tasks/{id} -> PATCH /tasks/{id}
  const taskMatch = path.match(/^\/tasks\/([^/]+)$/);
  if ((method === "PUT" || method === "PATCH") && taskMatch) {
      const id = taskMatch[1];
      const payload = mapTaskToBackend(body);
      const res = await axiosInstance.patch(`/tasks/${id}`, payload);
      return { data: mapTaskFromBackend(res.data) };
  }
  
  if (method === "DELETE" && taskMatch) {
      const id = taskMatch[1];
      await axiosInstance.delete(`/tasks/${id}`);
      return { data: { ok: true } };
  }

  // POST /tasks/{id}/complete
  const completeMatch = path.match(/^\/tasks\/([^/]+)\/complete$/);
  if (method === "POST" && completeMatch) {
      const id = completeMatch[1];
      await axiosInstance.patch(`/tasks/${id}`, { status: "Completed" });
      return { data: { ok: true } };
  }

  // --- COURSES ---
  
  if (method === "GET" && path === "/courses") {
      const res = await axiosInstance.get("/courses/");
      return { data: res.data };
  }
  
  if (method === "POST" && path === "/courses") {
      const res = await axiosInstance.post("/courses/", body);
      return { data: res.data };
  }

  // --- SCHEDULE ---
  
  if (method === "POST" && path === "/schedule/run") {
      // Backend handles this in background. No-op.
      console.log("Triggering schedule run (handled by backend background service)");
      return { data: { ok: true } };
  }

  // Fallback for direct calls
  return handleRequest(method, path, body);
}
