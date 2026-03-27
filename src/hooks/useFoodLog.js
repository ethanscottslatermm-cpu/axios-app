import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useFoodHistory() {
  const { user } = useAuth()

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['food_history', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_logs')
        .select('date, calories, protein, carbs, fat')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
      if (error) throw error

      const grouped = {}
      data.forEach(row => {
        if (!grouped[row.date]) {
          grouped[row.date] = { date: row.date, calories: 0, protein: 0, carbs: 0, fat: 0, entries: 0 }
        }
        grouped[row.date].calories += row.calories || 0
        grouped[row.date].protein  += row.protein  || 0
        grouped[row.date].carbs    += row.carbs     || 0
        grouped[row.date].fat      += row.fat       || 0
        grouped[row.date].entries  += 1
      })

      return Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date))
    },
    enabled: !!user,
  })

  return { history, isLoading }
}

export function useFoodLog(date) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const key = ['food_logs', date]

  const { data: logs = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .order('logged_at', { ascending: true })
      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  const addEntry = useMutation({
    mutationFn: async (entry) => {
      const { data, error } = await supabase
        .from('food_logs')
        .insert({ ...entry, user_id: user.id, date })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const deleteEntry = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('food_logs').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const totals = logs.reduce(
    (acc, l) => ({
      calories: acc.calories + (l.calories || 0),
      protein:  acc.protein  + (l.protein  || 0),
      carbs:    acc.carbs    + (l.carbs     || 0),
      fat:      acc.fat      + (l.fat       || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  return { logs, totals, isLoading, addEntry, deleteEntry }
}
