import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import SignOutScreen from '../SignOutScreen'

const modules = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/food',      label: 'Food Journal' },
  { path: '/water',     label: 'Water Tracker' },
  { path: '/weight',    label: 'Weight Tracker' },
  { path: '/prayer',    label: 'Prayer Tracker' },
  { path: '/devotional',label: 'Daily Devotional' },
  { path: '/fitness',   label: 'Fitness Tracker' },
]

export default function Sidebar() {
  const { signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  if (signingOut) return <SignOutScreen onComplete={signOut} />

  return (
    <aside className="w-[220px] min-w-[220px] bg-black border-r border-white/[0.08] flex flex-col">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-3 mb-2">
          <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
            <polygon points="0,22 10,2 14,10 6,22" fill="white"/>
            <polygon points="8,22 16,6 20,14 13,22" fill="white" opacity="0.6"/>
            <polygon points="13,22 19,12 21,18 14,22" fill="white" opacity="0.3"/>
          </svg>
          <div className="w-px h-7 bg-white/30" />
          <span className="text-white font-black text-lg tracking-[0.18em] uppercase">AXIOS</span>
        </div>
        <p className="text-white/30 text-[10px] tracking-[0.35em] uppercase ml-[38px]">I am worthy</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-5">
        <p className="text-white/25 text-[10px] tracking-[0.25em] uppercase px-5 mb-2">Main</p>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-5 py-2.5 transition-colors ${
              isActive
                ? 'text-white bg-white/[0.07] border-l-2 border-white'
                : 'text-white/45 hover:text-white/70'
            }`
          }
          style={{ fontFamily: "'The Seasons', serif", fontSize: '0.85rem', letterSpacing: '0.06em' }}
        >
          Dashboard
        </NavLink>

        <p className="text-white/25 text-[10px] tracking-[0.25em] uppercase px-5 mt-4 mb-2">Modules</p>
        {modules.slice(1).map(({ path, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-2.5 transition-colors ${
                isActive
                  ? 'text-white bg-white/[0.07] border-l-2 border-white'
                  : 'text-white/45 hover:text-white/70'
              }`
            }
            style={{ fontFamily: "'The Seasons', serif", fontSize: '0.85rem', letterSpacing: '0.06em' }}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/[0.08]">
        <button
          onClick={() => setSigningOut(true)}
          className="text-white/25 text-[11px] tracking-widest uppercase hover:text-white/50 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
