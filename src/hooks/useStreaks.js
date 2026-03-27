import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function calcStreak(dates) {
  if (!dates.length) return 0
  const unique = [...new Set(dates)].sort((a, b) => b.localeCompare(a))
  const today = new Date()
  let streak = 0
  let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  for (const d of unique) {
    const cursorStr = `${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}-${String(cursor.getDate()).padStart(2,'0')}`
    if (d === cursorStr) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else if (d < cursorStr) {
      // Missed a day — if we haven't started yet, allow starting from yesterday
      if (streak === 0) {
        cursor.setDate(cursor.getDate() - 1)
        const yStr = `${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}-${String(cursor.getDate()).padStart(2,'0')}`
        if (d === yStr) { streak++; cursor.setDate(cursor.getDate() - 1) }
        else break
      } else {
        break
      }
    }
  }
  return streak
}

export function useStreaks() {
  const { user } = useAuth()

  const { data: streaks = { food: 0, water: 0, fitness: 0, prayer: 0, devotional: 0 } } = useQuery({
    queryKey: ['streaks', user?.id],
    queryFn: async () => {
      const [food, water, fitness, prayer, devotional] = await Promise.all([
        supabase.from('food_logs').select('date').eq('user_id', user.id),
        supabase.from('water_logs').select('date').eq('user_id', user.id),
        supabase.from('workouts').select('workout_date').eq('user_id', user.id),
        supabase.from('prayer_logs').select('date').eq('user_id', user.id),
        supabase.from('devotional_entries').select('date').eq('user_id', user.id),
      ])

      return {
        food:      calcStreak((food.data      || []).map(r => r.date)),
        water:     calcStreak((water.data     || []).map(r => r.date)),
        fitness:   calcStreak((fitness.data   || []).map(r => r.workout_date)),
        prayer:    calcStreak((prayer.data    || []).map(r => r.date)),
        devotional:calcStreak((devotional.data|| []).map(r => r.date)),
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  })

  return streaks
}
