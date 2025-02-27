import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./contexts/AuthContext"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { Onboarding } from "./pages/Onboarding"
import { Layout } from "./components/Layout"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { Feed } from "./pages/Feed"
import { Chat } from "./pages/Chat"
import { Compliments } from "./pages/Compliments"
import { Matches } from "./pages/Matches"
import { Leaderboard } from "./pages/Leaderboard"

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Feed />} />
              <Route path="chat" element={<Chat />} />
              <Route path="compliments" element={<Compliments />} />
              <Route path="matches" element={<Matches />} />
              <Route path="leaderboard" element={<Leaderboard />} />
            </Route>
          </Routes>
          <Toaster />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App