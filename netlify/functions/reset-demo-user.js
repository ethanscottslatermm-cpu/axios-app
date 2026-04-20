const { createClient } = require('@supabase/supabase-js')

const DEMO_USER_ID = process.env.DEMO_USER_ID

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let userId
  try {
    ;({ userId } = JSON.parse(event.body))
  } catch {
    return { statusCode: 400, body: 'Invalid body' }
  }

  if (!DEMO_USER_ID || userId !== DEMO_USER_ID) {
    return { statusCode: 200, body: JSON.stringify({ skipped: true }) }
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const today = new Date().toISOString().split('T')[0]
  const currentMonth = today.slice(0, 7)

  // Wipe all demo user data
  await Promise.all([
    supabase.from('calendar_events').delete().eq('user_id', DEMO_USER_ID),
    supabase.from('bills').delete().eq('user_id', DEMO_USER_ID),
    supabase.from('workouts').delete().eq('user_id', DEMO_USER_ID),
    supabase.from('food_logs').delete().eq('user_id', DEMO_USER_ID),
    supabase.from('water_logs').delete().eq('user_id', DEMO_USER_ID),
    supabase.from('weight_logs').delete().eq('user_id', DEMO_USER_ID),
    supabase.from('devotionals').delete().eq('user_id', DEMO_USER_ID),
    supabase.from('prayer_logs').delete().eq('user_id', DEMO_USER_ID),
    supabase.from('stock_watchlist').delete().eq('user_id', DEMO_USER_ID),
  ])

  // Fitness: insert workout first, then exercises (need the workout id)
  const { data: workout } = await supabase
    .from('workouts')
    .insert({ user_id: DEMO_USER_ID, workout_date: today, label: 'Morning Run', type: 'Cardio', duration_min: 25 })
    .select()
    .single()

  if (workout) {
    await supabase.from('exercises').insert([
      { workout_id: workout.id, exercise_name: 'Outdoor Run', sets: 1, reps: null, weight_lbs: null, muscle_group: 'Full Body' },
      { workout_id: workout.id, exercise_name: 'Cool-down Stretch', sets: 1, reps: null, weight_lbs: null, muscle_group: 'Flexibility' },
    ])
  }

  // Seed everything else in parallel
  await Promise.all([
    // Calendar — 2 events today
    supabase.from('calendar_events').insert([
      { user_id: DEMO_USER_ID, title: 'Morning Run', date: today, time: '06:30', type: 'workout', recurring: 'none', email_reminder: false },
      { user_id: DEMO_USER_ID, title: 'Budget Review', date: today, time: '14:00', type: 'finance', recurring: 'none', email_reminder: false },
    ]),

    // Bills — 3 paid / 2 unpaid (60% paid)
    supabase.from('bills').insert([
      { user_id: DEMO_USER_ID, payee: 'Rent', amount: 1500.00, due_day: 1, frequency: 'monthly', category: 'rent', autopay: true, paid_months: [currentMonth] },
      { user_id: DEMO_USER_ID, payee: 'Netflix', amount: 18.00, due_day: 8, frequency: 'monthly', category: 'subscriptions', autopay: true, paid_months: [currentMonth] },
      { user_id: DEMO_USER_ID, payee: 'Car Insurance', amount: 210.00, due_day: 5, frequency: 'monthly', category: 'insurance', autopay: false, paid_months: [currentMonth] },
      { user_id: DEMO_USER_ID, payee: 'Electric Bill', amount: 140.00, due_day: 15, frequency: 'monthly', category: 'utilities', autopay: false, paid_months: [] },
      { user_id: DEMO_USER_ID, payee: 'Internet', amount: 75.00, due_day: 22, frequency: 'monthly', category: 'internet', autopay: false, paid_months: [] },
    ]),

    // Food — 1100 cal (50% of 2200 goal)
    supabase.from('food_logs').insert([
      { user_id: DEMO_USER_ID, food_name: 'Oatmeal & Berries', calories: 380, protein: 10, carbs: 65, fat: 7, meal_type: 'Breakfast', date: today },
      { user_id: DEMO_USER_ID, food_name: 'Grilled Chicken Wrap', calories: 520, protein: 38, carbs: 42, fat: 14, meal_type: 'Lunch', date: today },
      { user_id: DEMO_USER_ID, food_name: 'Protein Bar', calories: 200, protein: 20, carbs: 22, fat: 5, meal_type: 'Snack', date: today },
    ]),

    // Water — 4 glasses (50% of 8 goal)
    supabase.from('water_logs').insert([
      { user_id: DEMO_USER_ID, oz: 8, date: today },
      { user_id: DEMO_USER_ID, oz: 8, date: today },
      { user_id: DEMO_USER_ID, oz: 8, date: today },
      { user_id: DEMO_USER_ID, oz: 8, date: today },
    ]),

    // Weight — 182.5 lbs (goal is 175, so 7.5 lbs to go)
    supabase.from('weight_logs').insert([
      { user_id: DEMO_USER_ID, weight_lbs: 182.5, logged_date: today, note: 'Morning weigh-in' },
    ]),

    // Devotional — reflection + application filled = complete
    supabase.from('devotionals').insert([
      {
        user_id: DEMO_USER_ID,
        date: today,
        scripture_ref: 'philippians/4/13',
        scripture_text: 'I can do all things through Christ who strengthens me.',
        reflection: "Today I'm reminded that strength doesn't come from my own abilities, but from my faith. When challenges feel overwhelming, I can lean on something greater than myself.",
        application: "I will approach today's tasks with confidence, knowing I'm not doing it alone. When I feel discouraged, I'll pause and come back to this verse.",
      },
    ]),

    // Prayer — 2 prayers (gratitude + request)
    supabase.from('prayer_logs').insert([
      { user_id: DEMO_USER_ID, category: 'gratitude', prayer_text: "Lord, thank you for waking me up this morning with health and a clear mind. I'm grateful for every opportunity ahead today.", date: today, answered: false },
      { user_id: DEMO_USER_ID, category: 'request', prayer_text: "Please give me focus and wisdom today as I pursue my goals. Help me be disciplined in my health and intentional with my time.", date: today, answered: false },
    ]),

    // Finance — stock watchlist
    supabase.from('stock_watchlist').insert([
      { user_id: DEMO_USER_ID, symbol: 'AAPL' },
      { user_id: DEMO_USER_ID, symbol: 'GOOGL' },
      { user_id: DEMO_USER_ID, symbol: 'MSFT' },
    ]),
  ])

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reset: true }),
  }
}
