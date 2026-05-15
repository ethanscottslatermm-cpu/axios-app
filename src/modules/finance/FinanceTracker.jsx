import treasuryHeroImg from '../fitness/Images/Treasury.png'
const FINANCE_IMG = treasuryHeroImg

import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import financeIconSrc from '../../finance-icon.png'
import { usePlaidLink } from 'react-plaid-link'
import { useAuth } from '../../context/AuthContext'
import { getLinkToken, exchangeToken, fetchBalances, fetchTransactions } from '../../lib/plaidClient'
import { getQuote, getMarketNews, getCryptoNews, searchSymbol } from '../../lib/finnhub'
import { BottomNav } from '../../pages/Dashboard'
import BillsTab from './BillsTab'
import { useWatchlist } from '../../hooks/useWatchlist'
import { useMacro } from '../../hooks/useMacro'
import { useHaptic } from '../../hooks/useHaptic'


// ── Helpers ────────────────────────────────────────────────────────────────────
import LineChart from '../../components/LineChart'
function fmt(n)    { return n == null ? '—' : Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
function fmtPct(n) { return n == null ? '—' : `${n > 0 ? '+' : ''}${Number(n).toFixed(2)}%` }
function timeAgo(ts) {
  const diff = Math.floor((Date.now() / 1000) - ts)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`
  if (diff < 86400)return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

const Ico = {
  up:     () => <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 15l-6-6-6 6"/></svg>,
  down:   () => <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>,
  search: () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  plus:   () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  x:      () => <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  refresh:() => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
}

function SectionHead({ title, sub }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
      <p style={{ color:'var(--text-primary)', fontSize:12, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif' }}>{title}</p>
      {sub && <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{sub}</p>}
    </div>
  )
}

function QuoteCard({ symbol, onRemove, canRemove, onClick }) {
  const [quote,   setQuote]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true); setError(false)
    getQuote(symbol)
      .then(d => { if (!cancelled) { setQuote(d); setLoading(false) } })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false) } })
    return () => { cancelled = true }
  }, [symbol])

  const change  = quote ? quote.c - quote.pc : null
  const pct     = quote ? ((change / quote.pc) * 100) : null
  const up      = change >= 0
  const color   = error ? 'var(--text-muted)' : up ? '#86efac' : '#fca5a5'

  return (
    <div onClick={onClick} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:12, cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        {canRemove && (
          <button onClick={e => { e.stopPropagation(); onRemove(symbol) }} style={{ background:'none', border:'none', color:'var(--text-faint)', cursor:'pointer', padding:0, display:'flex', alignItems:'center' }}>
            {Ico.x()}
          </button>
        )}
        <div>
          <p style={{ color:'var(--text-primary)', fontSize:14, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif' }}>{symbol}</p>
          {loading && <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>Loading…</p>}
          {error   && <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>Unavailable</p>}
          {quote && !loading && (
            <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>
              H {fmt(quote.h)} · L {fmt(quote.l)}
            </p>
          )}
        </div>
      </div>

      {quote && !loading && (
        <div style={{ textAlign:'right' }}>
          <p style={{ color:'var(--text-primary)', fontSize:18, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.02em' }}>${fmt(quote.c)}</p>
          <div style={{ display:'flex', alignItems:'center', gap:4, justifyContent:'flex-end', color }}>
            {up ? Ico.up() : Ico.down()}
            <p style={{ fontSize:12, fontFamily:'Helvetica Neue,sans-serif', fontWeight:600 }}>{fmtPct(pct)}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function IndexCard({ label, symbol, onClick }) {
  const [quote,   setQuote]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getQuote(symbol).then(d => { setQuote(d); setLoading(false) }).catch(() => setLoading(false))
  }, [symbol])

  const change = quote ? quote.c - quote.pc : null
  const pct    = quote ? ((change / quote.pc) * 100) : null
  const up     = change >= 0

  return (
    <div onClick={onClick} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:12, padding:'14px 12px', textAlign:'center', cursor: onClick ? 'pointer' : 'default' }}>
      <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:6 }}>{label}</p>
      {loading ? (
        <p style={{ color:'var(--text-faint)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif' }}>—</p>
      ) : (
        <>
          <p style={{ color:'var(--text-primary)', fontSize:16, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.02em' }}>${fmt(quote?.c)}</p>
          <p style={{ color: up ? '#86efac' : '#fca5a5', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', fontWeight:600, marginTop:2 }}>{fmtPct(pct)}</p>
        </>
      )}
    </div>
  )
}

// ── Crypto symbol map ────────────────────────────────────────────────────────
const CRYPTO_MAP = {
  BTC:  'BINANCE:BTCUSDT',
  ETH:  'BINANCE:ETHUSDT',
  XRP:  'BINANCE:XRPUSDT',
  SOL:  'BINANCE:SOLUSDT',
  BNB:  'BINANCE:BNBUSDT',
  DOGE: 'BINANCE:DOGEUSDT',
  ADA:  'BINANCE:ADAUSDT',
  AVAX: 'BINANCE:AVAXUSDT',
  LINK: 'BINANCE:LINKUSDT',
  DOT:  'BINANCE:DOTUSDT',
  MATIC:'BINANCE:MATICUSDT',
  LTC:  'BINANCE:LTCUSDT',
}
const ROTATION_COINS = ['SOL','BNB','DOGE','ADA','AVAX','LINK','DOT','MATIC']

function fmtCrypto(n) {
  if (n == null) return '—'
  if (n >= 1000) return n.toLocaleString('en-US', { minimumFractionDigits:0, maximumFractionDigits:0 })
  if (n >= 1)    return n.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 })
  return n.toLocaleString('en-US', { minimumFractionDigits:4, maximumFractionDigits:6 })
}

function CryptoTopCard({ coin, fhSymbol, badge, onClick }) {
  const [quote,   setQuote]   = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    getQuote(fhSymbol).then(d => { setQuote(d); setLoading(false) }).catch(() => setLoading(false))
  }, [fhSymbol])
  const change = quote ? quote.c - quote.pc : null
  const pct    = quote ? ((change / quote.pc) * 100) : null
  const up     = change >= 0
  return (
    <div onClick={onClick} style={{ background:'var(--bg-card)', border:`1px solid ${badge === 'hot' ? 'rgba(251,146,60,0.35)' : 'var(--border)'}`, boxShadow:'var(--card-shadow)', borderRadius:14, padding:'14px 12px', textAlign:'center', position:'relative', overflow:'hidden', cursor: onClick ? 'pointer' : 'default' }}>
      {badge === 'hot' && (
        <span style={{ position:'absolute', top:6, right:8, fontSize:7, fontWeight:800, letterSpacing:'0.18em', color:'#fb923c', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif' }}>TOP</span>
      )}
      <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:6 }}>{coin}</p>
      {loading ? (
        <p style={{ color:'var(--text-faint)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif' }}>—</p>
      ) : (
        <>
          <p style={{ color:'var(--text-primary)', fontSize:15, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.01em' }}>${fmtCrypto(quote?.c)}</p>
          <p style={{ color: up ? '#86efac' : '#fca5a5', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', fontWeight:600, marginTop:3 }}>{fmtPct(pct)}</p>
        </>
      )}
    </div>
  )
}

function CryptoWatchCard({ coin, onRemove, onClick }) {
  const fhSym = CRYPTO_MAP[coin]
  const [quote,   setQuote]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)
  useEffect(() => {
    if (!fhSym) { setError(true); setLoading(false); return }
    let cancelled = false
    setLoading(true); setError(false)
    getQuote(fhSym)
      .then(d => { if (!cancelled) { setQuote(d); setLoading(false) } })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false) } })
    return () => { cancelled = true }
  }, [fhSym])
  const change = quote ? quote.c - quote.pc : null
  const pct    = quote ? ((change / quote.pc) * 100) : null
  const up     = change >= 0
  const color  = error ? 'var(--text-muted)' : up ? '#86efac' : '#fca5a5'
  return (
    <div onClick={onClick} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:12, cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={e => { e.stopPropagation(); onRemove(coin) }} style={{ background:'none', border:'none', color:'var(--text-faint)', cursor:'pointer', padding:0, display:'flex', alignItems:'center' }}>{Ico.x()}</button>
        <div>
          <p style={{ color:'var(--text-primary)', fontSize:14, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif' }}>{coin}</p>
          {loading && <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>Loading…</p>}
          {error   && <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{fhSym ? 'Unavailable' : 'Unknown symbol'}</p>}
          {quote && !loading && (
            <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>H ${fmtCrypto(quote.h)} · L ${fmtCrypto(quote.l)}</p>
          )}
        </div>
      </div>
      {quote && !loading && (
        <div style={{ textAlign:'right' }}>
          <p style={{ color:'var(--text-primary)', fontSize:18, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.02em' }}>${fmtCrypto(quote.c)}</p>
          <div style={{ display:'flex', alignItems:'center', gap:4, justifyContent:'flex-end', color }}>
            {up ? Ico.up() : Ico.down()}
            <p style={{ fontSize:12, fontFamily:'Helvetica Neue,sans-serif', fontWeight:600 }}>{fmtPct(pct)}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function fmtVol(n) {
  if (!n) return '—'
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return String(n)
}

const RANGES = [
  { key: '1d',  label: '1D', desc: 'Today'    },
  { key: '5d',  label: '1W', desc: '1 Week'   },
  { key: '1mo', label: '1M', desc: '1 Month'  },
  { key: '3mo', label: '3M', desc: '3 Months' },
  { key: '6mo', label: '6M', desc: '6 Months' },
  { key: '1y',  label: '1Y', desc: '1 Year'   },
]

// Yahoo Finance symbols for crypto (Finnhub uses BINANCE:X format)
const CRYPTO_YAHOO = {
  BTC:'BTC-USD', ETH:'ETH-USD', XRP:'XRP-USD', SOL:'SOL-USD',
  BNB:'BNB-USD', DOGE:'DOGE-USD', ADA:'ADA-USD', AVAX:'AVAX-USD',
  LINK:'LINK-USD', DOT:'DOT-USD', MATIC:'MATIC-USD', LTC:'LTC-USD',
}

function fmtHistLabel(ts, range) {
  const d = new Date(ts * 1000)
  if (range === '1d')  return d.toLocaleTimeString('en-US', { hour:'numeric', hour12:true })
  if (range === '5d')  return d.toLocaleDateString('en-US', { weekday:'short' })
  if (range === '1mo') return d.toLocaleDateString('en-US', { month:'short', day:'numeric' })
  if (range === '3mo') return d.toLocaleDateString('en-US', { month:'short', day:'numeric' })
  return d.toLocaleDateString('en-US', { month:'short', day:'numeric' })
}

// ── Stock Detail Sheet ─────────────────────────────────────────────────────────
function StockDetailSheet({ symbol, displaySymbol, onClose }) {
  const [range,   setRange]   = useState('1mo')
  const [hist,    setHist]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => { setTimeout(() => setVisible(true), 20) }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true); setError(false); setHist(null)
    fetch(`/api/history?symbol=${encodeURIComponent(symbol)}&range=${range}`)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json() })
      .then(d => { if (!cancelled) { setHist(d); setLoading(false) } })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false) } })
    return () => { cancelled = true }
  }, [symbol, range])

  const rawPoints = hist?.points || []
  // Reduce density: max ~60 points on screen
  const step = rawPoints.length > 60 ? Math.ceil(rawPoints.length / 60) : 1
  const chartData = rawPoints
    .filter((_, i) => i % step === 0 || i === rawPoints.length - 1)
    .map(p => ({ label: fmtHistLabel(p.ts, range), value: p.close }))

  const firstClose = rawPoints[0]?.close
  const lastClose  = rawPoints[rawPoints.length - 1]?.close
  const rangeChange = firstClose && lastClose ? lastClose - firstClose : null
  const rangePct    = firstClose && rangeChange != null ? (rangeChange / firstClose) * 100 : null
  const up    = (rangeChange ?? 0) >= 0
  const color = up ? '#86efac' : '#fca5a5'

  const close = () => { setVisible(false); setTimeout(onClose, 320) }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) close() }}
      style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(0,0,0,0.72)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)', display:'flex', alignItems:'flex-end' }}
    >
      <div style={{
        width:'100%', maxWidth:520, margin:'0 auto',
        background:'var(--bg-primary)', borderTop:'1px solid var(--border)', borderRadius:'20px 20px 0 0',
        padding:'0 0 max(28px,env(safe-area-inset-bottom))', maxHeight:'90vh', overflowY:'auto',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition:'transform 0.32s cubic-bezier(.16,1,.3,1)',
      }}>
        {/* Drag handle */}
        <div style={{ padding:'14px 0 0', display:'flex', justifyContent:'center' }}>
          <div style={{ width:36, height:4, borderRadius:99, background:'rgba(212,212,232,0.15)' }} />
        </div>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px 0' }}>
          <div>
            <p style={{ color:'var(--text-primary)', fontSize:20, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.02em' }}>{displaySymbol}</p>
            {hist?.displayName && hist.displayName !== displaySymbol && (
              <p style={{ color:'var(--text-muted)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', marginTop:2 }}>{hist.displayName}</p>
            )}
          </div>
          <button onClick={close} style={{ background:'var(--stat-bg)', border:'1px solid var(--border)', borderRadius:99, padding:'7px 9px', cursor:'pointer', color:'var(--text-muted)', display:'flex' }}>{Ico.x(15)}</button>
        </div>

        {/* Price block */}
        <div style={{ padding:'16px 18px 10px' }}>
          {hist ? (
            <>
              <p style={{ color:'var(--text-primary)', fontSize:36, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.03em', lineHeight:1 }}>
                ${fmt(hist.regularMarketPrice)}
              </p>
              {rangeChange != null && (
                <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:6 }}>
                  <p style={{ color, fontSize:14, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif' }}>
                    {rangeChange >= 0 ? '+' : ''}{fmt(rangeChange)} ({rangePct >= 0 ? '+' : ''}{rangePct?.toFixed(2)}%)
                  </p>
                  <span style={{ color:'var(--text-faint)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>
                    {RANGES.find(r => r.key === range)?.desc}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div style={{ height:52 }} />
          )}
        </div>

        {/* Range tabs */}
        <div style={{ display:'flex', gap:6, padding:'0 18px 14px', overflowX:'auto' }}>
          {RANGES.map(r => {
            const active = r.key === range
            return (
              <button key={r.key} onClick={() => setRange(r.key)} style={{
                flexShrink:0, padding:'6px 15px', borderRadius:8,
                border:`1px solid ${active ? color : 'var(--border)'}`,
                background: active ? `${color}1a` : 'transparent',
                color: active ? color : 'var(--text-muted)',
                fontSize:12, fontWeight: active ? 700 : 400,
                fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer', transition:'all 0.15s',
              }}>{r.label}</button>
            )
          })}
        </div>

        {/* Chart */}
        <div style={{ padding:'0 12px 20px' }}>
          {loading ? (
            <div style={{ height:160, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <p style={{ color:'var(--text-faint)', fontFamily:'Helvetica Neue,sans-serif', fontSize:12 }}>Loading…</p>
            </div>
          ) : error ? (
            <div style={{ height:160, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <p style={{ color:'var(--text-faint)', fontFamily:'Helvetica Neue,sans-serif', fontSize:12, fontStyle:'italic' }}>Chart data unavailable</p>
            </div>
          ) : (
            <LineChart data={chartData} height={160} color={color} showDots={chartData.length <= 25} showLabels={true} fillOpacity={0.14} />
          )}
        </div>

        {/* Stats grid */}
        {hist && (
          <div style={{ padding:'0 18px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
              {[
                { label:'Prev Close', val: hist.previousClose      != null ? '$' + fmt(hist.previousClose)           : '—' },
                { label:'Day High',   val: hist.regularMarketDayHigh != null ? '$' + fmt(hist.regularMarketDayHigh)   : '—' },
                { label:'Day Low',    val: hist.regularMarketDayLow  != null ? '$' + fmt(hist.regularMarketDayLow)    : '—' },
                { label:'Volume',     val: fmtVol(hist.regularMarketVolume) },
              ].map(({ label, val }) => (
                <div key={label} style={{ background:'var(--stat-bg)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 12px' }}>
                  <p style={{ color:'var(--text-faint)', fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:4 }}>{label}</p>
                  <p style={{ color:'var(--text-primary)', fontSize:14, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif' }}>{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sentiment helpers ──────────────────────────────────────────────────────────
const POS_WORDS = ['surge','jump','beat','profit','gain','rise','rally','soar','record','upgrade','strong','boost','bullish','growth','recovery','high','positive','exceed','outperform']
const NEG_WORDS = ['fall','drop','miss','loss','decline','plunge','crash','warn','downgrade','recession','weak','bearish','slump','fear','concern','risk','low','negative','disappoint','layoff']

function getSentiment(headline, summary = '') {
  const text = (headline + ' ' + summary).toLowerCase()
  const pos = POS_WORDS.filter(w => text.includes(w)).length
  const neg = NEG_WORDS.filter(w => text.includes(w)).length
  if (pos > neg) return 'positive'
  if (neg > pos) return 'negative'
  return 'neutral'
}

function NewsCard({ item, watchlist = [] }) {
  const [expanded, setExpanded] = useState(false)
  const sentiment = getSentiment(item.headline, item.summary)
  const related   = item.related || ''
  const isRelevant = watchlist.some(s => s === related || (item.headline || '').toUpperCase().includes(s))
  const tldr       = item.summary?.trim()
  const shortTldr  = tldr?.slice(0, 130)
  const needsMore  = tldr?.length > 130

  const sentimentCfg = {
    positive: { dot: '🟢', label: 'Positive', color: '#86efac' },
    negative: { dot: '🔴', label: 'Negative', color: '#fca5a5' },
    neutral:  { dot: '⚪', label: 'Neutral',  color: 'var(--text-muted)' },
  }[sentiment]

  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderLeft:`2px solid ${sentimentCfg.color}`, boxShadow:'var(--card-shadow)', borderRadius:12, overflow:'hidden', transition:'border-color 0.2s' }}>
      <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ display:'block', textDecoration:'none', padding:'13px 15px 10px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:7, flexWrap:'wrap' }}>
          <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:sentimentCfg.color, fontFamily:'Helvetica Neue,sans-serif' }}>
            {sentimentCfg.dot} {sentimentCfg.label}
          </span>
          {isRelevant && (
            <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#fb923c', fontFamily:'Helvetica Neue,sans-serif', background:'rgba(251,146,60,0.1)', borderRadius:4, padding:'1px 5px' }}>
              📌 Watchlist
            </span>
          )}
          {related && !isRelevant && (
            <span style={{ fontSize:9, color:'var(--text-faint)', fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'0.06em' }}>{related}</span>
          )}
        </div>
        <p style={{ color:'var(--text-primary)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', fontWeight:600, lineHeight:1.4, marginBottom:7 }}>{item.headline}</p>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <p style={{ color:'var(--text-muted)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'0.08em' }}>{item.source}</p>
          <p style={{ color:'var(--text-faint)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif' }}>{timeAgo(item.datetime)}</p>
        </div>
      </a>
      {tldr && (
        <div style={{ borderTop:'1px solid var(--border)', padding:'10px 15px' }}>
          <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1.55, fontStyle:'italic' }}>
            {expanded ? tldr : (shortTldr + (needsMore ? '…' : ''))}
          </p>
          {needsMore && (
            <button
              onClick={e => { e.preventDefault(); setExpanded(v => !v) }}
              style={{ marginTop:5, background:'none', border:'none', color:sentimentCfg.color, fontSize:10, fontFamily:'Helvetica Neue,sans-serif', fontWeight:600, cursor:'pointer', padding:0, letterSpacing:'0.06em', opacity:0.85 }}>
              {expanded ? 'Show less ↑' : 'Why this matters →'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Macro Strip ────────────────────────────────────────────────────────────────
function MacroStrip() {
  const { data, isLoading } = useMacro()

  if (isLoading) return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:20 }}>
      {[0,1,2,3].map(i => <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, height:64 }} />)}
    </div>
  )

  const items = data || []
  return (
    <div style={{ marginBottom:20 }}>
      <SectionHead title="Macro" sub="Economic context" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
        {items.map(item => {
          const val   = item.static ? item.staticVal : (item.price != null ? Number(item.price).toFixed(item.decimals ?? 2) : '—')
          const up    = !item.static && (item.change ?? 0) >= 0
          const color = item.static ? 'var(--text-secondary)' : up ? '#86efac' : '#fca5a5'
          return (
            <div key={item.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:10, padding:'10px 8px', textAlign:'center' }}>
              <p style={{ color:'var(--text-faint)', fontSize:8, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:5 }}>{item.label}</p>
              <p style={{ color, fontSize:12, fontWeight:800, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.01em', lineHeight:1 }}>
                {item.prefix}{val}{item.static ? '' : item.suffix}
              </p>
              {item.static
                ? <p style={{ color:'var(--text-faint)', fontSize:8, fontFamily:'Helvetica Neue,sans-serif', marginTop:3 }}>{item.suffix} target</p>
                : item.pct != null && (
                  <p style={{ color, fontSize:9, fontFamily:'Helvetica Neue,sans-serif', marginTop:3 }}>
                    {item.pct >= 0 ? '▲' : '▼'} {Math.abs(item.pct).toFixed(2)}%
                  </p>
                )
              }
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Daily Briefing ─────────────────────────────────────────────────────────────
function DailyBriefing({ spyQuote, watchlistQuotes }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const today    = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })

  const spyPct  = spyQuote && spyQuote.c && spyQuote.pc ? ((spyQuote.c - spyQuote.pc) / spyQuote.pc) * 100 : null
  const marketLine = spyPct != null
    ? `Markets are ${spyPct >= 0 ? 'up' : 'down'} ${Math.abs(spyPct).toFixed(1)}% today.`
    : 'Market data loading…'

  const topMover = (watchlistQuotes || []).reduce((best, curr) => {
    if (curr.pct == null) return best
    if (!best || Math.abs(curr.pct) > Math.abs(best.pct)) return curr
    return best
  }, null)

  return (
    <div style={{ background:'linear-gradient(135deg,rgba(74,222,128,0.05) 0%,rgba(59,130,246,0.04) 100%)', border:'1px solid rgba(134,239,172,0.18)', borderRadius:14, padding:'15px 16px', marginBottom:20 }}>
      <p style={{ color:'var(--text-faint)', fontSize:9, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:7 }}>{today}</p>
      <p style={{ color:'var(--text-primary)', fontSize:14, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1.45 }}>
        {greeting}. {marketLine}
      </p>
      {topMover && (
        <p style={{ color:'var(--text-muted)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1.4, marginTop:6 }}>
          <span style={{ color: (topMover.pct ?? 0) >= 0 ? '#86efac' : '#fca5a5', fontWeight:700 }}>{topMover.symbol}</span>
          {' '}{(topMover.pct ?? 0) >= 0 ? 'is your top mover' : 'is lagging your watchlist'} at{' '}
          {(topMover.pct ?? 0) >= 0 ? '+' : ''}{(topMover.pct ?? 0).toFixed(2)}%.
        </p>
      )}
    </div>
  )
}

// ── Portfolio Tab ──────────────────────────────────────────────────────────────
function usePortfolioStore() {
  const [positions, setPositions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('axios-portfolio') || '[]') } catch { return [] }
  })
  const save = (updated) => {
    setPositions(updated)
    localStorage.setItem('axios-portfolio', JSON.stringify(updated))
  }
  return {
    positions,
    add:    pos  => save([...positions, { id: Date.now().toString(), ...pos }]),
    remove: id   => save(positions.filter(p => p.id !== id)),
  }
}

function PortfolioPositionCard({ pos, onRemove }) {
  const [quote,   setQuote]   = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    getQuote(pos.symbol).then(d => { setQuote(d); setLoading(false) }).catch(() => setLoading(false))
  }, [pos.symbol])

  const currentPrice = quote?.c
  const marketVal    = currentPrice != null ? currentPrice * pos.shares : null
  const costBasis    = pos.avgCost * pos.shares
  const pnl          = marketVal != null ? marketVal - costBasis : null
  const pnlPct       = pnl != null ? (pnl / costBasis) * 100 : null
  const dayChange    = quote && quote.c && quote.pc ? (quote.c - quote.pc) * pos.shares : null
  const up           = (pnl ?? 0) >= 0

  return (
    <div style={{ background:'var(--bg-card)', border:`1px solid ${up ? 'rgba(134,239,172,0.2)' : 'rgba(252,165,165,0.2)'}`, boxShadow:'var(--card-shadow)', borderRadius:13, padding:'14px 16px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <p style={{ color:'var(--text-primary)', fontSize:15, fontWeight:800, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.01em' }}>{pos.symbol}</p>
            {dayChange != null && (
              <span style={{ fontSize:10, fontWeight:700, color: dayChange >= 0 ? '#86efac' : '#fca5a5', fontFamily:'Helvetica Neue,sans-serif' }}>
                {dayChange >= 0 ? '+' : ''}${Math.abs(dayChange).toFixed(2)} today
              </span>
            )}
          </div>
          <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', marginTop:1 }}>
            {pos.shares} shares · avg ${fmt(pos.avgCost)}
          </p>
        </div>
        <button onClick={() => onRemove(pos.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-faint)', padding:4, display:'flex' }}>{Ico.x()}</button>
      </div>
      {loading ? (
        <p style={{ color:'var(--text-faint)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif' }}>Loading…</p>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginTop:4 }}>
          {[
            { label:'Mkt Value', val: marketVal != null ? '$' + fmt(marketVal) : '—', color:'var(--text-primary)' },
            { label:'P&L',       val: pnl != null ? (pnl >= 0 ? '+$' : '-$') + fmt(Math.abs(pnl)) : '—', color: up ? '#86efac' : '#fca5a5' },
            { label:'Return',    val: pnlPct != null ? (pnlPct >= 0 ? '+' : '') + pnlPct.toFixed(1) + '%' : '—', color: up ? '#86efac' : '#fca5a5' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ textAlign:'center', background:'var(--stat-bg)', borderRadius:8, padding:'8px 4px' }}>
              <p style={{ color:'var(--text-faint)', fontSize:8, letterSpacing:'0.14em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:3 }}>{label}</p>
              <p style={{ color, fontSize:13, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif' }}>{val}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PortfolioTab() {
  const haptic = useHaptic()
  const { positions, add, remove } = usePortfolioStore()
  const [showAdd,  setShowAdd]  = useState(false)
  const [form,     setForm]     = useState({ symbol:'', shares:'', avgCost:'' })
  const [formErr,  setFormErr]  = useState('')

  const handleAdd = () => {
    const symbol  = form.symbol.trim().toUpperCase()
    const shares  = parseFloat(form.shares)
    const avgCost = parseFloat(form.avgCost)
    if (!symbol)           return setFormErr('Symbol required')
    if (!shares  || shares  <= 0) return setFormErr('Enter valid share count')
    if (!avgCost || avgCost <= 0) return setFormErr('Enter valid avg cost')
    haptic.bump?.()
    add({ symbol, shares, avgCost })
    setForm({ symbol:'', shares:'', avgCost:'' }); setFormErr(''); setShowAdd(false)
  }

  // Allocation bars (by cost basis)
  const totalCost = positions.reduce((s, p) => s + p.shares * p.avgCost, 0)

  return (
    <div>
      {positions.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <SectionHead title="Allocation" sub={`${positions.length} positions`} />
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:20 }}>
            {positions.map(p => {
              const pct = totalCost > 0 ? (p.shares * p.avgCost / totalCost) * 100 : 0
              return (
                <div key={p.id}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                    <p style={{ color:'var(--text-secondary)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', fontWeight:600 }}>{p.symbol}</p>
                    <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{pct.toFixed(1)}%</p>
                  </div>
                  <div style={{ width:'100%', height:5, borderRadius:99, background:'rgba(212,212,232,0.07)', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(to right,#86efac,#34d399)', borderRadius:99, transition:'width 0.8s cubic-bezier(.16,1,.3,1)' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <SectionHead title="Positions" sub={positions.length ? `${positions.length} holdings` : 'None yet'} />
      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:12 }}>
        {positions.map(p => (
          <PortfolioPositionCard key={p.id} pos={p} onRemove={remove} />
        ))}
      </div>

      {positions.length === 0 && !showAdd && (
        <div style={{ background:'var(--bg-card)', border:'1px dashed rgba(212,212,232,0.08)', borderRadius:14, padding:'40px 20px', textAlign:'center', marginBottom:12 }}>
          <p style={{ color:'var(--text-muted)', fontSize:14, fontFamily:"'EB Garamond',serif", fontStyle:'italic', lineHeight:1.7, marginBottom:16 }}>
            Track your stocks, see real P&L,<br/>and watch your allocation.
          </p>
        </div>
      )}

      {showAdd ? (
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:13, padding:'16px', marginBottom:12 }}>
          <p style={{ color:'var(--text-primary)', fontSize:13, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif', marginBottom:14 }}>Add Position</p>
          {[
            { key:'symbol',  label:'Ticker',     placeholder:'AAPL', upper:true  },
            { key:'shares',  label:'Shares',     placeholder:'10',   upper:false },
            { key:'avgCost', label:'Avg Cost ($)',placeholder:'182.50',upper:false },
          ].map(({ key, label, placeholder, upper }) => (
            <div key={key} style={{ marginBottom:10 }}>
              <p style={{ color:'var(--text-muted)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:4 }}>{label}</p>
              <input
                type={upper ? 'text' : 'number'}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: upper ? e.target.value.toUpperCase() : e.target.value }))}
                placeholder={placeholder}
                style={{ width:'100%', background:'var(--stat-bg)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 12px', color:'var(--text-primary)', fontSize:14, fontFamily:'Helvetica Neue,sans-serif', outline:'none' }}
              />
            </div>
          ))}
          {formErr && <p style={{ color:'#fca5a5', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', marginBottom:8 }}>{formErr}</p>}
          <div style={{ display:'flex', gap:8, marginTop:4 }}>
            <button onClick={() => { setShowAdd(false); setFormErr('') }} style={{ flex:1, padding:'11px', borderRadius:9, border:'1px solid var(--border)', background:'transparent', color:'var(--text-muted)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer' }}>Cancel</button>
            <button onClick={handleAdd} style={{ flex:2, padding:'11px', borderRadius:9, border:'1px solid rgba(134,239,172,0.4)', background:'rgba(134,239,172,0.1)', color:'#86efac', fontSize:12, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer' }}>Add Position</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} style={{ width:'100%', padding:'12px', borderRadius:12, border:'1px dashed var(--border)', background:'transparent', color:'var(--text-muted)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          {Ico.plus()} Add position
        </button>
      )}
    </div>
  )
}

export default function FinanceTracker() {
  const haptic = useHaptic()
  const [visible,     setVisible]     = useState(false)
  const { watchlist, custom, addSymbol: addSym, removeSymbol: removeSym, DEFAULT_SYMBOLS } = useWatchlist()
  // For DailyBriefing
  const [spyQuote,        setSpyQuote]        = useState(null)
  const [watchlistQuotes, setWatchlistQuotes] = useState([])
  const [news,        setNews]        = useState([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [showSearch,  setShowSearch]  = useState(false)
  const [query,       setQuery]       = useState('')
  const [results,     setResults]     = useState([])
  const [searching,   setSearching]   = useState(false)
  const [lastRefresh, setLastRefresh] = useState(Date.now())
  const [activeTab,   setActiveTab]   = useState('markets') // markets | crypto | portfolio | bank | bills
  const [cryptoWatchlist, setCryptoWatchlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('axios-crypto-watchlist') || '["XRP"]') } catch { return ['XRP'] }
  })
  const [rotatingCoin,    setRotatingCoin]    = useState(null)
  const [cryptoNews,      setCryptoNews]      = useState([])
  const [cryptoNewsLoad,  setCryptoNewsLoad]  = useState(false)
  const [showCryptoAdd,   setShowCryptoAdd]   = useState(false)
  const [cryptoInput,     setCryptoInput]     = useState('')
  const [detailSymbol,    setDetailSymbol]    = useState(null)
  // Bills state
  const [bills,       setBills]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('axios-bills') || '[]') } catch { return [] }
  })
  const [showAddBill, setShowAddBill] = useState(false)
  const [editBill,    setEditBill]    = useState(null)
  const [billForm,    setBillForm]    = useState({ payee:'', amount:'', due_day:'1', frequency:'monthly', category:'other', autopay:false, notes:'' })

  const { user } = useAuth()

  // Bank state
  const [linkToken,   setLinkToken]   = useState(null)
  const [accounts,    setAccounts]    = useState(null)
  const [txns,        setTxns]        = useState(null)
  const [bankLoading, setBankLoading] = useState(false)
  const [bankError,   setBankError]   = useState('')
  const [connected,   setConnected]   = useState(false)

  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t) }, [])

  useEffect(() => {
    setNewsLoading(true)
    getMarketNews().then(d => { setNews(d); setNewsLoading(false) }).catch(() => setNewsLoading(false))
  }, [lastRefresh])

  // Load SPY and watchlist quotes for DailyBriefing
  useEffect(() => {
    if (activeTab !== 'markets') return
    getQuote('SPY').then(setSpyQuote).catch(() => {})
    const syms = watchlist.filter(s => !['DIA','SPY','QQQ'].includes(s)).slice(0, 8)
    Promise.allSettled(syms.map(s => getQuote(s).then(d => ({ symbol: s, pct: d.c && d.pc ? ((d.c - d.pc) / d.pc) * 100 : null }))))
      .then(results => setWatchlistQuotes(results.filter(r => r.status === 'fulfilled').map(r => r.value)))
  }, [activeTab, watchlist, lastRefresh])

  // Load crypto data when crypto tab opens
  useEffect(() => {
    if (activeTab !== 'crypto') return
    // Find best rotating performer
    Promise.allSettled(
      ROTATION_COINS.map(coin =>
        getQuote(CRYPTO_MAP[coin]).then(d => ({ coin, pct: d.c && d.pc ? ((d.c - d.pc) / d.pc) * 100 : -999 }))
      )
    ).then(results => {
      const best = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value)
        .sort((a, b) => b.pct - a.pct)[0]
      if (best) setRotatingCoin(best.coin)
    })
    // Load crypto news
    setCryptoNewsLoad(true)
    getCryptoNews().then(d => { setCryptoNews(d); setCryptoNewsLoad(false) }).catch(() => setCryptoNewsLoad(false))
  }, [activeTab])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      try { setResults(await searchSymbol(query)) }
      finally { setSearching(false) }
    }, 400)
    return () => clearTimeout(t)
  }, [query])

  // Load bank data when bank tab opens
  useEffect(() => {
    if (activeTab !== 'bank' || !user) return
    loadBankData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user])

  const saveBills = (updated) => {
    setBills(updated)
    localStorage.setItem('axios-bills', JSON.stringify(updated))
  }

  const addOrUpdateBill = () => {
    const b = {
      id:        editBill?.id || Date.now().toString(),
      payee:     billForm.payee.trim(),
      amount:    parseFloat(billForm.amount) || 0,
      due_day:   parseInt(billForm.due_day) || 1,
      frequency: billForm.frequency,
      category:  billForm.category,
      autopay:   billForm.autopay,
      notes:     billForm.notes.trim(),
      paid_months: editBill?.paid_months || [],
    }
    if (!b.payee) return
    const updated = editBill
      ? bills.map(x => x.id === editBill.id ? b : x)
      : [...bills, b]
    saveBills(updated)
    setShowAddBill(false); setEditBill(null)
    setBillForm({ payee:'', amount:'', due_day:'1', frequency:'monthly', category:'other', autopay:false, notes:'' })
  }

  const deleteBill = (id) => saveBills(bills.filter(b => b.id !== id))

  const togglePaid = (id) => {
    const key = new Date().toISOString().slice(0,7)
    saveBills(bills.map(b => {
      if (b.id !== id) return b
      const paid = b.paid_months || []
      return { ...b, paid_months: paid.includes(key) ? paid.filter(m => m !== key) : [...paid, key] }
    }))
  }

  const getBillStatus = (bill) => {
    const key = new Date().toISOString().slice(0,7)
    if ((bill.paid_months || []).includes(key)) return 'paid'
    const today = new Date().getDate()
    const diff  = bill.due_day - today
    if (diff < 0)  return 'overdue'
    if (diff <= 5) return 'due-soon'
    return 'upcoming'
  }

  const openEditBill = (bill) => {
    setEditBill(bill)
    setBillForm({ payee:bill.payee, amount:String(bill.amount), due_day:String(bill.due_day), frequency:bill.frequency, category:bill.category, autopay:bill.autopay, notes:bill.notes })
    setShowAddBill(true)
  }

  const BILL_CATS = { rent:'Rent/Mortgage', utilities:'Utilities', insurance:'Insurance', subscriptions:'Subscriptions', loans:'Loans', phone:'Phone', internet:'Internet', other:'Other' }
  const BILL_STATUS_COLOR = { paid:'#4ade80', 'due-soon':'#facc15', overdue:'#f87171', upcoming:'var(--text-muted)' }
  const BILL_STATUS_LABEL = { paid:'Paid', 'due-soon':'Due Soon', overdue:'Overdue', upcoming:'Upcoming' }

  const loadBankData = async () => {
    setBankLoading(true); setBankError('')
    try {
      const [bal, tx] = await Promise.all([fetchBalances(user.id), fetchTransactions(user.id)])
      setAccounts(bal.accounts); setTxns(tx.transactions); setConnected(true)
    } catch (err) {
      if (err.message.includes('No bank connected')) {
        setConnected(false)
        try { const { link_token } = await getLinkToken(user.id); setLinkToken(link_token) } catch {}
      } else { setBankError(err.message) }
    } finally { setBankLoading(false) }
  }

  const onPlaidSuccess = useCallback(async (publicToken, metadata) => {
    setBankLoading(true); setBankError('')
    try {
      await exchangeToken(user.id, publicToken, metadata.institution?.name)
      await loadBankData()
    } catch (err) {
      setBankError('Connection failed: ' + err.message)
      setBankLoading(false)
    }
  }, [user])

  const { open: openPlaid, ready: plaidReady } = usePlaidLink({ token: linkToken, onSuccess: onPlaidSuccess })

  const addSymbol = (symbol) => {
    addSym.mutate(symbol)
    setShowSearch(false); setQuery(''); setResults([])
  }

  const removeSymbol = (symbol) => {
    removeSym.mutate(symbol)
  }

  const refresh = () => setLastRefresh(Date.now())

  const anim = (d=0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(12px)',
    transition: `opacity 0.5s ease ${d}ms, transform 0.5s ease ${d}ms`,
  })

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-primary)', WebkitFontSmoothing:'antialiased', position:'relative' }}>
      <div style={{ position:'fixed', inset:0, zIndex:0, backgroundImage:'url(' + FINANCE_IMG + ')', backgroundSize:'cover', backgroundPosition:'center 20%', opacity:0.08, filter:'grayscale(100%) contrast(1.3) brightness(1.1)', backgroundRepeat:'no-repeat', pointerEvents:'none' }} />
      <div style={{ position:'fixed', inset:0, zIndex:0, background:'linear-gradient(to bottom, rgba(8,8,8,0.6) 0%, rgba(8,8,8,0.25) 40%, rgba(8,8,8,0.92) 100%)', pointerEvents:'none' }} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital@1&display=swap');
        * { box-sizing: border-box; }
        .ax-tab-fin:hover { background: var(--bg-card-hover) !important; }
        .ax-sym-result:hover { background: var(--bg-card-hover) !important; }
      `}</style>

      {/* ── Sticky Header ── */}
      <div style={{ position:'sticky', top:0, zIndex:50, background:'var(--header-bg)', backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)', borderBottom:'1px solid var(--border)', padding:'14px 16px' }}>
        <div style={{ maxWidth:480, margin:'0 auto' }}>
          {/* Title row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <h1 style={{ color:'#86efac', fontSize:18, fontWeight:400, fontFamily:"'The Seasons', serif", letterSpacing:'0.08em', textTransform:'uppercase', whiteSpace:'nowrap' }}>Treasury</h1>
                <img src={financeIconSrc} width={22} height={22} style={{ filter:'brightness(0) invert(1)', objectFit:'contain', opacity:0.72, display:'block' }} alt="" />
              </div>
              <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:"'EB Garamond',serif", fontStyle:'italic', marginTop:2 }}>Live market data</p>
            </div>
            <button onClick={refresh} style={{ background:'var(--stat-bg)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:10, padding:'8px 12px', color:'var(--text-secondary)', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>
              {Ico.refresh()} Refresh
            </button>
          </div>
          {/* Tabs */}
          <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:1 }}>
            {[['markets','Stocks'],['crypto','Crypto'],['portfolio','Portfolio'],['bank','Bank'],['bills','Bills']].map(([key, label]) => (
              <button key={key} className="ax-tab-fin" onClick={() => { haptic.tap?.(); setActiveTab(key) }} style={{
                flexShrink:0, padding:'9px 12px', borderRadius:10, border:`1px solid ${activeTab===key ? 'rgba(134,239,172,0.45)' : 'var(--border)'}`,
                background: activeTab===key ? 'rgba(134,239,172,0.1)' : 'transparent',
                color: activeTab===key ? '#86efac' : 'var(--text-muted)',
                fontSize:11, fontWeight: activeTab===key ? 700 : 400,
                fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer',
                letterSpacing:'0.08em', textTransform:'uppercase', transition:'all 0.18s',
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding:'16px 16px 120px', maxWidth:480, margin:'0 auto', position:'relative', zIndex:1 }}>

        {/* Markets Tab */}
        {activeTab === 'markets' && (
          <div style={anim(80)}>

            {/* Daily Briefing */}
            <DailyBriefing spyQuote={spyQuote} watchlistQuotes={watchlistQuotes} />

            {/* Macro Strip */}
            <MacroStrip />

            {/* Index Overview */}
            <div style={{ marginBottom:24 }}>
              <SectionHead title="Indices" sub="ETF proxies" />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                <IndexCard label="DOW"     symbol="DIA" onClick={() => setDetailSymbol({ symbol: 'DIA', display: 'DOW' })} />
                <IndexCard label="S&P 500" symbol="SPY" onClick={() => setDetailSymbol({ symbol: 'SPY', display: 'S&P 500' })} />
                <IndexCard label="NASDAQ"  symbol="QQQ" onClick={() => setDetailSymbol({ symbol: 'QQQ', display: 'NASDAQ' })} />
              </div>
            </div>

            {/* Watchlist */}
            <div style={{ marginBottom:20 }}>
              <SectionHead title="Watchlist" sub={`${custom.length} stocks`} />
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {watchlist.filter(s => !['DIA','SPY','QQQ'].includes(s)).map(s => (
                  <QuoteCard key={s} symbol={s} onRemove={removeSymbol} canRemove={!DEFAULT_SYMBOLS.includes(s)} onClick={() => setDetailSymbol({ symbol: s, display: s })} />
                ))}
              </div>
            </div>

            {/* Add symbol */}
            {showSearch ? (
              <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:12, padding:16, marginBottom:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                  <div style={{ color:'var(--text-muted)' }}>{Ico.search()}</div>
                  <input
                    autoFocus
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search symbol or company…"
                    style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'var(--text-primary)', fontSize:14, fontFamily:'Helvetica Neue,sans-serif', caretColor:'var(--text-primary)' }}
                  />
                  <button onClick={() => { setShowSearch(false); setQuery(''); setResults([]) }} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}>{Ico.x()}</button>
                </div>
                {searching && <p style={{ color:'var(--text-muted)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif' }}>Searching…</p>}
                {results.map(r => (
                  <button key={r.symbol} className="ax-sym-result" onClick={() => addSymbol(r.symbol)} style={{
                    width:'100%', background:'transparent', border:'none', borderTop:'1px solid var(--border)',
                    padding:'10px 0', textAlign:'left', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center',
                  }}>
                    <div>
                      <p style={{ color:'var(--text-primary)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', fontWeight:600 }}>{r.symbol}</p>
                      <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{r.description}</p>
                    </div>
                    <div style={{ color:'var(--text-muted)' }}>{Ico.plus()}</div>
                  </button>
                ))}
              </div>
            ) : (
              <button onClick={() => setShowSearch(true)} style={{
                width:'100%', padding:'12px', borderRadius:12, border:'1px dashed var(--border)',
                background:'transparent', color:'var(--text-muted)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif',
                cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              }}>
                {Ico.plus()} Add symbol
              </button>
            )}

            {/* Market News */}
            <div style={{ marginTop:8 }}>
              <SectionHead title="Market News" sub={`${news.length} stories`} />
              {newsLoading ? (
                <p style={{ color:'var(--text-muted)', fontSize:13, fontFamily:"'EB Garamond',serif", fontStyle:'italic', textAlign:'center', padding:'32px 0' }}>Loading news…</p>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {news.map((item, i) => <NewsCard key={i} item={item} watchlist={watchlist} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bank Tab */}
        {activeTab === 'bank' && (
          <div style={{ ...anim(0) }}>
            {bankLoading && (
              <div style={{ textAlign:'center', padding:'48px 0' }}>
                <p style={{ color:'var(--text-muted)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'0.12em' }}>Loading…</p>
              </div>
            )}
            {bankError && !bankLoading && (
              <div style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.25)', borderRadius:12, padding:'14px 16px', marginBottom:16 }}>
                <p style={{ color:'#f87171', fontSize:13, fontFamily:'Helvetica Neue,sans-serif' }}>{bankError}</p>
                <button onClick={loadBankData} style={{ marginTop:10, padding:'8px 14px', borderRadius:8, border:'1px solid rgba(248,113,113,0.3)', background:'transparent', color:'#f87171', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer' }}>Retry</button>
              </div>
            )}
            {!connected && !bankLoading && !bankError && (
              <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:16, padding:'32px 24px', textAlign:'center' }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--stat-bg)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                  <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ color:'var(--glow-bar)' }}>
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/><path d="M22 7V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2"/>
                  </svg>
                </div>
                <h3 style={{ color:'var(--text-primary)', fontSize:17, fontWeight:800, fontFamily:'Helvetica Neue,sans-serif', marginBottom:8 }}>Connect Your Bank</h3>
                <p style={{ color:'var(--text-muted)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1.55, maxWidth:220, margin:'0 auto 24px' }}>
                  Securely link your accounts to view live balances and recent transactions.
                </p>
                <button onClick={() => openPlaid()} disabled={!plaidReady}
                  style={{ padding:'14px 28px', borderRadius:12, border:'1px solid var(--border)', background:'var(--btn-bg)', color:'var(--btn-text)', fontSize:13, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif', cursor: plaidReady ? 'pointer' : 'not-allowed', opacity: plaidReady ? 1 : 0.5, boxShadow:'var(--card-shadow)' }}>
                  Connect Bank
                </button>
              </div>
            )}
            {connected && accounts && !bankLoading && (
              <>
                <div style={{ marginBottom:20 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                    <p style={{ color:'var(--text-muted)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif' }}>Accounts</p>
                    <button onClick={loadBankData} style={{ background:'transparent', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>Refresh</button>
                  </div>
                  {accounts.map(acc => (
                    <div key={acc.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:14, padding:'16px', marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <p style={{ color:'var(--text-primary)', fontSize:14, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif', marginBottom:3 }}>{acc.name}</p>
                        <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', textTransform:'capitalize' }}>{acc.institution} · {acc.subtype}</p>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <p style={{ color:'var(--text-primary)', fontSize:18, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif' }}>
                          {acc.balance != null ? '$' + acc.balance.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 }) : '—'}
                        </p>
                        {acc.available != null && acc.available !== acc.balance && (
                          <p style={{ color:'var(--text-muted)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif' }}>
                            {'$' + acc.available.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 })} available
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {txns && txns.length > 0 && (
                  <div>
                    <p style={{ color:'var(--text-muted)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:12 }}>Recent Transactions</p>
                    {txns.map((t, i) => (
                      <div key={t.id} style={{ ...anim(i * 25), background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:12, padding:'13px 14px', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ color: t.pending ? 'var(--text-muted)' : 'var(--text-primary)', fontSize:13, fontWeight:600, fontFamily:'Helvetica Neue,sans-serif', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {t.name}{t.pending ? ' (pending)' : ''}
                          </p>
                          <p style={{ color:'var(--text-faint)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'0.04em' }}>
                            {new Date(t.date + 'T00:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric' })} · {t.category}
                          </p>
                        </div>
                        <p style={{ color: t.amount < 0 ? '#4ade80' : 'var(--text-primary)', fontSize:14, fontWeight:800, fontFamily:'Helvetica Neue,sans-serif', marginLeft:12, flexShrink:0 }}>
                          {(t.amount < 0 ? '+' : '-') + '$' + Math.abs(t.amount).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => { setConnected(false); setAccounts(null); setTxns(null) }}
                  style={{ marginTop:20, width:'100%', padding:'11px', borderRadius:10, border:'1px solid rgba(248,113,113,0.2)', background:'transparent', color:'rgba(248,113,113,0.6)', fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', fontWeight:600, cursor:'pointer' }}>
                  Disconnect Bank
                </button>
              </>
            )}
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div style={anim(80)}>
            <PortfolioTab />
          </div>
        )}

        {/* Bills Tab */}
        {activeTab === 'bills' && <BillsTab userId={user?.id} />}

        {/* Crypto Tab */}
        {activeTab === 'crypto' && (
          <div style={anim(80)}>

            {/* Top 3 */}
            <div style={{ marginBottom:24 }}>
              <SectionHead title="Top Crypto" sub="Live prices" />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                <CryptoTopCard coin="BTC" fhSymbol={CRYPTO_MAP.BTC} onClick={() => setDetailSymbol({ symbol: CRYPTO_YAHOO.BTC, display: 'BTC' })} />
                <CryptoTopCard coin="ETH" fhSymbol={CRYPTO_MAP.ETH} onClick={() => setDetailSymbol({ symbol: CRYPTO_YAHOO.ETH, display: 'ETH' })} />
                {rotatingCoin
                  ? <CryptoTopCard coin={rotatingCoin} fhSymbol={CRYPTO_MAP[rotatingCoin]} badge="hot" onClick={() => setDetailSymbol({ symbol: CRYPTO_YAHOO[rotatingCoin] || (rotatingCoin + '-USD'), display: rotatingCoin })} />
                  : <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'14px 12px', display:'flex', alignItems:'center', justifyContent:'center' }}><p style={{ color:'var(--text-faint)', fontSize:11 }}>—</p></div>
                }
              </div>
            </div>

            {/* Crypto Watchlist */}
            <div style={{ marginBottom:24 }}>
              <SectionHead title="Watchlist" sub={cryptoWatchlist.length + ' coins'} />
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:12 }}>
                {cryptoWatchlist.map(coin => (
                  <CryptoWatchCard
                    key={coin}
                    coin={coin}
                    onClick={() => setDetailSymbol({ symbol: CRYPTO_YAHOO[coin] || (coin + '-USD'), display: coin })}
                    onRemove={coin => {
                      const updated = cryptoWatchlist.filter(c => c !== coin)
                      setCryptoWatchlist(updated)
                      localStorage.setItem('axios-crypto-watchlist', JSON.stringify(updated))
                    }}
                  />
                ))}
              </div>
              {showCryptoAdd ? (
                <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'14px 16px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <input
                      autoFocus
                      value={cryptoInput}
                      onChange={e => setCryptoInput(e.target.value.toUpperCase())}
                      onKeyDown={e => {
                        if (e.key !== 'Enter') return
                        const coin = cryptoInput.trim().toUpperCase()
                        if (coin && !cryptoWatchlist.includes(coin)) {
                          const updated = [...cryptoWatchlist, coin]
                          setCryptoWatchlist(updated)
                          localStorage.setItem('axios-crypto-watchlist', JSON.stringify(updated))
                        }
                        setCryptoInput(''); setShowCryptoAdd(false)
                      }}
                      placeholder="Ticker (e.g. SOL, DOGE)…"
                      style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'var(--text-primary)', fontSize:14, fontFamily:'Helvetica Neue,sans-serif', caretColor:'var(--text-primary)', textTransform:'uppercase' }}
                    />
                    <button onClick={() => { setShowCryptoAdd(false); setCryptoInput('') }} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}>{Ico.x()}</button>
                  </div>
                  <p style={{ color:'var(--text-faint)', fontSize:10, marginTop:8, fontFamily:'Helvetica Neue,sans-serif' }}>Press Enter to add · Must be in CRYPTO_MAP or Finnhub Binance format</p>
                </div>
              ) : (
                <button onClick={() => setShowCryptoAdd(true)} style={{ width:'100%', padding:'12px', borderRadius:12, border:'1px dashed var(--border)', background:'transparent', color:'var(--text-muted)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  {Ico.plus()} Add coin
                </button>
              )}
            </div>

            {/* Crypto News */}
            <div>
              <SectionHead title="Crypto News" sub="Latest" />
              {cryptoNewsLoad ? (
                <p style={{ color:'var(--text-muted)', fontSize:13, fontFamily:"'EB Garamond',serif", fontStyle:'italic', textAlign:'center', padding:'32px 0' }}>Loading news…</p>
              ) : cryptoNews.length === 0 ? (
                <p style={{ color:'var(--text-muted)', fontSize:13, fontFamily:"'EB Garamond',serif", fontStyle:'italic', textAlign:'center', padding:'32px 0' }}>No news available.</p>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {cryptoNews.map((item, i) => <NewsCard key={i} item={item} watchlist={cryptoWatchlist} />)}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
      {detailSymbol && (
        <StockDetailSheet
          symbol={detailSymbol.symbol}
          displaySymbol={detailSymbol.display}
          onClose={() => setDetailSymbol(null)}
        />
      )}
      <BottomNav />
    </div>
  )
}