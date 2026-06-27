import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'

export function useMealPlan() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const key = ['meal_plans']

  const { data: plans = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  const createMealPlan = useMutation({
    mutationFn: async (mealPlan) => {
      const { data, error } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          name: mealPlan.name,
          macro_targets: mealPlan.macroTargets,
          meal_data: mealPlan.days,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const updateMealPlan = useMutation({
    mutationFn: async ({ id, mealPlan }) => {
      const { data, error } = await supabase
        .from('meal_plans')
        .update({
          name: mealPlan.name,
          macro_targets: mealPlan.macroTargets,
          meal_data: mealPlan.days,
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const deleteMealPlan = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  return {
    plans,
    isLoading,
    createMealPlan: createMealPlan.mutateAsync,
    updateMealPlan: updateMealPlan.mutateAsync,
    deleteMealPlan: deleteMealPlan.mutateAsync,
    loading: createMealPlan.isPending || updateMealPlan.isPending || deleteMealPlan.isPending,
  }
}
