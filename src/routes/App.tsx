
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import GoogleCallbackPage from "@/pages/GoogleCallbackPage";
import WizardPage from "@/pages/WizardPage";
<<<<<<< HEAD
=======
import HomePage from "@/pages/HomePage";
>>>>>>> 9137b811872796b8f1aed4f7ae2c5ce35dbbe851
import CalendarPage from "@/pages/CalendarPage";
import TasksPage from "@/pages/TasksPage";
import CoursesPage from "@/pages/CoursesPage";
import KanbanPage from "@/pages/KanbanPage";
import SettingsPage from "@/pages/SettingsPage";
<<<<<<< HEAD
import AnalyticsPage from "@/pages/AnalyticsPage";
import MemoryRulesPage from "@/pages/MemoryRulesPage";
import Home from "@/pages/Home";
=======
>>>>>>> 9137b811872796b8f1aed4f7ae2c5ce35dbbe851
import Protected from "./Protected";
import { AppLayout } from "@/components/layout/AppLayout";
import { ThemeProvider } from "@/components/theme-provider";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="schedora-ui-theme">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/oauth/callback" element={<GoogleCallbackPage />} />

        {/* Protected Routes */}
        <Route
          path="/wizard"
          element={
            <Protected>
              <WizardPage />
            </Protected>
          }
        />

        {/* App Layout Routes */}
        <Route
          path="/"
          element={
            <Protected>
              <AppLayout />
            </Protected>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
<<<<<<< HEAD
          <Route path="dashboard" element={<Home />} />
=======
          <Route path="dashboard" element={<HomePage />} />
>>>>>>> 9137b811872796b8f1aed4f7ae2c5ce35dbbe851
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="kanban" element={<KanbanPage />} />
          <Route path="settings" element={<SettingsPage />} />
<<<<<<< HEAD
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="memory-rules" element={<MemoryRulesPage />} />
=======
>>>>>>> 9137b811872796b8f1aed4f7ae2c5ce35dbbe851
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}
