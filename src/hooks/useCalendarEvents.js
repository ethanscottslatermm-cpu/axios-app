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
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendar_events', user?.id] }),
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
