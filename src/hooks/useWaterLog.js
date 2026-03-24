import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

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
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('water_logs')
        .insert({ user_id: user.id, date, oz: 8 })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const removeGlass = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('water_logs').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  return { logs, count: logs.length, isLoading, addGlass, removeGlass }
}
