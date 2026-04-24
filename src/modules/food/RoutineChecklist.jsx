import { useState } from 'react'
import { useRoutineItems, useRoutineLogs } from '../../hooks/useRoutine'
import { useHaptic } from '../../hooks/useHaptic'

const SunIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
  </svg>
)

const MoonIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

const BellIcon = ({ filled }) => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)

const TrashIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)

const PlusIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const CheckIcon = () => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

export default function RoutineChecklist({ today }) {
  const [tab, setTab] = useState('morning')
  const [newTitle, setNewTitle] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [reminderItem, setReminderItem] = useState(null)
  const [reminderTime, setReminderTime] = useState('')

  const haptic = useHaptic()
  const { items, addItem, deleteItem, setReminder } = useRoutineItems()
  const { toggleComplete, isCompleted, getLog } = useRoutineLogs(today)

  const filtered = items.filter(i => i.routine_type === tab)
  const completedCount = filtered.filter(i => isCompleted(i.id)).length
  const total = filtered.length

  const handleAdd = async () => {
    if (!newTitle.trim()) return
    await addItem.mutateAsync({ title: newTitle.trim(), routine_type: tab, position: filtered.length })
    setNewTitle('')
    setShowAdd(false)
    haptic.bump?.()
  }

  const handleToggle = (item) => {
    haptic.bump?.()
    const log = getLog(item.id)
    toggleComplete.mutate({ itemId: item.id, completed: !isCompleted(item.id), existingLogId: log?.id })
  }

  const handleOpenReminder = (item) => {
    setReminderItem(item)
    setReminderTime(item.reminder_time ? item.reminder_time.slice(0, 5) : '')
  }

  const handleSaveReminder = async () => {
    if (!reminderItem) return
    await setReminder.mutateAsync({
      id: reminderItem.id,
      reminderTime: reminderTime || null,
      routineType: reminderItem.routine_type,
      title: reminderItem.title,
      existingCalendarEventId: reminderItem.calendar_event_id,
    })
    setReminderItem(null)
    setReminderTime('')
    haptic.bump?.()
  }

  const handleRemoveReminder = async (item) => {
    await setReminder.mutateAsync({
      id: item.id,
      reminderTime: null,
      routineType: item.routine_type,
      title: item.title,
      existingCalendarEventId: item.calendar_event_id,
    })
  }

  const handleDelete = (item) => {
    haptic.bump?.()
    deleteItem.mutate({ id: item.id, calendarEventId: item.calendar_event_id })
  }

  const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0

  const tabStyle = (active) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', borderRadius: 99,
    border: `1px solid ${active ? 'rgba(200,212,200,0.4)' : 'rgba(212,212,232,0.08)'}`,
    background: active ? 'rgba(200,212,200,0.1)' : 'transparent',
    color: active ? '#c8d4c8' : 'rgba(212,212,232,0.35)',
    fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif',
    fontWeight: active ? 700 : 400, cursor: 'pointer',
    transition: 'all 0.18s', letterSpacing: '0.04em',
  })

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <p style={{ color: 'var(--text-primary)', fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif' }}>
            Daily Routine
          </p>
          {total > 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: 10, fontFamily: 'Helvetica Neue,sans-serif', marginTop: 2 }}>
              {completedCount}/{total} completed
            </p>
          )}
        </div>
        <button
          onClick={() => { setShowAdd(v => !v); setNewTitle('') }}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '7px 12px', borderRadius: 9,
            background: showAdd ? 'rgba(212,212,232,0.1)' : 'var(--stat-bg)',
            border: '1px solid var(--border)', color: 'var(--text-secondary)',
            fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.18s',
          }}>
          <PlusIcon /> Add
        </button>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button style={tabStyle(tab === 'morning')} onClick={() => setTab('morning')}>
          <SunIcon /> Morning
        </button>
        <button style={tabStyle(tab === 'night')} onClick={() => setTab('night')}>
          <MoonIcon /> Night
        </button>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ height: 3, background: 'rgba(212,212,232,0.07)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: progressPct === 100 ? '#a8d8a8' : 'rgba(200,212,200,0.5)',
              width: `${progressPct}%`, transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div style={{
          display: 'flex', gap: 8, marginBottom: 14,
          padding: '10px 12px', background: 'var(--bg-card)',
          border: '1px solid var(--border)', borderRadius: 10,
        }}>
          <input
            autoFocus
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder={`Add ${tab} routine item…`}
            style={{
              flex: 1, background: 'transparent', border: 'none',
              color: 'var(--text-primary)', fontSize: 13,
              fontFamily: 'Helvetica Neue,sans-serif',
            }}
          />
          <button
            onClick={handleAdd}
            disabled={!newTitle.trim() || addItem.isPending}
            style={{
              padding: '6px 14px', borderRadius: 7,
              background: newTitle.trim() ? 'var(--btn-bg)' : 'rgba(212,212,232,0.07)',
              color: newTitle.trim() ? 'var(--bg-primary)' : 'rgba(212,212,232,0.2)',
              border: 'none', fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif',
              fontWeight: 700, cursor: newTitle.trim() ? 'pointer' : 'default',
              transition: 'all 0.18s',
            }}>
            Save
          </button>
        </div>
      )}

      {/* Empty state */}
      {total === 0 && !showAdd && (
        <div style={{
          padding: '24px 16px', textAlign: 'center',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, borderStyle: 'dashed',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif' }}>
            No {tab} routine yet.
          </p>
          <p style={{ color: 'rgba(212,212,232,0.2)', fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif', marginTop: 4 }}>
            Tap Add to build your routine.
          </p>
        </div>
      )}

      {/* Checklist items */}
      {total > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((item) => {
            const done = isCompleted(item.id)
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  background: done ? 'rgba(168,216,168,0.06)' : 'var(--bg-card)',
                  border: `1px solid ${done ? 'rgba(168,216,168,0.2)' : 'var(--border)'}`,
                  borderRadius: 10, transition: 'all 0.2s',
                }}>
                {/* Checkbox */}
                <button
                  onClick={() => handleToggle(item)}
                  style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    border: `1.5px solid ${done ? '#a8d8a8' : 'rgba(212,212,232,0.2)'}`,
                    background: done ? 'rgba(168,216,168,0.2)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.18s',
                    color: done ? '#a8d8a8' : 'transparent',
                  }}>
                  {done && <CheckIcon />}
                </button>

                {/* Title */}
                <p style={{
                  flex: 1, fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif',
                  color: done ? 'rgba(168,216,168,0.6)' : 'var(--text-primary)',
                  textDecoration: done ? 'line-through' : 'none',
                  transition: 'all 0.2s',
                }}>
                  {item.title}
                </p>

                {/* Reminder indicator */}
                {item.reminder_enabled && item.reminder_time && (
                  <span style={{
                    fontSize: 10, fontFamily: 'Helvetica Neue,sans-serif',
                    color: 'rgba(200,212,200,0.5)', letterSpacing: '0.04em',
                  }}>
                    {item.reminder_time.slice(0, 5)}
                  </span>
                )}

                {/* Bell button */}
                <button
                  onClick={() => handleOpenReminder(item)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                    background: item.reminder_enabled ? 'rgba(200,212,200,0.1)' : 'transparent',
                    border: `1px solid ${item.reminder_enabled ? 'rgba(200,212,200,0.3)' : 'rgba(212,212,232,0.08)'}`,
                    color: item.reminder_enabled ? '#c8d4c8' : 'rgba(212,212,232,0.25)',
                    cursor: 'pointer', transition: 'all 0.18s',
                  }}>
                  <BellIcon filled={item.reminder_enabled} />
                </button>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(item)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                    background: 'transparent',
                    border: '1px solid rgba(212,212,232,0.06)',
                    color: 'rgba(212,212,232,0.18)',
                    cursor: 'pointer', transition: 'all 0.18s',
                  }}>
                  <TrashIcon />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Reminder modal */}
      {reminderItem && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          padding: '0 0 32px',
        }} onClick={(e) => { if (e.target === e.currentTarget) { setReminderItem(null); setReminderTime('') } }}>
          <div style={{
            width: '100%', maxWidth: 480,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '18px 18px 12px 12px',
            padding: '24px 20px 20px',
          }}>
            {/* Handle */}
            <div style={{ width: 36, height: 4, background: 'rgba(212,212,232,0.15)', borderRadius: 99, margin: '0 auto 20px' }} />

            <p style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 700, fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 4 }}>
              Set Reminder
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 20 }}>
              {reminderItem.title}
            </p>

            <p style={{ color: 'rgba(212,212,232,0.4)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 8 }}>
              Reminder Time
            </p>
            <input
              type="time"
              value={reminderTime}
              onChange={e => setReminderTime(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px',
                background: 'rgba(212,212,232,0.05)',
                border: '1px solid rgba(212,212,232,0.12)',
                borderRadius: 10, color: 'var(--text-primary)',
                fontSize: 15, fontFamily: 'Helvetica Neue,sans-serif',
                marginBottom: 8,
                colorScheme: 'dark',
              }}
            />
            <p style={{ color: 'rgba(212,212,232,0.3)', fontSize: 10, fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 20 }}>
              Reminder syncs to your calendar as a daily recurring event.
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              {reminderItem.reminder_enabled && (
                <button
                  onClick={() => handleRemoveReminder(reminderItem).then(() => { setReminderItem(null); setReminderTime('') })}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 10,
                    background: 'transparent',
                    border: '1px solid rgba(212,212,232,0.12)',
                    color: 'rgba(212,212,232,0.4)',
                    fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', fontWeight: 600,
                    cursor: 'pointer',
                  }}>
                  Remove
                </button>
              )}
              <button
                onClick={handleSaveReminder}
                disabled={setReminder.isPending}
                style={{
                  flex: 2, padding: '12px', borderRadius: 10,
                  background: reminderTime ? 'var(--btn-bg)' : 'rgba(212,212,232,0.07)',
                  color: reminderTime ? 'var(--bg-primary)' : 'rgba(212,212,232,0.3)',
                  border: 'none',
                  fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', fontWeight: 700,
                  cursor: reminderTime ? 'pointer' : 'default',
                  transition: 'all 0.18s',
                }}>
                {setReminder.isPending ? 'Saving…' : 'Save Reminder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
