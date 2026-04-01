import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const DEFAULT_SYMBOLS = ['DIA', 'SPY', 'QQQ', 'AAPL', 'TSLA']

export function useWatchlist() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const key = ['stock_watchlist', user?.id]

  const { data: custom = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_watchlist')
        .select('symbol')
        .eq('user_id', user.id)
        .order('added_at', { ascending: true })
      if (error) throw error
      return data.map(r => r.symbol).filter(s => !DEFAULT_SYMBOLS.includes(s))
    },
    enabled: !!user,
  })

  const watchlist = [...DEFAULT_SYMBOLS, ...custom]

  const addSymbol = useMutation({
    mutationFn: async (symbol) => {
      if (DEFAULT_SYMBOLS.includes(symbol) || watchlist.includes(symbol)) return
      const { error } = await supabase
        .from('stock_watchlist')
        .insert({ user_id: user.id, symbol })
      if (error && error.code !== '23505') throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const removeSymbol = useMutation({
    mutationFn: async (symbol) => {
      if (DEFAULT_SYMBOLS.includes(symbol)) return
      const { error } = await supabase
        .from('stock_watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('symbol', symbol)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  return { watchlist, custom, isLoading, addSymbol, removeSymbol, DEFAULT_SYMBOLS }
}
