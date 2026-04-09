import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import OnboardingRoute from './components/OnboardingRoute'
import Login      from './pages/Login'
import Login2     from './pages/Login2'
import Dashboard  from './pages/Dashboard'
import Settings   from './pages/Settings'
import Onboarding from './pages/Onboarding'
import Widget     from './pages/Widget'
import FoodJournal    from './modules/food/FoodJournal'
import WaterTracker   from './modules/water/WaterTracker'
import WeightTracker  from './modules/weight/WeightTracker'
import FitnessTracker from './modules/fitness/FitnessTracker'
import PrayerTracker  from './modules/prayer/PrayerTracker'
import Devotional     from './modules/devotional/Devotional'
import FinanceTracker from './modules/finance/FinanceTracker'
import CalendarModule from './modules/calendar/CalendarModule'
import Admin       from './pages/Admin'
import AdminGuard   from './components/AdminGuard'
import FinanceGuard from './components/FinanceGuard'
import AppLock      from './components/AppLock'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <AppProvider>
            <AppLock>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Login2 />} />
                <Route path="/login2" element={<Login />} />
                <Route path="/onboarding" element={
                  <ProtectedRoute><Onboarding /></ProtectedRoute>
                } />
                <Route path="/widget" element={
                  <ProtectedRoute><Widget /></ProtectedRoute>
                } />
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
                <Route path="/finance" element={
                  <ProtectedRoute><OnboardingRoute><FinanceGuard><FinanceTracker /></FinanceGuard></OnboardingRoute></ProtectedRoute>
                } />
                <Route path="/calendar" element={
                  <ProtectedRoute><OnboardingRoute><CalendarModule /></OnboardingRoute></ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute><AdminGuard><Admin /></AdminGuard></ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
            </AppLock>
          </AppProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
