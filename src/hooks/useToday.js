import { useState, useEffect } from 'react'

function getLocalDateStr() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function useToday() {
  const [todayStr, setTodayStr] = useState(getLocalDateStr)

  useEffect(() => {
    const scheduleRefresh = () => {
      const now = new Date()
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      const msUntilMidnight = tomorrow - now

      const timeout = setTimeout(() => {
        setTodayStr(getLocalDateStr())
        scheduleRefresh()
      }, msUntilMidnight)

      return timeout
    }

    const timeout = scheduleRefresh()
    return () => clearTimeout(timeout)
  }, [])

  return todayStr
}
