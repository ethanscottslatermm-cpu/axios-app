import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [activeModule, setActiveModule] = useState('dashboard')
  const [today] = useState(new Date().toISOString().split('T')[0])

  return (
    <AppContext.Provider value={{ activeModule, setActiveModule, today }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
