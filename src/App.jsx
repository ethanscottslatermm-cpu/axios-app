import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import ProtectedRoute from './components/ProtectedRoute'
import ModuleShell from './components/layout/ModuleShell'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import FoodJournal    from './modules/food/FoodJournal'
import WaterTracker   from './modules/water/WaterTracker'
import WeightTracker  from './modules/weight/WeightTracker'
import FitnessTracker from './modules/fitness/FitnessTracker'
import PrayerTracker  from './modules/prayer/PrayerTracker'
import Devotional     from './modules/devotional/Devotional'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <ModuleShell><Dashboard /></ModuleShell>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/food" element={
                <ProtectedRoute>
                  <ModuleShell><FoodJournal /></ModuleShell>
                </ProtectedRoute>
              } />
              <Route path="/water" element={
                <ProtectedRoute>
                  <ModuleShell><WaterTracker /></ModuleShell>
                </ProtectedRoute>
              } />
              <Route path="/weight" element={
                <ProtectedRoute>
                  <ModuleShell><WeightTracker /></ModuleShell>
                </ProtectedRoute>
              } />
              <Route path="/fitness" element={
                <ProtectedRoute>
                  <ModuleShell><FitnessTracker /></ModuleShell>
                </ProtectedRoute>
              } />
              <Route path="/prayer" element={
                <ProtectedRoute>
                  <ModuleShell><PrayerTracker /></ModuleShell>
                </ProtectedRoute>
              } />
              <Route path="/devotional" element={
                <ProtectedRoute>
                  <ModuleShell><Devotional /></ModuleShell>
                </ProtectedRoute>
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
