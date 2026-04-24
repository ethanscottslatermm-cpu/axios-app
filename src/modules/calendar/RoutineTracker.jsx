import { useState, useMemo } from 'react'
import { useRoutineItems, useRoutineLogs, useRoutineHistory } from '../../hooks/useRoutine'
import { useHaptic } from '../../hooks/useHaptic'

const FF = 'Helvetica Neue,Arial,sans-serif'

// ── Categories ──────────────────────────────────────────────────────────────
const CATS = {
  mindfulness: { label: 'Mindfulness', emoji: '🧘', color: '#9b8ec4' },
  fitness:     { label: 'Fitness',     emoji: '💪', color: '#dc4f3a' },
  nutrition:   { label: 'Nutrition',   emoji: '🥗', color: '#c8853a' },
  hydration:   { label: 'Hydration',   emoji: '💧', color: '#4db8c8' },
  learning:    { label: 'Learning',    emoji: '📚', color: '#d4c44a' },
  hygiene:     { label: 'Hygiene',     emoji: '✨', color: '#c8d4c8' },
  spiritual:   { label: 'Spiritual',   emoji: '🙏', color: '#c8a000' },
  sleep:       { label: 'Sleep',       emoji: '😴', color: '#6a8ac8' },
  other:       { label: 'Other',       emoji: '⭐', color: '#888899' },
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function getLast7(todayStr) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(todayStr + 'T12:00:00')
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}

function computeStreak(itemId, history, todayStr) {
  const done = new Set(history.filter(l => l.item_id === itemId).map(l => l.date))
  let streak = 0
  const d = new Date(todayStr + 'T12:00:00')
  for (let i = 0; i < 60; i++) {
    if (done.has(d.toISOString().split('T')[0])) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

function computeBestStreak(itemId, history) {
  const done = new Set(history.filter(l => l.item_id === itemId).map(l => l.date))
  if (!done.size) return 0
  const dates = [...done].sort()
  let best = 1, cur = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i-1] + 'T12:00:00')
    const curr = new Date(dates[i]   + 'T12:00:00')
    const diff = (curr - prev) / 86400000
    if (diff === 1) { cur++; if (cur > best) best = cur }
    else cur = 1
  }
  return best
}

// ── SVG Progress Ring ────────────────────────────────────────────────────────
function ProgressRing({ pct, size = 68, stroke = 5, color }) {
  const r      = (size - stroke * 2) / 2
  const circ   = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const c      = color || (pct === 100 ? '#a8d8a8' : 'rgba(200,212,200,0.65)')
  return (
    <svg width={size} height={size} style={{ transform:'rotate(-90deg)', flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(212,212,232,0.07)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition:'stroke-dashoffset 0.5s ease' }}/>
    </svg>
  )
}

// ── 7-Day Dot Row ────────────────────────────────────────────────────────────
function DotRow({ itemId, last7, history, todayIsCompleted }) {
  const done = new Set(history.filter(l => l.item_id === itemId).map(l => l.date))
  const DAY_LABELS = ['S','M','T','W','T','F','S']
  return (
    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
      {last7.map((date, i) => {
        const isToday = i === 6
        const completed = isToday ? todayIsCompleted : done.has(date)
        const d = new Date(date + 'T12:00:00')
        const dayIdx = d.getDay()
        return (
          <div key={date} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
            <div style={{
              width: isToday ? 8 : 7,
              height: isToday ? 8 : 7,
              borderRadius: '50%',
              background: completed
                ? (isToday ? 'var(--btn-bg)' : 'rgba(200,212,200,0.55)')
                : 'rgba(212,212,232,0.1)',
              border: isToday ? '1px solid rgba(200,212,200,0.3)' : 'none',
              transition: 'background 0.2s',
            }}/>
            <span style={{ fontSize:7, color:'rgba(212,212,232,0.2)', fontFamily:FF }}>
              {DAY_LABELS[dayIdx]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Add / Edit Sheet ─────────────────────────────────────────────────────────
function HabitSheet({ initial, routineType, onSave, onClose, saving }) {
  const [title,       setTitle]       = useState(initial?.title       || '')
  const [category,    setCategory]    = useState(initial?.category    || 'other')
  const [durationMin, setDurationMin] = useState(initial?.duration_min != null ? String(initial.duration_min) : '')
  const [notes,       setNotes]       = useState(initial?.notes       || '')
  const [remTime,     setRemTime]     = useState(
    initial?.reminder_time ? initial.reminder_time.slice(0,5) : ''
  )

  const isEdit = !!initial?.id
  const valid  = title.trim().length > 0

  const handleSave = () => {
    if (!valid) return
    onSave({
      title:       title.trim(),
      category,
      duration_min: durationMin ? parseInt(durationMin, 10) : null,
      notes:        notes.trim() || null,
      reminder_time: remTime || null,
    })
  }

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:200,
      background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'flex-end', justifyContent:'center',
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        width:'100%', maxWidth:520,
        background:'var(--bg-card)', border:'1px solid var(--border)',
        borderRadius:'20px 20px 0 0', padding:'22px 20px 32px',
        maxHeight:'90dvh', overflowY:'auto',
      }}>
        <div style={{ width:36, height:4, background:'rgba(212,212,232,0.15)', borderRadius:99, margin:'0 auto 22px' }}/>

        <p style={{ color:'var(--text-primary)', fontSize:16, fontWeight:800, fontFamily:FF, marginBottom:20 }}>
          {isEdit ? 'Edit Habit' : `Add ${routineType === 'morning' ? 'Morning' : 'Night'} Habit`}
        </p>

        {/* Title */}
        <label style={{ color:'rgba(212,212,232,0.35)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:FF, display:'block', marginBottom:6 }}>
          Habit Name
        </label>
        <input
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          placeholder="e.g. Meditate for 10 minutes"
          style={{
            width:'100%', padding:'12px 14px', borderRadius:10, marginBottom:18,
            background:'rgba(212,212,232,0.05)', border:'1px solid rgba(212,212,232,0.12)',
            color:'var(--text-primary)', fontSize:14, fontFamily:FF,
          }}
        />

        {/* Category */}
        <label style={{ color:'rgba(212,212,232,0.35)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:FF, display:'block', marginBottom:10 }}>
          Category
        </label>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:18 }}>
          {Object.entries(CATS).map(([key, cat]) => {
            const active = category === key
            return (
              <button key={key} onClick={() => setCategory(key)} style={{
                display:'flex', alignItems:'center', gap:7, padding:'9px 10px', borderRadius:10,
                background: active ? `${cat.color}18` : 'rgba(212,212,232,0.03)',
                border: `1px solid ${active ? cat.color + '55' : 'rgba(212,212,232,0.08)'}`,
                color: active ? cat.color : 'rgba(212,212,232,0.4)',
                fontSize:11, fontFamily:FF, fontWeight: active ? 700 : 400,
                cursor:'pointer', transition:'all 0.15s', textAlign:'left',
              }}>
                <span style={{ fontSize:15 }}>{cat.emoji}</span>
                <span style={{ fontSize:10 }}>{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* Duration + Reminder row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:18 }}>
          <div>
            <label style={{ color:'rgba(212,212,232,0.35)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:FF, display:'block', marginBottom:6 }}>
              Duration (min)
            </label>
            <input
              type="number"
              min={1} max={180}
              value={durationMin}
              onChange={e => setDurationMin(e.target.value)}
              placeholder="Optional"
              style={{
                width:'100%', padding:'11px 12px', borderRadius:9,
                background:'rgba(212,212,232,0.05)', border:'1px solid rgba(212,212,232,0.1)',
                color:'var(--text-primary)', fontSize:13, fontFamily:FF,
              }}
            />
          </div>
          <div>
            <label style={{ color:'rgba(212,212,232,0.35)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:FF, display:'block', marginBottom:6 }}>
              Reminder Time
            </label>
            <input
              type="time"
              value={remTime}
              onChange={e => setRemTime(e.target.value)}
              style={{
                width:'100%', padding:'11px 12px', borderRadius:9,
                background:'rgba(212,212,232,0.05)', border:'1px solid rgba(212,212,232,0.1)',
                color:'var(--text-primary)', fontSize:13, fontFamily:FF, colorScheme:'dark',
              }}
            />
          </div>
        </div>

        {/* Notes */}
        <label style={{ color:'rgba(212,212,232,0.35)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:FF, display:'block', marginBottom:6 }}>
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Why this habit matters…"
          rows={2}
          style={{
            width:'100%', padding:'11px 14px', borderRadius:10, marginBottom:22, resize:'none',
            background:'rgba(212,212,232,0.05)', border:'1px solid rgba(212,212,232,0.1)',
            color:'var(--text-primary)', fontSize:13, fontFamily:FF, lineHeight:1.5,
          }}
        />

        <p style={{ color:'rgba(212,212,232,0.25)', fontSize:10, fontFamily:FF, marginBottom:18, lineHeight:1.5 }}>
          {remTime ? 'A daily reminder will sync to your calendar automatically.' : 'Set a reminder time above to sync a daily event to your calendar.'}
        </p>

        <button
          onClick={handleSave}
          disabled={!valid || saving}
          style={{
            width:'100%', padding:'14px', borderRadius:11,
            background: valid ? 'var(--btn-bg)' : 'rgba(212,212,232,0.07)',
            color: valid ? 'var(--btn-text)' : 'rgba(212,212,232,0.25)',
            border:'none', fontSize:14, fontFamily:FF, fontWeight:800,
            letterSpacing:'0.06em', cursor: valid ? 'pointer' : 'default',
            transition:'all 0.18s',
          }}>
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Habit'}
        </button>
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function RoutineTracker({ today }) {
  const [tab,       setTab]       = useState('morning')
  const [showSheet, setShowSheet] = useState(false)
  const [editItem,  setEditItem]  = useState(null)

  const haptic = useHaptic()
  const { items, isLoading, addItem, updateItem, deleteItem, setReminder } = useRoutineItems()
  const { toggleComplete, isCompleted, getLog } = useRoutineLogs(today)
  const { data: history = [] } = useRoutineHistory(30)

  const last7   = useMemo(() => getLast7(today), [today])
  const filtered = items.filter(i => i.routine_type === tab)
  const total    = filtered.length
  const completedCount = filtered.filter(i => isCompleted(i.id)).length
  const pct      = total > 0 ? Math.round((completedCount / total) * 100) : 0
  const totalMin = filtered.reduce((s, i) => s + (i.duration_min || 0), 0)

  // Weekly completion: for each of last 7 days, what % of habits were done?
  const weekStats = useMemo(() => {
    return last7.map(date => {
      if (!total) return { date, pct: 0 }
      const doneCnt = filtered.filter(item => {
        if (date === today) return isCompleted(item.id)
        return history.some(l => l.item_id === item.id && l.date === date)
      }).length
      return { date, pct: total > 0 ? Math.round((doneCnt / total) * 100) : 0 }
    })
  }, [last7, filtered, history, today, isCompleted])

  const handleToggle = (item) => {
    haptic.bump?.()
    const log = getLog(item.id)
    toggleComplete.mutate({ itemId: item.id, completed: !isCompleted(item.id), existingLogId: log?.id })
  }

  const handleAdd = async (form) => {
    const item = await addItem.mutateAsync({
      title: form.title,
      routine_type: tab,
      position: filtered.length,
      category: form.category,
      duration_min: form.duration_min,
      notes: form.notes,
    })
    if (form.reminder_time && item) {
      await setReminder.mutateAsync({
        id: item.id,
        reminderTime: form.reminder_time,
        routineType: tab,
        title: form.title,
        existingCalendarEventId: null,
      })
    }
    setShowSheet(false)
    haptic.bump?.()
  }

  const handleEdit = async (form) => {
    await updateItem.mutateAsync({ id: editItem.id, title: form.title, category: form.category, duration_min: form.duration_min, notes: form.notes })
    const reminderChanged = form.reminder_time !== (editItem.reminder_time?.slice(0,5) || '')
    if (reminderChanged) {
      await setReminder.mutateAsync({
        id: editItem.id,
        reminderTime: form.reminder_time || null,
        routineType: editItem.routine_type,
        title: form.title,
        existingCalendarEventId: editItem.calendar_event_id,
      })
    }
    setEditItem(null)
    haptic.bump?.()
  }

  const handleDelete = (item) => {
    haptic.bump?.()
    deleteItem.mutate({ id: item.id, calendarEventId: item.calendar_event_id })
  }

  const DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  const tabStyle = (active) => ({
    flex: 1, padding:'9px 0', borderRadius:9,
    background: active ? 'rgba(200,212,200,0.12)' : 'transparent',
    border: `1px solid ${active ? 'rgba(200,212,200,0.35)' : 'transparent'}`,
    color: active ? '#c8d4c8' : 'rgba(212,212,232,0.35)',
    fontSize: 12, fontFamily: FF, fontWeight: active ? 700 : 400,
    cursor: 'pointer', transition: 'all 0.18s', display:'flex', alignItems:'center', justifyContent:'center', gap:5,
  })

  return (
    <div style={{ padding:'20px 18px 80px' }}>

      {/* ── Tab switcher ── */}
      <div style={{ display:'flex', gap:6, marginBottom:24, background:'rgba(212,212,232,0.04)', padding:4, borderRadius:12 }}>
        <button style={tabStyle(tab === 'morning')} onClick={() => setTab('morning')}>
          <span style={{ fontSize:14 }}>🌅</span> Morning
        </button>
        <button style={tabStyle(tab === 'night')} onClick={() => setTab('night')}>
          <span style={{ fontSize:14 }}>🌙</span> Night
        </button>
      </div>

      {/* ── Hero progress card ── */}
      <div style={{
        background:'var(--bg-card)', border:'1px solid var(--border)',
        borderRadius:18, padding:'20px 18px', marginBottom:22,
        boxShadow:'var(--card-shadow)', display:'flex', alignItems:'center', gap:18,
      }}>
        <div style={{ position:'relative', flexShrink:0 }}>
          <ProgressRing pct={pct} size={72} stroke={5}/>
          <div style={{
            position:'absolute', inset:0, display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center',
          }}>
            <span style={{ color:'var(--text-primary)', fontSize:15, fontWeight:900, fontFamily:FF, lineHeight:1 }}>{completedCount}</span>
            <span style={{ color:'var(--text-muted)', fontSize:9, fontFamily:FF }}>{total > 0 ? `/${total}` : '—'}</span>
          </div>
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ color:'var(--text-primary)', fontSize:16, fontWeight:900, fontFamily:FF, marginBottom:2 }}>
            {pct === 100 && total > 0 ? 'Complete! 🎉' : tab === 'morning' ? 'Morning Routine' : 'Night Routine'}
          </p>
          <p style={{ color:'var(--text-muted)', fontSize:12, fontFamily:FF, marginBottom:8 }}>
            {total === 0 ? 'No habits yet' : `${completedCount} of ${total} done today${totalMin > 0 ? ` · ~${totalMin} min` : ''}`}
          </p>
          {/* Mini week bar */}
          <div style={{ display:'flex', gap:4, alignItems:'flex-end' }}>
            {weekStats.map(({ date, pct: wp }, i) => {
              const isToday = i === 6
              const d = new Date(date + 'T12:00:00')
              return (
                <div key={date} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                  <div style={{
                    width: 14, height: 22, borderRadius:4, display:'flex', alignItems:'flex-end', overflow:'hidden',
                    background:'rgba(212,212,232,0.06)',
                    outline: isToday ? '1px solid rgba(200,212,200,0.25)' : 'none',
                  }}>
                    <div style={{
                      width:'100%',
                      height: `${wp}%`,
                      background: isToday
                        ? (wp === 100 ? '#a8d8a8' : 'rgba(200,212,200,0.6)')
                        : 'rgba(200,212,200,0.3)',
                      transition:'height 0.4s ease',
                    }}/>
                  </div>
                  <span style={{ color: isToday ? 'rgba(200,212,200,0.6)' : 'rgba(212,212,232,0.2)', fontSize:7, fontFamily:FF }}>
                    {DAY_SHORT[d.getDay()].charAt(0)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      {total > 0 && (() => {
        const best = filtered.length > 0
          ? Math.max(...filtered.map(i => computeBestStreak(i.id, history)))
          : 0
        const curStreak = filtered.length > 0
          ? Math.max(...filtered.map(i => computeStreak(i.id, history, today)))
          : 0
        const weekDone = weekStats.filter(s => s.pct === 100).length
        return (
          <div style={{
            display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:22,
          }}>
            {[
              { label:'Streak',    value: curStreak > 0 ? `🔥 ${curStreak}d` : '0d' },
              { label:'Best',      value: best > 0 ? `⭐ ${best}d` : '0d' },
              { label:'This Week', value: `${weekDone}/7` },
            ].map(s => (
              <div key={s.label} style={{
                background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12,
                padding:'12px 10px', textAlign:'center', boxShadow:'var(--card-shadow)',
              }}>
                <p style={{ color:'var(--text-primary)', fontSize:15, fontWeight:800, fontFamily:FF, marginBottom:2 }}>{s.value}</p>
                <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', fontFamily:FF }}>{s.label}</p>
              </div>
            ))}
          </div>
        )
      })()}

      {/* ── Section header ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:2, height:14, background:'linear-gradient(to bottom,var(--btn-bg),var(--btn-bg)22)', borderRadius:2, boxShadow:'0 0 6px var(--btn-bg)66' }}/>
          <p style={{ color:'var(--text-secondary)', fontSize:10, letterSpacing:'0.26em', textTransform:'uppercase', fontFamily:FF, fontWeight:700, margin:0 }}>
            Habits
          </p>
        </div>
        <button
          onClick={() => { setEditItem(null); setShowSheet(true) }}
          style={{
            display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:8,
            background:'var(--btn-bg)', border:'none',
            color:'var(--btn-text)', fontSize:11, fontFamily:FF, fontWeight:800,
            letterSpacing:'0.08em', cursor:'pointer',
          }}>
          + Add
        </button>
      </div>

      {/* ── Empty state ── */}
      {total === 0 && !isLoading && (
        <div style={{
          padding:'36px 20px', textAlign:'center',
          background:'var(--bg-card)', border:'1px dashed rgba(212,212,232,0.1)',
          borderRadius:16,
        }}>
          <p style={{ fontSize:32, marginBottom:12 }}>{tab === 'morning' ? '🌅' : '🌙'}</p>
          <p style={{ color:'var(--text-muted)', fontSize:14, fontFamily:FF, fontWeight:600, marginBottom:6 }}>
            No {tab} habits yet
          </p>
          <p style={{ color:'rgba(212,212,232,0.25)', fontSize:12, fontFamily:FF, lineHeight:1.6, maxWidth:220, margin:'0 auto' }}>
            Build your {tab === 'morning' ? 'morning' : 'evening'} routine. Tap <strong style={{ color:'rgba(212,212,232,0.4)' }}>+ Add</strong> to get started.
          </p>
        </div>
      )}

      {/* ── Habit list ── */}
      {total > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.map(item => {
            const done = isCompleted(item.id)
            const cat  = CATS[item.category] || CATS.other
            const streak = computeStreak(item.id, history, today)

            return (
              <div key={item.id} style={{
                background: done ? `${cat.color}0a` : 'var(--bg-card)',
                border: `1px solid ${done ? cat.color + '30' : 'var(--border)'}`,
                borderRadius:14, padding:'14px 14px 12px',
                boxShadow:'var(--card-shadow)', transition:'all 0.22s',
              }}>
                {/* Top row */}
                <div style={{ display:'flex', alignItems:'center', gap:11, marginBottom: item.notes ? 8 : 10 }}>
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggle(item)}
                    style={{
                      width:26, height:26, borderRadius:8, flexShrink:0,
                      border: `2px solid ${done ? cat.color : 'rgba(212,212,232,0.18)'}`,
                      background: done ? `${cat.color}28` : 'transparent',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      cursor:'pointer', transition:'all 0.18s',
                    }}>
                    {done && (
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={cat.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>

                  {/* Category emoji */}
                  <span style={{
                    fontSize:18, flexShrink:0, opacity: done ? 0.5 : 1,
                    filter: done ? 'grayscale(60%)' : 'none',
                    transition:'all 0.2s',
                  }}>{cat.emoji}</span>

                  {/* Title + meta */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{
                      color: done ? 'rgba(212,212,232,0.4)' : 'var(--text-primary)',
                      fontSize:14, fontFamily:FF, fontWeight:600, marginBottom:0,
                      textDecoration: done ? 'line-through' : 'none',
                      textDecorationColor: 'rgba(212,212,232,0.3)',
                      transition:'all 0.2s', lineHeight:1.3,
                    }}>{item.title}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:2 }}>
                      {item.duration_min && (
                        <span style={{ color:'rgba(212,212,232,0.3)', fontSize:10, fontFamily:FF }}>
                          {item.duration_min} min
                        </span>
                      )}
                      {item.reminder_enabled && item.reminder_time && (
                        <span style={{ color:'rgba(200,212,200,0.4)', fontSize:10, fontFamily:FF }}>
                          🔔 {item.reminder_time.slice(0,5)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Streak badge */}
                  {streak > 0 && (
                    <div style={{
                      display:'flex', alignItems:'center', gap:3,
                      padding:'3px 8px', borderRadius:99, flexShrink:0,
                      background: streak >= 7 ? 'rgba(220,79,58,0.12)' : 'rgba(212,212,232,0.05)',
                      border: `1px solid ${streak >= 7 ? 'rgba(220,79,58,0.3)' : 'rgba(212,212,232,0.08)'}`,
                    }}>
                      <span style={{ fontSize:10 }}>{streak >= 7 ? '🔥' : '✦'}</span>
                      <span style={{ color: streak >= 7 ? '#e0705a' : 'rgba(212,212,232,0.35)', fontSize:10, fontFamily:FF, fontWeight:700 }}>{streak}d</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {item.notes && (
                  <p style={{
                    color:'rgba(212,212,232,0.28)', fontSize:11, fontFamily:FF,
                    lineHeight:1.5, marginBottom:10, paddingLeft:37,
                    fontStyle:'italic',
                  }}>{item.notes}</p>
                )}

                {/* 7-day dots + actions row */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingLeft:37 }}>
                  <DotRow itemId={item.id} last7={last7} history={history} todayIsCompleted={done}/>
                  <div style={{ display:'flex', gap:6 }}>
                    {/* Edit */}
                    <button
                      onClick={() => { setEditItem(item); setShowSheet(true) }}
                      style={{
                        width:26, height:26, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center',
                        background:'transparent', border:'1px solid rgba(212,212,232,0.08)',
                        color:'rgba(212,212,232,0.25)', cursor:'pointer', transition:'all 0.15s', flexShrink:0,
                      }}>
                      <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(item)}
                      style={{
                        width:26, height:26, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center',
                        background:'transparent', border:'1px solid rgba(212,212,232,0.06)',
                        color:'rgba(212,212,232,0.18)', cursor:'pointer', transition:'all 0.15s', flexShrink:0,
                      }}>
                      <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Add / Edit sheet ── */}
      {(showSheet || editItem) && (
        <HabitSheet
          initial={editItem || undefined}
          routineType={tab}
          saving={addItem.isPending || updateItem.isPending}
          onSave={editItem ? handleEdit : handleAdd}
          onClose={() => { setShowSheet(false); setEditItem(null) }}
        />
      )}
    </div>
  )
}
