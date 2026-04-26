import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useWeightLog() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const key = ['weight_logs']

  const { data: logs = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_date', { ascending: true })
        .limit(90)
      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  const addEntry = useMutation({
    mutationFn: async ({ weight_lbs, logged_date, note }) => {
      const { data, error } = await supabase
        .from('weight_logs')
        .insert({ user_id: user.id, weight_lbs, logged_date, note })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const latest = logs.at(-1)?.weight_lbs ?? null

  return { logs, latest, isLoading, addEntry }
}
