// Daily prayer card — cycles through 30 prayers seeded by calendar day
const PRAYERS = [
  {
    theme: 'Morning',
    scripture: 'Psalm 143:8',
    text: `Lord, before the noise of the day fills my mind, let Your peace fill me first. I do not know what today holds. You do. Guide my steps, guard my words, and remind me — when I forget — that I am not walking this alone. Let my first thought today be of You.`,
  },
  {
    theme: 'Strength',
    scripture: 'Isaiah 40:31',
    text: `Father, I am tired in ways I cannot always explain. Renew me today. Not just physically — renew my resolve, my faith, the quiet conviction that what I am doing matters. When I want to stop, be the reason I continue. I wait on You.`,
  },
  {
    theme: 'Gratitude',
    scripture: '1 Thessalonians 5:18',
    text: `God, I am grateful. For breath. For the people in my life who stay. For small mercies I have taken for granted. Teach me to hold what I have with open hands — generous, present, aware. Not everything will last. Help me love it while it does.`,
  },
  {
    theme: 'Peace',
    scripture: 'Philippians 4:7',
    text: `Lord, quiet the anxious thoughts today. The ones that spiral before I sleep and the ones that meet me before I rise. You have said Your peace surpasses understanding — I am asking for exactly that. Not explanation. Not control. Just peace that doesn't make sense and doesn't need to.`,
  },
  {
    theme: 'Wisdom',
    scripture: 'James 1:5',
    text: `Father, I face decisions today I am not sure I am equipped to make. Give me wisdom — not cleverness, not strategy, but wisdom rooted in what is right and true. Let me be slow to speak, slow to react, and quick to listen for You.`,
  },
  {
    theme: 'Healing',
    scripture: 'Psalm 147:3',
    text: `Lord, You heal what doctors cannot reach and mend what time alone cannot fix. I bring to You what is broken in me today — the grief I've been carrying, the wounds I keep reopening. I am not asking for the absence of pain. I am asking for Your presence inside it.`,
  },
  {
    theme: 'Purpose',
    scripture: 'Jeremiah 29:11',
    text: `God, remind me today that my life is not an accident. That the story You are writing through my days has meaning — even in the chapters I would not have chosen. Use what I have. Use where I am. I am available.`,
  },
  {
    theme: 'Courage',
    scripture: 'Joshua 1:9',
    text: `Father, I need courage today — not the absence of fear, but the willingness to move through it. The conversation I've been avoiding. The step I've been delaying. The truth I need to speak. You go before me. Let me remember that.`,
  },
  {
    theme: 'Humility',
    scripture: 'Micah 6:8',
    text: `Lord, keep my pride in check today. When I am tempted to make things about myself — my image, my recognition, my comfort — redirect me. There is freedom in smallness, in serving without credit, in doing good that no one sees but You.`,
  },
  {
    theme: 'Family',
    scripture: 'Psalm 127:3',
    text: `God, I pray for the people I love most. The ones who know me fully and stay anyway. Protect them. Strengthen what holds us together. Where there is distance — heal it. Where there is hurt — give us both the grace to bridge it. Let my home be a place of peace.`,
  },
  {
    theme: 'Focus',
    scripture: 'Colossians 3:2',
    text: `Father, there is so much competing for my attention today. Help me filter noise from signal, urgent from important. Fix my mind on what is true, what is honorable, what actually matters. Don't let me spend a whole day on things that mean nothing.`,
  },
  {
    theme: 'Forgiveness',
    scripture: 'Ephesians 4:32',
    text: `Lord, is there someone I need to release today? I lay down the grievance I've been rehearsing. Not because they were right. Not because it didn't hurt. But because carrying it costs me more than releasing it. Forgive me as I choose to forgive. Free me.`,
  },
  {
    theme: 'Faith',
    scripture: 'Hebrews 11:1',
    text: `God, grow my faith today. Not the kind that only rises in easy seasons — the kind that holds in the dark, the kind that trusts Your goodness even when I cannot see the outcome. You have been faithful before. You will be again. Help me believe that.`,
  },
  {
    theme: 'Provision',
    scripture: 'Matthew 6:33',
    text: `Father, I bring my needs to You honestly. The financial pressure. The uncertainty I wake up with. You have said You know what I need before I ask. I am asking anyway — not because You forgot, but because I need the act of trusting You with it. Provide in Your way, Your timing.`,
  },
  {
    theme: 'Discipline',
    scripture: 'Proverbs 25:28',
    text: `Lord, help me govern myself today. My words before I speak them. My reactions before they leave me. My time before I waste it. Self-control is a fruit of Your Spirit — I cannot manufacture it. Produce it in me. Let me become someone I am proud to be.`,
  },
  {
    theme: 'Perspective',
    scripture: '2 Corinthians 4:17',
    text: `God, put today in eternal context for me. What feels enormous from the inside of it may look very small from the outside of it. Help me grieve real losses without losing hope. Help me celebrate small wins without losing humility. Give me the long view.`,
  },
  {
    theme: 'Service',
    scripture: 'Mark 10:45',
    text: `Father, who can I serve today? Not in a way that earns recognition — in a way that quietly, genuinely helps. Open my eyes to the person right in front of me who needs something I can give. Let me be useful in someone's day.`,
  },
  {
    theme: 'Anxiety',
    scripture: '1 Peter 5:7',
    text: `Lord, I cast this anxiety on You — not because it isn't real, but because You said to. The what-ifs are loud today. Remind me that You are in every outcome I fear. There is no version of tomorrow that surprises You or falls outside Your reach.`,
  },
  {
    theme: 'Integrity',
    scripture: 'Proverbs 11:3',
    text: `God, make me a person whose private life matches my public one. Who says what they mean. Who keeps commitments even when it costs something. I want my character to be something I've built carefully, not just claimed. Search me. Refine me where I need it.`,
  },
  {
    theme: 'Rest',
    scripture: 'Matthew 11:28',
    text: `Father, I am worn. Not just tired — soul tired. You invite me to come as I am and find rest. I accept. I stop striving for a moment. I let the weight down. Restore what has been depleted. You made rest. You made it good. Let me receive it.`,
  },
  {
    theme: 'Loss',
    scripture: 'Psalm 34:18',
    text: `Lord, You are near to the brokenhearted. I need that nearness today. The grief doesn't leave just because I don't talk about it. I bring it to You — the ache, the absence, the questions without answers. Sit with me in this. That is enough.`,
  },
  {
    theme: 'Work',
    scripture: 'Colossians 3:23',
    text: `God, let me work today as if it matters — because it does. Not for applause or advancement, but out of faithfulness. Let excellence be a form of worship. Where I feel overlooked, remind me You see every effort made in quiet. Nothing is wasted that is done for You.`,
  },
  {
    theme: 'Relationships',
    scripture: 'Romans 12:10',
    text: `Father, I want to be someone who people feel seen by. Who listens more than speaks. Who is present — not performing presence while thinking about something else. Teach me how to love the people in my life with patience, honesty, and care.`,
  },
  {
    theme: 'Dependence',
    scripture: 'John 15:5',
    text: `Lord, I cannot do this on my own. I have tried — it shows. The fruit I want to bear does not grow from effort alone. It grows from You. Keep me close today. Let every good thing in me trace its roots back to Your grace, not my performance.`,
  },
  {
    theme: 'Evening',
    scripture: 'Psalm 4:8',
    text: `God, the day is behind me. Some of it I am proud of. Some of it I'd take back. Cover it all in grace. I do not have to carry tomorrow tonight. Let me sleep in the knowledge that Your mercy is new in the morning and that nothing I did today puts me outside Your reach.`,
  },
  {
    theme: 'Renewal',
    scripture: 'Romans 12:2',
    text: `Father, transform the way I think. There are patterns in my mind — old reactions, reflexive fears, worn assumptions — that I want renewed. Do not conform me to what is comfortable. Conform me to what is true. Change me from the inside.`,
  },
  {
    theme: 'Joy',
    scripture: 'Nehemiah 8:10',
    text: `Lord, where joy has been absent, let it return. Not manufactured cheerfulness — deep, settled joy that is not shaken by circumstances. The kind that runs alongside sorrow without canceling it. Your joy is my strength. Let me know it today.`,
  },
  {
    theme: 'Obedience',
    scripture: '1 Samuel 15:22',
    text: `God, is there something You have asked of me that I have been slow to do? Show me clearly. I want to be someone who moves when You speak — not because I understand the full plan, but because I trust the One giving the instruction. Here I am.`,
  },
  {
    theme: 'Protection',
    scripture: 'Psalm 91:11',
    text: `Father, go before me and behind me today. Guard my mind against what would corrupt it, my heart against what would harden it, my soul against what would diminish it. I am not unaware of the battles that are fought invisibly. Cover me.`,
  },
  {
    theme: 'Surrender',
    scripture: 'Proverbs 3:5–6',
    text: `Lord, I give You my agenda. My timeline. My preferred outcome. I hold them loosely because I know my plans and Your purposes are not always the same — and Yours are better. I surrender control of what I was never meant to carry. Lead me.`,
  },
]

function dayOfYear() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  return Math.floor((now - start) / 86400000)
}

export default function DailyPrayer({ anim = () => ({}), visible }) {
  const prayer = PRAYERS[dayOfYear() % PRAYERS.length]
  const today  = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(200,160,0,0.06) 0%, rgba(212,212,232,0.03) 100%)',
      border:     '1px solid rgba(200,160,0,0.2)',
      borderRadius: 16,
      padding:    '22px 20px 20px',
      position:   'relative',
      overflow:   'hidden',
      ...anim(30),
    }}>
      {/* Subtle gold glow top-right */}
      <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, background:'radial-gradient(circle, rgba(200,160,0,0.12), transparent 70%)', pointerEvents:'none' }} />

      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:2, height:14, background:'linear-gradient(to bottom,rgba(200,160,0,0.9),rgba(200,160,0,0.1))', borderRadius:2, boxShadow:'0 0 8px rgba(200,160,0,0.4)' }} />
          <span style={{ color:'rgba(200,160,0,0.85)', fontSize:9, letterSpacing:'0.26em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', fontWeight:700 }}>
            Daily Prayer
          </span>
        </div>
        <span style={{ color:'rgba(212,212,232,0.22)', fontSize:9, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'0.08em' }}>
          {today}
        </span>
      </div>

      {/* Theme badge */}
      <div style={{ marginBottom:14 }}>
        <span style={{
          display:       'inline-block',
          background:    'rgba(200,160,0,0.1)',
          border:        '1px solid rgba(200,160,0,0.25)',
          color:         'rgba(200,160,0,0.75)',
          fontSize:       8,
          fontWeight:     700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontFamily:    'Helvetica Neue,sans-serif',
          padding:       '3px 9px',
          borderRadius:   99,
        }}>
          {prayer.theme}
        </span>
      </div>

      {/* Prayer text */}
      <p style={{
        color:       'rgba(212,212,232,0.82)',
        fontSize:     16,
        fontFamily:  "'EB Garamond', Georgia, serif",
        fontStyle:   'italic',
        lineHeight:   1.75,
        marginBottom: 16,
        letterSpacing:'0.01em',
      }}>
        {prayer.text}
      </p>

      {/* Scripture reference */}
      {prayer.scripture && (
        <p style={{
          color:        'rgba(200,160,0,0.45)',
          fontSize:      10,
          fontFamily:   'Helvetica Neue, sans-serif',
          letterSpacing:'0.14em',
          textTransform:'uppercase',
          fontWeight:    600,
        }}>
          — {prayer.scripture}
        </p>
      )}
    </div>
  )
}
