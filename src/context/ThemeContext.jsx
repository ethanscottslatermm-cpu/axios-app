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
  midnight: {
    name: 'Midnight',
    description: 'Deep navy blue — bold and focused',
    preview: ['#050d1a', '#0a1628', '#4fa3ff'],
    vars: {
      '--bg-primary':    '#050d1a',
      '--bg-secondary':  '#0a1628',
      '--bg-card':       'rgba(79,163,255,0.05)',
      '--bg-card-hover': 'rgba(79,163,255,0.09)',
      '--border':        'rgba(79,163,255,0.15)',
      '--border-focus':  'rgba(79,163,255,0.45)',
      '--text-primary':  '#e8f4ff',
      '--text-secondary':'rgba(232,244,255,0.6)',
      '--text-muted':    'rgba(232,244,255,0.35)',
      '--text-faint':    'rgba(232,244,255,0.15)',
      '--glow':          'rgba(79,163,255,0.6)',
      '--glow-bar':      '#4fa3ff',
      '--btn-bg':        '#4fa3ff',
      '--btn-text':      '#050d1a',
      '--overlay-bg':    'rgba(5,13,26,0.85)',
      '--header-bg':     'rgba(5,13,26,0.95)',
      '--sheet-bg':      '#0a1628',
      '--input-bg':      'rgba(79,163,255,0.05)',
      '--img-opacity':   '0.1',
      '--scrollbar':     'rgba(79,163,255,0.15)',
      '--badge-bg':      'rgba(79,163,255,0.08)',
      '--stat-bg':       'rgba(79,163,255,0.05)',
    }
  },
  crimson: {
    name: 'Crimson',
    description: 'Black and red — raw intensity',
    preview: ['#0a0000', '#1a0000', '#e53935'],
    vars: {
      '--bg-primary':    '#0a0000',
      '--bg-secondary':  '#120000',
      '--bg-card':       'rgba(229,57,53,0.05)',
      '--bg-card-hover': 'rgba(229,57,53,0.09)',
      '--border':        'rgba(229,57,53,0.18)',
      '--border-focus':  'rgba(229,57,53,0.5)',
      '--text-primary':  '#fff0f0',
      '--text-secondary':'rgba(255,240,240,0.6)',
      '--text-muted':    'rgba(255,240,240,0.35)',
      '--text-faint':    'rgba(255,240,240,0.15)',
      '--glow':          'rgba(229,57,53,0.65)',
      '--glow-bar':      '#e53935',
      '--btn-bg':        '#e53935',
      '--btn-text':      '#ffffff',
      '--overlay-bg':    'rgba(10,0,0,0.85)',
      '--header-bg':     'rgba(10,0,0,0.95)',
      '--sheet-bg':      '#120000',
      '--input-bg':      'rgba(229,57,53,0.05)',
      '--img-opacity':   '0.1',
      '--scrollbar':     'rgba(229,57,53,0.18)',
      '--badge-bg':      'rgba(229,57,53,0.08)',
      '--stat-bg':       'rgba(229,57,53,0.05)',
    }
  },
  arctic: {
    name: 'Arctic',
    description: 'Clean white with ice blue accents',
    preview: ['#f0f4f8', '#e2eaf2', '#1a6eb5'],
    vars: {
      '--bg-primary':    '#f0f4f8',
      '--bg-secondary':  '#e2eaf2',
      '--bg-card':       'rgba(26,110,181,0.05)',
      '--bg-card-hover': 'rgba(26,110,181,0.09)',
      '--border':        'rgba(26,110,181,0.15)',
      '--border-focus':  'rgba(26,110,181,0.4)',
      '--text-primary':  '#0d1f33',
      '--text-secondary':'rgba(13,31,51,0.65)',
      '--text-muted':    'rgba(13,31,51,0.4)',
      '--text-faint':    'rgba(13,31,51,0.18)',
      '--glow':          'rgba(26,110,181,0.35)',
      '--glow-bar':      '#1a6eb5',
      '--btn-bg':        '#1a6eb5',
      '--btn-text':      '#ffffff',
      '--overlay-bg':    'rgba(13,31,51,0.55)',
      '--header-bg':     'rgba(240,244,248,0.96)',
      '--sheet-bg':      '#e2eaf2',
      '--input-bg':      'rgba(26,110,181,0.05)',
      '--img-opacity':   '0.07',
      '--scrollbar':     'rgba(26,110,181,0.18)',
      '--badge-bg':      'rgba(26,110,181,0.07)',
      '--stat-bg':       'rgba(26,110,181,0.05)',
    }
  },
  forest: {
    name: 'Forest',
    description: 'Deep green — grounded and calm',
    preview: ['#050f08', '#0a1a0d', '#3d9e5f'],
    vars: {
      '--bg-primary':    '#050f08',
      '--bg-secondary':  '#0a1a0d',
      '--bg-card':       'rgba(61,158,95,0.05)',
      '--bg-card-hover': 'rgba(61,158,95,0.09)',
      '--border':        'rgba(61,158,95,0.15)',
      '--border-focus':  'rgba(61,158,95,0.45)',
      '--text-primary':  '#e8f5ec',
      '--text-secondary':'rgba(232,245,236,0.6)',
      '--text-muted':    'rgba(232,245,236,0.35)',
      '--text-faint':    'rgba(232,245,236,0.15)',
      '--glow':          'rgba(61,158,95,0.55)',
      '--glow-bar':      '#3d9e5f',
      '--btn-bg':        '#3d9e5f',
      '--btn-text':      '#050f08',
      '--overlay-bg':    'rgba(5,15,8,0.85)',
      '--header-bg':     'rgba(5,15,8,0.95)',
      '--sheet-bg':      '#0a1a0d',
      '--input-bg':      'rgba(61,158,95,0.05)',
      '--img-opacity':   '0.1',
      '--scrollbar':     'rgba(61,158,95,0.15)',
      '--badge-bg':      'rgba(61,158,95,0.08)',
      '--stat-bg':       'rgba(61,158,95,0.05)',
    }
  },
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const { user } = useAuth()
  const [themeKey, setThemeKey] = useState(() => {
    const saved = localStorage.getItem('axios-theme')
    return (saved && THEMES[saved]) ? saved : 'obsidian'
  })
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase.from('profiles').select('theme').eq('id', user.id).single()
      .then(({ data }) => {
        const local = localStorage.getItem('axios-theme')
        const db    = data?.theme
        if (local && THEMES[local]) {
          // localStorage is the user's last explicit choice — trust it
          setThemeKey(local)
          // Sync back to Supabase if out of date
          if (db !== local) {
            supabase.from('profiles').upsert({ id: user.id, theme: local }, { onConflict: 'id' })
          }
        } else if (db && THEMES[db]) {
          setThemeKey(db)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user])

  useEffect(() => {
    const theme = THEMES[themeKey]
    if (!theme) return
    const root = document.documentElement

    // Set all theme variables
    Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v))

    // Also update legacy axios variables for backward compat
    root.style.setProperty('--axios-black', theme.vars['--bg-primary'])
    root.style.setProperty('--axios-dark',  theme.vars['--bg-primary'])
    root.style.setProperty('--axios-border',theme.vars['--border'])
    root.style.setProperty('--axios-muted', theme.vars['--text-muted'])

    // Force body background and text color
    document.body.style.setProperty('background', theme.vars['--bg-primary'], 'important')
    document.body.style.setProperty('color', theme.vars['--text-primary'], 'important')

    // Store in localStorage as instant-load fallback
    localStorage.setItem('axios-theme', themeKey)
  }, [themeKey])

  // Apply theme from localStorage immediately on first paint (before Supabase loads)
  useEffect(() => {
    const saved = localStorage.getItem('axios-theme')
    if (saved && THEMES[saved]) {
      const theme = THEMES[saved]
      const root = document.documentElement
      Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v))
      document.body.style.setProperty('background', theme.vars['--bg-primary'], 'important')
      document.body.style.setProperty('color', theme.vars['--text-primary'], 'important')
    }
  }, [])

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
