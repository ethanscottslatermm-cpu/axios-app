// Daily reflection card — cycles through 30 entries seeded by calendar day
const REFLECTIONS = [
  {
    theme: 'Stillness',
    scripture: 'Psalm 46:10',
    text: `Before the day layers itself with noise and obligation, take one deliberate breath. Not everything that demands your attention today deserves it. Some of the most important things you'll do today will look like doing nothing at all.`,
  },
  {
    theme: 'Perspective',
    scripture: '2 Corinthians 4:17',
    text: `Whatever feels heavy right now has a weight to it that is real but not final. Trouble that is temporary is still trouble — but it is worth something on the other side. Hold today loosely, and let the larger story speak louder than the present one.`,
  },
  {
    theme: 'Purpose',
    scripture: 'Jeremiah 29:11',
    text: `You are not behind. The life you have is not the lesser version of some ideal you missed. You are exactly in the middle of a story that is still being written — and the Author has not lost the thread.`,
  },
  {
    theme: 'Gratitude',
    scripture: '1 Thessalonians 5:18',
    text: `Make a short list today — three things that exist in your life that you did not earn and could not have arranged on your own. Gratitude is not naïve. It is a disciplined refusal to let what is hard erase what is good.`,
  },
  {
    theme: 'Courage',
    scripture: 'Joshua 1:9',
    text: `There is one thing you've been circling. You know what it is. Courage is not the absence of fear — it is movement in spite of it. Do one thing today that the lesser version of you would have talked yourself out of.`,
  },
  {
    theme: 'Identity',
    scripture: 'Psalm 139:14',
    text: `How you see yourself shapes everything downstream — what you attempt, what you accept, how you treat others. You are not your worst week, your most persistent failure, or the label someone else gave you. You are more than the story fear tells about you.`,
  },
  {
    theme: 'Rest',
    scripture: 'Matthew 11:28',
    text: `Rest is not a reward for finishing — it is a rhythm that makes finishing sustainable. If you have been running past empty, today is permission to stop. Not everything worth doing must be done today.`,
  },
  {
    theme: 'Patience',
    scripture: 'Romans 5:3–4',
    text: `Not all growth is visible while it's happening. Some of the most important work in a person's life happens underground, in a season that looks like delay. What is forming in you right now may be the most valuable thing about this chapter.`,
  },
  {
    theme: 'Words',
    scripture: 'Proverbs 18:21',
    text: `Consider what you've said recently — and what you've left unsaid. Words that need to be spoken rarely become easier with more time. And words that should have been withheld rarely disappear on their own. Choose carefully today.`,
  },
  {
    theme: 'Focus',
    scripture: 'Colossians 3:2',
    text: `Your attention is the most finite resource you have. It is also the most hunted. What you consume, scroll through, and dwell on becomes the lens through which you see everything else. Protect it accordingly.`,
  },
  {
    theme: 'Integrity',
    scripture: 'Proverbs 11:3',
    text: `Character is what you do when no one is watching — not because no one matters, but because the habit of consistency doesn't know how to be selective. Who you are privately is who you become publicly. Build carefully in the quiet.`,
  },
  {
    theme: 'Community',
    scripture: 'Hebrews 10:24–25',
    text: `You were not designed to carry everything alone. The people around you are not interruptions to your growth — they often are your growth. Who in your life deserves more of your time than you've been giving them?`,
  },
  {
    theme: 'Contentment',
    scripture: 'Philippians 4:11',
    text: `Wanting more is not wrong. But wanting more before you've been fully present in what you already have is a kind of poverty disguised as ambition. Contentment is not a ceiling — it is a foundation.`,
  },
  {
    theme: 'Change',
    scripture: 'Romans 12:2',
    text: `Growth is not about adding habits to an unchanged self. The real transformation happens when old thinking is replaced, not just supplemented. What belief have you been carrying that no longer serves who you are becoming?`,
  },
  {
    theme: 'Service',
    scripture: 'Mark 10:43',
    text: `There is a kind of significance that comes from achievement, and a different kind that comes from contribution. The second kind lasts longer and costs more. Look for someone today whose burden you can quietly lighten.`,
  },
  {
    theme: 'Faith',
    scripture: 'Hebrews 11:1',
    text: `Faith is not certainty — it is confidence directed at what you cannot fully prove. If you are waiting for more certainty before you act, you may be waiting for something that by design was never meant to arrive first.`,
  },
  {
    theme: 'Forgiveness',
    scripture: 'Ephesians 4:31–32',
    text: `Unforgiveness is not a punishment you give to someone else — it is a weight you carry for them. Whatever you've been holding, consider that releasing it may cost you far less than keeping it has.`,
  },
  {
    theme: 'Discipline',
    scripture: 'Galatians 6:9',
    text: `The days when you feel least like doing the right thing are exactly the days when doing the right thing matters most. Discipline is keeping your future self in the room when your present self wants to quit.`,
  },
  {
    theme: 'Anxiety',
    scripture: '1 Peter 5:7',
    text: `What are you carrying that was never yours to carry? Anxiety often attaches itself to outcomes genuinely outside your control. Name what is yours to do — then do it. Let the rest go.`,
  },
  {
    theme: 'Presence',
    scripture: 'Psalm 16:11',
    text: `The present moment is the only one available for living. The past is a place to learn from, not a place to live in. The future is something to prepare for, not to fear. Where you are right now is where your life is actually happening.`,
  },
  {
    theme: 'Honesty',
    scripture: 'John 8:32',
    text: `There is something liberating about saying the true thing — even when it is uncomfortable, even when it costs something. Honesty, practiced consistently, is one of the most freeing disciplines you can build into your life.`,
  },
  {
    theme: 'Loss',
    scripture: 'Psalm 34:18',
    text: `Some seasons are not about building — they are about surviving without losing yourself in the process. If today is one of those days, that is enough. Getting through something intact is its own kind of strength.`,
  },
  {
    theme: 'Generosity',
    scripture: 'Luke 6:38',
    text: `What you give does not diminish you. Generosity operates by a different mathematics than scarcity suggests. The most giving people you know are rarely the emptiest — there is something about open hands that tends to be filled.`,
  },
  {
    theme: 'Wonder',
    scripture: 'Psalm 8:3–4',
    text: `Pay attention to something beautiful today. Not as a productivity strategy — just because beauty still exists, because you still have eyes to see it, and because that is worth something no metric captures.`,
  },
  {
    theme: 'Humility',
    scripture: 'Micah 6:8',
    text: `You are not the main character of every story you're in. Some of the wisest things you'll do today will be listening longer, speaking later, and crediting others more freely than your instincts suggest. Strength lives in that.`,
  },
  {
    theme: 'Hope',
    scripture: 'Romans 15:13',
    text: `Hope is not wishful thinking — it is the choice to believe that what is good can still arrive, that what is broken can still be mended, that the end of this chapter is not the end of the story.`,
  },
  {
    theme: 'Enough',
    scripture: '2 Corinthians 12:9',
    text: `You do not need to have it all together to be useful today. The most powerful thing you can bring into most situations is not your strength — it is your honesty about where your strength ends and your dependence begins.`,
  },
  {
    theme: 'Renewal',
    scripture: 'Isaiah 43:19',
    text: `Something new is always possible. Not by ignoring what has happened, but by refusing to let it be the only thing allowed to define what comes next. You are not finished. This is not your final form.`,
  },
  {
    theme: 'Investment',
    scripture: 'Matthew 6:21',
    text: `Where you spend your time, money, and attention tells a more accurate story about what you value than what you say you value. Look at your last week honestly — and ask if the story it tells is the one you want to be writing.`,
  },
  {
    theme: 'Surrender',
    scripture: 'Proverbs 3:5–6',
    text: `Some things will not make sense until later. Some may never fully make sense. The willingness to move forward without complete understanding is not weakness — it is the practical expression of trust in something larger than your own comprehension.`,
  },
]

function dayOfYear() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  return Math.floor((now - start) / 86400000)
}

export default function DailyPrayer({ anim = () => ({}), visible }) {
  const reflection = REFLECTIONS[dayOfYear() % REFLECTIONS.length]
  const today = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })

  return (
    <div style={{
      background:   'var(--stat-bg)',
      border:       '1px solid var(--accent-prayer, rgba(212,212,232,0.18))',
      borderRadius:  16,
      padding:      '22px 20px 20px',
      position:     'relative',
      overflow:     'hidden',
      boxShadow:    '0 0 18px color-mix(in srgb, var(--accent-prayer, rgba(212,212,232,0.12)) 10%, transparent)',
      ...anim(30),
    }}>
      {/* Accent glow top-right */}
      <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, background:'radial-gradient(circle, var(--accent-prayer, rgba(212,212,232,0.15)), transparent 70%)', opacity:0.12, pointerEvents:'none' }} />

      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:2, height:14, background:`linear-gradient(to bottom,var(--accent-prayer,rgba(212,212,232,0.5)),transparent)`, borderRadius:2 }} />
          <span style={{ color:'var(--accent-prayer, rgba(212,212,232,0.6))', fontSize:9, letterSpacing:'0.26em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', fontWeight:700 }}>
            Daily Reflection
          </span>
        </div>
        <span style={{ color:'var(--text-faint)', fontSize:9, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'0.08em' }}>
          {today}
        </span>
      </div>

      {/* Theme badge */}
      <div style={{ marginBottom:14 }}>
        <span style={{
          display:       'inline-block',
          background:    'var(--badge-bg)',
          border:        '1px solid var(--accent-prayer, rgba(212,212,232,0.2))',
          color:         'var(--accent-prayer, rgba(212,212,232,0.6))',
          fontSize:       8,
          fontWeight:     700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontFamily:    'Helvetica Neue,sans-serif',
          padding:       '3px 9px',
          borderRadius:   99,
          opacity:        0.85,
        }}>
          {reflection.theme}
        </span>
      </div>

      {/* Reflection text */}
      <p style={{
        color:       'var(--text-primary)',
        fontSize:     16,
        fontFamily:  "'EB Garamond', Georgia, serif",
        fontStyle:   'italic',
        lineHeight:   1.75,
        marginBottom: 16,
        letterSpacing:'0.01em',
        opacity:      0.88,
      }}>
        {reflection.text}
      </p>

      {/* Scripture reference */}
      {reflection.scripture && (
        <p style={{
          color:        'var(--accent-prayer, rgba(212,212,232,0.45))',
          fontSize:      10,
          fontFamily:   'Helvetica Neue, sans-serif',
          letterSpacing:'0.14em',
          textTransform:'uppercase',
          fontWeight:    600,
          opacity:       0.7,
        }}>
          — {reflection.scripture}
        </p>
      )}
    </div>
  )
}
