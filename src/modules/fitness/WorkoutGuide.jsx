import { useState } from 'react'

// ─── Exercise Database ────────────────────────────────────────────────────────
// Each entry has: name, equipment, sets, desc, videoSearch (opens YouTube)
const DB = {
  chest: {
    label: 'Chest', color: '#ef4444',
    men: [
      { name:'Bench Press',      eq:'Barbell',     sets:'4×8-10',  desc:'Primary compound lift for chest mass. Control the descent, touch lower chest, drive up.',             yt:'bench press proper form tutorial' },
      { name:'Push-Up',          eq:'Bodyweight',  sets:'3×15-20', desc:'Classic full-chest move. Elevate feet for upper chest emphasis. Keep core rigid throughout.',          yt:'push up proper form tutorial' },
      { name:'Incline DB Press', eq:'Dumbbells',   sets:'3×10-12', desc:'Upper chest and front delt focus at 30-45°. Don\'t let elbows flare past 75°.',                       yt:'incline dumbbell press form tutorial' },
      { name:'Cable Flyes',      eq:'Cable',       sets:'3×12-15', desc:'Isolation for the chest stretch and squeeze. Slight elbow bend throughout. Squeeze at centre.',       yt:'cable fly chest isolation tutorial' },
    ],
    women: [
      { name:'Push-Up',          eq:'Bodyweight',  sets:'3×12',    desc:'Builds chest, shoulders and triceps. Start from knees if needed, progress to full form.',             yt:'push up proper form tutorial women' },
      { name:'DB Chest Press',   eq:'Dumbbells',   sets:'3×15',    desc:'Controlled pressing movement for upper body strength and chest definition.',                          yt:'dumbbell chest press form tutorial' },
      { name:'Pec Deck Flyes',   eq:'Machine',     sets:'3×15',    desc:'Machine-guided isolation for a safe, controlled chest squeeze at full range of motion.',              yt:'pec deck fly machine tutorial' },
      { name:'Incline Push-Up',  eq:'Bodyweight',  sets:'3×15',    desc:'Reduce load by elevating hands on a bench. Great stepping stone toward full push-ups.',              yt:'incline push up tutorial form' },
    ],
  },
  shoulders: {
    label: 'Shoulders', color: '#f59e0b',
    men: [
      { name:'Overhead Press',   eq:'Barbell',     sets:'4×8-10',  desc:'King of shoulder development. Builds all three heads and overall pressing strength.',                 yt:'overhead press form tutorial barbell' },
      { name:'Lateral Raise',    eq:'Dumbbells',   sets:'4×15',    desc:'Essential for shoulder width. Raise to shoulder height with slight elbow bend. No swinging.',        yt:'lateral raise proper form tutorial' },
      { name:'Face Pull',        eq:'Cable',       sets:'3×20',    desc:'Rear delts + rotator cuff health. One of the most important shoulder exercises for longevity.',       yt:'face pull cable rear delt tutorial' },
      { name:'Arnold Press',     eq:'Dumbbells',   sets:'3×10-12', desc:'Rotating press targeting all three delt heads through a longer ROM than standard press.',             yt:'arnold press dumbbell tutorial form' },
    ],
    women: [
      { name:'DB Shoulder Press',eq:'Dumbbells',   sets:'3×12-15', desc:'Balanced shoulder development. Great for sculpting defined shoulder caps.',                          yt:'dumbbell shoulder press form tutorial' },
      { name:'Lateral Raise',    eq:'Dumbbells',   sets:'3×15-20', desc:'Defines the side delt for a rounded look. Keep controlled with lighter weight.',                     yt:'lateral raise proper form tutorial' },
      { name:'Front Raise',      eq:'Dumbbells',   sets:'3×15',    desc:'Targets the front deltoid. Alternate arms or raise together with light weight.',                     yt:'front raise dumbbell shoulder tutorial' },
      { name:'Band Pull-Apart',  eq:'Band',        sets:'3×20',    desc:'Rear delt and upper back. Excellent for posture and shoulder health. Pull band to chest level.',     yt:'band pull apart rear delt tutorial' },
    ],
  },
  biceps: {
    label: 'Biceps', color: '#22c55e',
    men: [
      { name:'Barbell Curl',     eq:'Barbell',     sets:'4×8-10',  desc:'Best overall mass builder. Full ROM, supinate at top, don\'t swing the torso.',                      yt:'barbell curl form bicep tutorial' },
      { name:'Hammer Curl',      eq:'Dumbbells',   sets:'3×12',    desc:'Neutral grip targets brachialis for thicker, fuller arms. Great complement to standard curls.',      yt:'hammer curl form tutorial dumbbell' },
      { name:'Incline DB Curl',  eq:'Dumbbells',   sets:'3×12',    desc:'Greater stretch on the long head. Sit on incline bench, let arms hang behind torso fully.',          yt:'incline dumbbell curl bicep tutorial' },
      { name:'Concentration Curl',eq:'Dumbbell',   sets:'3×12',    desc:'Brace elbow on inner thigh for strict isolation and peak contraction.',                              yt:'concentration curl bicep isolation form' },
    ],
    women: [
      { name:'DB Bicep Curl',    eq:'Dumbbells',   sets:'3×15',    desc:'Core arm-toning exercise. Slow down the lowering phase for maximum benefit.',                        yt:'dumbbell bicep curl form tutorial' },
      { name:'Hammer Curl',      eq:'Dumbbells',   sets:'3×15',    desc:'Targets forearm and brachialis for overall arm definition and functional strength.',                  yt:'hammer curl form tutorial dumbbell' },
      { name:'Cable Curl',       eq:'Cable',       sets:'3×15',    desc:'Constant tension throughout the movement for a great pump and muscle definition.',                   yt:'cable bicep curl form tutorial' },
      { name:'Band Curl',        eq:'Band',        sets:'3×20',    desc:'Home-friendly option. Stand on band and curl up maintaining tension at the top.',                    yt:'resistance band bicep curl tutorial' },
    ],
  },
  core: {
    label: 'Core', color: '#3b82f6',
    men: [
      { name:'Hanging Leg Raise',eq:'Pull-up Bar', sets:'4×12-15', desc:'Advanced lower-ab builder. Keep legs together and avoid swinging. Slow controlled movement.',        yt:'hanging leg raise core form tutorial' },
      { name:'Ab Wheel Rollout', eq:'Ab Wheel',    sets:'3×10',    desc:'Elite full-core movement. Start from knees, progress to standing. Keep lower back neutral.',         yt:'ab wheel rollout form tutorial core' },
      { name:'Plank',            eq:'Bodyweight',  sets:'3×60s',   desc:'Full core stabilisation. Straight line from head to heels. Hips neither sagging nor raised.',       yt:'plank proper form technique core' },
      { name:'Cable Crunch',     eq:'Cable',       sets:'3×15-20', desc:'Weighted ab builder. Kneel facing cable, flex your spine to crunch — don\'t just hip-flex.',        yt:'cable crunch abs form tutorial' },
    ],
    women: [
      { name:'Plank',            eq:'Bodyweight',  sets:'3×30-45s',desc:'Full core stabilisation. Build from 30s to 60s over time. Quality over duration.',                  yt:'plank proper form technique core' },
      { name:'Dead Bug',         eq:'Bodyweight',  sets:'3×10/side',desc:'Low-back-safe core exercise. Lower back pressed flat throughout. Opposite arm and leg.',            yt:'dead bug core exercise tutorial form' },
      { name:'Bicycle Crunch',   eq:'Bodyweight',  sets:'3×20',    desc:'Hits abs and obliques simultaneously. Slow is better — resist the urge to speed up.',               yt:'bicycle crunch abs form tutorial' },
      { name:'Leg Raise',        eq:'Bodyweight',  sets:'3×15',    desc:'Lower ab focus. Keep legs straight. Lower slowly to avoid hip flexor compensation.',                yt:'leg raise lower abs tutorial form' },
    ],
  },
  obliques: {
    label: 'Obliques', color: '#8b5cf6',
    men: [
      { name:'Russian Twist',    eq:'Weight',      sets:'3×20',    desc:'Seated rotation. Add a plate for resistance. Keep chest up and feet off the floor.',                 yt:'russian twist obliques form tutorial' },
      { name:'Side Plank',       eq:'Bodyweight',  sets:'3×45s',   desc:'Lateral core stability. Stack feet or stagger for easier modification. Progress to dips.',          yt:'side plank form tutorial obliques' },
      { name:'Woodchopper',      eq:'Cable/Band',  sets:'3×12/side',desc:'Rotational power that works obliques through full twisting range of motion.',                      yt:'cable woodchopper obliques tutorial' },
      { name:'Pallof Press',     eq:'Cable/Band',  sets:'3×12/side',desc:'Anti-rotation core stability. Press away from anchor and resist the pull back.',                   yt:'pallof press core anti rotation tutorial' },
    ],
    women: [
      { name:'Side Plank',       eq:'Bodyweight',  sets:'3×30s',   desc:'Great oblique and hip stability. Modify from knees or progress to full extended form.',             yt:'side plank form tutorial obliques' },
      { name:'Bicycle Crunch',   eq:'Bodyweight',  sets:'3×20',    desc:'Rotation hits obliques hard. Slow, controlled reps for best engagement.',                           yt:'bicycle crunch abs obliques tutorial' },
      { name:'Standing Side Crunch',eq:'DB',       sets:'3×15/side',desc:'Stand hip-width apart, dip sideways reaching hand toward knee. Squeeze oblique.',                 yt:'standing oblique crunch tutorial form' },
      { name:'Russian Twist',    eq:'Bodyweight',  sets:'3×20',    desc:'Seated rotation for waist definition. Keep feet off floor for extra challenge.',                    yt:'russian twist obliques form tutorial' },
    ],
  },
  quads: {
    label: 'Quads', color: '#06b6d4',
    men: [
      { name:'Back Squat',       eq:'Barbell',     sets:'4×6-8',   desc:'King of lower body. Chest up, sit into the squat, knees track over toes. Full depth.',              yt:'back squat form proper technique tutorial' },
      { name:'Leg Press',        eq:'Machine',     sets:'4×10-12', desc:'High-load quad builder. Narrow stance for outer quad, wide for inner thigh activation.',             yt:'leg press form proper technique tutorial' },
      { name:'Bulgarian Split Squat',eq:'DB',      sets:'3×10/leg',desc:'Unilateral quad and glute developer. Rear foot elevated, front foot forward. Control descent.',     yt:'bulgarian split squat form tutorial' },
      { name:'Leg Extension',    eq:'Machine',     sets:'3×15',    desc:'Quad isolation. Full extension at top, slow lowering for maximum eccentric benefit.',               yt:'leg extension machine proper form tutorial' },
    ],
    women: [
      { name:'Goblet Squat',     eq:'KB/DB',       sets:'3×15',    desc:'Beginner-friendly squat. Hold weight at chest, sit deep, keep tall chest throughout.',              yt:'goblet squat form tutorial proper' },
      { name:'Leg Press',        eq:'Machine',     sets:'3×15',    desc:'Controlled quad and glute builder. Higher foot placement adds more glute activation.',              yt:'leg press form proper technique tutorial' },
      { name:'Walking Lunges',   eq:'DB',          sets:'3×12/leg',desc:'Dynamic movement for quads, glutes and balance. Keep front knee stacked over ankle.',              yt:'walking lunge form tutorial proper' },
      { name:'Sumo Squat',       eq:'Dumbbell',    sets:'3×15',    desc:'Wide stance targets inner thigh and glutes. Hold DB between legs, squat deep.',                    yt:'sumo squat form tutorial dumbbell' },
    ],
  },
  calves: {
    label: 'Calves', color: '#f97316',
    men: [
      { name:'Standing Calf Raise',eq:'Machine',   sets:'4×15-20', desc:'Primary calf mass builder. All the way up, all the way down. Full ROM is everything here.',         yt:'standing calf raise form tutorial' },
      { name:'Seated Calf Raise', eq:'Machine',    sets:'3×15-20', desc:'Isolates the soleus (deeper calf muscle). Essential for balanced lower leg development.',           yt:'seated calf raise form tutorial machine' },
      { name:'Single-leg Calf Raise',eq:'BW',      sets:'3×15/leg',desc:'Progressive overload via single leg. Use wall for balance, full ROM essential.',                   yt:'single leg calf raise form tutorial' },
      { name:'Jump Rope',        eq:'Jump Rope',   sets:'3×2min',  desc:'Explosive calf conditioning with cardiovascular benefit. Ankles stay stiff, bounce on toes.',       yt:'jump rope calf workout tutorial' },
    ],
    women: [
      { name:'Standing Calf Raise',eq:'BW/Machine',sets:'3×20',    desc:'Full ROM calf toning. Use a step for greater stretch at the bottom of each rep.',                  yt:'standing calf raise form tutorial' },
      { name:'Seated Calf Raise', eq:'Machine',    sets:'3×20',    desc:'Soleus-focused for balanced calf development and improved ankle stability.',                        yt:'seated calf raise form tutorial machine' },
      { name:'Jump Rope',        eq:'Jump Rope',   sets:'3×1-2min',desc:'Cardio and calf conditioning combined. Excellent for toning and calorie burn.',                    yt:'jump rope tutorial beginners calves' },
    ],
  },
  traps: {
    label: 'Traps', color: '#ec4899',
    men: [
      { name:'Barbell Shrug',    eq:'Barbell',     sets:'4×10-12', desc:'Primary trap mass builder. Hold at top for a count. Don\'t roll the shoulders.',                    yt:'barbell shrug traps form tutorial' },
      { name:'DB Shrug',         eq:'Dumbbells',   sets:'3×12-15', desc:'Greater ROM than barbell. Squeeze at top, lower slowly through full range.',                        yt:'dumbbell shrug traps form tutorial' },
      { name:'Face Pull',        eq:'Cable',       sets:'3×20',    desc:'Traps + rear delts + rotator cuff in one movement. Critical for upper back health.',                yt:'face pull cable rear delt traps tutorial' },
      { name:'Rack Pull',        eq:'Barbell',     sets:'3×6-8',   desc:'Partial deadlift from knee height allows heavy loading for upper trap thickness.',                  yt:'rack pull trap deadlift form tutorial' },
    ],
    women: [
      { name:'DB Shrug',         eq:'Dumbbells',   sets:'3×15',    desc:'Upper trap development. Squeeze at top, full range of motion on the way down.',                    yt:'dumbbell shrug traps form tutorial' },
      { name:'Face Pull',        eq:'Band/Cable',  sets:'3×20',    desc:'Rear delt and trap health. Critical for posture correction and shoulder stability.',               yt:'face pull cable rear delt traps tutorial' },
      { name:'Upright Row',      eq:'Dumbbells',   sets:'3×15',    desc:'Compound upper-body pull hitting traps and shoulders simultaneously.',                              yt:'upright row form tutorial dumbbell' },
    ],
  },
  lats: {
    label: 'Lats', color: '#14b8a6',
    men: [
      { name:'Pull-Up',          eq:'Bar',         sets:'4×max',   desc:'Best lat mass builder. Dead hang start. Drive elbows toward hips as you pull up.',                  yt:'pull up proper form lat engagement tutorial' },
      { name:'Lat Pulldown',     eq:'Cable',       sets:'4×10-12', desc:'Pull-up substitute with controlled load. Wide grip, lean back slightly, pull to upper chest.',     yt:'lat pulldown form proper technique tutorial' },
      { name:'Bent-Over Row',    eq:'Barbell',     sets:'4×8-10',  desc:'Compound pull for lat and mid-back thickness. Hinge to 45°, pull bar to lower chest.',             yt:'bent over row form proper technique tutorial' },
      { name:'Seated Cable Row', eq:'Cable',       sets:'3×12',    desc:'Mid-back and lat builder. Neutral grip, pull to navel, squeeze shoulder blades together.',         yt:'seated cable row form tutorial lat' },
    ],
    women: [
      { name:'Assisted Pull-Up', eq:'Machine/Band',sets:'3×8-10',  desc:'Build toward full pull-ups with controlled assistance. Maintain proper form throughout.',          yt:'assisted pull up lat tutorial form' },
      { name:'Lat Pulldown',     eq:'Cable',       sets:'3×12-15', desc:'Excellent back width builder. Pull bar to upper chest, focus on feeling the lat.',                 yt:'lat pulldown form proper technique tutorial' },
      { name:'Single-arm DB Row',eq:'Dumbbell',    sets:'3×12/side',desc:'Unilateral back builder. Support on bench, pull elbow past hip, squeeze the lat hard.',          yt:'single arm dumbbell row form tutorial' },
      { name:'Band Row',         eq:'Band',        sets:'3×15',    desc:'Home-friendly lat builder. Anchor band at waist height, row to sides, squeeze back.',             yt:'resistance band row back tutorial form' },
    ],
  },
  triceps: {
    label: 'Triceps', color: '#a855f7',
    men: [
      { name:'Close-Grip Bench', eq:'Barbell',     sets:'4×8-10',  desc:'Compound tricep mass builder. Shoulder-width grip, elbows in, lower to lower chest.',              yt:'close grip bench press triceps tutorial' },
      { name:'Tricep Pushdown',  eq:'Cable',       sets:'3×12-15', desc:'Classic isolation. Keep elbows fixed at sides, fully extend, squeeze hard at bottom.',             yt:'tricep pushdown cable form tutorial' },
      { name:'Skull Crusher',    eq:'EZ Bar',      sets:'3×10-12', desc:'Long head developer. Lower bar to forehead, keep upper arms perfectly vertical.',                  yt:'skull crusher triceps ez bar form tutorial' },
      { name:'Overhead Ext',     eq:'Dumbbell',    sets:'3×12',    desc:'Stretches the long head maximally. Hold DB overhead with both hands, lower behind head.',          yt:'overhead tricep extension dumbbell form' },
    ],
    women: [
      { name:'Tricep Dip',       eq:'Bench',       sets:'3×12-15', desc:'Excellent arm-toning exercise. Bend elbows to 90°, push back up. Hips close to bench.',           yt:'tricep dip bench form tutorial' },
      { name:'Overhead Ext',     eq:'Dumbbell',    sets:'3×15',    desc:'Tones the back of arms. Keep upper arms close to head, full extension at top.',                    yt:'overhead tricep extension dumbbell form' },
      { name:'Pushdown',         eq:'Cable/Band',  sets:'3×15-20', desc:'Constant tension isolation. Keep elbows pinned at sides throughout the full range.',               yt:'tricep pushdown cable band form tutorial' },
      { name:'Diamond Push-Up',  eq:'Bodyweight',  sets:'3×10-12', desc:'Challenging bodyweight tricep move. Diamond hand position, elbows close to body.',                 yt:'diamond push up triceps form tutorial' },
    ],
  },
  lower_back: {
    label: 'Lower Back', color: '#f43f5e',
    men: [
      { name:'Deadlift',         eq:'Barbell',     sets:'4×5',     desc:'King of all lifts. Neutral spine is non-negotiable. Drive through floor, hips and shoulders together.', yt:'conventional deadlift form tutorial' },
      { name:'Good Morning',     eq:'Barbell',     sets:'3×10-12', desc:'Hip hinge for lower back and hamstrings. Light weight only — perfect form is everything.',         yt:'good morning barbell lower back form' },
      { name:'Back Extension',   eq:'Machine',     sets:'3×15',    desc:'Spinal erector isolation. Control both phases equally. Add plate for extra load.',                  yt:'back extension hyperextension form tutorial' },
      { name:'Superman Hold',    eq:'Bodyweight',  sets:'3×10',    desc:'Posterior chain activation. Raise arms and legs simultaneously, hold 2 seconds at top.',           yt:'superman exercise lower back form tutorial' },
    ],
    women: [
      { name:'Romanian Deadlift',eq:'DB',          sets:'3×12',    desc:'Hip hinge for lower back and glutes. Push hips back, slight knee bend, neutral spine.',            yt:'romanian deadlift form tutorial women' },
      { name:'Back Extension',   eq:'Machine',     sets:'3×15',    desc:'Erector spinae focus. Great for lower back health and posture improvement over time.',             yt:'back extension hyperextension form tutorial' },
      { name:'Bird Dog',         eq:'Bodyweight',  sets:'3×10/side',desc:'Lower back and glute stability. On all fours, extend opposite arm and leg. Hold 2 seconds.',     yt:'bird dog exercise form tutorial core lower back' },
      { name:'Glute Bridge',     eq:'BW/Barbell',  sets:'3×15',    desc:'Posterior chain activation. Squeeze glutes hard at top, engage lower back and hamstrings.',       yt:'glute bridge form tutorial lower back glutes' },
    ],
  },
  glutes: {
    label: 'Glutes', color: '#d946ef',
    men: [
      { name:'Hip Thrust',       eq:'Barbell',     sets:'4×8-10',  desc:'Best glute-specific exercise. Shoulders on bench, barbell across hips, full extension at top.',    yt:'barbell hip thrust glute form tutorial' },
      { name:'Romanian Deadlift',eq:'Barbell',     sets:'4×8-10',  desc:'Dual glute and hamstring developer. Hip hinge with neutral spine and deep stretch.',               yt:'romanian deadlift form tutorial glutes' },
      { name:'Squat',            eq:'Barbell',     sets:'4×6-8',   desc:'Deeper squats hit glutes harder. Control the descent. Drive knees out at the bottom.',             yt:'back squat glutes form proper technique' },
      { name:'Cable Kickback',   eq:'Cable',       sets:'3×15/leg',desc:'Glute isolation. Ankle cuff attached, kick leg back, squeeze glute hard at full extension.',       yt:'cable kickback glute isolation form tutorial' },
    ],
    women: [
      { name:'Hip Thrust',       eq:'BW/Barbell',  sets:'4×15',    desc:'#1 glute builder. Drive through heels, full hip extension, squeeze at top every rep.',             yt:'hip thrust glute form tutorial women' },
      { name:'Glute Bridge',     eq:'BW/Band',     sets:'3×20',    desc:'Floor-based hip thrust. Feet flat, drive hips up hard. Add resistance band above knees.',          yt:'glute bridge form tutorial women' },
      { name:'Sumo Deadlift',    eq:'DB/Barbell',  sets:'3×12',    desc:'Wide stance deadlift prioritising glutes and inner thighs. Sit back and push floor away.',         yt:'sumo deadlift form glutes tutorial women' },
      { name:'Donkey Kick',      eq:'BW/Band',     sets:'3×15/leg',desc:'On all fours, kick heel to ceiling and squeeze glute hard at the top.',                           yt:'donkey kick glute exercise form tutorial' },
    ],
  },
  hamstrings: {
    label: 'Hamstrings', color: '#84cc16',
    men: [
      { name:'Romanian Deadlift',eq:'Barbell',     sets:'4×8-10',  desc:'Best hamstring builder. Hip hinge with slight knee bend, feel the stretch, drive hips forward.',   yt:'romanian deadlift hamstrings form tutorial' },
      { name:'Lying Leg Curl',   eq:'Machine',     sets:'3×12',    desc:'Hamstring isolation. Full ROM, control the eccentric lowering phase above all else.',              yt:'lying leg curl hamstring machine form tutorial' },
      { name:'Nordic Curl',      eq:'Partner',     sets:'3×5-8',   desc:'Advanced eccentric exercise. Exceptional hamstring strength and injury prevention.',               yt:'nordic curl hamstring form tutorial' },
      { name:'Good Morning',     eq:'Barbell',     sets:'3×10',    desc:'Hip hinge that heavily loads the hamstrings. Keep a proud chest and neutral spine.',               yt:'good morning exercise hamstrings form' },
    ],
    women: [
      { name:'Romanian Deadlift',eq:'Dumbbells',   sets:'3×12-15', desc:'Essential hamstring and glute exercise. Neutral spine, feel the stretch in hamstrings.',           yt:'romanian deadlift hamstrings form women' },
      { name:'Lying Leg Curl',   eq:'Machine',     sets:'3×15',    desc:'Hamstring isolation machine. Great for toning the back of the thigh.',                             yt:'lying leg curl hamstring machine form tutorial' },
      { name:'Single-leg DL',    eq:'Dumbbell',    sets:'3×10/leg',desc:'Balance and hamstring strength combined. Hinge at hip, lower DB toward floor, return tall.',       yt:'single leg deadlift form tutorial women' },
      { name:'Ball Leg Curl',    eq:'Stability Ball',sets:'3×12',  desc:'Functional hamstring move. Lie on back, feet on ball, curl ball toward glutes.',                  yt:'stability ball leg curl hamstrings form' },
    ],
  },
}

// ─── SVG Muscle Zone Data ─────────────────────────────────────────────────────
// zones: array of ellipse definitions {cx, cy, rx, ry}
// label: where to render the text label
const FRONT = [
  { id:'shoulders',  zones:[{cx:40,cy:52,rx:15,ry:10},{cx:120,cy:52,rx:15,ry:10}], lx:138, ly:55, anchor:'start' },
  { id:'chest',      zones:[{cx:80,cy:71,rx:26,ry:21}],                             lx:116, ly:68, anchor:'start' },
  { id:'biceps',     zones:[{cx:26,cy:70,rx:8,ry:16},{cx:134,cy:70,rx:8,ry:16}],   lx: 10, ly:67, anchor:'start' },
  { id:'core',       zones:[{cx:80,cy:115,rx:23,ry:20}],                            lx: 10, ly:112,anchor:'start' },
  { id:'obliques',   zones:[{cx:49,cy:110,rx:10,ry:19},{cx:111,cy:110,rx:10,ry:19}],lx:128,ly:108,anchor:'start' },
  { id:'quads',      zones:[{cx:61,cy:196,rx:22,ry:28},{cx:99,cy:196,rx:22,ry:28}], lx:130,ly:193,anchor:'start' },
  { id:'calves',     zones:[{cx:61,cy:260,rx:14,ry:22},{cx:99,cy:260,rx:14,ry:22}], lx: 10,ly:258,anchor:'start' },
]

const BACK = [
  { id:'traps',      zones:[{cx:80,cy:53,rx:24,ry:13}],                             lx:116, ly:52, anchor:'start' },
  { id:'lats',       zones:[{cx:45,cy:88,rx:16,ry:27},{cx:115,cy:88,rx:16,ry:27}], lx:138, ly:86, anchor:'start' },
  { id:'triceps',    zones:[{cx:26,cy:72,rx:8,ry:17},{cx:134,cy:72,rx:8,ry:17}],   lx:  8, ly:70, anchor:'start' },
  { id:'lower_back', zones:[{cx:80,cy:128,rx:23,ry:16}],                            lx:  8, ly:126,anchor:'start' },
  { id:'glutes',     zones:[{cx:58,cy:163,rx:22,ry:18},{cx:102,cy:163,rx:22,ry:18}],lx:130,ly:161,anchor:'start' },
  { id:'hamstrings', zones:[{cx:61,cy:203,rx:22,ry:27},{cx:99,cy:203,rx:22,ry:27}], lx:  8,ly:201,anchor:'start' },
  { id:'calves',     zones:[{cx:61,cy:261,rx:14,ry:22},{cx:99,cy:261,rx:14,ry:22}], lx:130,ly:259,anchor:'start' },
]

// ─── Body Silhouette SVG Paths ────────────────────────────────────────────────
// Male front silhouette assembled from basic shapes
function BodyShape({ gender, view }) {
  const isMale = gender === 'male'
  const fill   = 'rgba(255,255,255,0.07)'
  const stroke = 'rgba(255,255,255,0.18)'
  const sw     = 0.8

  // shoulder/hip widths differ by gender
  const sw2 = isMale ? 140 : 130  // shoulder outer x
  const sw1 = isMale ? 20  : 30   // shoulder outer x (left)
  const hw  = isMale ? 56  : 50   // hip rect x
  const hw2 = isMale ? 104 : 110  // hip rect end x (width = hw2-hw)

  return (
    <g>
      {/* Head */}
      <circle cx="80" cy="17" r="13" fill={fill} stroke={stroke} strokeWidth={sw}/>
      {/* Neck */}
      <rect x="74" y="28" width="12" height="10" rx="3" fill={fill} stroke={stroke} strokeWidth={sw}/>
      {/* Upper torso */}
      <path d={`M72,37 L88,37 L${sw2-10},47 L${sw2},58 L${sw2},102 L${sw1},102 L${sw1},58 L${sw1+10},47 Z`} fill={fill} stroke={stroke} strokeWidth={sw}/>
      {/* Abs */}
      <rect x="53" y="102" width="54" height="44" rx="7" fill={fill} stroke={stroke} strokeWidth={sw}/>
      {/* Hips */}
      <rect x={hw} y="147" width={hw2-hw} height="18" rx="7" fill={fill} stroke={stroke} strokeWidth={sw}/>
      {/* Left upper arm */}
      <rect x="18" y="44" width="16" height="54" rx="7" fill={fill} stroke={stroke} strokeWidth={sw} transform="rotate(-7,26,71)"/>
      {/* Right upper arm */}
      <rect x="126" y="44" width="16" height="54" rx="7" fill={fill} stroke={stroke} strokeWidth={sw} transform="rotate(7,134,71)"/>
      {/* Left forearm */}
      <rect x="12" y="98" width="13" height="50" rx="6" fill={fill} stroke={stroke} strokeWidth={sw} transform="rotate(-9,18,123)"/>
      {/* Right forearm */}
      <rect x="135" y="98" width="13" height="50" rx="6" fill={fill} stroke={stroke} strokeWidth={sw} transform="rotate(9,142,123)"/>
      {/* Left thigh */}
      <rect x="51" y="165" width="25" height="68" rx="9" fill={fill} stroke={stroke} strokeWidth={sw}/>
      {/* Right thigh */}
      <rect x="84" y="165" width="25" height="68" rx="9" fill={fill} stroke={stroke} strokeWidth={sw}/>
      {/* Left lower leg */}
      <rect x="53" y="236" width="21" height="56" rx="7" fill={fill} stroke={stroke} strokeWidth={sw}/>
      {/* Right lower leg */}
      <rect x="86" y="236" width="21" height="56" rx="7" fill={fill} stroke={stroke} strokeWidth={sw}/>
      {/* Feet */}
      <ellipse cx="63" cy="294" rx="14" ry="5" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <ellipse cx="97" cy="294" rx="14" ry="5" fill={fill} stroke={stroke} strokeWidth={sw}/>
    </g>
  )
}

// ─── Anatomy Diagram ──────────────────────────────────────────────────────────
function AnatomyDiagram({ gender, view, selected, onSelect }) {
  const muscles   = view === 'front' ? FRONT : BACK
  const isMale    = gender === 'male'

  return (
    <svg
      viewBox="0 0 160 305"
      style={{ width:'100%', maxWidth:230, display:'block', margin:'0 auto', overflow:'visible' }}
    >
      <BodyShape gender={gender} view={view} />

      {muscles.map(m => {
        const data  = DB[m.id]
        const color = data?.color || '#3b82f6'
        const sel   = selected === m.id
        return (
          <g key={m.id} onClick={() => onSelect(sel ? null : m.id)} style={{ cursor:'pointer' }}>
            {m.zones.map((z, i) => (
              <ellipse
                key={i}
                cx={z.cx} cy={z.cy} rx={z.rx} ry={z.ry}
                fill={sel ? `${color}55` : `${color}1a`}
                stroke={sel ? color : `${color}55`}
                strokeWidth={sel ? 1.5 : 0.8}
                style={{ transition:'all 0.18s' }}
              />
            ))}
            {/* Label */}
            <text
              x={m.lx} y={m.ly}
              fill={sel ? color : 'rgba(255,255,255,0.32)'}
              fontSize="6.5"
              fontFamily="Helvetica Neue,Arial,sans-serif"
              fontWeight={sel ? '700' : '500'}
              textAnchor="start"
              style={{ pointerEvents:'none', transition:'fill 0.18s', letterSpacing:'0.04em' }}
            >
              {data?.label || m.id}
            </text>
          </g>
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
      borderRadius:12, padding:'14px 14px 12px', display:'flex', flexDirection:'column', gap:8,
    }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
        <div style={{ flex:1 }}>
          <p style={{ color:'var(--text-primary)', fontSize:14, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif', marginBottom:2 }}>{ex.name}</p>
          <div style={{ display:'flex', gap:6 }}>
            <span style={{ color:'rgba(255,255,255,0.35)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', background:'rgba(255,255,255,0.06)', padding:'2px 7px', borderRadius:5 }}>{ex.eq}</span>
            <span style={{ color:'#3b82f6', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', fontWeight:700, background:'rgba(59,130,246,0.1)', padding:'2px 7px', borderRadius:5 }}>{ex.sets}</span>
          </div>
        </div>
        <a
          href={ytUrl} target="_blank" rel="noopener noreferrer"
          style={{
            display:'flex', alignItems:'center', gap:5, flexShrink:0,
            padding:'7px 11px', borderRadius:8,
            background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)',
            color:'#ef4444', fontSize:10, fontWeight:700,
            fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'0.08em',
            textDecoration:'none', transition:'all 0.15s',
          }}
          onClick={e => e.stopPropagation()}
        >
          <svg width={12} height={12} viewBox="0 0 24 24" fill="#ef4444"><path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.8 5 12 5 12 5s-4.8 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.2.8C6.8 19 12 19 12 19s4.8 0 7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8z"/><polygon fill="white" points="10,8.5 16,12 10,15.5"/></svg>
          Watch
        </a>
      </div>
      <p style={{ color:'var(--text-muted)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1.6 }}>{ex.desc}</p>
    </div>
  )
}

// ─── Muscle Chips (quick-select row) ─────────────────────────────────────────
function MuscleChips({ muscles, selected, onSelect }) {
  return (
    <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:2 }}>
      {muscles.map(m => {
        const d   = DB[m.id]
        const sel = selected === m.id
        return (
          <button key={m.id} onClick={() => onSelect(sel ? null : m.id)} style={{
            flexShrink:0, padding:'6px 12px', borderRadius:99,
            background: sel ? `${d?.color}22` : 'var(--stat-bg)',
            border: `1px solid ${sel ? d?.color+'66' : 'var(--border)'}`,
            color: sel ? d?.color : 'var(--text-muted)',
            fontSize:11, fontWeight: sel ? 700 : 400,
            fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer',
            letterSpacing:'0.04em', transition:'all 0.15s',
            whiteSpace:'nowrap',
          }}>{d?.label || m.id}</button>
        )
      })}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WorkoutGuide({ onClose }) {
  const [gender,   setGender]   = useState('male')     // 'male' | 'female'
  const [view,     setView]     = useState('front')    // 'front' | 'back'
  const [selected, setSelected] = useState(null)
  const [visible,  setVisible]  = useState(true)

  const muscles     = view === 'front' ? FRONT : BACK
  const selectedDB  = selected ? DB[selected] : null
  const exercises   = selectedDB ? selectedDB[gender === 'male' ? 'men' : 'women'] : []

  const accentColor = '#3b82f6'

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:200,
      background:'var(--bg-primary)',
      display:'flex', flexDirection:'column',
      animation:'slideUp 0.28s ease both',
      WebkitFontSmoothing:'antialiased',
    }}>
      <style>{`
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        .ax-guide-chip:hover{opacity:0.85!important;}
        .ax-watch-btn:hover{background:rgba(239,68,68,0.22)!important;}
      `}</style>

      {/* ── Header ── */}
      <div style={{
        flexShrink:0, position:'sticky', top:0, zIndex:10,
        background:'var(--header-bg)', backdropFilter:'blur(18px)',
        WebkitBackdropFilter:'blur(18px)',
        borderBottom:'1px solid var(--border)', padding:'12px 16px',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
          <button onClick={onClose} style={{
            display:'flex', alignItems:'center', justifyContent:'center',
            width:34, height:34, borderRadius:9,
            background:'var(--stat-bg)', border:'1px solid var(--border)',
            color:'var(--text-secondary)', cursor:'pointer', flexShrink:0,
          }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>
          <div style={{ flex:1 }}>
            <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:1 }}>AXIOS FITNESS</p>
            <h2 style={{ color:accentColor, fontWeight:900, fontSize:18, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.02em' }}>Workout Guide</h2>
          </div>
        </div>

        {/* Gender + View toggles */}
        <div style={{ display:'flex', gap:8 }}>
          {/* Gender */}
          <div style={{ display:'flex', background:'var(--stat-bg)', borderRadius:9, border:'1px solid var(--border)', padding:2, gap:2, flex:1 }}>
            {[['male','Men'],['female','Women']].map(([g, label]) => (
              <button key={g} onClick={() => { setGender(g); setSelected(null) }} style={{
                flex:1, padding:'7px', borderRadius:7,
                background: gender===g ? accentColor : 'transparent',
                color: gender===g ? '#fff' : 'var(--text-muted)',
                border:'none', cursor:'pointer', fontSize:11, fontWeight:700,
                fontFamily:'Helvetica Neue,sans-serif', transition:'all 0.15s',
              }}>{label}</button>
            ))}
          </div>
          {/* Front / Back */}
          <div style={{ display:'flex', background:'var(--stat-bg)', borderRadius:9, border:'1px solid var(--border)', padding:2, gap:2, flex:1 }}>
            {[['front','Front'],['back','Back']].map(([v, label]) => (
              <button key={v} onClick={() => { setView(v); setSelected(null) }} style={{
                flex:1, padding:'7px', borderRadius:7,
                background: view===v ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: view===v ? 'var(--text-primary)' : 'var(--text-muted)',
                border:'none', cursor:'pointer', fontSize:11, fontWeight: view===v ? 700 : 400,
                fontFamily:'Helvetica Neue,sans-serif', transition:'all 0.15s',
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scrollable Body ── */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>

        {/* Anatomy Diagram */}
        <div style={{ position:'relative', marginBottom:14 }}>
          <AnatomyDiagram
            gender={gender}
            view={view}
            selected={selected}
            onSelect={setSelected}
          />
          {!selected && (
            <p style={{
              textAlign:'center', color:'rgba(255,255,255,0.2)', fontSize:11,
              fontFamily:'Helvetica Neue,sans-serif', fontStyle:'italic', marginTop:8,
            }}>Tap a muscle group to see exercises</p>
          )}
        </div>

        {/* Quick-select chips */}
        <MuscleChips muscles={muscles} selected={selected} onSelect={setSelected} />

        {/* Exercise panel */}
        {selected && selectedDB && (
          <div style={{ marginTop:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <div style={{ width:3, height:16, background:selectedDB.color, borderRadius:2, boxShadow:`0 0 8px ${selectedDB.color}` }} />
              <p style={{ color:selectedDB.color, fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', fontWeight:700 }}>
                {selectedDB.label} · {gender === 'male' ? "Men's" : "Women's"} Exercises
              </p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {exercises.map((ex, i) => <ExerciseCard key={i} ex={ex} />)}
            </div>
          </div>
        )}

        {/* Empty state if nothing selected */}
        {!selected && (
          <div style={{ marginTop:20, textAlign:'center', padding:'20px 0' }}>
            <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ display:'block', margin:'0 auto 12px' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p style={{ color:'rgba(255,255,255,0.18)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1.6 }}>
              Select a muscle group<br/>from the diagram or chips above
            </p>
          </div>
        )}

        <div style={{ height:24 }} />
      </div>
    </div>
  )
}
