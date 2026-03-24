import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function usePrayers() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const key = ['prayer_logs']

  const { data: prayers = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prayer_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  const addPrayer = useMutation({
    mutationFn: async ({ category, prayer_text, note }) => {
      const { data, error } = await supabase
        .from('prayer_logs')
        .insert({ user_id: user.id, category, prayer_text, note, answered: false })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const toggleAnswered = useMutation({
    mutationFn: async ({ id, answered }) => {
      const { error } = await supabase
        .from('prayer_logs')
        .update({ answered, answered_at: answered ? new Date().toISOString() : null })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  return { prayers, isLoading, addPrayer, toggleAnswered }
}
