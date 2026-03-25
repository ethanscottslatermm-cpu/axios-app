import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useFoodLog } from '../hooks/useFoodLog'
import { useWaterLog } from '../hooks/useWaterLog'
import { useWeightLog } from '../hooks/useWeightLog'
import { usePrayers } from '../hooks/usePrayers'

const today = new Date()
const todayStr = today.toISOString().split('T')[0]
const dayName = today.toLocaleDateString('en-US', { weekday: 'long' })
const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

const CALORIE_GOAL = 2200
const WATER_GOAL = 8

const modules = [
  { key: 'food',       label: 'Food',       path: '/food' },
  { key: 'water',      label: 'Water',      path: '/water' },
  { key: 'weight',     label: 'Weight',     path: '/weight' },
  { key: 'prayer',     label: 'Prayer',     path: '/prayer' },
  { key: 'devotional', label: 'Devotional', path: '/devotional' },
  { key: 'fitness',    label: 'Fitness',    path: '/fitness' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const { totals, logs: foodLogs }   = useFoodLog(todayStr)
  const { count: waterCount }        = useWaterLog(todayStr)
  const { latest, goal: weightGoal } = useWeightLog()
  const { prayers }                  = usePrayers()

  const todayPrayers   = prayers.filter(p => p.date === todayStr).length
  const answeredCount  = prayers.filter(p => p.answered).length
  const calRemaining   = Math.max(0, CALORIE_GOAL - (totals?.calories || 0))
  const calPct         = Math.min(100, Math.round(((totals?.calories || 0) / CALORIE_GOAL) * 100))
  const waterPct       = Math.min(100, Math.round((waterCount / WATER_GOAL) * 100))

  const loggedModules = {
    food:       (totals?.calories || 0) > 0,
    water:      waterCount > 0,
    weight:     !!latest,
    prayer:     todayPrayers > 0,
    devotional: false,
    fitness:    false,
  }
  const loggedCount = Object.values(loggedModules).filter(Boolean).length

  const recentFood = foodLogs.slice(-3).reverse()

  return (
    <div className="flex flex-col min-h-screen">

      {/* Top bar */}
      <div className="px-7 py-5 border-b border-white/[0.08] flex items-center justify-between">
        <div>
          <p className="text-white/25 text-[10px] tracking-[0.28em] uppercase mb-0.5">{dayName}</p>
          <h1 className="text-white font-black text-xl tracking-wide">Good morning.</h1>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-white/35 text-xs tracking-wider">{dateStr}</p>
          <button
            onClick={() => navigate('/food')}
            className="bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-2 rounded-sm hover:opacity-85 transition-opacity"
          >
            + Log entry
          </button>
        </div>
      </div>

      <div className="flex-1 px-7 py-6 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-md px-4 py-3.5">
            <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-1.5">Calories</p>
            <p className="text-white text-2xl font-black mb-0.5">
              {(totals?.calories || 0).toLocaleString()}
            </p>
            <p className="text-white/25 text-[11px]">of {CALORIE_GOAL.toLocaleString()} goal</p>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-md px-4 py-3.5">
            <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-1.5">Water</p>
            <p className="text-white text-2xl font-black mb-0.5">{waterCount} / {WATER_GOAL}</p>
            <p className="text-white/25 text-[11px]">glasses today</p>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-md px-4 py-3.5">
            <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-1.5">Weight</p>
            <p className="text-white text-2xl font-black mb-0.5">
              {latest ? `${latest} lb` : '—'}
            </p>
            <p className="text-white/25 text-[11px]">
              {latest && weightGoal ? `${Math.max(0, latest - weightGoal).toFixed(1)} from goal` : 'not logged'}
            </p>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-md px-4 py-3.5">
            <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-1.5">Streak</p>
            <p className="text-white text-2xl font-black mb-0.5">{loggedCount} / 6</p>
            <p className="text-white/25 text-[11px]">modules today</p>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-[1.6fr_1fr] gap-4">

          {/* Left column */}
          <div className="space-y-4">

            {/* Module status grid */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white text-[13px] font-medium tracking-wide">Today's modules</p>
                <p className="text-white/30 text-[11px]">{loggedCount} of 6 logged</p>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {modules.map(({ key, label, path }) => {
                  const done = loggedModules[key]
                  return (
                    <button
                      key={key}
                      onClick={() => navigate(path)}
                      className={`p-3 rounded-md border text-left transition-all hover:border-white/30 ${
                        done
                          ? 'bg-white/[0.06] border-white/[0.12]'
                          : 'bg-white/[0.02] border-white/[0.06]'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mb-2 ${done ? 'bg-white' : 'bg-white/20'}`} />
                      <p className={`text-[13px] font-medium mb-0.5 ${done ? 'text-white' : 'text-white/40'}`}>
                        {label}
                      </p>
                      <p className={`text-[11px] ${done ? 'text-white/35' : 'text-white/20'}`}>
                        {done ? 'Logged' : 'Pending'}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Recent food log */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white text-[13px] font-medium tracking-wide">Recent food log</p>
                <button onClick={() => navigate('/food')} className="text-white/30 text-[11px] hover:text-white/60 transition-colors">
                  View all
                </button>
              </div>
              {recentFood.length === 0 ? (
                <p className="text-white/20 text-sm italic text-center py-4">Nothing logged yet today.</p>
              ) : (
                <div className="space-y-0">
                  {recentFood.map((entry, i) => (
                    <div key={entry.id}
                      className={`flex items-center justify-between py-2.5 ${
                        i < recentFood.length - 1 ? 'border-b border-white/[0.05]' : ''
                      }`}
                    >
                      <span className="text-white/70 text-sm">{entry.food_name}</span>
                      <span className="text-white/40 text-sm">{entry.calories} cal</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Calorie progress */}
              <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <div>
                  <p className="text-white/25 text-[10px] tracking-[0.18em] uppercase mb-1">Remaining</p>
                  <p className="text-white font-black text-base">{calRemaining.toLocaleString()} cal left</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-36 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all"
                      style={{ width: `${calPct}%` }}
                    />
                  </div>
                  <span className="text-white/30 text-[11px]">{calPct}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">

            {/* Prayer snapshot */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white text-[13px] font-medium tracking-wide">Prayer</p>
                <button onClick={() => navigate('/prayer')} className="text-white/30 text-[11px] hover:text-white/60 transition-colors">
                  Open
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white/[0.04] rounded-md p-3">
                  <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Today</p>
                  <p className="text-white text-xl font-black">{todayPrayers}</p>
                  <p className="text-white/25 text-[10px]">logged</p>
                </div>
                <div className="bg-white/[0.04] rounded-md p-3">
                  <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Answered</p>
                  <p className="text-white text-xl font-black">{answeredCount}</p>
                  <p className="text-white/25 text-[10px]">total</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/prayer')}
                className="w-full border border-white/[0.1] rounded-sm py-2 text-white/40 text-[11px] tracking-[0.15em] uppercase hover:border-white/30 hover:text-white/60 transition-all"
              >
                + Log a prayer
              </button>
            </div>

            {/* Water tracker */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white text-[13px] font-medium tracking-wide">Water intake</p>
                <button onClick={() => navigate('/water')} className="text-white/30 text-[11px] hover:text-white/60 transition-colors">
                  Open
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {Array.from({ length: WATER_GOAL }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-7 h-7 rounded-full border transition-all ${
                      i < waterCount
                        ? 'bg-white border-white/30'
                        : 'bg-white/[0.06] border-white/[0.1]'
                    }`}
                  />
                ))}
              </div>
              <p className="text-white/25 text-[11px]">
                {waterCount >= WATER_GOAL
                  ? 'Goal reached — well done.'
                  : `${WATER_GOAL - waterCount} glass${WATER_GOAL - waterCount !== 1 ? 'es' : ''} remaining`}
              </p>
              {/* Water progress bar */}
              <div className="mt-3 w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${waterPct}%` }}
                />
              </div>
            </div>

            {/* Quick nav */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-5">
              <p className="text-white text-[13px] font-medium tracking-wide mb-3">Quick access</p>
              <div className="space-y-1.5">
                {modules.map(({ label, path }) => (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-sm hover:bg-white/[0.04] transition-colors group"
                  >
                    <span className="text-white/50 text-sm group-hover:text-white/80 transition-colors">{label}</span>
                    <span className="text-white/20 text-lg group-hover:text-white/50 transition-colors">›</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
