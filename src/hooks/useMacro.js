import { useQuery } from '@tanstack/react-query'

export function useMacro() {
  return useQuery({
    queryKey: ['macro'],
    queryFn: async () => {
      const res = await fetch('/api/macro')
      if (!res.ok) throw new Error('macro fetch failed')
      return res.json()
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}
