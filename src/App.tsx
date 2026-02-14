import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/auth'
import LoginPage from '@/pages/Login'
import SignupPage from '@/pages/Signup'
import ForgotPasswordPage from '@/pages/ForgotPassword'
import WizardPage from '@/pages/Wizard'
import HomePage from '@/pages/Home'

function Protected({ children }: { children: React.ReactNode }) {
  const { isAuthed } = useAuth()
  return isAuthed ? <>{children}</> : <Navigate to="/login" replace />
}

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
