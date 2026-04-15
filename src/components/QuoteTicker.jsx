import { useState, useEffect } from 'react'

const QUOTES = [
  { text: 'The obstacle is the way.',                                        author: 'Marcus Aurelius'   },
  { text: 'I can do all things through Christ who strengthens me.',          author: 'Philippians 4:13'  },
  { text: 'Discipline is choosing what you want most over what you want now.', author: 'Abraham Lincoln' },
  { text: 'The body achieves what the mind believes.',                       author: 'Anonymous'         },
  { text: 'Be still and know that I am God.',                                author: 'Psalm 46:10'       },
  { text: 'Strength does not come from the body. It comes from the will.',   author: 'Gandhi'            },
  { text: 'Waste no more time arguing what a good man should be. Be one.',   author: 'Marcus Aurelius'   },
  { text: 'The Lord is my strength and my shield.',                          author: 'Psalm 28:7'        },
  { text: 'Hard work beats talent when talent does not work hard.',          author: 'Tim Notke'         },
  { text: 'Do not pray for an easy life. Pray for strength to endure.',      author: 'Bruce Lee'         },
  { text: 'Every morning we are born again. What we do today is what matters most.', author: 'Buddha'   },
  { text: 'You are braver than you believe and stronger than you seem.',     author: 'A.A. Milne'        },
  { text: 'Rest when you are done. Not when you are tired.',                 author: 'Anonymous'         },
  { text: 'He who has a why to live can bear almost any how.',               author: 'Nietzsche'         },
  { text: 'Success is not final. Failure is not fatal. It is the courage to continue that counts.', author: 'Churchill' },
  { text: 'Your body can stand almost anything. It is your mind you have to convince.', author: 'Anonymous' },
  { text: 'No pain, no palm. No thorns, no throne.',                        author: 'William Penn'      },
  { text: 'I am worthy of the work.',                                        author: 'AXIOS'             },
]

const INTERVAL = 7000   // ms per quote
const FADE_MS  = 600    // fade transition duration

export default function QuoteTicker() {
  const [index,   setIndex]   = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      // Fade out, swap quote, fade in
      setVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % QUOTES.length)
        setVisible(true)
      }, FADE_MS)
    }, INTERVAL)
    return () => clearInterval(id)
  }, [])

  const { text, author } = QUOTES[index]

  return (
    <div style={{
      overflow:             'hidden',
      borderBottom:         '1px solid var(--border)',
      background:           'rgba(0,0,0,0.55)',
      backdropFilter:       'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      height:               34,
      display:              'flex',
      alignItems:           'center',
      justifyContent:       'center',
      padding:              '0 20px',
      position:             'relative',
      zIndex:               49,
    }}>
      <style>{`
        @keyframes qt-slide-in {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>

      {/* Left accent line */}
      <div style={{
        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
        width: 2, height: 14, borderRadius: 2,
        background: 'linear-gradient(to bottom, rgba(212,212,232,0.5), transparent)',
      }} />

      {/* Quote text */}
      <p
        key={index}
        style={{
          opacity:    visible ? 1 : 0,
          transform:  visible ? 'translateY(0)' : 'translateY(-4px)',
          transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`,
          color:      'rgba(212,212,232,0.62)',
          fontSize:   10,
          fontFamily: "'EB Garamond', Georgia, serif",
          fontStyle:  'italic',
          letterSpacing: '0.03em',
          lineHeight: 1,
          whiteSpace: 'nowrap',
          overflow:   'hidden',
          textOverflow: 'ellipsis',
          maxWidth:   '100%',
          textAlign:  'center',
        }}
      >
        "{text}"
        <span style={{
          fontStyle:     'normal',
          fontFamily:    'Helvetica Neue, sans-serif',
          fontSize:      8,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color:         'rgba(212,212,232,0.28)',
          marginLeft:    10,
        }}>
          — {author}
        </span>
      </p>

      {/* Right accent line */}
      <div style={{
        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
        width: 2, height: 14, borderRadius: 2,
        background: 'linear-gradient(to bottom, rgba(212,212,232,0.5), transparent)',
      }} />
    </div>
  )
}
