import { useState } from 'react'

/**
 * Exercise row for the muscle maps.
 *
 * A faithful extraction of `ExCard` from MuscleMapView.jsx (the current 2D
 * model) so the new map's exercise list is not a lookalike but the same
 * markup, spacing, chips, inline log form and Watch button.
 *
 * MuscleMapView still has its own private copy - the replacement spec says
 * leave that file untouched. When the old map is retired, delete its copy and
 * point it here rather than letting the two drift.
 */

const FF = 'Helvetica Neue,Arial,sans-serif'

/** The app's convention: a curated search, never a hardcoded video id. */
export const ytUrlFor = q =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`

/* mmPulse lives inside MuscleMapView's own <style> block, so it does not exist
   for any other consumer. Ship it alongside the row that depends on it. */
export function ExerciseRowStyles() {
  return (
    <style>{`
      @keyframes mmPulse { 0%,100% { opacity:1 } 50% { opacity:0.6 } }
      @-webkit-keyframes mmPulse { 0%,100% { opacity:1 } 50% { opacity:0.6 } }
    `}</style>
  )
}

export default function ExerciseRow({ ex, accent, onLog, muscleLabel }) {
  const [logging, setLogging] = useState(false)
  const [sets,    setSets]    = useState('')
  const [reps,    setReps]    = useState('')
  const [weight,  setWeight]  = useState('')
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const ytUrl = ytUrlFor(ex.yt)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onLog({ name: ex.name, sets, reps, weight, muscleLabel })
      setSaved(true)
      setTimeout(() => {
        setSaved(false); setLogging(false); setSets(''); setReps(''); setWeight('')
      }, 900)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, overflow:'hidden' }}>
      <div style={{ padding:'11px 12px', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
        <div style={{ flex:1 }}>
          <p style={{ color:'var(--text-primary)', fontSize:12, fontWeight:700, fontFamily:FF, marginBottom:3 }}>{ex.name}</p>
          <div style={{ display:'flex', gap:5 }}>
            <span style={{ color:'rgba(255,255,255,0.82)', fontSize:9, fontFamily:FF, background:'rgba(255,255,255,0.06)', padding:'2px 6px', borderRadius:4, border:'1px solid rgba(255,255,255,0.14)', animation:'mmPulse 2.8s ease-in-out infinite' }}>{ex.eq}</span>
            <span style={{ color:accent, fontSize:9, fontFamily:FF, fontWeight:700, background:`${accent}18`, padding:'2px 6px', borderRadius:4 }}>{ex.sets}</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:5, flexShrink:0 }}>
          {onLog && (
            <button onClick={() => setLogging(l => !l)}
              style={{
                display:'flex', alignItems:'center', gap:4, padding:'6px 10px', borderRadius:7,
                background: logging ? 'rgba(248,113,113,0.15)' : 'rgba(180,188,204,0.1)',
                border: `1px solid ${logging ? 'rgba(248,113,113,0.4)' : 'rgba(180,188,204,0.25)'}`,
                color: logging ? '#f87171' : '#b4bccc',
                fontSize:9, fontWeight:700, fontFamily:FF, letterSpacing:'0.08em', cursor:'pointer', transition:'all 0.15s',
              }}>
              <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Log
            </button>
          )}
          <a href={ytUrl} target="_blank" rel="noopener noreferrer"
            style={{
              display:'flex', alignItems:'center', gap:4,
              padding:'6px 9px', borderRadius:7,
              background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.28)',
              color:'#ef4444', fontSize:9, fontWeight:700,
              fontFamily:FF, letterSpacing:'0.08em', textDecoration:'none',
            }}
            onClick={e => e.stopPropagation()}>
            <svg width={10} height={10} viewBox="0 0 24 24" fill="#ef4444">
              <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.8 5 12 5 12 5s-4.8 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.2.8C6.8 19 12 19 12 19s4.8 0 7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8z"/>
              <polygon fill="white" points="10,8.5 16,12 10,15.5"/>
            </svg>
            Watch
          </a>
        </div>
      </div>

      <div style={{ overflow:'hidden', maxHeight: logging ? 130 : 0, transition:'max-height 0.28s cubic-bezier(.16,1,.3,1)' }}>
        <div style={{ padding:'0 12px 12px', borderTop:'1px solid rgba(212,212,232,0.06)' }}>
          <div style={{ display:'flex', gap:7, marginTop:10, marginBottom:8 }}>
            {[['Sets', sets, setSets], ['Reps', reps, setReps], ['Weight (lbs)', weight, setWeight]].map(([lbl, val, set]) => (
              <div key={lbl} style={{ flex:1 }}>
                <p style={{ color:'rgba(212,212,232,0.3)', fontSize:8, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:FF, marginBottom:4 }}>{lbl}</p>
                <input type="number" value={val} onChange={e => set(e.target.value)} placeholder="—"
                  style={{ width:'100%', background:'rgba(212,212,232,0.05)', border:'1px solid rgba(212,212,232,0.1)', borderRadius:7, padding:'7px 4px', color:'var(--text-primary)', fontSize:15, fontWeight:700, fontFamily:FF, textAlign:'center', outline:'none', boxSizing:'border-box' }} />
              </div>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving || saved}
            style={{
              width:'100%', padding:'8px', borderRadius:8,
              background: saved ? 'rgba(16,185,129,0.15)' : 'rgba(180,188,204,0.12)',
              border: `1px solid ${saved ? 'rgba(16,185,129,0.4)' : 'rgba(180,188,204,0.28)'}`,
              color: saved ? '#10b981' : '#b4bccc',
              fontSize:10, fontWeight:700, fontFamily:FF, letterSpacing:'0.1em', textTransform:'uppercase',
              cursor: saving || saved ? 'not-allowed' : 'pointer', transition:'all 0.2s',
            }}>
            {saved ? '✓ Logged' : saving ? 'Saving…' : `Log ${ex.name}`}
          </button>
        </div>
      </div>
    </div>
  )
}
