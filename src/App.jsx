import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import ProtectedRoute from './components/ProtectedRoute'
import OnboardingRoute from './components/OnboardingRoute'
import ModuleShell from './components/layout/ModuleShell'
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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Login />} />

              {/* Onboarding — protected but separate from main app shell */}
              <Route path="/onboarding" element={
                <ProtectedRoute><Onboarding /></ProtectedRoute>
              } />

              {/* Dashboard — NO ModuleShell, has its own bottom nav */}
              <Route path="/dashboard" element={
                <ProtectedRoute><OnboardingRoute><Dashboard /></OnboardingRoute></ProtectedRoute>
              } />

              {/* Settings — NO ModuleShell, has its own bottom nav */}
              <Route path="/settings" element={
                <ProtectedRoute><OnboardingRoute><Settings /></OnboardingRoute></ProtectedRoute>
              } />

              {/* Module routes — keep ModuleShell for sidebar on tablet/desktop */}
              <Route path="/food" element={
                <ProtectedRoute><OnboardingRoute><ModuleShell><FoodJournal /></ModuleShell></OnboardingRoute></ProtectedRoute>
              } />
              <Route path="/water" element={
                <ProtectedRoute><OnboardingRoute><ModuleShell><WaterTracker /></ModuleShell></OnboardingRoute></ProtectedRoute>
              } />
              <Route path="/weight" element={
                <ProtectedRoute><OnboardingRoute><ModuleShell><WeightTracker /></ModuleShell></OnboardingRoute></ProtectedRoute>
              } />
              <Route path="/fitness" element={
                <ProtectedRoute><OnboardingRoute><ModuleShell><FitnessTracker /></ModuleShell></OnboardingRoute></ProtectedRoute>
              } />
              <Route path="/prayer" element={
                <ProtectedRoute><OnboardingRoute><ModuleShell><PrayerTracker /></ModuleShell></OnboardingRoute></ProtectedRoute>
              } />
              <Route path="/devotional" element={
                <ProtectedRoute><OnboardingRoute><ModuleShell><Devotional /></ModuleShell></OnboardingRoute></ProtectedRoute>
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
