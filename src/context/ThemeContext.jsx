import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

export const THEMES = {
  axios: {
    name: 'Axios Platinum',
    description: 'Void black with chrome platinum â€” the signature look',
    preview: ['#050507', '#0b0b10', '#e2e2f0'],
    vars: {
      '--bg-primary':    '#050507',
      '--bg-secondary':  '#0b0b10',
      '--bg-card':       'rgba(220,220,240,0.08)',
      '--bg-card-hover': 'rgba(220,220,240,0.15)',
      '--border':        'rgba(220,220,240,0.55)',
      '--border-focus':  'rgba(240,240,255,0.94)',
      '--text-primary':  '#f2f2fa',
      '--text-secondary':'rgba(200,200,218,0.82)',
      '--text-muted':    'rgba(190,190,210,0.54)',
      '--text-faint':    'rgba(190,190,210,0.25)',
      '--glow':          'rgba(220,220,250,0.88)',
      '--glow-bar':      '#e2e2f0',
      '--btn-bg':        '#e2e2f0',
      '--btn-text':      '#040406',
      '--overlay-bg':    'rgba(0,0,0,0.80)',
      '--header-bg':     'rgba(5,5,7,0.82)',
      '--sheet-bg':      '#0b0b10',
      '--input-bg':      'rgba(220,220,240,0.07)',
      '--img-opacity':   '0.13',
      '--scrollbar':     'rgba(220,220,240,0.52)',
      '--badge-bg':      'rgba(220,220,240,0.14)',
      '--stat-bg':       'rgba(220,220,240,0.09)',
      '--card-shadow':   'inset 0 1px 0 rgba(255,255,255,0.16), 0 0 0 1px rgba(220,220,240,0.54), 0 0 32px rgba(180,180,235,0.20), 0 4px 18px rgba(0,0,0,0.72)',
      '--bg-ambient':    'rgba(165,165,210,0.15)',
    }
  },
  obsidian: {
    name: 'Obsidian',
    description: 'Deep black â€” clean and minimal',
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
      '--overlay-bg':    'rgba(0,0,0,0.80)',
      '--header-bg':     'rgba(8,8,8,0.82)',
      '--sheet-bg':      '#0d0d0d',
      '--input-bg':      'rgba(255,255,255,0.07)',
      '--img-opacity':   '0.11',
      '--scrollbar':     'rgba(255,255,255,0.22)',
      '--badge-bg':      'rgba(255,255,255,0.10)',
      '--stat-bg':       'rgba(255,255,255,0.07)',
      '--card-shadow':   'inset 0 1px 0 rgba(255,255,255,0.10), 0 0 0 0.5px rgba(255,255,255,0.07), 0 0 18px rgba(255,255,255,0.05), 0 2px 10px rgba(0,0,0,0.5)',
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
      '--overlay-bg':    'rgba(0,0,0,0.78)',
      '--header-bg':     'rgba(28,28,30,0.82)',
      '--sheet-bg':      '#232325',
      '--input-bg':      'rgba(255,255,255,0.06)',
      '--img-opacity':   '0.12',
      '--scrollbar':     'rgba(255,255,255,0.12)',
      '--badge-bg':      'rgba(255,255,255,0.08)',
      '--stat-bg':       'rgba(255,255,255,0.05)',
      '--card-shadow':   'inset 0 1px 0 rgba(255,255,255,0.09), 0 0 0 0.5px rgba(255,255,255,0.06), 0 0 16px rgba(255,255,255,0.04), 0 2px 10px rgba(0,0,0,0.4)',
    }
  },
  sepia: {
    name: 'Sepia',
    description: 'Warm parchment â€” easy reading',
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
      '--header-bg':     'rgba(245,240,232,0.88)',
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
      '--overlay-bg':    'rgba(0,0,0,0.84)',
      '--header-bg':     'rgba(0,0,0,0.84)',
      '--sheet-bg':      '#080808',
      '--input-bg':      'rgba(255,255,255,0.08)',
      '--img-opacity':   '0.13',
      '--scrollbar':     'rgba(255,255,255,0.28)',
      '--badge-bg':      'rgba(255,255,255,0.12)',
      '--stat-bg':       'rgba(255,255,255,0.08)',
      '--card-shadow':   'inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 0.5px rgba(255,255,255,0.08), 0 0 20px rgba(255,255,255,0.06), 0 2px 10px rgba(0,0,0,0.6)',
    }
  },
  midnight: {
    name: 'Midnight',
    description: 'Deep navy blue â€” bold and focused',
    preview: ['#030c1c', '#071425', '#4fa3ff'],
    vars: {
      '--bg-primary':    '#030c1c',
      '--bg-secondary':  '#071425',
      '--bg-card':       'rgba(79,163,255,0.085)',
      '--bg-card-hover': 'rgba(79,163,255,0.145)',
      '--border':        'rgba(79,163,255,0.28)',
      '--border-focus':  'rgba(79,163,255,0.65)',
      '--text-primary':  '#edf6ff',
      '--text-secondary':'rgba(210,232,255,0.75)',
      '--text-muted':    'rgba(175,210,255,0.48)',
      '--text-faint':    'rgba(175,210,255,0.20)',
      '--glow':          'rgba(79,163,255,0.80)',
      '--glow-bar':      '#5aadff',
      '--btn-bg':        '#4fa3ff',
      '--btn-text':      '#020b19',
      '--overlay-bg':    'rgba(3,12,28,0.82)',
      '--header-bg':     'rgba(3,12,28,0.82)',
      '--sheet-bg':      'rgba(7,20,37,0.88)',
      '--input-bg':      'rgba(79,163,255,0.075)',
      '--img-opacity':   '0.12',
      '--scrollbar':     'rgba(79,163,255,0.22)',
      '--badge-bg':      'rgba(79,163,255,0.14)',
      '--stat-bg':       'rgba(79,163,255,0.09)',
      '--card-shadow':   'inset 0 1.5px 0 rgba(255,255,255,0.14), inset 0 -0.5px 0 rgba(0,0,0,0.20), 0 0 0 0.5px rgba(79,163,255,0.32), 0 0 40px rgba(79,163,255,0.18), 0 8px 40px rgba(0,0,0,0.85)',
      '--bg-ambient':    'rgba(40,100,210,0.16)',
    }
  },
  crimson: {
    name: 'Crimson',
    description: 'Black and red â€” raw intensity',
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
      '--overlay-bg':    'rgba(10,0,0,0.80)',
      '--header-bg':     'rgba(10,0,0,0.82)',
      '--sheet-bg':      '#120000',
      '--input-bg':      'rgba(229,57,53,0.05)',
      '--img-opacity':   '0.1',
      '--scrollbar':     'rgba(229,57,53,0.18)',
      '--badge-bg':      'rgba(229,57,53,0.08)',
      '--stat-bg':       'rgba(229,57,53,0.05)',
      '--card-shadow':   'inset 0 1px 0 rgba(255,200,200,0.10), 0 0 0 0.5px rgba(229,57,53,0.10), 0 0 18px rgba(229,57,53,0.06), 0 2px 10px rgba(0,0,0,0.5)',
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
      '--header-bg':     'rgba(240,244,248,0.88)',
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
    name: 'Axis â€” Organic',
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
      '--overlay-bg':    'rgba(0,0,0,0.80)',
      '--header-bg':     'rgba(6,6,8,0.82)',
      '--sheet-bg':      '#0c0b09',
      '--input-bg':      'rgba(200,180,140,0.04)',
      '--img-opacity':   '0.14',
      '--scrollbar':     'rgba(200,180,140,0.20)',
      '--badge-bg':      'rgba(200,180,140,0.08)',
      '--stat-bg':       'rgba(200,180,140,0.06)',
      '--card-shadow':   'inset 0 1px 0 rgba(255,240,200,0.10), 0 0 0 1px rgba(200,180,140,0.15), 0 0 22px rgba(200,133,58,0.05), 0 2px 12px rgba(0,0,0,0.65)',
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
    description: 'Near-black with warm gold â€” premium finance feel',
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
      '--overlay-bg':    'rgba(8,6,4,0.80)',
      '--header-bg':     'rgba(8,6,4,0.82)',
      '--sheet-bg':      '#110e08',
      '--input-bg':      'rgba(201,168,76,0.05)',
      '--img-opacity':   '0.10',
      '--scrollbar':     'rgba(201,168,76,0.20)',
      '--badge-bg':      'rgba(201,168,76,0.10)',
      '--stat-bg':       'rgba(201,168,76,0.06)',
      '--card-shadow':   'inset 0 1px 0 rgba(255,240,180,0.12), 0 0 0 1px rgba(201,168,76,0.18), 0 0 24px rgba(201,168,76,0.07), 0 2px 12px rgba(0,0,0,0.65)',
    }
  },
  dusk: {
    name: 'Dusk',
    description: 'Deep twilight with amethyst glow and gemstone module accents',
    preview: ['#0d0b16', '#14112a', '#b07fe8'],
    vars: {
      '--bg-primary':    '#0d0b16',
      '--bg-secondary':  '#14112a',
      '--bg-card':       'rgba(180,160,255,0.05)',
      '--bg-card-hover': 'rgba(180,160,255,0.09)',
      '--border':        'rgba(180,160,255,0.14)',
      '--border-focus':  'rgba(180,160,255,0.45)',
      '--text-primary':  '#ede8ff',
      '--text-secondary':'rgba(237,232,255,0.62)',
      '--text-muted':    'rgba(220,210,250,0.38)',
      '--text-faint':    'rgba(220,210,250,0.17)',
      '--glow':          'rgba(176,127,232,0.60)',
      '--glow-bar':      '#b07fe8',
      '--btn-bg':        '#b07fe8',
      '--btn-text':      '#0d0b16',
      '--overlay-bg':    'rgba(13,11,22,0.80)',
      '--header-bg':     'rgba(13,11,22,0.82)',
      '--sheet-bg':      '#14112a',
      '--input-bg':      'rgba(180,160,255,0.04)',
      '--img-opacity':   '0.12',
      '--scrollbar':     'rgba(180,160,255,0.18)',
      '--badge-bg':      'rgba(180,160,255,0.08)',
      '--stat-bg':       'rgba(180,160,255,0.06)',
      '--card-shadow':   'inset 0 1px 0 rgba(220,200,255,0.12), 0 0 0 1px rgba(180,160,255,0.12), 0 0 24px rgba(176,127,232,0.06), 0 2px 12px rgba(0,0,0,0.65)',
      '--bg-ambient':    'rgba(120,80,200,0.16)',
      '--accent-food':        '#f0a070',
      '--accent-water':       '#70c0f0',
      '--accent-fitness':     '#f07090',
      '--accent-finance':     '#70e8a8',
      '--accent-prayer':      '#e8c870',
      '--accent-devotional':  '#b07fe8',
    }
  },
  ember: {
    name: 'Ember',
    description: 'Deep charcoal with warm amber â€” focused and grounded',
    preview: ['#0f0b08', '#1c1408', '#e8843a'],
    vars: {
      '--bg-primary':    '#0f0b08',
      '--bg-secondary':  '#1c1408',
      '--bg-card':       'rgba(240,160,80,0.05)',
      '--bg-card-hover': 'rgba(240,160,80,0.09)',
      '--border':        'rgba(240,160,80,0.15)',
      '--border-focus':  'rgba(240,160,80,0.45)',
      '--text-primary':  '#fff0e0',
      '--text-secondary':'rgba(255,240,224,0.65)',
      '--text-muted':    'rgba(245,225,200,0.40)',
      '--text-faint':    'rgba(245,225,200,0.18)',
      '--glow':          'rgba(232,132,58,0.60)',
      '--glow-bar':      '#e8843a',
      '--btn-bg':        '#e8843a',
      '--btn-text':      '#0f0b08',
      '--overlay-bg':    'rgba(15,11,8,0.80)',
      '--header-bg':     'rgba(15,11,8,0.82)',
      '--sheet-bg':      '#1c1408',
      '--input-bg':      'rgba(240,160,80,0.04)',
      '--img-opacity':   '0.11',
      '--scrollbar':     'rgba(240,160,80,0.18)',
      '--badge-bg':      'rgba(240,160,80,0.08)',
      '--stat-bg':       'rgba(240,160,80,0.06)',
      '--card-shadow':   'inset 0 1px 0 rgba(255,220,160,0.10), 0 0 0 1px rgba(240,160,80,0.14), 0 0 22px rgba(232,132,58,0.06), 0 2px 12px rgba(0,0,0,0.65)',
      '--bg-ambient':    'rgba(180,90,30,0.14)',
    }
  },
  forest: {
    name: 'Forest',
    description: 'Deep green â€” grounded and calm',
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
      '--overlay-bg':    'rgba(5,15,8,0.80)',
      '--header-bg':     'rgba(5,15,8,0.82)',
      '--sheet-bg':      '#0a1a0d',
      '--input-bg':      'rgba(61,158,95,0.05)',
      '--img-opacity':   '0.1',
      '--scrollbar':     'rgba(61,158,95,0.15)',
      '--badge-bg':      'rgba(61,158,95,0.08)',
      '--stat-bg':       'rgba(61,158,95,0.05)',
      '--card-shadow':   'inset 0 1px 0 rgba(180,255,200,0.09), 0 0 0 0.5px rgba(61,158,95,0.10), 0 0 18px rgba(61,158,95,0.06), 0 2px 10px rgba(0,0,0,0.5)',
    }
  },
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const { user } = useAuth()
  const [themeKey, setThemeKey] = useState(() => {
    const saved = localStorage.getItem('axios-theme')
    return (saved && THEMES[saved]) ? saved : 'midnight'
  })
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase.from('profiles').select('theme').eq('id', user.id).single()
      .then(({ data, error }) => {
        const local = localStorage.getItem('axios-theme')
        const db    = !error ? data?.theme : null
        if (local && THEMES[local]) {
          setThemeKey(local)
          if (!error && db !== local) {
            supabase.from('profiles').upsert({ id: user.id, theme: local }, { onConflict: 'id' }).catch(() => {})
          }
        } else if (db && THEMES[db]) {
          setThemeKey(db)
          localStorage.setItem('axios-theme', db)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user])

  useEffect(() => {
    const theme = THEMES[themeKey]
    if (!theme) return
    const root = document.documentElement

    // Clear per-module accents first so switching away from themed variants resets them
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

    // Force body background and text color â€” include ambient orb glow if theme defines it
    const ambient = theme.vars['--bg-ambient']
    const bodyBg = ambient
      ? `radial-gradient(ellipse 100% 55% at 50% -8%, ${ambient} 0%, transparent 62%),` +
        `radial-gradient(ellipse 65% 38% at -8% 52%, ${ambient} 0%, transparent 58%),` +
        `radial-gradient(ellipse 60% 35% at 108% 52%, ${ambient} 0%, transparent 58%),` +
        theme.vars['--bg-primary']
      : theme.vars['--bg-primary']
    document.body.style.setProperty('background', bodyBg, 'important')
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
      const ambient = theme.vars['--bg-ambient']
      const bodyBg = ambient
        ? `radial-gradient(ellipse 100% 55% at 50% -8%, ${ambient} 0%, transparent 62%),` +
          `radial-gradient(ellipse 65% 38% at -8% 52%, ${ambient} 0%, transparent 58%),` +
          `radial-gradient(ellipse 60% 35% at 108% 52%, ${ambient} 0%, transparent 58%),` +
          theme.vars['--bg-primary']
        : theme.vars['--bg-primary']
      document.body.style.setProperty('background', bodyBg, 'important')
      document.body.style.setProperty('color', theme.vars['--text-primary'], 'important')
    }
  }, [])

  const setTheme = async (key) => {
    if (!THEMES[key]) return
    localStorage.setItem('axios-theme', key)
    setThemeKey(key)
    if (user) {
      supabase.from('profiles').upsert({ id: user.id, theme: key }, { onConflict: 'id' }).catch(() => {})
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
