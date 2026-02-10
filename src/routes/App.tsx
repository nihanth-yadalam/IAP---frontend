import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import WizardPage from "@/pages/WizardPage";
import HomePage from "@/pages/HomePage";
import Protected from "./Protected";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot" element={<ForgotPasswordPage />} />

        <Route
          path="/wizard"
          element={
            <Protected>
              <WizardPage />
            </Protected>
          }
        />

        <Route
          path="/app"
          element={
            <Protected>
              <HomePage />
            </Protected>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
