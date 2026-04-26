import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useWaterHistory() {
  const { user } = useAuth()

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['water_history', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('water_logs')
        .select('date, oz')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
      if (error) throw error

      const grouped = {}
      data.forEach(row => {
        if (!grouped[row.date]) {
          grouped[row.date] = { date: row.date, glasses: 0, oz: 0 }
        }
        grouped[row.date].glasses += 1
        grouped[row.date].oz      += row.oz || 8
      })

      return Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date))
    },
    enabled: !!user,
  })

  return { history, isLoading }
}

export function useWaterLog(date) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const key = ['water_logs', date]

  const { data: logs = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .order('logged_at', { ascending: true })
      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  const addGlass = useMutation({
    mutationFn: async (oz = 8) => {
      const { data, error } = await supabase
        .from('water_logs')
        .insert({ user_id: user.id, date, oz })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key })
      qc.invalidateQueries({ queryKey: ['water_history', user?.id] })
    },
  })

  const removeGlass = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('water_logs').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key })
      qc.invalidateQueries({ queryKey: ['water_history', user?.id] })
    },
  })

  return { logs, count: logs.length, isLoading, addGlass, removeGlass }
}
