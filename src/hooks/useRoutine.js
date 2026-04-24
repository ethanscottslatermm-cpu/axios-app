import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useRoutineItems() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['routine_items', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routine_items')
        .select('*')
        .eq('user_id', user.id)
        .order('routine_type', { ascending: true })
        .order('position', { ascending: true })
      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  const addItem = useMutation({
    mutationFn: async ({ title, routine_type, position }) => {
      const { data, error } = await supabase
        .from('routine_items')
        .insert({ user_id: user.id, title, routine_type, position })
        .select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routine_items', user?.id] }),
  })

  const deleteItem = useMutation({
    mutationFn: async ({ id, calendarEventId }) => {
      if (calendarEventId) {
        await supabase.from('calendar_events').delete().eq('id', calendarEventId)
      }
      const { error } = await supabase.from('routine_items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['routine_items', user?.id] })
      qc.invalidateQueries({ queryKey: ['calendar_events', user?.id] })
      qc.invalidateQueries({ queryKey: ['calendar_upcoming', user?.id] })
    },
  })

  const setReminder = useMutation({
    mutationFn: async ({ id, reminderTime, routineType, title, existingCalendarEventId }) => {
      if (!reminderTime) {
        if (existingCalendarEventId) {
          await supabase.from('calendar_events').delete().eq('id', existingCalendarEventId)
        }
        const { error } = await supabase
          .from('routine_items')
          .update({ reminder_time: null, reminder_enabled: false, calendar_event_id: null })
          .eq('id', id)
        if (error) throw error
        return
      }

      if (existingCalendarEventId) {
        await supabase.from('calendar_events').delete().eq('id', existingCalendarEventId)
      }

      const today = new Date().toISOString().split('T')[0]
      const label = routineType === 'morning' ? 'Morning' : 'Night'
      const { data: calEvent, error: calError } = await supabase
        .from('calendar_events')
        .insert({
          user_id: user.id,
          title: `${label} Routine: ${title}`,
          date: today,
          time: reminderTime,
          type: 'general',
          notes: `${label} routine reminder`,
          recurring: 'daily',
          email_reminder: true,
          reminder_sent: false,
        })
        .select().single()
      if (calError) throw calError

      const { error } = await supabase
        .from('routine_items')
        .update({ reminder_time: reminderTime, reminder_enabled: true, calendar_event_id: calEvent.id })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['routine_items', user?.id] })
      qc.invalidateQueries({ queryKey: ['calendar_events', user?.id] })
      qc.invalidateQueries({ queryKey: ['calendar_upcoming', user?.id] })
    },
  })

  return { items, isLoading, addItem, deleteItem, setReminder }
}

export function useRoutineLogs(date) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const key = ['routine_logs', user?.id, date]

  const { data: logs = [] } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routine_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  const toggleComplete = useMutation({
    mutationFn: async ({ itemId, completed, existingLogId }) => {
      if (existingLogId) {
        const { error } = await supabase
          .from('routine_logs')
          .update({ completed, completed_at: completed ? new Date().toISOString() : null })
          .eq('id', existingLogId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('routine_logs')
          .insert({
            user_id: user.id,
            item_id: itemId,
            date,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
          })
        if (error) throw error
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const getLog = (itemId) => logs.find(l => l.item_id === itemId)
  const isCompleted = (itemId) => getLog(itemId)?.completed || false

  return { logs, toggleComplete, isCompleted, getLog }
}
