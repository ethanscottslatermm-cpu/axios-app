import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import ProtectedRoute from './components/ProtectedRoute'
import OnboardingRoute from './components/OnboardingRoute'
import Login      from './pages/Login'
import Dashboard  from './pages/Dashboard'
import Settings   from './pages/Settings'
import Onboarding from './pages/Onboarding'
import FoodJournal    from './modules/food/FoodJournal'
import WaterTracker   from './modules/water/WaterTracker'
import WeightTracker  from './modules/weight/WeightTracker'
import FitnessTracker from './modules/fitness/FitnessTracker'
import PrayerTracker  from './modules/prayer/PrayerTracker'
import Devotional     from './modules/devotional/Devotional'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
})

// All routes render full-width with no ModuleShell.
// Navigation is handled by the BottomNav inside each page.

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Login />} />

              {/* Onboarding */}
              <Route path="/onboarding" element={
                <ProtectedRoute><Onboarding /></ProtectedRoute>
              } />

              {/* Main pages — no ModuleShell on any route */}
              <Route path="/dashboard" element={
                <ProtectedRoute><OnboardingRoute><Dashboard /></OnboardingRoute></ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute><OnboardingRoute><Settings /></OnboardingRoute></ProtectedRoute>
              } />
              <Route path="/food" element={
                <ProtectedRoute><OnboardingRoute><FoodJournal /></OnboardingRoute></ProtectedRoute>
              } />
              <Route path="/water" element={
                <ProtectedRoute><OnboardingRoute><WaterTracker /></OnboardingRoute></ProtectedRoute>
              } />
              <Route path="/weight" element={
                <ProtectedRoute><OnboardingRoute><WeightTracker /></OnboardingRoute></ProtectedRoute>
              } />
              <Route path="/fitness" element={
                <ProtectedRoute><OnboardingRoute><FitnessTracker /></OnboardingRoute></ProtectedRoute>
              } />
              <Route path="/prayer" element={
                <ProtectedRoute><OnboardingRoute><PrayerTracker /></OnboardingRoute></ProtectedRoute>
              } />
              <Route path="/devotional" element={
                <ProtectedRoute><OnboardingRoute><Devotional /></OnboardingRoute></ProtectedRoute>
              } />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
