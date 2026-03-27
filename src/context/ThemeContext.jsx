import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

export const THEMES = {
  obsidian: {
    name: 'Obsidian',
    description: 'Deep black — the default',
    preview: ['#080808', '#1a1a1a', '#ffffff'],
    vars: {
      '--bg-primary':    '#080808',
      '--bg-secondary':  '#0e0e0e',
      '--bg-card':       'rgba(255,255,255,0.03)',
      '--bg-card-hover': 'rgba(255,255,255,0.06)',
      '--border':        'rgba(255,255,255,0.08)',
      '--border-focus':  'rgba(255,255,255,0.25)',
      '--text-primary':  '#ffffff',
      '--text-secondary':'rgba(255,255,255,0.55)',
      '--text-muted':    'rgba(255,255,255,0.28)',
      '--text-faint':    'rgba(255,255,255,0.12)',
      '--glow':          'rgba(255,255,255,0.55)',
      '--glow-bar':      '#ffffff',
      '--btn-bg':        '#ffffff',
      '--btn-text':      '#080808',
      '--overlay-bg':    'rgba(0,0,0,0.8)',
      '--header-bg':     'rgba(8,8,8,0.93)',
      '--sheet-bg':      '#0d0d0d',
      '--input-bg':      'rgba(255,255,255,0.04)',
      '--img-opacity':   '0.11',
      '--scrollbar':     'rgba(255,255,255,0.1)',
      '--badge-bg':      'rgba(255,255,255,0.07)',
      '--stat-bg':       'rgba(255,255,255,0.04)',
    }
  },
  ash: {
    name: 'Ash',
    description: 'Soft dark gray, easier on the eyes',
    preview: ['#1c1c1e', '#2c2c2e', '#e5e5e7'],
    vars: {
      '--bg-primary':    '#1c1c1e',
      '--bg-secondary':  '#232325',
      '--bg-card':       'rgba(255,255,255,0.05)',
      '--bg-card-hover': 'rgba(255,255,255,0.09)',
      '--border':        'rgba(255,255,255,0.1)',
      '--border-focus':  'rgba(255,255,255,0.3)',
      '--text-primary':  '#e5e5e7',
      '--text-secondary':'rgba(229,229,231,0.6)',
      '--text-muted':    'rgba(229,229,231,0.35)',
      '--text-faint':    'rgba(229,229,231,0.15)',
      '--glow':          'rgba(229,229,231,0.5)',
      '--glow-bar':      '#e5e5e7',
      '--btn-bg':        '#e5e5e7',
      '--btn-text':      '#1c1c1e',
      '--overlay-bg':    'rgba(0,0,0,0.75)',
      '--header-bg':     'rgba(28,28,30,0.93)',
      '--sheet-bg':      '#232325',
      '--input-bg':      'rgba(255,255,255,0.06)',
      '--img-opacity':   '0.12',
      '--scrollbar':     'rgba(255,255,255,0.12)',
      '--badge-bg':      'rgba(255,255,255,0.08)',
      '--stat-bg':       'rgba(255,255,255,0.05)',
    }
  },
  sepia: {
    name: 'Sepia',
    description: 'Warm parchment — easy reading',
    preview: ['#f5f0e8', '#ede4d0', '#2c1a0e'],
    vars: {
      '--bg-primary':    '#f5f0e8',
      '--bg-secondary':  '#ede4d0',
      '--bg-card':       'rgba(44,26,14,0.05)',
      '--bg-card-hover': 'rgba(44,26,14,0.09)',
      '--border':        'rgba(44,26,14,0.12)',
      '--border-focus':  'rgba(44,26,14,0.35)',
      '--text-primary':  '#2c1a0e',
      '--text-secondary':'rgba(44,26,14,0.65)',
      '--text-muted':    'rgba(44,26,14,0.4)',
      '--text-faint':    'rgba(44,26,14,0.18)',
      '--glow':          'rgba(44,26,14,0.3)',
      '--glow-bar':      '#7c4a1e',
      '--btn-bg':        '#2c1a0e',
      '--btn-text':      '#f5f0e8',
      '--overlay-bg':    'rgba(44,26,14,0.6)',
      '--header-bg':     'rgba(245,240,232,0.95)',
      '--sheet-bg':      '#ede4d0',
      '--input-bg':      'rgba(44,26,14,0.05)',
      '--img-opacity':   '0.08',
      '--scrollbar':     'rgba(44,26,14,0.15)',
      '--badge-bg':      'rgba(44,26,14,0.07)',
      '--stat-bg':       'rgba(44,26,14,0.05)',
    }
  },
  noir: {
    name: 'Noir',
    description: 'True black, razor-sharp contrast',
    preview: ['#000000', '#111111', '#ffffff'],
    vars: {
      '--bg-primary':    '#000000',
      '--bg-secondary':  '#0a0a0a',
      '--bg-card':       'rgba(255,255,255,0.04)',
      '--bg-card-hover': 'rgba(255,255,255,0.08)',
      '--border':        'rgba(255,255,255,0.1)',
      '--border-focus':  'rgba(255,255,255,0.4)',
      '--text-primary':  '#ffffff',
      '--text-secondary':'rgba(255,255,255,0.7)',
      '--text-muted':    'rgba(255,255,255,0.35)',
      '--text-faint':    'rgba(255,255,255,0.15)',
      '--glow':          'rgba(255,255,255,0.8)',
      '--glow-bar':      '#ffffff',
      '--btn-bg':        '#ffffff',
      '--btn-text':      '#000000',
      '--overlay-bg':    'rgba(0,0,0,0.9)',
      '--header-bg':     'rgba(0,0,0,0.97)',
      '--sheet-bg':      '#080808',
      '--input-bg':      'rgba(255,255,255,0.05)',
      '--img-opacity':   '0.13',
      '--scrollbar':     'rgba(255,255,255,0.15)',
      '--badge-bg':      'rgba(255,255,255,0.08)',
      '--stat-bg':       'rgba(255,255,255,0.05)',
    }
  },
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const { user } = useAuth()
  const [themeKey, setThemeKey] = useState('obsidian')
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase.from('profiles').select('theme').eq('id', user.id).single()
      .then(({ data }) => {
        if (data?.theme && THEMES[data.theme]) setThemeKey(data.theme)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user])

  useEffect(() => {
    const theme = THEMES[themeKey]
    if (!theme) return
    const root = document.documentElement
    Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v))
    document.body.style.background = theme.vars['--bg-primary']
  }, [themeKey])

  const setTheme = async (key) => {
    if (!THEMES[key]) return
    setThemeKey(key)
    if (user) {
      await supabase.from('profiles').upsert({ id: user.id, theme: key }, { onConflict: 'id' })
    }
  }

  return (
    <ThemeContext.Provider value={{ themeKey, setTheme, themes: THEMES, loading }}>
      {!loading && children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
