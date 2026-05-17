import { useState, useMemo, useEffect, useRef } from 'react'
import Model from 'react-body-highlighter'
import { DB } from './WorkoutGuide'
import geminiModel from './Images/Gemini-humoid.png'

const FF = 'Helvetica Neue,Arial,sans-serif'

const MIND_COLOR      = '#a78bfa'
const HIGHLIGHT_COLOR = '#F5A623'
const ARMOR_NAVY = '#1B3A6B'
const ARMOR_GLOW = '#E8F4FF'
const ARMOR_RED  = '#8B1A1A'
const ARMOR_GOLD = '#F5A623'

function muscleArmorColor(m) {
  if (['Head','Biceps','Triceps','Quads','Abs','Glutes','Hamstrings','Lower Back','Forearms'].includes(m)) return ARMOR_GLOW
  if (['Calves','Chest','Core','Traps','Upper Back'].includes(m)) return ARMOR_RED
  if (m === 'Shoulders') return ARMOR_GOLD
  return ARMOR_NAVY
}

// Override colors to match the mech figure's actual panel colors
function mechZoneColor(group) {
  if (group === 'Head')      return MIND_COLOR          // purple for mind zone
  if (group === 'Traps')     return ARMOR_GOLD          // gold wings
  if (group === 'Chest')     return ARMOR_NAVY          // navy chest panel
  if (group === 'Shoulders') return ARMOR_NAVY          // navy pauldrons
  if (group === 'Biceps')    return ARMOR_GLOW          // white arm panels
  if (group === 'Forearms')  return ARMOR_GLOW          // white forearm panels
  if (group === 'Abs')       return ARMOR_NAVY          // navy abs panel
  if (group === 'Core')      return ARMOR_GOLD          // gold side panels
  if (group === 'Quads')     return ARMOR_GLOW          // white thigh panels
  if (group === 'Calves')    return ARMOR_RED           // RED calf panels
  return ARMOR_NAVY
}

function mechGlowFilter(group, isSel) {
  const color = mechZoneColor(group)
  const whiteEdge = isSel
    ? 'drop-shadow(0 0 2px rgba(255,255,255,1)) drop-shadow(0 0 5px rgba(255,255,255,0.95)) drop-shadow(0 0 10px rgba(255,255,255,0.70))'
    : undefined
  let colorGlow
  if (color === ARMOR_GLOW) {
    colorGlow = isSel
      ? 'drop-shadow(0 0 20px rgba(255,255,255,1.0)) drop-shadow(0 0 10px rgba(232,244,255,0.95))'
      : 'drop-shadow(0 0 8px rgba(232,244,255,0.40))'
  } else if (color === ARMOR_RED) {
    colorGlow = isSel
      ? 'drop-shadow(0 0 20px rgba(200,30,30,1.0)) drop-shadow(0 0 10px rgba(139,26,26,0.95))'
      : 'drop-shadow(0 0 8px rgba(139,26,26,0.45))'
  } else if (color === ARMOR_GOLD) {
    colorGlow = isSel
      ? 'drop-shadow(0 0 20px rgba(245,166,35,1.0)) drop-shadow(0 0 10px rgba(255,200,80,0.95))'
      : 'drop-shadow(0 0 8px rgba(245,166,35,0.40))'
  } else if (color === MIND_COLOR) {
    colorGlow = isSel
      ? 'drop-shadow(0 0 20px rgba(167,139,250,1.0)) drop-shadow(0 0 10px rgba(167,139,250,0.95))'
      : 'drop-shadow(0 0 8px rgba(167,139,250,0.35))'
  } else {
    colorGlow = isSel
      ? 'drop-shadow(0 0 20px rgba(56,100,200,1.0)) drop-shadow(0 0 10px rgba(27,58,107,0.95))'
      : 'drop-shadow(0 0 8px rgba(27,58,107,0.40))'
  }
  return isSel ? `${whiteEdge} ${colorGlow}` : colorGlow
}

const MUSCLES = ['Head','Chest','Shoulders','Traps','Biceps','Triceps','Forearms','Abs','Core','Upper Back','Lower Back','Quads','Hamstrings','Glutes','Calves']

// Kept for rear-view placeholder (react-body-highlighter)
const SLUG_MAP = {
  Head:           ['head'],
  Chest:          ['chest'],
  Shoulders:      ['front-deltoids','back-deltoids'],
  Traps:          ['trapezius','neck'],
  Biceps:         ['biceps'],
  Triceps:        ['triceps'],
  Forearms:       ['forearm'],
  Abs:            ['abs'],
  Core:           ['obliques'],
  'Upper Back':   ['upper-back'],
  'Lower Back':   ['lower-back'],
  Quads:          ['quadriceps'],
  Hamstrings:     ['hamstring'],
  Glutes:         ['gluteal'],
  Calves:         ['calves','left-soleus','right-soleus'],
}

const GROUP_FROM_SLUG = {
  head:'Head', chest:'Chest', 'front-deltoids':'Shoulders', 'back-deltoids':'Shoulders',
  biceps:'Biceps', forearm:'Forearms', triceps:'Triceps', abs:'Abs', obliques:'Core',
  trapezius:'Traps', neck:'Traps', 'upper-back':'Upper Back', 'lower-back':'Lower Back',
  quadriceps:'Quads', adductor:'Quads', abductors:'Quads', hamstring:'Hamstrings',
  gluteal:'Glutes', calves:'Calves', 'left-soleus':'Calves', 'right-soleus':'Calves',
}

const GROUP_TO_DB = {
  Head:'', Chest:'chest', Shoulders:'shoulders', Traps:'traps', Biceps:'biceps',
  Triceps:'triceps', Forearms:'biceps', Abs:'core', Core:'core',
  'Upper Back':'upper_back', 'Lower Back':'lower_back', Quads:'quads',
  Hamstrings:'hamstrings', Glutes:'glutes', Calves:'calves',
}

const SCI_SHORT = {
  Head:'Mind & Recovery', Chest:'Pectoralis', Shoulders:'Deltoideus', Traps:'Trapezius',
  Biceps:'Biceps Brachii', Triceps:'Triceps Brachii', Forearms:'Brachioradialis',
  Abs:'Rectus Abdominis', Core:'Obliques', 'Upper Back':'Rhomboids',
  'Lower Back':'Erector Spinae', Quads:'Quadriceps Femoris', Hamstrings:'Biceps Femoris',
  Glutes:'Gluteus Maximus', Calves:'Gastrocnemius',
}

// Hit zones traced against Gemini-humoid.png panel boundaries in 0 0 100 200 space.
// All zones fill="transparent" at rest — the mech panels show naturally.
// Joints/dark separator panels between zones are intentionally un-zoned.
// Coordinates are best-estimate; verify and adjust in browser devtools.
const FRONT_HIT_ZONES = [
  // ── TORSO ──
  { id: 'chest',      group: 'Chest',
    points: '34,28 66,28 70,36 68,56 50,62 32,56 30,36' },
  { id: 'abs',        group: 'Abs',
    points: '40,60 60,60 64,70 58,90 50,94 42,90 36,70' },
  { id: 'l-core',     group: 'Core',
    points: '26,62 40,60 38,86 24,84' },
  { id: 'r-core',     group: 'Core',
    points: '60,60 74,62 76,84 62,86' },
  // ── SHOULDERS / TRAPS ──
  { id: 'l-trap',     group: 'Traps',
    points: '16,24 42,22 42,30 18,30' },
  { id: 'r-trap',     group: 'Traps',
    points: '58,22 84,24 82,30 58,30' },
  { id: 'l-shoulder', group: 'Shoulders',
    points: '14,26 34,26 36,44 28,50 14,44' },
  { id: 'r-shoulder', group: 'Shoulders',
    points: '66,26 86,26 86,44 72,50 64,44' },
  // ── ARMS ──
  { id: 'l-bicep',    group: 'Biceps',
    points: '8,44 28,44 26,72 8,72' },
  { id: 'r-bicep',    group: 'Biceps',
    points: '72,44 92,44 92,72 74,72' },
  { id: 'l-forearm',  group: 'Forearms',
    points: '4,72 24,72 22,94 4,94' },
  { id: 'r-forearm',  group: 'Forearms',
    points: '76,72 96,72 96,94 78,94' },
  // ── LEGS ──
  { id: 'l-quad',     group: 'Quads',
    points: '30,94 50,94 48,144 28,144' },
  { id: 'r-quad',     group: 'Quads',
    points: '50,94 70,94 72,144 52,144' },
  { id: 'l-calf',     group: 'Calves',
    points: '30,154 44,154 42,197 28,197' },
  { id: 'r-calf',     group: 'Calves',
    points: '56,154 70,154 72,197 58,197' },
]

// Head zone polygon (white helmet region)
const HEAD_POINTS = '50,4 63,7 65,17 57,23 50,25 43,23 35,17 37,7'

// Zones active on front view
const FRONT_ACTIVE = new Set(['Head','Traps','Chest','Shoulders','Biceps','Forearms','Abs','Core','Quads','Calves'])
const REAR_ACTIVE  = new Set(['Head','Traps','Shoulders','Upper Back','Lower Back','Triceps','Glutes','Hamstrings','Calves'])

const LABELS = {
  anterior: [
    { group: 'Head',      x: 103, y: 14,  anchor: 'start', ex: 63 },
    { group: 'Traps',     x: -3,  y: 26,  anchor: 'end',   ex: 18 },
    { group: 'Shoulders', x: 103, y: 36,  anchor: 'start', ex: 82 },
    { group: 'Chest',     x: 103, y: 44,  anchor: 'start', ex: 68 },
    { group: 'Biceps',    x: -3,  y: 58,  anchor: 'end',   ex: 10 },
    { group: 'Forearms',  x: -3,  y: 82,  anchor: 'end',   ex: 6  },
    { group: 'Abs',       x: 103, y: 72,  anchor: 'start', ex: 62 },
    { group: 'Core',      x: 103, y: 84,  anchor: 'start', ex: 74 },
    { group: 'Quads',     x: -3,  y: 118, anchor: 'end',   ex: 30 },
    { group: 'Calves',    x: 103, y: 174, anchor: 'start', ex: 70 },
  ],
  posterior: [
    { group: 'Head',       x: 103, y: 10,  anchor: 'start', ex: 57 },
    { group: 'Traps',      x: 103, y: 38,  anchor: 'start', ex: 64 },
    { group: 'Shoulders',  x: -3,  y: 46,  anchor: 'end',   ex: 29 },
    { group: 'Upper Back', x: 103, y: 57,  anchor: 'start', ex: 66 },
    { group: 'Triceps',    x: -3,  y: 65,  anchor: 'end',   ex: 27 },
    { group: 'Lower Back', x: -3,  y: 82,  anchor: 'end',   ex: 44 },
    { group: 'Glutes',     x: 103, y: 111, anchor: 'start', ex: 69 },
    { group: 'Hamstrings', x: -3,  y: 140, anchor: 'end',   ex: 29 },
    { group: 'Calves',     x: 103, y: 178, anchor: 'start', ex: 71 },
  ],
}

const MIND_DATA = {
  desc: 'Controlled breathing activates the parasympathetic nervous system, lowering cortisol and heart rate within minutes. Use these techniques between sets or post-workout.',
  breathing: [
    { name:'Box Breathing',      tag:'Focus & Calm',    desc:'Equal 4-count phases. Used by Navy SEALs to reset the nervous system under pressure.',      phases:[{label:'Inhale',s:4},{label:'Hold',s:4},{label:'Exhale',s:4},{label:'Hold',s:4}] },
    { name:'4 · 7 · 8',         tag:'Deep Relaxation', desc:'Extended exhale stimulates the vagus nerve. Ideal for winding down post-training.',          phases:[{label:'Inhale',s:4},{label:'Hold',s:7},{label:'Exhale',s:8}] },
    { name:'Physiological Sigh', tag:'Fastest Reset',   desc:'Double nasal inhale + long exhale. Deflates air sacs and drops CO₂ fastest.',               phases:[{label:'Inhale',s:2},{label:'+Inhale',s:2},{label:'Exhale',s:6}] },
    { name:'Resonant Breathing', tag:'HRV Optimise',    desc:'5.5-second cycles synchronise heart rate variability for peak recovery.',                   phases:[{label:'Inhale',s:5.5},{label:'Exhale',s:5.5}] },
  ],
}

function getRecovery(n) {
  return [{pct:100,status:'Ready',color:'#3cb371'},{pct:84,status:'Ready',color:'#80c060'},{pct:68,status:'Active',color:'#e8a030'},{pct:45,status:'Fatigued',color:'#d73a28'}][Math.min(n,3)]
}

function fmtDate(ds, todayStr) {
  if (!ds) return 'Never'
  const diff = Math.round((new Date(todayStr+'T12:00:00') - new Date(ds+'T12:00:00')) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7)   return `${diff}d ago`
  return new Date(ds+'T12:00:00').toLocaleDateString([],{month:'short',day:'numeric'})
}

function pickFour(pool) {
  const arr = [...pool]
  for (let i = arr.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]] }
  return arr.slice(0,4)
}

function BreathingGuide({ exercise, onStop }) {
  const [tick, setTick] = useState(0)
  const totalCycle = exercise.phases.reduce((s,p) => s+p.s, 0)
  useEffect(() => { setTick(0); const t = setInterval(() => setTick(n=>n+1),1000); return ()=>clearInterval(t) }, [exercise])
  const elapsed = tick % totalCycle
  let acc=0, phase=exercise.phases[0], remaining=phase.s
  for (const ph of exercise.phases) { if (elapsed < acc+ph.s) { phase=ph; remaining=Math.ceil(acc+ph.s-elapsed); break }; acc+=ph.s }
  const isInhale = phase.label.toLowerCase().startsWith('inhale')||phase.label.startsWith('+')
  const isHold   = phase.label.toLowerCase().startsWith('hold')
  const progress = 1-(remaining/phase.s)
  const ringSize = isInhale ? 54+progress*30 : isHold ? 84 : 84-progress*30
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,padding:'4px 0 8px'}}>
      <p style={{color:MIND_COLOR,fontSize:10,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',fontFamily:FF,margin:0}}>{exercise.name}</p>
      <div style={{position:'relative',width:110,height:110,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{position:'absolute',inset:0,borderRadius:'50%',border:`1px solid ${MIND_COLOR}20`}}/>
        <div style={{width:ringSize,height:ringSize,borderRadius:'50%',background:`radial-gradient(circle,${MIND_COLOR}38 0%,${MIND_COLOR}0a 70%)`,border:`1.5px solid ${MIND_COLOR}${isHold?'cc':'77'}`,boxShadow:`0 0 ${isHold?24:10}px ${MIND_COLOR}${isHold?'55':'28'}`,transition:`width ${remaining}s linear,height ${remaining}s linear,box-shadow 0.6s ease`,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{color:MIND_COLOR,fontSize:20,fontWeight:900,fontFamily:FF,lineHeight:1}}>{remaining}</span>
        </div>
      </div>
      <div style={{textAlign:'center'}}>
        <p style={{color:MIND_COLOR,fontSize:15,fontWeight:800,fontFamily:FF,margin:'0 0 3px'}}>{phase.label}</p>
        <p style={{color:'var(--text-faint)',fontSize:8.5,fontFamily:FF,margin:0,letterSpacing:'0.06em'}}>{exercise.phases.map(p=>`${p.label} ${p.s}s`).join(' · ')}</p>
      </div>
      <button onClick={onStop} style={{padding:'5px 18px',borderRadius:99,cursor:'pointer',background:`${MIND_COLOR}14`,border:`1px solid ${MIND_COLOR}40`,color:MIND_COLOR,fontSize:10,fontFamily:FF,fontWeight:700,letterSpacing:'0.08em'}}>Stop</button>
    </div>
  )
}

function ExCard({ ex, accent, onLog, muscleLabel }) {
  const [logging,setLogging]=useState(false); const [sets,setSets]=useState(''); const [reps,setReps]=useState(''); const [weight,setWeight]=useState(''); const [saving,setSaving]=useState(false); const [saved,setSaved]=useState(false)
  const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.yt)}`
  const handleSave = async () => { setSaving(true); try { await onLog({name:ex.name,sets,reps,weight,muscleLabel}); setSaved(true); setTimeout(()=>{setSaved(false);setLogging(false);setSets('');setReps('');setWeight('')},900) } catch(e){console.error(e)} finally{setSaving(false)} }
  return (
    <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,overflow:'hidden'}}>
      <div style={{padding:'11px 12px',display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10}}>
        <div style={{flex:1}}>
          <p style={{color:'var(--text-primary)',fontSize:12,fontWeight:700,fontFamily:FF,marginBottom:3}}>{ex.name}</p>
          <div style={{display:'flex',gap:5}}>
            <span style={{color:'rgba(255,255,255,0.82)',fontSize:9,fontFamily:FF,background:'rgba(255,255,255,0.06)',padding:'2px 6px',borderRadius:4,border:'1px solid rgba(255,255,255,0.14)',animation:'mmPulse 2.8s ease-in-out infinite'}}>{ex.eq}</span>
            <span style={{color:accent,fontSize:9,fontFamily:FF,fontWeight:700,background:`${accent}18`,padding:'2px 6px',borderRadius:4}}>{ex.sets}</span>
          </div>
        </div>
        <div style={{display:'flex',gap:5,flexShrink:0}}>
          {onLog&&(<button onClick={()=>setLogging(l=>!l)} style={{display:'flex',alignItems:'center',gap:4,padding:'6px 10px',borderRadius:7,background:logging?'rgba(248,113,113,0.15)':'rgba(180,188,204,0.1)',border:`1px solid ${logging?'rgba(248,113,113,0.4)':'rgba(180,188,204,0.25)'}`,color:logging?'#f87171':'#b4bccc',fontSize:9,fontWeight:700,fontFamily:FF,letterSpacing:'0.08em',cursor:'pointer',transition:'all 0.15s'}}>
            <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>Log
          </button>)}
          <a href={ytUrl} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:4,padding:'6px 9px',borderRadius:7,background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.28)',color:'#ef4444',fontSize:9,fontWeight:700,fontFamily:FF,letterSpacing:'0.08em',textDecoration:'none'}} onClick={e=>e.stopPropagation()}>
            <svg width={10} height={10} viewBox="0 0 24 24" fill="#ef4444"><path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.8 5 12 5 12 5s-4.8 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.2.8C6.8 19 12 19 12 19s4.8 0 7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8z"/><polygon fill="white" points="10,8.5 16,12 10,15.5"/></svg>Watch
          </a>
        </div>
      </div>
      <div style={{overflow:'hidden',maxHeight:logging?130:0,transition:'max-height 0.28s cubic-bezier(.16,1,.3,1)'}}>
        <div style={{padding:'0 12px 12px',borderTop:'1px solid rgba(212,212,232,0.06)'}}>
          <div style={{display:'flex',gap:7,marginTop:10,marginBottom:8}}>
            {[['Sets',sets,setSets],['Reps',reps,setReps],['Weight (lbs)',weight,setWeight]].map(([lbl,val,set])=>(
              <div key={lbl} style={{flex:1}}>
                <p style={{color:'rgba(212,212,232,0.3)',fontSize:8,letterSpacing:'0.18em',textTransform:'uppercase',fontFamily:FF,marginBottom:4}}>{lbl}</p>
                <input type="number" value={val} onChange={e=>set(e.target.value)} placeholder="—" style={{width:'100%',background:'rgba(212,212,232,0.05)',border:'1px solid rgba(212,212,232,0.1)',borderRadius:7,padding:'7px 4px',color:'var(--text-primary)',fontSize:15,fontWeight:700,fontFamily:FF,textAlign:'center',outline:'none',boxSizing:'border-box'}}/>
              </div>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving||saved} style={{width:'100%',padding:'8px',borderRadius:8,background:saved?'rgba(16,185,129,0.15)':'rgba(180,188,204,0.12)',border:`1px solid ${saved?'rgba(16,185,129,0.4)':'rgba(180,188,204,0.28)'}`,color:saved?'#10b981':'#b4bccc',fontSize:10,fontWeight:700,fontFamily:FF,letterSpacing:'0.1em',textTransform:'uppercase',cursor:saving||saved?'not-allowed':'pointer',transition:'all 0.2s'}}>
            {saved?'✓ Logged':saving?'Saving…':`Log ${ex.name}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MuscleMapView({ workouts=[], onLogWorkout, onSaveExercise, defaultSelected=null }) {
  const [selected,     setSelected]    = useState(defaultSelected)
  const [lastSelected, setLastSelected] = useState(null)
  const [view,         setView]        = useState('anterior')
  const [exercises,    setExercises]   = useState([])
  const [spinning,     setSpinning]    = useState(false)
  const [breathingEx,  setBreathingEx] = useState(null)
  const [ripples,      setRipples]     = useState([])
  const svgRef      = useRef(null)
  const touchStartX = useRef(null)
  const didSwipe    = useRef(false)

  const todayStr = new Date().toISOString().split('T')[0]
  const sevenAgo = new Date(); sevenAgo.setDate(sevenAgo.getDate()-7)
  const sevenStr = sevenAgo.toISOString().split('T')[0]

  const counts = useMemo(() => {
    const c={}; MUSCLES.forEach(m=>{c[m]=0}); const seen=new Set()
    workouts.forEach(w=>{
      if(!w.workout_date||w.workout_date<sevenStr||w.workout_date>todayStr) return
      ;(w.exercises||[]).forEach(ex=>{
        const mg=ex.muscle_group; if(!mg) return
        if(mg==='Full Body'){MUSCLES.forEach(k=>{const key=`${w.workout_date}-${k}`;if(!seen.has(key)){seen.add(key);c[k]++}})}
        else if(c[mg]!==undefined){const key=`${w.workout_date}-${mg}`;if(!seen.has(key)){seen.add(key);c[mg]++}}
      })
    })
    return c
  },[workouts,sevenStr,todayStr])

  const lastWorked = useMemo(()=>{
    const lw={}
    workouts.forEach(w=>{
      if(!w.workout_date) return
      ;(w.exercises||[]).forEach(ex=>{if(!ex.muscle_group||ex.muscle_group==='Full Body') return; if(!lw[ex.muscle_group]||w.workout_date>lw[ex.muscle_group]) lw[ex.muscle_group]=w.workout_date})
    })
    return lw
  },[workouts])

  function muscleAgeDays(muscle) {
    const lw=lastWorked[muscle]; if(!lw) return null
    return Math.round((new Date(todayStr+'T12:00:00')-new Date(lw+'T12:00:00'))/86400000)
  }

  useEffect(()=>{
    if(selected&&selected!=='Head'){const dbKey=GROUP_TO_DB[selected];if(dbKey&&DB[dbKey])setExercises(pickFour(DB[dbKey].exercises))}
    else setExercises([])
    setBreathingEx(null)
  },[selected])

  // Reset selection on view change
  useEffect(()=>{ setSelected(null) },[view])

  function handleZoneClick(group, e) {
    e.stopPropagation()
    if(didSwipe.current){didSwipe.current=false;return}
    const activeSet=view==='anterior'?FRONT_ACTIVE:REAR_ACTIVE
    if(!activeSet.has(group)) return
    setLastSelected(group)
    setSelected(s=>s===group?null:group)
  }

  function handleRearClick({ muscle }) {
    if(didSwipe.current){didSwipe.current=false;return}
    const group=GROUP_FROM_SLUG[muscle]
    if(group&&REAR_ACTIVE.has(group)){setLastSelected(group);setSelected(s=>s===group?null:group)}
  }

  function handleShuffle() {
    if(!selected) return
    const dbKey=GROUP_TO_DB[selected]; if(!dbKey||!DB[dbKey]) return
    setSpinning(true); setExercises(pickFour(DB[dbKey].exercises)); setTimeout(()=>setSpinning(false),460)
  }

  function spawnRipple(e) {
    const svg=svgRef.current; if(!svg) return
    const rect=svg.getBoundingClientRect()
    const x=(e.clientX-rect.left)/rect.width*100
    const y=(e.clientY-rect.top)/rect.height*200
    const id=Date.now()
    setRipples(r=>[...r,{x,y,id}])
    setTimeout(()=>setRipples(r=>r.filter(ri=>ri.id!==id)),700)
  }

  const touchHandlers = {
    onTouchStart: e=>{touchStartX.current=e.touches[0].clientX},
    onTouchEnd:   e=>{
      if(touchStartX.current===null) return
      const dx=e.changedTouches[0].clientX-touchStartX.current
      if(Math.abs(dx)>40){setView(dx<0?'posterior':'anterior');didSwipe.current=true}
      touchStartX.current=null
    },
    onPointerDown: spawnRipple,
  }

  const isHead = selected==='Head'
  const n      = selected&&!isHead?(counts[selected]||0):0
  const rec    = selected&&!isHead?getRecovery(n):null
  const dbData = selected&&!isHead?DB[GROUP_TO_DB[selected]]:null

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <style>{`
        @keyframes mmFadeUp         { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes mmGlow           { 0%,100%{opacity:0.85} 50%{opacity:1} }
        @keyframes mmPulse          { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes mmCrosshairPulse { 0%,100%{opacity:0.45;transform:scale(1)} 50%{opacity:0.9;transform:scale(1.14)} }
        @keyframes mmFatiguePulse   { 0%,100%{opacity:0.58} 50%{opacity:0.78} }
        @keyframes mmScan           { 0%{transform:translateY(-2px);opacity:0} 4%{opacity:0.85} 30%{transform:translateY(202px);opacity:0.5} 33%{transform:translateY(202px);opacity:0} 100%{transform:translateY(202px);opacity:0} }
        @keyframes mmRipple         { from{transform:scale(0);opacity:0.85} to{transform:scale(1);opacity:0} }
      `}</style>

      {/* Front / Back toggle */}
      <div style={{display:'flex',gap:8,justifyContent:'center'}}>
        {[['anterior','Front'],['posterior','Back']].map(([v,label])=>(
          <button key={v} onClick={()=>setView(v)} style={{
            padding:'7px 26px',borderRadius:99,cursor:'pointer',
            background:view===v?'linear-gradient(135deg,rgba(56,189,248,0.18) 0%,rgba(56,189,248,0.08) 100%)':'var(--bg-card)',
            border:`1px solid ${view===v?'rgba(56,189,248,0.6)':'var(--border)'}`,
            color:view===v?'#38bdf8':'var(--text-muted)',
            fontSize:11,fontFamily:FF,fontWeight:view===v?700:400,
            letterSpacing:'0.12em',textTransform:'uppercase',
            boxShadow:view===v?'0 0 14px rgba(56,189,248,0.28),inset 0 1px 0 rgba(56,189,248,0.18)':'none',
            transition:'all 0.2s',
          }}>{label}</button>
        ))}
      </div>

      {/* Body model */}
      <div style={{display:'flex',justifyContent:'center',overflow:'visible'}}>

        {view==='anterior' ? (
          // ── FRONT VIEW: Gemini mech PNG + SVG hit zones ──
          <div
            style={{position:'relative',width:'100%',maxWidth:240,aspectRatio:'1/2',overflow:'visible'}}
            {...touchHandlers}
          >
            {/* Ambient glow when zone selected */}
            <div style={{
              position:'absolute',inset:0,zIndex:0,borderRadius:8,pointerEvents:'none',
              background:selected&&!isHead
                ?`radial-gradient(ellipse 72% 62% at 50% 45%, ${mechZoneColor(selected)}18 0%, transparent 65%)`
                :'radial-gradient(ellipse 72% 62% at 50% 45%, rgba(27,58,107,0.06) 0%, transparent 65%)',
              transition:'background 0.6s ease',
            }}/>

            {/* Base mech figure — transparent background shows app dark theme */}
            <img
              src={geminiModel}
              alt=""
              draggable={false}
              style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'fill',display:'block',zIndex:1,pointerEvents:'none',userSelect:'none'}}
            />

            {/* SVG: glow overlays (selected only) + transparent hit zones + labels + ripples */}
            <svg
              ref={svgRef}
              viewBox="0 0 100 200"
              preserveAspectRatio="xMidYMid meet"
              style={{position:'absolute',inset:0,width:'100%',height:'100%',overflow:'visible',zIndex:2}}
            >
              <defs>
                <linearGradient id="mm-scan-g" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor="transparent"/>
                  <stop offset="25%"  stopColor="rgba(245,166,35,0.45)"/>
                  <stop offset="50%"  stopColor="rgba(255,210,120,0.28)"/>
                  <stop offset="75%"  stopColor="rgba(245,166,35,0.45)"/>
                  <stop offset="100%" stopColor="transparent"/>
                </linearGradient>
                <filter id="mm-lbl-glow" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur"/>
                  <feFlood floodColor="#38bdf8" floodOpacity="1" result="c"/>
                  <feComposite in="c" in2="blur" operator="in" result="wb"/>
                  <feMerge><feMergeNode in="wb"/><feMergeNode in="wb"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              {/* Scan sweep */}
              <rect x="0" y="-1" width="100" height="1.5" fill="url(#mm-scan-g)"
                style={{animation:'mmScan 7s ease-in-out infinite',filter:'drop-shadow(0 0 1.5px rgba(56,189,248,0.65))'}}
              />

              {/* Selected zone glow overlay — only rendered when a zone is active */}
              {selected && selected !== 'Head' && FRONT_ACTIVE.has(selected) &&
                FRONT_HIT_ZONES.filter(z=>z.group===selected).map(zone=>(
                  <polygon
                    key={`glow-${zone.id}`}
                    points={zone.points}
                    fill={mechZoneColor(selected)}
                    opacity={0.20}
                    pointerEvents="none"
                    style={{
                      filter: mechGlowFilter(selected, true),
                      animation: 'mmPulse 2.4s ease-in-out infinite',
                      transition: 'opacity 0.35s ease',
                    }}
                  />
                ))
              }

              {/* Head glow overlay when selected */}
              {selected === 'Head' && (
                <polygon
                  points={HEAD_POINTS}
                  fill={MIND_COLOR}
                  opacity={0.22}
                  pointerEvents="none"
                  style={{
                    filter: mechGlowFilter('Head', true),
                    animation: 'mmPulse 2.4s ease-in-out infinite',
                    transition: 'opacity 0.35s ease',
                  }}
                />
              )}

              {/* Transparent hit zones — invisible but tappable */}
              {FRONT_HIT_ZONES.map(zone=>(
                <polygon
                  key={`hit-${zone.id}`}
                  points={zone.points}
                  fill="transparent"
                  stroke="none"
                  style={{cursor:'pointer'}}
                  onClick={e=>handleZoneClick(zone.group,e)}
                />
              ))}

              {/* Head hit zone */}
              <polygon
                points={HEAD_POINTS}
                fill="transparent"
                stroke="none"
                style={{cursor:'pointer'}}
                onClick={e=>handleZoneClick('Head',e)}
              />

              {/* Ripples */}
              {ripples.map(rp=>(
                <circle key={rp.id} cx={rp.x} cy={rp.y} r="11"
                  fill="rgba(56,189,248,0.10)" stroke="rgba(147,223,253,0.72)" strokeWidth="0.55"
                  style={{transformBox:'fill-box',transformOrigin:'center',animation:'mmRipple 0.65s ease-out forwards',pointerEvents:'none'}}
                />
              ))}

              {/* Labels */}
              {LABELS.anterior.map(l=>{
                const isActive=selected===l.group
                const color=isActive?'#ffffff':'rgba(200,210,230,0.30)'
                const lineX1=l.anchor==='start'?101:-1
                return (
                  <g key={l.group} pointerEvents="none" style={{transition:'opacity 0.2s'}}>
                    <line x1={lineX1} y1={l.y} x2={l.ex} y2={l.y} stroke={color} strokeWidth={isActive?0.5:0.3} strokeDasharray={isActive?'none':'2 2'} style={{transition:'stroke 0.2s,stroke-width 0.2s'}}/>
                    <circle cx={l.ex} cy={l.y} r={isActive?1.4:0.8} fill={color} style={{transition:'fill 0.2s'}}/>
                    <text x={l.x} y={l.y} textAnchor={l.anchor} fontSize="4.2" fontFamily={FF} fontWeight={isActive?'700':'500'} fill={color} filter={isActive?'url(#mm-lbl-glow)':undefined} letterSpacing="0.04em" style={{transition:'fill 0.2s',animation:isActive?'mmGlow 2.4s ease-in-out infinite':undefined}}>{l.group}</text>
                    <text x={l.x} y={l.y+4.2} textAnchor={l.anchor} fontSize="3.0" fontFamily={FF} fontWeight="400" fontStyle="italic" fill={isActive?`${color}cc`:'rgba(200,210,230,0.18)'} letterSpacing="0.02em" style={{transition:'fill 0.2s'}}>{SCI_SHORT[l.group]||''}</text>
                  </g>
                )
              })}
            </svg>
          </div>
        ) : (
          // ── REAR VIEW: legacy react-body-highlighter placeholder ──
          <div
            style={{position:'relative',width:'100%',maxWidth:240,overflow:'visible'}}
            {...touchHandlers}
          >
            <div style={{position:'absolute',inset:0,zIndex:0,borderRadius:8,pointerEvents:'none',background:'radial-gradient(ellipse 72% 62% at 50% 45%,rgba(27,58,107,0.08) 0%,transparent 65%)',transition:'background 0.6s ease'}}/>
            <Model data={[]} type="posterior" bodyColor="#3A3A3A" onClick={handleRearClick}
              style={{width:'100%',display:'block',position:'relative',zIndex:1,filter:'drop-shadow(0 0 10px rgba(27,58,107,0.70)) drop-shadow(0 0 3px rgba(232,244,255,0.45))'}}
              svgStyle={{borderRadius:8}}
            />
            {MUSCLES.filter(m=>m!=='Head'&&SLUG_MAP[m]&&REAR_ACTIVE.has(m)).map(m=>{
              const isSel=selected===m; const col=muscleArmorColor(m); const days=muscleAgeDays(m)
              const op=isSel?1.0:0.72
              const glow=isSel?'drop-shadow(0 0 1px rgba(255,255,255,1)) drop-shadow(0 0 18px rgba(245,166,35,0.9))':'drop-shadow(0 0 1px rgba(255,255,255,0.8)) drop-shadow(0 0 8px rgba(27,58,107,0.6))'
              const anim=isSel?'mmPulse 2.4s ease-in-out infinite':days===0?'mmFatiguePulse 2s ease-in-out infinite':undefined
              return (
                <div key={m} style={{position:'absolute',inset:0,zIndex:2,pointerEvents:'none',filter:glow,transition:'filter 0.6s ease'}}>
                  <div style={{width:'100%',height:'100%',opacity:op,transition:'opacity 0.35s ease',animation:anim,WebkitAnimation:anim,transform:'translateZ(0)'}}>
                    <Model data={[{name:m,muscles:SLUG_MAP[m],frequency:1}]} type="posterior" bodyColor="rgba(0,0,0,0)" highlightedColors={[col,col,col]} style={{width:'100%',display:'block'}} svgStyle={{borderRadius:8}}/>
                  </div>
                </div>
              )
            })}
            {/* Rear labels + ripples */}
            <svg ref={svgRef} viewBox="0 0 100 200" preserveAspectRatio="xMidYMid meet"
              style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',overflow:'visible',pointerEvents:'none',zIndex:3}}>
              <defs>
                <linearGradient id="mm-scan-g-r" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="transparent"/><stop offset="25%" stopColor="rgba(245,166,35,0.45)"/>
                  <stop offset="50%" stopColor="rgba(255,210,120,0.28)"/><stop offset="75%" stopColor="rgba(245,166,35,0.45)"/><stop offset="100%" stopColor="transparent"/>
                </linearGradient>
                <filter id="mm-lbl-glow-r" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur"/><feFlood floodColor="#38bdf8" floodOpacity="1" result="c"/>
                  <feComposite in="c" in2="blur" operator="in" result="wb"/>
                  <feMerge><feMergeNode in="wb"/><feMergeNode in="wb"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <rect x="0" y="-1" width="100" height="1.5" fill="url(#mm-scan-g-r)" style={{animation:'mmScan 7s ease-in-out infinite',filter:'drop-shadow(0 0 1.5px rgba(56,189,248,0.65))'}}/>
              {ripples.map(rp=>(<circle key={rp.id} cx={rp.x} cy={rp.y} r="11" fill="rgba(56,189,248,0.10)" stroke="rgba(147,223,253,0.72)" strokeWidth="0.55" style={{transformBox:'fill-box',transformOrigin:'center',animation:'mmRipple 0.65s ease-out forwards'}}/>))}
              {LABELS.posterior.map(l=>{
                const isActive=selected===l.group; const color=isActive?'#ffffff':'rgba(200,210,230,0.30)'; const lineX1=l.anchor==='start'?101:-1
                return (<g key={l.group} style={{transition:'opacity 0.2s'}}>
                  <line x1={lineX1} y1={l.y} x2={l.ex} y2={l.y} stroke={color} strokeWidth={isActive?0.5:0.3} strokeDasharray={isActive?'none':'2 2'} style={{transition:'stroke 0.2s'}}/>
                  <circle cx={l.ex} cy={l.y} r={isActive?1.4:0.8} fill={color}/>
                  <text x={l.x} y={l.y} textAnchor={l.anchor} fontSize="4.2" fontFamily={FF} fontWeight={isActive?'700':'500'} fill={color} filter={isActive?'url(#mm-lbl-glow-r)':undefined} letterSpacing="0.04em" style={{transition:'fill 0.2s',animation:isActive?'mmGlow 2.4s ease-in-out infinite':undefined}}>{l.group}</text>
                  <text x={l.x} y={l.y+4.2} textAnchor={l.anchor} fontSize="3.0" fontFamily={FF} fontWeight="400" fontStyle="italic" fill={isActive?`${color}cc`:'rgba(200,210,230,0.18)'} letterSpacing="0.02em">{SCI_SHORT[l.group]||''}</text>
                </g>)
              })}
            </svg>
          </div>
        )}
      </div>

      {/* ── Detail panel ── */}
      {!selected ? (
        <div style={{background:'radial-gradient(ellipse 110% 100% at 50% 0%,rgba(255,255,255,0.09) 0%,rgba(255,255,255,0.03) 100%)',border:'1px solid rgba(255,255,255,0.18)',boxShadow:'0 0 24px rgba(255,255,255,0.06),inset 0 1px 0 rgba(255,255,255,0.14)',borderRadius:14,padding:'22px 18px 18px',display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.80)" strokeWidth="1.4" strokeLinecap="round" style={{animation:'mmCrosshairPulse 2.4s ease-in-out infinite',filter:'drop-shadow(0 0 6px rgba(255,255,255,0.55))'}}>
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3.5"/>
            <line x1="12" y1="2" x2="12" y2="5.5"/><line x1="12" y1="18.5" x2="12" y2="22"/>
            <line x1="2" y1="12" x2="5.5" y2="12"/><line x1="18.5" y1="12" x2="22" y2="12"/>
          </svg>
          <div style={{textAlign:'center'}}>
            <p style={{color:'rgba(255,255,255,0.92)',fontSize:13,fontFamily:FF,fontStyle:'italic',margin:'0 0 7px',lineHeight:1.55,textShadow:'0 0 12px rgba(255,255,255,0.35)'}}>Tap a panel on the figure<br/>to see activation details</p>
            <p style={{color:'rgba(255,255,255,0.40)',fontSize:9.5,fontFamily:FF,letterSpacing:'0.06em',margin:0}}>Exercises · Recovery · Scientific name</p>
          </div>
          {lastSelected&&(
            <div style={{display:'flex',alignItems:'center',gap:6,padding:'5px 13px',borderRadius:99,background:`${HIGHLIGHT_COLOR}12`,border:`1px solid ${HIGHLIGHT_COLOR}38`}}>
              <div style={{width:5,height:5,borderRadius:'50%',background:HIGHLIGHT_COLOR,boxShadow:`0 0 5px ${HIGHLIGHT_COLOR}`}}/>
              <p style={{color:`${HIGHLIGHT_COLOR}cc`,fontSize:9.5,fontFamily:FF,fontWeight:600,margin:0,letterSpacing:'0.04em'}}>Last: {lastSelected}</p>
            </div>
          )}
        </div>
      ) : isHead ? (
        <div style={{display:'flex',flexDirection:'column',gap:10,animation:'mmFadeUp 0.22s ease both'}}>
          <div style={{background:'var(--bg-card)',border:`1px solid ${MIND_COLOR}35`,borderRadius:14,overflow:'hidden'}}>
            <div style={{background:`linear-gradient(90deg,${MIND_COLOR}18 0%,transparent 100%)`,borderBottom:`1px solid ${MIND_COLOR}22`,padding:'11px 14px',display:'flex',alignItems:'center',gap:9}}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={MIND_COLOR} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                <path d="M9.5 2a3.5 3.5 0 0 1 3 1.7A3.5 3.5 0 0 1 18 7v1a3 3 0 0 1 1 5.74V15a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-1.26A3 3 0 0 1 6 8V7a3.5 3.5 0 0 1 3.5-5z"/>
                <path d="M12 12v5M9 15h6"/>
              </svg>
              <div style={{flex:1}}>
                <p style={{color:MIND_COLOR,fontSize:14,fontWeight:800,fontFamily:FF,margin:0,lineHeight:1.2}}>Mind & Recovery</p>
                <p style={{color:`${MIND_COLOR}99`,fontSize:8.5,fontFamily:FF,fontStyle:'italic',margin:0}}>Stress Relief · Breathing Techniques</p>
              </div>
            </div>
            <div style={{padding:'10px 14px 12px'}}>
              <p style={{color:'var(--text-secondary)',fontSize:11,fontFamily:FF,lineHeight:1.68,margin:0}}>{MIND_DATA.desc}</p>
            </div>
          </div>
          {breathingEx ? (
            <div style={{background:'var(--bg-card)',border:`1px solid ${MIND_COLOR}30`,borderRadius:14,padding:'14px 16px',animation:'mmFadeUp 0.18s ease both'}}>
              <BreathingGuide exercise={breathingEx} onStop={()=>setBreathingEx(null)}/>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:7}}>
              <p style={{color:`${MIND_COLOR}88`,fontSize:9,letterSpacing:'0.18em',textTransform:'uppercase',fontFamily:FF,fontWeight:700,margin:'0 0 2px 2px'}}>Breathing Exercises</p>
              {MIND_DATA.breathing.map(ex=>(
                <button key={ex.name} onClick={()=>setBreathingEx(ex)} style={{display:'flex',flexDirection:'column',gap:4,textAlign:'left',background:`${MIND_COLOR}08`,border:`1px solid ${MIND_COLOR}28`,borderRadius:11,padding:'11px 13px',cursor:'pointer',transition:'background 0.15s,border-color 0.15s'}}>
                  <div style={{display:'flex',alignItems:'center',gap:7}}>
                    <div style={{width:6,height:6,borderRadius:'50%',background:MIND_COLOR,boxShadow:`0 0 6px ${MIND_COLOR}`,flexShrink:0}}/>
                    <p style={{color:MIND_COLOR,fontSize:12,fontWeight:700,fontFamily:FF,margin:0,flex:1}}>{ex.name}</p>
                    <span style={{background:`${MIND_COLOR}18`,border:`1px solid ${MIND_COLOR}38`,color:`${MIND_COLOR}cc`,fontSize:8,fontFamily:FF,fontWeight:600,padding:'2px 7px',borderRadius:99,letterSpacing:'0.04em'}}>{ex.tag}</span>
                  </div>
                  <p style={{color:'var(--text-secondary)',fontSize:10.5,fontFamily:FF,margin:'0 0 0 13px',lineHeight:1.55}}>{ex.desc}</p>
                  <p style={{color:`${MIND_COLOR}77`,fontSize:8.5,fontFamily:FF,margin:'0 0 0 13px',letterSpacing:'0.04em'}}>{ex.phases.map(p=>`${p.label} ${p.s}s`).join(' · ')}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:10,animation:'mmFadeUp 0.22s ease both'}}>
          {dbData&&(
            <div style={{background:'var(--bg-card)',border:'1px solid rgba(16,185,129,0.28)',borderRadius:14,overflow:'hidden'}}>
              <div style={{background:'linear-gradient(90deg,rgba(16,185,129,0.14) 0%,rgba(255,255,255,0.03) 100%)',borderBottom:'1px solid rgba(16,185,129,0.15)',padding:'11px 14px',display:'flex',alignItems:'center',gap:9}}>
                <div style={{width:10,height:10,borderRadius:'50%',flexShrink:0,background:'#10b981',boxShadow:'0 0 10px rgba(16,185,129,0.85)'}}/>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{color:'#ffffff',fontSize:14,fontWeight:800,fontFamily:FF,margin:0,lineHeight:1.2,textShadow:'0 0 10px rgba(16,185,129,0.9),0 0 22px rgba(255,255,255,0.35)'}}>{selected}</p>
                  <p style={{color:'rgba(180,240,210,0.65)',fontSize:8.5,fontFamily:FF,fontStyle:'italic',margin:0,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{dbData.scientific}</p>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:4,flexShrink:0}}>
                  {[1,2,3,4,5].map(i=>(<div key={i} style={{width:5,height:5,borderRadius:'50%',background:i<=dbData.intensity?'#10b981':'rgba(212,212,232,0.10)',boxShadow:i<=dbData.intensity?'0 0 4px rgba(16,185,129,0.85)':'none'}}/>))}
                </div>
              </div>
              <div style={{padding:'10px 14px 12px',display:'flex',flexDirection:'column',gap:9}}>
                <p style={{color:'rgba(255,255,255,0.72)',fontSize:11,fontFamily:FF,lineHeight:1.68,margin:0,textShadow:'0 0 8px rgba(255,255,255,0.3)'}}>{dbData.desc}</p>
                <div style={{display:'flex',flexWrap:'wrap',gap:6,alignItems:'center'}}>
                  {n>0&&(<span style={{background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.42)',color:'#10b981',fontSize:9,fontFamily:FF,fontWeight:700,padding:'3px 8px',borderRadius:99,letterSpacing:'0.06em'}}>{n}× this week</span>)}
                  {rec&&(<span style={{display:'flex',alignItems:'center',gap:4,color:rec.color,fontSize:9,fontFamily:FF,fontWeight:600}}><span style={{width:5,height:5,borderRadius:'50%',background:rec.color,display:'inline-block',boxShadow:`0 0 4px ${rec.color}`}}/>{rec.status}</span>)}
                  {lastWorked[selected]&&(<span style={{color:'var(--text-faint)',fontSize:9,fontFamily:FF}}>Last: {fmtDate(lastWorked[selected],todayStr)}</span>)}
                </div>
                {onLogWorkout&&(<button onClick={()=>onLogWorkout(selected)} style={{width:'100%',padding:'10px',background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.42)',borderRadius:10,cursor:'pointer',color:'#10b981',fontSize:11,fontWeight:700,fontFamily:FF,letterSpacing:'0.08em',display:'flex',alignItems:'center',justifyContent:'center',gap:7,marginTop:2}}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  Log {selected} Workout
                </button>)}
              </div>
            </div>
          )}
          {dbData&&exercises.length>0&&(
            <div>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <div style={{width:3,height:12,background:'#ffffff',borderRadius:2,boxShadow:'0 0 6px rgba(255,255,255,0.7)'}}/>
                <p style={{color:'rgba(255,255,255,0.85)',fontSize:9,letterSpacing:'0.22em',textTransform:'uppercase',fontFamily:FF,fontWeight:700,flex:1,margin:0}}>Exercises</p>
                <button onClick={handleShuffle} style={{display:'flex',alignItems:'center',gap:5,padding:'4px 9px',borderRadius:7,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.25)',color:'rgba(255,255,255,0.75)',fontSize:9,fontWeight:700,fontFamily:FF,cursor:'pointer',letterSpacing:'0.08em'}}>
                  <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{transform:spinning?'rotate(180deg)':'rotate(0deg)',transition:'transform 0.46s ease'}}>
                    <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                  </svg>Shuffle
                </button>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {exercises.map((ex,i)=><ExCard key={`${ex.name}-${i}`} ex={ex} accent="#10b981" onLog={onSaveExercise} muscleLabel={dbData?.label}/>)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
