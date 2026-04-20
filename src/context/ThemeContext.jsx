import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

export const THEMES = {
  axios: {
    name: 'Axios Platinum',
    description: 'Void black with chrome platinum — the signature look',
    preview: ['#060608', '#0d0d11', '#d0d0dc'],
    vars: {
      '--bg-primary':    '#060608',
      '--bg-secondary':  '#0d0d11',
      '--bg-card':       'rgba(212,212,232,0.06)',
      '--bg-card-hover': 'rgba(212,212,232,0.11)',
      '--border':        'rgba(212,212,232,0.42)',
      '--border-focus':  'rgba(220,220,240,0.82)',
      '--text-primary':  '#e8e8f0',
      '--text-secondary':'rgba(180,180,195,0.70)',
      '--text-muted':    'rgba(180,180,195,0.45)',
      '--text-faint':    'rgba(180,180,195,0.20)',
      '--glow':          'rgba(220,220,240,0.60)',
      '--glow-bar':      '#d0d0dc',
      '--btn-bg':        '#d0d0dc',
      '--btn-text':      '#060608',
      '--overlay-bg':    'rgba(0,0,0,0.82)',
      '--header-bg':     'rgba(6,6,8,0.96)',
      '--sheet-bg':      '#0d0d11',
      '--input-bg':      'rgba(208,208,220,0.05)',
      '--img-opacity':   '0.11',
      '--scrollbar':     'rgba(212,212,232,0.38)',
      '--badge-bg':      'rgba(212,212,232,0.10)',
      '--stat-bg':       'rgba(212,212,232,0.07)',
      '--card-shadow':   '0 0 0 1px rgba(212,212,232,0.38), 0 0 22px rgba(212,212,232,0.08), 0 2px 12px rgba(0,0,0,0.60)',
    }
  },
  obsidian: {
    name: 'Obsidian',
    description: 'Deep black — clean and minimal',
    preview: ['#080808', '#1a1a1a', '#ffffff'],
    vars: {
      '--bg-primary':    '#080808',
      '--bg-secondary':  '#0e0e0e',
      '--bg-card':       'rgba(255,255,255,0.055)',
      '--bg-card-hover': 'rgba(255,255,255,0.10)',
      '--border':        'rgba(255,255,255,0.18)',
      '--border-focus':  'rgba(255,255,255,0.55)',
      '--text-primary':  '#ffffff',
      '--text-secondary':'rgba(255,255,255,0.65)',
      '--text-muted':    'rgba(255,255,255,0.38)',
      '--text-faint':    'rgba(255,255,255,0.18)',
      '--glow':          'rgba(255,255,255,0.65)',
      '--glow-bar':      '#ffffff',
      '--btn-bg':        '#ffffff',
      '--btn-text':      '#080808',
      '--overlay-bg':    'rgba(0,0,0,0.8)',
      '--header-bg':     'rgba(8,8,8,0.96)',
      '--sheet-bg':      '#0d0d0d',
      '--input-bg':      'rgba(255,255,255,0.07)',
      '--img-opacity':   '0.11',
      '--scrollbar':     'rgba(255,255,255,0.22)',
      '--badge-bg':      'rgba(255,255,255,0.10)',
      '--stat-bg':       'rgba(255,255,255,0.07)',
      '--card-shadow':   '0 0 0 0.5px rgba(255,255,255,0.07), 0 0 18px rgba(255,255,255,0.05), 0 2px 10px rgba(0,0,0,0.5)',
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
      '--card-shadow':   '0 0 0 0.5px rgba(255,255,255,0.06), 0 0 16px rgba(255,255,255,0.04), 0 2px 10px rgba(0,0,0,0.4)',
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
      '--card-shadow':   '0 0 0 0.5px rgba(44,26,14,0.1), 0 0 16px rgba(44,26,14,0.06), 0 2px 10px rgba(0,0,0,0.15)',
    }
  },
  noir: {
    name: 'Noir',
    description: 'True black, razor-sharp contrast',
    preview: ['#000000', '#111111', '#ffffff'],
    vars: {
      '--bg-primary':    '#000000',
      '--bg-secondary':  '#0a0a0a',
      '--bg-card':       'rgba(255,255,255,0.07)',
      '--bg-card-hover': 'rgba(255,255,255,0.13)',
      '--border':        'rgba(255,255,255,0.24)',
      '--border-focus':  'rgba(255,255,255,0.7)',
      '--text-primary':  '#ffffff',
      '--text-secondary':'rgba(255,255,255,0.75)',
      '--text-muted':    'rgba(255,255,255,0.42)',
      '--text-faint':    'rgba(255,255,255,0.2)',
      '--glow':          'rgba(255,255,255,0.9)',
      '--glow-bar':      '#ffffff',
      '--btn-bg':        '#ffffff',
      '--btn-text':      '#000000',
      '--overlay-bg':    'rgba(0,0,0,0.9)',
      '--header-bg':     'rgba(0,0,0,0.98)',
      '--sheet-bg':      '#080808',
      '--input-bg':      'rgba(255,255,255,0.08)',
      '--img-opacity':   '0.13',
      '--scrollbar':     'rgba(255,255,255,0.28)',
      '--badge-bg':      'rgba(255,255,255,0.12)',
      '--stat-bg':       'rgba(255,255,255,0.08)',
      '--card-shadow':   '0 0 0 0.5px rgba(255,255,255,0.08), 0 0 20px rgba(255,255,255,0.06), 0 2px 10px rgba(0,0,0,0.6)',
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
      '--card-shadow':   '0 0 0 0.5px rgba(79,163,255,0.1), 0 0 18px rgba(79,163,255,0.06), 0 2px 10px rgba(0,0,0,0.5)',
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
      '--card-shadow':   '0 0 0 0.5px rgba(229,57,53,0.1), 0 0 18px rgba(229,57,53,0.06), 0 2px 10px rgba(0,0,0,0.5)',
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
      '--card-shadow':   '0 0 0 0.5px rgba(26,110,181,0.12), 0 0 16px rgba(26,110,181,0.06), 0 2px 10px rgba(0,0,0,0.12)',
    }
  },
  axis_organic: {
    name: 'Axis — Organic',
    description: 'Volcanic black, each module colored like a natural gemstone',
    preview: ['#060608', '#c8853a', '#2dd4bf', '#9b7ad4'],
    vars: {
      '--bg-primary':    '#060608',
      '--bg-secondary':  '#0c0b09',
      '--bg-card':       'rgba(200,180,140,0.05)',
      '--bg-card-hover': 'rgba(200,180,140,0.09)',
      '--border':        'rgba(200,180,140,0.18)',
      '--border-focus':  'rgba(200,180,140,0.50)',
      '--text-primary':  '#ede8e0',
      '--text-secondary':'rgba(220,210,195,0.65)',
      '--text-muted':    'rgba(200,190,175,0.42)',
      '--text-faint':    'rgba(200,190,175,0.18)',
      '--glow':          'rgba(200,133,58,0.55)',
      '--glow-bar':      '#c8853a',
      '--btn-bg':        '#c8853a',
      '--btn-text':      '#060608',
      '--overlay-bg':    'rgba(0,0,0,0.85)',
      '--header-bg':     'rgba(6,6,8,0.97)',
      '--sheet-bg':      '#0c0b09',
      '--input-bg':      'rgba(200,180,140,0.04)',
      '--img-opacity':   '0.14',
      '--scrollbar':     'rgba(200,180,140,0.20)',
      '--badge-bg':      'rgba(200,180,140,0.08)',
      '--stat-bg':       'rgba(200,180,140,0.06)',
      '--card-shadow':   '0 0 0 1px rgba(200,180,140,0.15), 0 0 22px rgba(200,133,58,0.05), 0 2px 12px rgba(0,0,0,0.65)',
      // Per-module mineral accents
      '--accent-food':        '#c8853a',
      '--accent-water':       '#2dd4bf',
      '--accent-fitness':     '#dc4f3a',
      '--accent-finance':     '#4db891',
      '--accent-prayer':      '#c8a000',
      '--accent-devotional':  '#c4a44a',
    }
  },
  onyx_gold: {
    name: 'Onyx Gold',
    description: 'Near-black with warm gold — premium finance feel',
    preview: ['#080604', '#110e08', '#c9a84c'],
    vars: {
      '--bg-primary':    '#080604',
      '--bg-secondary':  '#110e08',
      '--bg-card':       'rgba(201,168,76,0.05)',
      '--bg-card-hover': 'rgba(201,168,76,0.10)',
      '--border':        'rgba(201,168,76,0.18)',
      '--border-focus':  'rgba(201,168,76,0.50)',
      '--text-primary':  '#f0e8d0',
      '--text-secondary':'rgba(240,232,208,0.65)',
      '--text-muted':    'rgba(240,232,208,0.40)',
      '--text-faint':    'rgba(240,232,208,0.18)',
      '--glow':          'rgba(201,168,76,0.60)',
      '--glow-bar':      '#c9a84c',
      '--btn-bg':        '#c9a84c',
      '--btn-text':      '#080604',
      '--overlay-bg':    'rgba(8,6,4,0.88)',
      '--header-bg':     'rgba(8,6,4,0.96)',
      '--sheet-bg':      '#110e08',
      '--input-bg':      'rgba(201,168,76,0.05)',
      '--img-opacity':   '0.10',
      '--scrollbar':     'rgba(201,168,76,0.20)',
      '--badge-bg':      'rgba(201,168,76,0.10)',
      '--stat-bg':       'rgba(201,168,76,0.06)',
      '--card-shadow':   '0 0 0 1px rgba(201,168,76,0.18), 0 0 24px rgba(201,168,76,0.07), 0 2px 12px rgba(0,0,0,0.65)',
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
      '--card-shadow':   '0 0 0 0.5px rgba(61,158,95,0.1), 0 0 18px rgba(61,158,95,0.06), 0 2px 10px rgba(0,0,0,0.5)',
    }
  },
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const { user } = useAuth()
  const [themeKey, setThemeKey] = useState(() => {
    const saved = localStorage.getItem('axios-theme')
    return (saved && THEMES[saved]) ? saved : 'axis_organic'
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

    // Clear per-module accents first so switching away from axis_organic resets them
    ;['food','water','fitness','finance','prayer','devotional'].forEach(m =>
      root.style.removeProperty(`--accent-${m}`)
    )

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
