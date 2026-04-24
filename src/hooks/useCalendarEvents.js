import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useCalendarEvents(year, month) {
  const { user } = useAuth()
  const qc       = useQueryClient()

  const pad   = (n) => String(n).padStart(2, '0')
  const start = `${year}-${pad(month + 1)}-01`
  const end   = new Date(year, month + 1, 0).toISOString().split('T')[0]
  const key   = ['calendar_events', user?.id, year, month]

  const { data: events = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: true })
        .order('time', { ascending: true, nullsFirst: true })
      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  const addEvent = useMutation({
    mutationFn: async (ev) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({ user_id: user.id, ...ev })
        .select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendar_events', user?.id] }),
  })

  const deleteEvent = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('calendar_events').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['calendar_events',       user?.id] })
      qc.invalidateQueries({ queryKey: ['calendar_upcoming_ext', user?.id] })
      qc.invalidateQueries({ queryKey: ['calendar_upcoming',     user?.id] })
      qc.invalidateQueries({ queryKey: ['calendar_past',         user?.id] })
      qc.invalidateQueries({ queryKey: ['calendar_year',         user?.id] })
    },
  })

  const markReminderSent = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('calendar_events').update({ reminder_sent: true }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendar_events', user?.id] }),
  })

  return { events, isLoading, addEvent, deleteEvent, markReminderSent }
}

export function useUpcomingEvents(limit = 4) {
  const { user } = useAuth()
  const today    = new Date().toISOString().split('T')[0]
  return useQuery({
    queryKey: ['calendar_upcoming', user?.id, today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', today)
        .order('date', { ascending: true })
        .order('time', { ascending: true, nullsFirst: true })
        .limit(limit)
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export function useUpcomingEventsExtended(days = 90) {
  const { user } = useAuth()
  const today    = new Date().toISOString().split('T')[0]
  const future   = new Date(); future.setDate(future.getDate() + days)
  const futureStr = future.toISOString().split('T')[0]
  return useQuery({
    queryKey: ['calendar_upcoming_ext', user?.id, today, days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', today)
        .lte('date', futureStr)
        .order('date', { ascending: true })
        .order('time', { ascending: true, nullsFirst: true })
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export function usePastEvents(days = 14) {
  const { user } = useAuth()
  const today    = new Date().toISOString().split('T')[0]
  const past     = new Date(); past.setDate(past.getDate() - days)
  const pastStr  = past.toISOString().split('T')[0]
  return useQuery({
    queryKey: ['calendar_past', user?.id, today, days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', pastStr)
        .lt('date', today)
        .order('date', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export function usePendingReminders() {
  const { user } = useAuth()
  const today    = new Date().toISOString().split('T')[0]
  return useQuery({
    queryKey: ['calendar_reminders', user?.id, today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .eq('email_reminder', true)
        .eq('reminder_sent', false)
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export function useAllEventsForYear(year) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['calendar_year', user?.id, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('id, date, type, title')
        .eq('user_id', user.id)
        .gte('date', `${year}-01-01`)
        .lte('date', `${year}-12-31`)
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export function useHealthEventsForMonth(year, month) {
  const { user } = useAuth()
  const pad   = n => String(n).padStart(2, '0')
  const start = `${year}-${pad(month + 1)}-01`
  const end   = new Date(year, month + 1, 0).toISOString().split('T')[0]
  return useQuery({
    queryKey: ['health_events', user?.id, year, month],
    queryFn: async () => {
      const [foodRes, workoutRes, prayerRes] = await Promise.all([
        supabase.from('food_logs').select('date').eq('user_id', user.id).gte('date', start).lte('date', end),
        supabase.from('workouts').select('workout_date').eq('user_id', user.id).gte('workout_date', start).lte('workout_date', end),
        supabase.from('prayer_logs').select('date').eq('user_id', user.id).gte('date', start).lte('date', end),
      ])
      const events = []
      const seen   = new Set()
      const add = (date, type) => { const k = `${date}-${type}`; if (!seen.has(k)) { seen.add(k); events.push({ date, type }) } }
      ;(foodRes.data    || []).forEach(r => add(r.date, 'meal'))
      ;(workoutRes.data || []).forEach(r => add(r.workout_date, 'workout'))
      ;(prayerRes.data  || []).forEach(r => add(r.date, 'prayer'))
      return events
    },
    enabled: !!user,
  })
}

export function useMonthlyIntention(year, month) {
  const { user } = useAuth()
  const qc  = useQueryClient()
  const key = ['monthly_intention', user?.id, year, month]

  const { data } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monthly_intentions')
        .select('*')
        .eq('user_id', user.id)
        .eq('year', year)
        .eq('month', month)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  const upsert = useMutation({
    mutationFn: async (intention) => {
      const { error } = await supabase
        .from('monthly_intentions')
        .upsert({ user_id: user.id, year, month, intention }, { onConflict: 'user_id,year,month' })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  return { intention: data?.intention || '', upsert }
}
