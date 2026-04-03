import { useState, useEffect } from 'react'

// ─── Muscle Database ─────────────────────────────────────────────────────────
const DB = {
  // ── Front ──
  chest: {
    label: 'Chest', scientific: 'Pectoralis Major & Pectoralis Minor',
    color: '#e24b4a', intensity: 4,
    desc: 'Primary horizontal pushing muscle. Controls arm adduction and internal rotation across the chest. The pectoralis minor lies beneath, stabilising the scapula and assisting shoulder-blade protraction.',
    exercises: [
      { name: 'Barbell Bench Press',    eq: 'Barbell',    sets: '4 × 6–8',     yt: 'barbell bench press form tutorial' },
      { name: 'Incline Dumbbell Press', eq: 'Dumbbells',  sets: '3 × 10–12',   yt: 'incline dumbbell press form tutorial' },
      { name: 'Cable Chest Fly',        eq: 'Cable',      sets: '3 × 12–15',   yt: 'cable fly chest isolation tutorial' },
      { name: 'Push-Up',                eq: 'Bodyweight', sets: '3 × failure',  yt: 'push up proper form tutorial' },
      { name: 'Weighted Dip',           eq: 'Bodyweight', sets: '4 × 8–10',    yt: 'weighted dip chest form tutorial' },
      { name: 'Decline Bench Press',    eq: 'Barbell',    sets: '3 × 10',      yt: 'decline bench press form tutorial' },
      { name: 'DB Pullover',            eq: 'Dumbbell',   sets: '3 × 12',      yt: 'dumbbell pullover chest tutorial' },
      { name: 'Pec Deck Machine',       eq: 'Machine',    sets: '3 × 15',      yt: 'pec deck fly machine tutorial' },
    ],
  },
  shoulders: {
    label: 'Shoulders', scientific: 'Deltoid — Anterior · Lateral · Posterior',
    color: '#f59e0b', intensity: 3,
    desc: 'Three-headed deltoid controlling all planes of arm elevation. The anterior head presses; the lateral head builds width; the posterior head and rotator cuff sustain joint health under heavy load.',
    exercises: [
      { name: 'Overhead Press',       eq: 'Barbell',   sets: '4 × 8',   yt: 'overhead press form tutorial barbell' },
      { name: 'Lateral Raise',        eq: 'Dumbbells', sets: '4 × 15',  yt: 'lateral raise proper form tutorial' },
      { name: 'Face Pull',            eq: 'Cable',     sets: '3 × 20',  yt: 'face pull cable rear delt tutorial' },
      { name: 'Arnold Press',         eq: 'Dumbbells', sets: '3 × 10',  yt: 'arnold press dumbbell tutorial form' },
      { name: 'Cable Lateral Raise',  eq: 'Cable',     sets: '4 × 15',  yt: 'cable lateral raise shoulder tutorial' },
      { name: 'DB Front Raise',       eq: 'Dumbbells', sets: '3 × 12',  yt: 'front raise dumbbell shoulder tutorial' },
      { name: 'Rear Delt Fly',        eq: 'Dumbbells', sets: '3 × 15',  yt: 'rear delt fly tutorial form' },
      { name: 'Upright Row',          eq: 'Barbell',   sets: '3 × 12',  yt: 'upright row shoulder form tutorial' },
    ],
  },
  biceps: {
    label: 'Biceps', scientific: 'Biceps Brachii (Long & Short Head) & Brachialis',
    color: '#10b981', intensity: 2,
    desc: 'Controls elbow flexion and forearm supination. Full stretch at the bottom of each rep drives hypertrophy. The brachialis beneath adds overall arm thickness and improves peak height.',
    exercises: [
      { name: 'Barbell Curl',        eq: 'Barbell',   sets: '4 × 10',  yt: 'barbell curl form bicep tutorial' },
      { name: 'Incline DB Curl',     eq: 'Dumbbells', sets: '3 × 12',  yt: 'incline dumbbell curl bicep tutorial' },
      { name: 'Hammer Curl',         eq: 'Dumbbells', sets: '3 × 12',  yt: 'hammer curl form tutorial dumbbell' },
      { name: 'Cable Concentration', eq: 'Cable',     sets: '3 × 15',  yt: 'concentration curl bicep isolation form' },
      { name: 'Preacher Curl',       eq: 'Machine',   sets: '3 × 12',  yt: 'preacher curl bicep form tutorial' },
      { name: 'Zottman Curl',        eq: 'Dumbbells', sets: '3 × 10',  yt: 'zottman curl tutorial form' },
      { name: 'Spider Curl',         eq: 'Barbell',   sets: '3 × 12',  yt: 'spider curl bicep tutorial form' },
      { name: 'Cable Drag Curl',     eq: 'Cable',     sets: '3 × 12',  yt: 'cable drag curl bicep tutorial' },
    ],
  },
  forearms: {
    label: 'Forearms', scientific: 'Brachioradialis · Flexor Carpi Radialis · Extensor Carpi Group',
    color: '#6ee7b7', intensity: 2,
    desc: 'Grip strength and wrist stability — critical for every pulling and carrying movement. Often neglected, but forearm resilience directly limits every curl, row, and deadlift you ever pull.',
    exercises: [
      { name: "Farmer's Carry",  eq: 'Dumbbells',   sets: '3 × 40 m',  yt: 'farmers carry grip forearm tutorial' },
      { name: 'Wrist Curl',      eq: 'Barbell',     sets: '3 × 20',    yt: 'wrist curl forearm exercise tutorial' },
      { name: 'Reverse Curl',    eq: 'Barbell',     sets: '3 × 12',    yt: 'reverse curl forearm brachioradialis tutorial' },
      { name: 'Dead Hang',       eq: 'Pull-up Bar', sets: '3 × 45 s',  yt: 'dead hang grip strength tutorial' },
      { name: 'Wrist Roller',    eq: 'Wrist Roller',sets: '3 × 2 min', yt: 'wrist roller forearm tutorial' },
      { name: 'Plate Pinch',     eq: 'Weight Plate',sets: '3 × 30 s',  yt: 'plate pinch grip strength tutorial' },
      { name: 'Towel Pull-Up',   eq: 'Pull-up Bar', sets: '3 × 6',     yt: 'towel pull up grip forearm tutorial' },
      { name: 'Reverse Wrist Curl', eq: 'Barbell',  sets: '3 × 20',    yt: 'reverse wrist curl extensor forearm tutorial' },
    ],
  },
  core: {
    label: 'Core', scientific: 'Rectus Abdominis & Transverse Abdominis',
    color: '#8b5cf6', intensity: 3,
    desc: 'Rectus abdominis flexes the spine and creates the visible "six-pack". The deep transverse abdominis compresses the abdomen like a natural weightlifting belt — essential protection under every heavy compound lift.',
    exercises: [
      { name: 'Hanging Leg Raise', eq: 'Pull-up Bar', sets: '4 × 12',   yt: 'hanging leg raise core form tutorial' },
      { name: 'Cable Crunch',      eq: 'Cable',       sets: '3 × 15',   yt: 'cable crunch abs form tutorial' },
      { name: 'Ab Wheel Rollout',  eq: 'Ab Wheel',    sets: '3 × 10',   yt: 'ab wheel rollout form tutorial core' },
      { name: 'Plank',             eq: 'Bodyweight',  sets: '3 × 60 s', yt: 'plank proper form technique core' },
      { name: 'Dragon Flag',       eq: 'Bodyweight',  sets: '3 × 6',    yt: 'dragon flag core tutorial form' },
      { name: 'Dead Bug',          eq: 'Bodyweight',  sets: '3 × 10/side', yt: 'dead bug core exercise tutorial form' },
      { name: 'L-Sit Hold',        eq: 'Parallel Bars', sets: '3 × 20 s', yt: 'l sit hold core tutorial form' },
      { name: 'Hollow Body Hold',  eq: 'Bodyweight',  sets: '3 × 30 s', yt: 'hollow body hold core tutorial' },
    ],
  },
  obliques: {
    label: 'Obliques', scientific: 'External Obliques & Internal Obliques',
    color: '#ec4899', intensity: 2,
    desc: 'Control trunk rotation and lateral flexion — the source of rotational power and the V-taper silhouette. Anti-rotation exercises build the stiffest, most force-resistant core structure.',
    exercises: [
      { name: 'Russian Twist',      eq: 'Plate/DB',   sets: '3 × 20',        yt: 'russian twist obliques form tutorial' },
      { name: 'Side Plank',         eq: 'Bodyweight', sets: '3 × 45 s/side', yt: 'side plank form tutorial obliques' },
      { name: 'Cable Woodchop',     eq: 'Cable',      sets: '3 × 12/side',   yt: 'cable woodchopper obliques tutorial' },
      { name: 'Pallof Press',       eq: 'Cable/Band', sets: '3 × 12/side',   yt: 'pallof press core anti rotation tutorial' },
      { name: 'Copenhagen Plank',   eq: 'Bodyweight', sets: '3 × 30 s/side', yt: 'copenhagen plank oblique tutorial' },
      { name: 'Landmine Rotation',  eq: 'Barbell',    sets: '3 × 10/side',   yt: 'landmine rotation obliques tutorial' },
      { name: 'Windmill',           eq: 'Kettlebell', sets: '3 × 8/side',    yt: 'kettlebell windmill oblique tutorial' },
      { name: 'Bicycle Crunch',     eq: 'Bodyweight', sets: '3 × 20',        yt: 'bicycle crunch abs obliques tutorial' },
    ],
  },
  quads: {
    label: 'Quads', scientific: 'Quadriceps Femoris — Vastus Lateralis · Medialis · Intermedius · Rectus Femoris',
    color: '#22d3ee', intensity: 5,
    desc: "Four muscles extending the knee — the body's single largest muscle group. The engine of squatting, jumping, and sprinting. The vastus medialis 'teardrop' is critical for kneecap tracking and stability.",
    exercises: [
      { name: 'Back Squat',            eq: 'Barbell',   sets: '4 × 5–6',    yt: 'back squat form proper technique tutorial' },
      { name: 'Leg Press',             eq: 'Machine',   sets: '4 × 12',     yt: 'leg press form proper technique tutorial' },
      { name: 'Bulgarian Split Squat', eq: 'Dumbbells', sets: '3 × 10/leg', yt: 'bulgarian split squat form tutorial' },
      { name: 'Leg Extension',         eq: 'Machine',   sets: '3 × 15',     yt: 'leg extension machine proper form tutorial' },
      { name: 'Hack Squat',            eq: 'Machine',   sets: '4 × 10',     yt: 'hack squat machine form tutorial' },
      { name: 'Goblet Squat',          eq: 'Kettlebell',sets: '3 × 15',     yt: 'goblet squat form tutorial proper' },
      { name: 'Walking Lunge',         eq: 'Dumbbells', sets: '3 × 12/leg', yt: 'walking lunge form tutorial proper' },
      { name: 'Front Squat',           eq: 'Barbell',   sets: '4 × 6',      yt: 'front squat form proper technique tutorial' },
    ],
  },
  calves: {
    label: 'Calves', scientific: 'Gastrocnemius (Medial & Lateral Head) & Soleus',
    color: '#d8d8e8', intensity: 3,
    desc: 'Gastrocnemius provides the visible shape and explosive plantarflexion power. The soleus lies beneath and dominates endurance work. Both demand full range of motion — heel completely below the platform.',
    exercises: [
      { name: 'Standing Calf Raise',   eq: 'Machine',    sets: '5 × 20',     yt: 'standing calf raise form tutorial' },
      { name: 'Seated Calf Raise',     eq: 'Machine',    sets: '4 × 20',     yt: 'seated calf raise form tutorial machine' },
      { name: 'Single-Leg Raise',      eq: 'Bodyweight', sets: '3 × 15/leg', yt: 'single leg calf raise tutorial form' },
      { name: 'Jump Rope',             eq: 'Jump Rope',  sets: '3 × 2 min',  yt: 'jump rope calf workout tutorial' },
      { name: 'Leg Press Calf Raise',  eq: 'Machine',    sets: '4 × 20',     yt: 'leg press calf raise tutorial form' },
      { name: 'Box Jump',              eq: 'Bodyweight', sets: '4 × 8',      yt: 'box jump explosive calf tutorial' },
      { name: 'Donkey Calf Raise',     eq: 'Machine',    sets: '4 × 20',     yt: 'donkey calf raise machine tutorial' },
      { name: 'Calf Raise On Stairs',  eq: 'Bodyweight', sets: '3 × 20/leg', yt: 'stair calf raise tutorial bodyweight' },
    ],
  },
  // ── Back ──
  traps: {
    label: 'Traps', scientific: 'Trapezius — Upper · Middle · Lower Fibres',
    color: '#f59e0b', intensity: 3,
    desc: 'Upper fibres elevate and upwardly rotate the scapula; middle fibres retract it; lower fibres depress it. All three need balanced work to prevent the rounded-shoulder posture that plagues desk workers.',
    exercises: [
      { name: 'Barbell Shrug',       eq: 'Barbell',   sets: '4 × 12',   yt: 'barbell shrug traps form tutorial' },
      { name: 'Face Pull',           eq: 'Cable',     sets: '4 × 20',   yt: 'face pull cable rear delt tutorial' },
      { name: 'Rack Pull',           eq: 'Barbell',   sets: '3 × 6',    yt: 'rack pull trap activation tutorial' },
      { name: "Farmer's Carry",      eq: 'Dumbbells', sets: '3 × 40 m', yt: 'farmers carry trap workout tutorial' },
      { name: 'DB Shrug',            eq: 'Dumbbells', sets: '4 × 15',   yt: 'dumbbell shrug trap form tutorial' },
      { name: 'Upright Row',         eq: 'Barbell',   sets: '3 × 12',   yt: 'upright row trap shoulder tutorial' },
      { name: 'Cable Shrug',         eq: 'Cable',     sets: '3 × 15',   yt: 'cable shrug trap tutorial form' },
      { name: 'Snatch-Grip Shrug',   eq: 'Barbell',   sets: '3 × 10',   yt: 'snatch grip shrug upper trap tutorial' },
    ],
  },
  lats: {
    label: 'Lats', scientific: 'Latissimus Dorsi',
    color: '#b4bccc', intensity: 4,
    desc: "The widest muscle in the body — the architect of the V-taper silhouette. Pulls the arm down and back into extension and adduction. A full stretch at the top of every rep is non-negotiable for width.",
    exercises: [
      { name: 'Pull-Up',                eq: 'Bodyweight', sets: '4 × failure',  yt: 'pull up lat form tutorial' },
      { name: 'Barbell Row',            eq: 'Barbell',    sets: '4 × 8',        yt: 'barbell row back form tutorial' },
      { name: 'Lat Pulldown',           eq: 'Cable',      sets: '3 × 12',       yt: 'lat pulldown proper form tutorial' },
      { name: 'Single-Arm DB Row',      eq: 'Dumbbell',   sets: '3 × 12/side',  yt: 'single arm dumbbell row tutorial' },
      { name: 'Straight-Arm Pulldown',  eq: 'Cable',      sets: '3 × 15',       yt: 'straight arm pulldown lat isolation tutorial' },
      { name: 'T-Bar Row',              eq: 'Barbell',    sets: '4 × 10',       yt: 't bar row back form tutorial' },
      { name: 'Chest-Supported Row',    eq: 'Dumbbells',  sets: '3 × 12',       yt: 'chest supported row back tutorial' },
      { name: 'Meadows Row',            eq: 'Barbell',    sets: '3 × 10/side',  yt: 'meadows row lat back tutorial' },
    ],
  },
  triceps: {
    label: 'Triceps', scientific: 'Triceps Brachii — Long Head · Lateral Head · Medial Head',
    color: '#b8b8cc', intensity: 2,
    desc: 'Three-headed muscle making up roughly ⅔ of total upper-arm mass. The long head requires overhead position for full stretch. The lateral head creates the horseshoe shape visible when the arm is extended.',
    exercises: [
      { name: 'Close-Grip Bench',   eq: 'Barbell',    sets: '4 × 8',   yt: 'close grip bench press tricep form' },
      { name: 'Skull Crusher',      eq: 'Barbell',    sets: '3 × 10',  yt: 'skull crusher tricep form tutorial' },
      { name: 'Tricep Pushdown',    eq: 'Cable',      sets: '3 × 15',  yt: 'tricep pushdown cable form tutorial' },
      { name: 'Overhead Extension', eq: 'Dumbbell',   sets: '3 × 12',  yt: 'overhead tricep extension form tutorial' },
      { name: 'Tricep Dip',         eq: 'Bodyweight', sets: '4 × 10',  yt: 'tricep dip bodyweight form tutorial' },
      { name: 'Diamond Push-Up',    eq: 'Bodyweight', sets: '3 × 15',  yt: 'diamond push up tricep tutorial' },
      { name: 'JM Press',           eq: 'Barbell',    sets: '3 × 10',  yt: 'jm press tricep tutorial form' },
      { name: 'Rope Pushdown',      eq: 'Cable',      sets: '3 × 15',  yt: 'rope tricep pushdown cable tutorial' },
    ],
  },
  lower_back: {
    label: 'Lower Back', scientific: 'Erector Spinae (Iliocostalis · Longissimus · Spinalis) & Multifidus',
    color: '#f97316', intensity: 3,
    desc: "The erector spinae group extends the spine under load — the safety cable of every deadlift and squat. The deep multifidus provides segmental stability. The single most important injury-prevention target in strength training.",
    exercises: [
      { name: 'Conventional Deadlift', eq: 'Barbell',    sets: '4 × 5',   yt: 'conventional deadlift form tutorial' },
      { name: 'Romanian Deadlift',     eq: 'Barbell',    sets: '3 × 10',  yt: 'romanian deadlift form tutorial' },
      { name: 'Back Extension',        eq: 'Machine',    sets: '3 × 15',  yt: 'back extension hyperextension tutorial' },
      { name: 'Good Morning',          eq: 'Barbell',    sets: '3 × 10',  yt: 'good morning exercise lower back tutorial' },
      { name: 'Reverse Hyper',         eq: 'Machine',    sets: '3 × 15',  yt: 'reverse hyperextension lower back tutorial' },
      { name: 'Bird Dog',              eq: 'Bodyweight', sets: '3 × 10/side', yt: 'bird dog lower back core tutorial' },
      { name: 'Jefferson Curl',        eq: 'Barbell',    sets: '3 × 8',   yt: 'jefferson curl lower back mobility tutorial' },
      { name: 'Suitcase Deadlift',     eq: 'Dumbbell',   sets: '3 × 8/side', yt: 'suitcase deadlift lower back core tutorial' },
    ],
  },
  glutes: {
    label: 'Glutes', scientific: 'Gluteus Maximus · Gluteus Medius · Gluteus Minimus',
    color: '#f43f5e', intensity: 4,
    desc: "Gluteus maximus is the body's largest muscle and the primary driver of hip extension and power output. Medius and minimus control hip abduction and stabilise the pelvis on every single-leg step, squat, and sprint.",
    exercises: [
      { name: 'Hip Thrust',           eq: 'Barbell',    sets: '4 × 10',      yt: 'hip thrust barbell glute form tutorial' },
      { name: 'Romanian Deadlift',    eq: 'Barbell',    sets: '4 × 10',      yt: 'romanian deadlift glute hamstring tutorial' },
      { name: 'Glute Bridge',         eq: 'Bodyweight', sets: '3 × 20',      yt: 'glute bridge form tutorial bodyweight' },
      { name: 'Cable Kickback',       eq: 'Cable',      sets: '3 × 15/side', yt: 'cable kickback glute isolation tutorial' },
      { name: 'Sumo Deadlift',        eq: 'Barbell',    sets: '4 × 6',       yt: 'sumo deadlift glute form tutorial' },
      { name: 'Step-Up',              eq: 'Dumbbells',  sets: '3 × 12/leg',  yt: 'step up glute leg exercise tutorial' },
      { name: 'Bulgarian Split Squat',eq: 'Dumbbells',  sets: '3 × 10/leg',  yt: 'bulgarian split squat glute tutorial' },
      { name: 'Clamshell',            eq: 'Band',       sets: '3 × 20/side', yt: 'clamshell glute medius band tutorial' },
    ],
  },
  hamstrings: {
    label: 'Hamstrings', scientific: 'Biceps Femoris · Semitendinosus · Semimembranosus',
    color: '#84cc16', intensity: 3,
    desc: 'Three muscles spanning the back of the thigh — knee flexors and hip extensors in one. Direct antagonists to the quads. Eccentric-focused training (Nordic curls) is the single best intervention against hamstring strains.',
    exercises: [
      { name: 'Romanian Deadlift',   eq: 'Barbell',    sets: '4 × 10', yt: 'romanian deadlift hamstring form tutorial' },
      { name: 'Lying Leg Curl',      eq: 'Machine',    sets: '3 × 12', yt: 'lying leg curl hamstring machine tutorial' },
      { name: 'Nordic Curl',         eq: 'Bodyweight', sets: '3 × 6',  yt: 'nordic hamstring curl tutorial form' },
      { name: 'Good Morning',        eq: 'Barbell',    sets: '3 × 10', yt: 'good morning hamstring tutorial form' },
      { name: 'Seated Leg Curl',     eq: 'Machine',    sets: '3 × 12', yt: 'seated leg curl hamstring machine tutorial' },
      { name: 'Stiff-Leg Deadlift',  eq: 'Barbell',    sets: '3 × 10', yt: 'stiff leg deadlift hamstring tutorial' },
      { name: 'Glute-Ham Raise',     eq: 'Machine',    sets: '3 × 8',  yt: 'glute ham raise hamstring tutorial' },
      { name: 'Single-Leg Deadlift', eq: 'Dumbbell',   sets: '3 × 8/side', yt: 'single leg deadlift hamstring balance tutorial' },
    ],
  },
}

const FRONT_ZONES = ['chest','shoulders','biceps','forearms','core','obliques','quads','calves']
const BACK_ZONES  = ['traps','lats','triceps','lower_back','glutes','hamstrings','calves']

// Zone SVG shape data
const FRONT_ZONE_SHAPES = {
  chest:     [
    { d:'M82 96 Q100 90 120 92 Q100 98 84 110 Q76 120 76 140 Q76 154 86 160 Q102 166 120 163 Q102 156 88 148 Q80 140 80 126 Z' },
    { d:'M158 96 Q140 90 120 92 Q140 98 156 110 Q164 120 164 140 Q164 154 154 160 Q138 166 120 163 Q138 156 152 148 Q160 140 160 126 Z' },
  ],
  shoulders: [
    { e:true, cx:66,  cy:108, rx:20, ry:18 },
    { e:true, cx:174, cy:108, rx:20, ry:18 },
  ],
  biceps:    [
    { e:true, cx:52,  cy:136, rx:11, ry:22 },
    { e:true, cx:188, cy:136, rx:11, ry:22 },
  ],
  forearms:  [
    { e:true, cx:48,  cy:196, rx:10, ry:22 },
    { e:true, cx:192, cy:196, rx:10, ry:22 },
  ],
  core:      [
    { r:true, x:103, y:152, w:15, h:13, rx:4 },
    { r:true, x:122, y:152, w:15, h:13, rx:4 },
    { r:true, x:103, y:169, w:15, h:13, rx:4 },
    { r:true, x:122, y:169, w:15, h:13, rx:4 },
    { r:true, x:105, y:186, w:13, h:11, rx:4 },
    { r:true, x:122, y:186, w:13, h:11, rx:4 },
  ],
  obliques:  [
    { d:'M78 148 Q74 165 74 182 Q74 198 78 210 Q86 214 96 208 Q100 196 100 180 Q98 164 90 150 Z' },
    { d:'M162 148 Q166 165 166 182 Q166 198 162 210 Q154 214 144 208 Q140 196 140 180 Q142 164 150 150 Z' },
  ],
  quads:     [
    { e:true, cx:78,  cy:300, rx:22, ry:44 },
    { e:true, cx:162, cy:300, rx:22, ry:44 },
  ],
  calves:    [
    { e:true, cx:73,  cy:406, rx:15, ry:30 },
    { e:true, cx:167, cy:406, rx:15, ry:30 },
  ],
}

const BACK_ZONE_SHAPES = {
  traps:      [
    { d:'M82 84 Q96 76 110 70 L120 72 L130 70 Q144 76 158 84 Q142 90 120 91 Q98 90 82 84 Z' },
  ],
  lats:       [
    { d:'M64 104 Q54 120 52 144 Q50 166 56 182 Q64 194 74 200 Q78 204 76 212 L72 212 Q64 200 58 182 Q52 160 54 136 Q56 114 64 104 Z' },
    { d:'M176 104 Q186 120 188 144 Q190 166 184 182 Q176 194 166 200 Q162 204 164 212 L168 212 Q176 200 182 182 Q188 160 186 136 Q184 114 176 104 Z' },
  ],
  triceps:   [
    { e:true, cx:50,  cy:132, rx:11, ry:24 },
    { e:true, cx:190, cy:132, rx:11, ry:24 },
  ],
  lower_back:[
    { d:'M100 168 Q110 164 120 166 Q130 164 140 168 Q145 184 140 202 Q130 208 120 208 Q110 208 100 202 Q95 184 100 168 Z' },
  ],
  glutes:    [
    { d:'M70 212 Q60 226 58 246 Q58 260 70 266 Q84 270 96 262 Q104 250 102 236 Q100 220 96 212 Z' },
    { d:'M170 212 Q180 226 182 246 Q182 260 170 266 Q156 270 144 262 Q136 250 138 236 Q140 220 144 212 Z' },
  ],
  hamstrings:[
    { e:true, cx:78,  cy:308, rx:22, ry:42 },
    { e:true, cx:162, cy:308, rx:22, ry:42 },
  ],
  calves:    [
    { e:true, cx:73,  cy:414, rx:16, ry:32 },
    { e:true, cx:167, cy:414, rx:16, ry:32 },
  ],
}

const FRONT_LABELS = [
  { id:'shoulders', x:2,   y:104, a:'start' },
  { id:'biceps',    x:2,   y:130, a:'start' },
  { id:'forearms',  x:2,   y:192, a:'start' },
  { id:'core',      x:2,   y:174, a:'start' },
  { id:'chest',     x:238, y:104, a:'end'   },
  { id:'obliques',  x:238, y:182, a:'end'   },
  { id:'quads',     x:238, y:296, a:'end'   },
  { id:'calves',    x:2,   y:408, a:'start' },
]

const BACK_LABELS = [
  { id:'traps',      x:238, y:86,  a:'end'   },
  { id:'lats',       x:238, y:148, a:'end'   },
  { id:'triceps',    x:2,   y:128, a:'start' },
  { id:'lower_back', x:2,   y:184, a:'start' },
  { id:'glutes',     x:238, y:244, a:'end'   },
  { id:'hamstrings', x:2,   y:304, a:'start' },
  { id:'calves',     x:238, y:412, a:'end'   },
]

// ─── Base Body SVGs ───────────────────────────────────────────────────────────
function FrontBase() {
  return (
    <svg viewBox="0 0 240 500" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
      <defs>
        <radialGradient id="fg-rg1" cx="50%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="#2c2640"/>
          <stop offset="100%" stopColor="#16121e"/>
        </radialGradient>
        <radialGradient id="fg-rg2" cx="50%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#242034"/>
          <stop offset="100%" stopColor="#100e18"/>
        </radialGradient>
      </defs>
      {/* Head */}
      <ellipse cx="120" cy="36" rx="25" ry="30" fill="url(#fg-rg1)" stroke="#2a243c" strokeWidth="1.5"/>
      <path d="M98 50 Q120 62 142 50" fill="none" stroke="#221e30" strokeWidth="1"/>
      <path d="M96 40 Q102 44 100 50" fill="none" stroke="#221e30" strokeWidth="0.8"/>
      <path d="M144 40 Q138 44 140 50" fill="none" stroke="#221e30" strokeWidth="0.8"/>
      {/* Neck */}
      <path d="M109 62 Q106 70 106 80 L134 80 Q134 70 131 62 Z" fill="#1a1626" stroke="#24203a" strokeWidth="1"/>
      <path d="M112 63 Q108 72 108 78" fill="none" stroke="#20183a" strokeWidth="1.5"/>
      <path d="M128 63 Q132 72 132 78" fill="none" stroke="#20183a" strokeWidth="1.5"/>
      {/* Upper traps */}
      <path d="M82 84 Q100 78 120 80 Q140 78 158 84 Q162 90 158 96 Q140 92 120 93 Q100 92 82 96 Q78 90 82 84 Z" fill="#1a1628" stroke="#22203a" strokeWidth="1"/>
      {/* Torso */}
      <path d="M80 94 Q64 104 60 132 Q56 160 58 186 Q60 206 70 212 L170 212 Q180 206 182 186 Q184 160 180 132 Q176 104 160 94 Q142 88 120 89 Q98 88 80 94 Z" fill="url(#fg-rg2)" stroke="#20183a" strokeWidth="1.5"/>
      <line x1="120" y1="96" x2="120" y2="148" stroke="#181428" strokeWidth="1.5"/>
      <path d="M84 144 Q102 158 120 155 Q138 158 156 144" fill="none" stroke="#1c1830" strokeWidth="1.5"/>
      <path d="M84 120 Q100 116 118 118" fill="none" stroke="#1e1a2e" strokeWidth="1"/>
      <path d="M156 120 Q140 116 122 118" fill="none" stroke="#1e1a2e" strokeWidth="1"/>
      <path d="M72 150 Q78 155 76 162" fill="none" stroke="#1c1a2e" strokeWidth="1.2"/>
      <path d="M72 162 Q78 167 76 174" fill="none" stroke="#1c1a2e" strokeWidth="1.2"/>
      <path d="M168 150 Q162 155 164 162" fill="none" stroke="#1c1a2e" strokeWidth="1.2"/>
      <path d="M168 162 Q162 167 164 174" fill="none" stroke="#1c1a2e" strokeWidth="1.2"/>
      <line x1="120" y1="152" x2="120" y2="210" stroke="#14122a" strokeWidth="1.8"/>
      <path d="M100 162 Q110 159 120 160 Q130 159 140 162" fill="none" stroke="#1a1830" strokeWidth="1.2"/>
      <path d="M100 176 Q110 173 120 174 Q130 173 140 176" fill="none" stroke="#1a1830" strokeWidth="1.2"/>
      <path d="M102 190 Q110 188 120 189 Q130 188 138 190" fill="none" stroke="#1a1830" strokeWidth="1.2"/>
      <rect x="101" y="153" width="17" height="12" rx="3" fill="#181428" opacity="0.4"/>
      <rect x="122" y="153" width="17" height="12" rx="3" fill="#181428" opacity="0.4"/>
      <rect x="101" y="168" width="17" height="12" rx="3" fill="#181428" opacity="0.35"/>
      <rect x="122" y="168" width="17" height="12" rx="3" fill="#181428" opacity="0.35"/>
      {/* Pelvis */}
      <path d="M70 212 Q64 228 66 246 Q74 256 120 258 Q166 256 174 246 Q176 228 170 212 Z" fill="#161422" stroke="#201e38" strokeWidth="1"/>
      <path d="M72 222 Q90 216 120 218 Q150 216 168 222" fill="none" stroke="#1e1c30" strokeWidth="1"/>
      {/* Clavicles */}
      <path d="M108 90 Q94 88 82 94" fill="none" stroke="#26223a" strokeWidth="1.5"/>
      <path d="M132 90 Q146 88 158 94" fill="none" stroke="#26223a" strokeWidth="1.5"/>
      {/* Left arm */}
      <path d="M62 98 Q52 108 48 130 Q46 148 50 162 Q56 168 66 164 Q74 150 76 128 Q78 110 72 100 Z" fill="#1e1a2c" stroke="#221e38" strokeWidth="1.5"/>
      <path d="M54 120 Q50 140 52 158" fill="none" stroke="#181426" strokeWidth="1"/>
      <path d="M68 118 Q72 138 70 160" fill="none" stroke="#181426" strokeWidth="1"/>
      <path d="M50 164 Q42 178 40 208 Q39 222 46 226 Q54 228 62 224 Q68 210 70 192 Q70 176 66 164 Z" fill="#1a1828" stroke="#201e38" strokeWidth="1.2"/>
      <path d="M48 172 Q44 190 46 210" fill="none" stroke="#161428" strokeWidth="1"/>
      <path d="M44 226 Q40 238 42 248 Q46 252 54 250 Q60 246 62 238 Q62 230 58 226 Z" fill="#14122a" stroke="#1c1a34" strokeWidth="1"/>
      {/* Right arm */}
      <path d="M178 98 Q188 108 192 130 Q194 148 190 162 Q184 168 174 164 Q166 150 164 128 Q162 110 168 100 Z" fill="#1e1a2c" stroke="#221e38" strokeWidth="1.5"/>
      <path d="M186 120 Q190 140 188 158" fill="none" stroke="#181426" strokeWidth="1"/>
      <path d="M172 118 Q168 138 170 160" fill="none" stroke="#181426" strokeWidth="1"/>
      <path d="M190 164 Q198 178 200 208 Q201 222 194 226 Q186 228 178 224 Q172 210 170 192 Q170 176 174 164 Z" fill="#1a1828" stroke="#201e38" strokeWidth="1.2"/>
      <path d="M192 172 Q196 190 194 210" fill="none" stroke="#161428" strokeWidth="1"/>
      <path d="M196 226 Q200 238 198 248 Q194 252 186 250 Q180 246 178 238 Q178 230 182 226 Z" fill="#14122a" stroke="#1c1a34" strokeWidth="1"/>
      {/* Left leg */}
      <path d="M70 256 Q58 272 54 308 Q52 332 56 348 Q62 356 78 356 Q94 356 102 348 Q106 334 106 308 Q106 272 102 256 Z" fill="#1c1a2a" stroke="#221e38" strokeWidth="1.5"/>
      <path d="M62 276 Q66 308 64 338" fill="none" stroke="#14122a" strokeWidth="1.2"/>
      <path d="M90 272 Q92 304 90 336" fill="none" stroke="#14122a" strokeWidth="1.2"/>
      <path d="M72 342 Q78 352 84 354 Q90 352 92 344 Q90 336 84 334 Q78 334 74 338 Z" fill="#181628" stroke="#1e1c30" strokeWidth="1"/>
      {/* Right leg */}
      <path d="M170 256 Q182 272 186 308 Q188 332 184 348 Q178 356 162 356 Q146 356 138 348 Q134 334 134 308 Q134 272 138 256 Z" fill="#1c1a2a" stroke="#221e38" strokeWidth="1.5"/>
      <path d="M178 276 Q174 308 176 338" fill="none" stroke="#14122a" strokeWidth="1.2"/>
      <path d="M150 272 Q148 304 150 336" fill="none" stroke="#14122a" strokeWidth="1.2"/>
      <path d="M168 342 Q162 352 156 354 Q150 352 148 344 Q150 336 156 334 Q162 334 166 338 Z" fill="#181628" stroke="#1e1c30" strokeWidth="1"/>
      {/* Knees */}
      <path d="M56 350 Q52 362 54 374 Q58 380 78 380 Q98 380 102 374 Q104 362 100 350 Z" fill="#161424" stroke="#201e38" strokeWidth="1.2"/>
      <ellipse cx="79" cy="364" rx="16" ry="9" fill="none" stroke="#1c1a2e" strokeWidth="1"/>
      <path d="M140 350 Q144 362 142 374 Q146 380 162 380 Q178 380 182 374 Q186 362 184 350 Z" fill="#161424" stroke="#201e38" strokeWidth="1.2"/>
      <ellipse cx="161" cy="364" rx="16" ry="9" fill="none" stroke="#1c1a2e" strokeWidth="1"/>
      {/* Shins + calves */}
      <path d="M56 376 Q50 396 50 424 Q51 440 60 444 Q70 448 80 446 Q90 444 94 438 Q98 424 96 406 Q94 390 92 376 Z" fill="#181626" stroke="#1e1c34" strokeWidth="1.2"/>
      <line x1="75" y1="378" x2="73" y2="438" stroke="#121028" strokeWidth="1.5"/>
      <path d="M54 390 Q48 408 50 424" fill="none" stroke="#14122a" strokeWidth="1.2"/>
      <path d="M66 382 Q60 400 62 418" fill="none" stroke="#14122a" strokeWidth="1"/>
      <path d="M184 376 Q190 396 190 424 Q189 440 180 444 Q170 448 160 446 Q150 444 146 438 Q142 424 144 406 Q146 390 148 376 Z" fill="#181626" stroke="#1e1c34" strokeWidth="1.2"/>
      <line x1="165" y1="378" x2="167" y2="438" stroke="#121028" strokeWidth="1.5"/>
      <path d="M186 390 Q192 408 190 424" fill="none" stroke="#14122a" strokeWidth="1.2"/>
      <path d="M174 382 Q180 400 178 418" fill="none" stroke="#14122a" strokeWidth="1"/>
      {/* Feet */}
      <path d="M50 440 Q44 450 44 458 Q48 464 62 466 Q76 466 82 460 Q86 454 84 444 Q78 440 68 440 Z" fill="#12102a" stroke="#1a1832" strokeWidth="1"/>
      <path d="M190 440 Q196 450 196 458 Q192 464 178 466 Q164 466 158 460 Q154 454 156 444 Q162 440 172 440 Z" fill="#12102a" stroke="#1a1832" strokeWidth="1"/>
    </svg>
  )
}

function BackBase() {
  return (
    <svg viewBox="0 0 240 500" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
      <defs>
        <radialGradient id="bg-rg1" cx="50%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="#2c2640"/>
          <stop offset="100%" stopColor="#16121e"/>
        </radialGradient>
        <radialGradient id="bg-rg2" cx="50%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#242034"/>
          <stop offset="100%" stopColor="#100e18"/>
        </radialGradient>
      </defs>
      {/* Head (back) */}
      <ellipse cx="120" cy="36" rx="25" ry="30" fill="url(#bg-rg1)" stroke="#2a243c" strokeWidth="1.5"/>
      <path d="M98 28 Q120 20 142 28" fill="none" stroke="#221e30" strokeWidth="0.8"/>
      {/* Neck */}
      <path d="M109 62 Q106 70 106 80 L134 80 Q134 70 131 62 Z" fill="#1a1626" stroke="#24203a" strokeWidth="1"/>
      {/* Upper trapezius */}
      <path d="M82 84 Q96 76 110 70 L120 72 L130 70 Q144 76 158 84 Q142 90 120 91 Q98 90 82 84 Z" fill="#1c1a2e" stroke="#22203a" strokeWidth="1"/>
      {/* Torso (back outer) */}
      <path d="M80 94 Q64 104 60 132 Q56 160 58 186 Q60 206 70 212 L170 212 Q180 206 182 186 Q184 160 180 132 Q176 104 160 94 Q142 88 120 89 Q98 88 80 94 Z" fill="url(#bg-rg2)" stroke="#20183a" strokeWidth="1.5"/>
      {/* Spine */}
      <line x1="120" y1="80" x2="120" y2="210" stroke="#12102a" strokeWidth="1.8"/>
      {/* Erector spinae */}
      <path d="M113 92 Q112 132 112 172 Q112 192 113 210" fill="none" stroke="#181428" strokeWidth="1.2"/>
      <path d="M127 92 Q128 132 128 172 Q128 192 127 210" fill="none" stroke="#181428" strokeWidth="1.2"/>
      {/* Rhomboids */}
      <path d="M110 98 Q100 108 96 122 Q102 118 120 120 Q138 118 144 122 Q140 108 130 98 Z" fill="none" stroke="#1e1a2e" strokeWidth="1"/>
      {/* Infraspinatus / teres major */}
      <path d="M84 106 Q90 118 88 136" fill="none" stroke="#1c1a2e" strokeWidth="1"/>
      <path d="M156 106 Q150 118 152 136" fill="none" stroke="#1c1a2e" strokeWidth="1"/>
      {/* Lat grooves */}
      <path d="M68 112 Q62 132 60 150 Q60 168 64 182 Q68 192 76 198" fill="none" stroke="#181426" strokeWidth="1.2"/>
      <path d="M172 112 Q178 132 180 150 Q180 168 176 182 Q172 192 164 198" fill="none" stroke="#181426" strokeWidth="1.2"/>
      {/* Scapula edges */}
      <path d="M86 96 Q96 100 106 106" fill="none" stroke="#26223a" strokeWidth="1.2"/>
      <path d="M154 96 Q144 100 134 106" fill="none" stroke="#26223a" strokeWidth="1.2"/>
      {/* Iliac crest */}
      <path d="M72 210 Q90 204 120 206 Q150 204 168 210" fill="none" stroke="#1e1c30" strokeWidth="1"/>
      {/* Left arm (back — tricep side) */}
      <path d="M62 98 Q52 108 48 130 Q46 148 50 162 Q56 168 66 164 Q74 150 76 128 Q78 110 72 100 Z" fill="#1e1a2c" stroke="#221e38" strokeWidth="1.5"/>
      <path d="M56 108 Q52 130 54 154" fill="none" stroke="#14122a" strokeWidth="1.2"/>
      <path d="M66 106 Q68 128 66 156" fill="none" stroke="#14122a" strokeWidth="1"/>
      <path d="M50 164 Q42 178 40 208 Q39 222 46 226 Q54 228 62 224 Q68 210 70 192 Q70 176 66 164 Z" fill="#1a1828" stroke="#201e38" strokeWidth="1.2"/>
      <path d="M46 170 Q42 190 44 210" fill="none" stroke="#161428" strokeWidth="1"/>
      <path d="M44 226 Q40 238 42 248 Q46 252 54 250 Q60 246 62 238 Q62 230 58 226 Z" fill="#14122a" stroke="#1c1a34" strokeWidth="1"/>
      {/* Right arm (back) */}
      <path d="M178 98 Q188 108 192 130 Q194 148 190 162 Q184 168 174 164 Q166 150 164 128 Q162 110 168 100 Z" fill="#1e1a2c" stroke="#221e38" strokeWidth="1.5"/>
      <path d="M184 108 Q188 130 186 154" fill="none" stroke="#14122a" strokeWidth="1.2"/>
      <path d="M174 106 Q172 128 174 156" fill="none" stroke="#14122a" strokeWidth="1"/>
      <path d="M190 164 Q198 178 200 208 Q201 222 194 226 Q186 228 178 224 Q172 210 170 192 Q170 176 174 164 Z" fill="#1a1828" stroke="#201e38" strokeWidth="1.2"/>
      <path d="M194 170 Q198 190 196 210" fill="none" stroke="#161428" strokeWidth="1"/>
      <path d="M196 226 Q200 238 198 248 Q194 252 186 250 Q180 246 178 238 Q178 230 182 226 Z" fill="#14122a" stroke="#1c1a34" strokeWidth="1"/>
      {/* Glutes */}
      <path d="M70 212 Q60 226 58 246 Q58 260 70 266 Q84 270 96 262 Q104 252 102 236 Q100 220 96 212 Z" fill="#1c1a2a" stroke="#221e38" strokeWidth="1.5"/>
      <path d="M170 212 Q180 226 182 246 Q182 260 170 266 Q156 270 144 262 Q136 252 138 236 Q140 220 144 212 Z" fill="#1c1a2a" stroke="#221e38" strokeWidth="1.5"/>
      <line x1="120" y1="212" x2="120" y2="268" stroke="#12102a" strokeWidth="1"/>
      <path d="M72 256 Q90 262 120 264 Q150 262 168 256" fill="none" stroke="#1e1c30" strokeWidth="1"/>
      {/* Hamstrings */}
      <path d="M70 264 Q58 278 54 314 Q52 336 56 352 Q62 358 78 358 Q94 358 102 352 Q106 336 106 314 Q106 278 102 264 Z" fill="#1c1a2a" stroke="#221e38" strokeWidth="1.5"/>
      <path d="M62 278 Q60 310 62 342" fill="none" stroke="#14122a" strokeWidth="1.2"/>
      <path d="M88 276 Q90 308 88 340" fill="none" stroke="#14122a" strokeWidth="1.2"/>
      <path d="M170 264 Q182 278 186 314 Q188 336 184 352 Q178 358 162 358 Q146 358 138 352 Q134 336 134 314 Q134 278 138 264 Z" fill="#1c1a2a" stroke="#221e38" strokeWidth="1.5"/>
      <path d="M178 278 Q180 310 178 342" fill="none" stroke="#14122a" strokeWidth="1.2"/>
      <path d="M152 276 Q150 308 152 340" fill="none" stroke="#14122a" strokeWidth="1.2"/>
      {/* Knees (back) */}
      <path d="M56 354 Q52 366 54 378 Q58 384 78 384 Q98 384 102 378 Q104 366 100 354 Z" fill="#161424" stroke="#201e38" strokeWidth="1.2"/>
      <path d="M140 354 Q144 366 142 378 Q146 384 162 384 Q178 384 182 378 Q186 366 184 354 Z" fill="#161424" stroke="#201e38" strokeWidth="1.2"/>
      {/* Calves (back — gastrocnemius heads prominent) */}
      <path d="M56 380 Q50 398 50 426 Q51 442 60 446 Q70 450 80 448 Q90 446 94 440 Q98 426 96 408 Q94 392 92 380 Z" fill="#181626" stroke="#1e1c34" strokeWidth="1.2"/>
      <path d="M62 388 Q58 410 60 430" fill="none" stroke="#14122a" strokeWidth="1.5"/>
      <path d="M76 384 Q72 406 74 426" fill="none" stroke="#14122a" strokeWidth="1"/>
      <path d="M184 380 Q190 398 190 426 Q189 442 180 446 Q170 450 160 448 Q150 446 146 440 Q142 426 144 408 Q146 392 148 380 Z" fill="#181626" stroke="#1e1c34" strokeWidth="1.2"/>
      <path d="M178 388 Q182 410 180 430" fill="none" stroke="#14122a" strokeWidth="1.5"/>
      <path d="M164 384 Q168 406 166 426" fill="none" stroke="#14122a" strokeWidth="1"/>
      {/* Feet */}
      <path d="M50 442 Q44 452 44 460 Q48 466 62 468 Q76 468 82 462 Q86 456 84 446 Q78 442 68 442 Z" fill="#12102a" stroke="#1a1832" strokeWidth="1"/>
      <path d="M190 442 Q196 452 196 460 Q192 466 178 468 Q164 468 158 462 Q154 456 156 446 Q162 442 172 442 Z" fill="#12102a" stroke="#1a1832" strokeWidth="1"/>
    </svg>
  )
}

// ─── Zone + Label Overlay ─────────────────────────────────────────────────────
function ZoneOverlay({ view, selected, hovered, onSelect, onHover }) {
  const shapes = view === 'front' ? FRONT_ZONE_SHAPES : BACK_ZONE_SHAPES
  const labels = view === 'front' ? FRONT_LABELS : BACK_LABELS
  const zones  = view === 'front' ? FRONT_ZONES : BACK_ZONES

  const opacity = (id) => {
    if (!selected && !hovered) return 0.32
    if (id === selected) return 0.88
    if (id === hovered)  return 0.62
    return 0.07
  }
  const sw = (id) => (id === selected ? 2 : id === hovered ? 1.5 : 0.8)

  const renderShape = (s, color, op, strokeW) => {
    if (s.e) return <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} fill={color} fillOpacity={op} stroke={color} strokeWidth={strokeW} style={{ transition:'all 0.18s' }}/>
    if (s.r) return <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} fill={color} fillOpacity={op} stroke={color} strokeWidth={strokeW} style={{ transition:'all 0.18s' }}/>
    return <path d={s.d} fill={color} fillOpacity={op} stroke={color} strokeWidth={strokeW} style={{ transition:'all 0.18s' }}/>
  }

  return (
    <svg viewBox="0 0 240 500" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
      {zones.map(id => {
        const data   = DB[id]
        const color  = data?.color || '#b4bccc'
        const op     = opacity(id)
        const strokeW = sw(id)
        return (
          <g key={id}
            onClick={() => onSelect(selected === id ? null : id)}
            onMouseEnter={() => onHover(id)}
            onMouseLeave={() => onHover(null)}
            style={{ cursor:'pointer' }}>
            {(shapes[id] || []).map((s, i) => (
              <g key={i}>{renderShape(s, color, op, strokeW)}</g>
            ))}
          </g>
        )
      })}
      {/* Labels */}
      {labels.map(l => {
        const data  = DB[l.id]
        const color = data?.color || '#b4bccc'
        const sel   = selected === l.id || hovered === l.id
        return (
          <text key={l.id} x={l.x} y={l.y}
            fill={sel ? color : 'rgba(212,212,232,0.28)'}
            fontSize="7.5"
            fontFamily="Helvetica Neue,Arial,sans-serif"
            fontWeight={sel ? '700' : '400'}
            textAnchor={l.a}
            style={{ pointerEvents:'none', transition:'fill 0.18s', letterSpacing:'0.04em' }}>
            {DB[l.id]?.label || l.id}
          </text>
        )
      })}
    </svg>
  )
}

// ─── Exercise Card ────────────────────────────────────────────────────────────
function ExerciseCard({ ex }) {
  const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.yt)}`
  return (
    <div style={{
      background:'var(--bg-card)', border:'1px solid var(--border)',
      borderRadius:12, padding:'13px 14px 11px',
      display:'flex', flexDirection:'column', gap:7,
    }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
        <div style={{ flex:1 }}>
          <p style={{ color:'var(--text-primary)', fontSize:13, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif', marginBottom:3 }}>{ex.name}</p>
          <div style={{ display:'flex', gap:6 }}>
            <span style={{ color:'rgba(212,212,232,0.32)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', background:'rgba(212,212,232,0.06)', padding:'2px 7px', borderRadius:5 }}>{ex.eq}</span>
            <span style={{ color:'#b4bccc', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', fontWeight:700, background:'rgba(180,188,204,0.1)', padding:'2px 7px', borderRadius:5 }}>{ex.sets}</span>
          </div>
        </div>
        <a href={ytUrl} target="_blank" rel="noopener noreferrer"
          style={{
            display:'flex', alignItems:'center', gap:5, flexShrink:0,
            padding:'7px 11px', borderRadius:8,
            background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)',
            color:'#ef4444', fontSize:10, fontWeight:700,
            fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'0.08em',
            textDecoration:'none',
          }}
          onClick={e => e.stopPropagation()}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="#ef4444">
            <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.8 5 12 5 12 5s-4.8 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.2.8C6.8 19 12 19 12 19s4.8 0 7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8z"/>
            <polygon fill="white" points="10,8.5 16,12 10,15.5"/>
          </svg>
          Watch
        </a>
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function pickFour(pool) {
  const arr = [...pool]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, 4)
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WorkoutGuide({ onClose, inline = false }) {
  const [view,           setView]           = useState('front')
  const [selected,       setSelected]       = useState(null)
  const [hovered,        setHovered]        = useState(null)
  const [shownExercises, setShownExercises] = useState([])
  const [spinning,       setSpinning]       = useState(false)

  const zones      = view === 'front' ? FRONT_ZONES : BACK_ZONES
  const selectedDB = selected ? DB[selected] : null
  const accent     = '#b4bccc'

  useEffect(() => {
    if (selected && DB[selected]) setShownExercises(pickFour(DB[selected].exercises))
    else setShownExercises([])
  }, [selected])

  const handleViewChange = (v) => { setView(v); setSelected(null); setHovered(null) }
  const handleSelect = (id) => { setSelected(id); setHovered(null) }

  const handleRefresh = () => {
    if (!selected || !DB[selected]) return
    setSpinning(true)
    setShownExercises(pickFour(DB[selected].exercises))
    setTimeout(() => setSpinning(false), 460)
  }

  return (
    <div style={{
      ...(inline ? {} : { position:'fixed', inset:0, zIndex:200, animation:'slideUp 0.28s ease both' }),
      background:'var(--bg-primary)',
      display:'flex', flexDirection:'column',
      WebkitFontSmoothing:'antialiased',
    }}>
      {!inline && <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>}

      {/* Header */}
      <div style={{
        flexShrink:0, position: inline ? 'relative' : 'sticky', top:0, zIndex:10,
        background:'var(--header-bg)', backdropFilter:'blur(18px)',
        WebkitBackdropFilter:'blur(18px)',
        borderBottom:'1px solid var(--border)', padding:'12px 16px',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
          {!inline && (
            <button onClick={onClose} style={{
              display:'flex', alignItems:'center', justifyContent:'center',
              width:34, height:34, borderRadius:9,
              background:'var(--stat-bg)', border:'1px solid var(--border)',
              color:'var(--text-secondary)', cursor:'pointer', flexShrink:0,
            }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </button>
          )}
          <div style={{ flex:1 }}>
            <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:1 }}>AXIOS FITNESS</p>
            <h2 style={{ color:accent, fontWeight:900, fontSize:18, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.02em' }}>Workout Guide</h2>
          </div>
        </div>
        {/* Front / Back toggle */}
        <div style={{ display:'flex', background:'var(--stat-bg)', borderRadius:9, border:'1px solid var(--border)', padding:2, gap:2 }}>
          {[['front','Front'],['back','Back']].map(([v, lbl]) => (
            <button key={v} onClick={() => handleViewChange(v)} style={{
              flex:1, padding:'7px', borderRadius:7,
              background: view===v ? 'rgba(212,212,232,0.1)' : 'transparent',
              color: view===v ? 'var(--text-primary)' : 'var(--text-muted)',
              border:'none', cursor:'pointer', fontSize:11,
              fontWeight: view===v ? 700 : 400,
              fontFamily:'Helvetica Neue,sans-serif', transition:'all 0.15s',
            }}>{lbl}</button>
          ))}
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>

        {/* Anatomy diagram */}
        <div style={{ position:'relative', width:240, height:500, margin:'0 auto 14px' }}>
          {view === 'front' ? <FrontBase/> : <BackBase/>}
          <ZoneOverlay
            view={view}
            selected={selected}
            hovered={hovered}
            onSelect={handleSelect}
            onHover={setHovered}
          />
        </div>

        {!selected && (
          <p style={{ textAlign:'center', color:'rgba(212,212,232,0.2)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', fontStyle:'italic', marginBottom:14 }}>
            Tap a muscle group to see exercises
          </p>
        )}

        {/* Chip bar */}
        <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4, marginBottom:16 }}>
          {zones.map(id => {
            const d   = DB[id]
            const sel = selected === id
            return (
              <button key={id} onClick={() => handleSelect(sel ? null : id)} style={{
                flexShrink:0, padding:'6px 12px', borderRadius:99,
                background: sel ? `${d?.color}22` : 'var(--stat-bg)',
                border: `1px solid ${sel ? d?.color+'66' : 'var(--border)'}`,
                color: sel ? d?.color : 'var(--text-muted)',
                fontSize:11, fontWeight: sel ? 700 : 400,
                fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer',
                letterSpacing:'0.04em', transition:'all 0.15s',
                whiteSpace:'nowrap',
              }}>{d?.label || id}</button>
            )
          })}
        </div>

        {/* Detail panel */}
        {selected && selectedDB && (
          <div style={{ animation:'fadeUp 0.22s ease both' }}>
            <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

            {/* Muscle header */}
            <div style={{
              background:'var(--bg-card)', border:`1px solid ${selectedDB.color}33`,
              borderRadius:14, padding:'14px 16px', marginBottom:12,
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:selectedDB.color, boxShadow:`0 0 10px ${selectedDB.color}` }}/>
                <p style={{ color:selectedDB.color, fontSize:15, fontWeight:800, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.01em' }}>{selectedDB.label}</p>
              </div>
              <p style={{ color:'rgba(212,212,232,0.38)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'0.06em', fontStyle:'italic', marginBottom:10 }}>
                {selectedDB.scientific}
              </p>
              {/* Intensity */}
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
                <span style={{ color:'rgba(212,212,232,0.28)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif' }}>Intensity</span>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{
                    width:7, height:7, borderRadius:'50%',
                    background: i <= selectedDB.intensity ? selectedDB.color : 'rgba(212,212,232,0.08)',
                    boxShadow: i <= selectedDB.intensity ? `0 0 6px ${selectedDB.color}88` : 'none',
                  }}/>
                ))}
              </div>
              <p style={{ color:'rgba(212,212,232,0.52)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1.65 }}>{selectedDB.desc}</p>
            </div>

            {/* Exercise list */}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <div style={{ width:3, height:14, background:selectedDB.color, borderRadius:2, boxShadow:`0 0 8px ${selectedDB.color}` }}/>
              <p style={{ color:selectedDB.color, fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', fontWeight:700, flex:1 }}>
                Exercises
              </p>
              <button onClick={handleRefresh} style={{
                display:'flex', alignItems:'center', gap:5,
                padding:'5px 10px', borderRadius:8,
                background:`${selectedDB.color}18`, border:`1px solid ${selectedDB.color}44`,
                color:selectedDB.color, fontSize:10, fontWeight:700,
                fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer',
                letterSpacing:'0.08em',
              }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: spinning ? 'rotate(180deg)' : 'rotate(0deg)', transition:'transform 0.46s ease' }}>
                  <polyline points="1 4 1 10 7 10"/>
                  <polyline points="23 20 23 14 17 14"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                </svg>
                Shuffle
              </button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
              {shownExercises.map((ex, i) => <ExerciseCard key={`${ex.name}-${i}`} ex={ex}/>)}
            </div>
          </div>
        )}

        {!selected && (
          <div style={{ textAlign:'center', padding:'24px 0' }}>
            <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="rgba(212,212,232,0.1)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ display:'block', margin:'0 auto 10px' }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style={{ color:'rgba(212,212,232,0.15)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1.6 }}>
              Select a muscle group<br/>from the diagram or chips above
            </p>
          </div>
        )}

        <div style={{ height:24 }}/>
      </div>
    </div>
  )
}
