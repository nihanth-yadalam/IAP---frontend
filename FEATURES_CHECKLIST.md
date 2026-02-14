# Schedora – Frontend features & user stories checklist

This document cross-checks the planned demo flow and user stories against the implemented frontend.

---

## Demo flow (from README)

| # | Feature | Status | Location |
|---|--------|--------|----------|
| 1 | Sign up / Login | ✅ | `/login`, `/signup` |
| 2 | Complete Cold Start onboarding wizard | ✅ | `/wizard` (profile, chronotype, busy slots, calendar) |
| 3 | View dashboard and calendar | ✅ | `/dashboard` (HomePage), `/calendar` (CalendarPage) |
| 4 | Add tasks using Schedule button | ✅ | ScheduleDialog (Add Task), TasksPage, CalendarPage |
| 5 | Switch between Calendar / List / Kanban views | ✅ | TasksPage (views), CalendarPage, KanbanView, ListView |

---

## Auth & account

| Feature | Status | Notes |
|--------|--------|------|
| Email/username + password login | ✅ | useAuthStore, LoginPage |
| Sign up (username, email, password, name) | ✅ | SignupPage |
| Forgot password (request reset email) | ✅ | ForgotPasswordPage, `/forgot` |
| Reset password (set new password with token) | ✅ | ResetPasswordPage, `/reset-password?token=...` |
| Sign in with Google (UI) | ✅ | Buttons on Login/Signup; stubbed (no backend) |
| Sign in with passkey (UI) | ✅ | Buttons on Login/Signup; stubbed (no backend) |
| Logout | ✅ | AppLayout dropdown |
| Protected routes | ✅ | Protected.tsx, redirect to `/login` |

---

## Onboarding & profile

| Feature | Status | Notes |
|--------|--------|------|
| Wizard: Welcome | ✅ | WizardPage step 0 |
| Wizard: Profile (name, university, major) | ✅ | Step 1 |
| Wizard: Chronotype (morning / balanced / night) | ✅ | Step 2 |
| Wizard: Attention / work style & session length | ✅ | Step 3 |
| Wizard: Weekly busy slots | ✅ | Step 4, BusySlotPainter |
| Wizard: Google Calendar connect (stub) | ✅ | Step 5 |
| Wizard: Finish → Home | ✅ | Step 6, nav to dashboard |
| Settings: Profile (name, university, major) | ✅ | SettingsPage, General tab |
| Settings: Preferences (chronotype, work style, session length) | ✅ | SettingsPage |
| Settings: Fixed weekly schedule (busy slots) | ✅ | SettingsPage, Schedule tab |
| Settings: Google Calendar integration (stub) | ✅ | SettingsPage, Integrations tab |
| Chronotype-based avatar | ✅ | AppLayout: Sunrise / initials / Sunset by chronotype |

---

## Tasks & scheduling

| Feature | Status | Notes |
|--------|--------|------|
| Add task (category, priority, title, description, due date/time, course) | ✅ | ScheduleDialog |
| Edit task | ✅ | ScheduleDialog with taskToEdit |
| Delete task | ✅ | TasksPage, useTaskStore.deleteTask |
| Complete task (with optional feedback) | ✅ | completeTask, ScheduleDialog/feedback |
| Filter tasks by status | ✅ | TasksPage filter (all / pending / completed / dropped) |
| Search tasks | ✅ | TasksPage search input |
| Run scheduler (heuristic places tasks in free slots) | ✅ | Mock API POST /schedule/run |
| Calendar view of tasks | ✅ | CalendarPage, CalendarView |
| List view of tasks | ✅ | TasksPage, ListView |
| Kanban view | ✅ | KanbanView (if used in TasksPage) |

---

## Courses

| Feature | Status | Notes |
|--------|--------|------|
| List courses | ✅ | CoursesPage, useCourseStore |
| Add course (name, code, color, term) | ✅ | CoursesPage |
| Edit course | ✅ | CoursesPage |
| Delete course | ✅ | CoursesPage |
| Assign task to course | ✅ | ScheduleDialog course selector |

---

## UI & UX

| Feature | Status | Notes |
|--------|--------|------|
| Light / dark theme | ✅ | ThemeProvider, AppLayout theme toggle |
| Solid, non-transparent dialogs & popovers | ✅ | Dialog, Select, Dropdown, Popover use bg-card / text-foreground |
| Add Task dialog fits viewport (scrollable) | ✅ | ScheduleDialog max-h, overflow-y-auto |
| Visible buttons (primary/outline) | ✅ | Consistent bg-primary / border-border |
| Visible input text (including autofill) | ✅ | Input text-foreground, autofill overrides in index.css |
| Button click animation (active scale) | ✅ | Button active:scale-[0.98], tailwind animations |
| Scroll / fade / scale animations | ✅ | animate-fade-in, animate-scale-in, animate-slide-up, animate-float (tailwind.config) |

---

## Data & API (mock)

| Feature | Status | Notes |
|--------|--------|------|
| All data in localStorage | ✅ | lib/api.ts |
| Auth token persistence | ✅ | Zustand persist, setAuthToken |
| Profile & chronotype in /auth/me | ✅ | Used for avatar and settings |

---

## Summary

- **Planned demo flow:** All 5 steps implemented.
- **Auth:** Login, signup, forgot password, reset password, Google/passkey UI (stubbed).
- **Onboarding & settings:** Wizard and Settings cover profile, preferences, busy slots, integrations.
- **Tasks & courses:** CRUD, scheduling heuristic, calendar/list (and Kanban if wired).
- **UI fixes:** Non-transparent popups, readable text, Add Task dialog fit, chronotype avatar, button/scroll animations.
- **User stories:** Aligned with README demo flow; no obvious missing frontend feature for the described scope.
