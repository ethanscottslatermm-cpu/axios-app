import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getQuote, getMarketNews, searchSymbol } from '../../lib/finnhub'
import { BottomNav } from '../../pages/Dashboard'

// ── Default watchlist ──────────────────────────────────────────────────────────
const DEFAULT_SYMBOLS = ['DIA', 'SPY', 'QQQ', 'AAPL', 'TSLA']

// ── Helpers ────────────────────────────────────────────────────────────────────
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

function QuoteCard({ symbol, onRemove, canRemove }) {
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
  const color   = error ? 'var(--text-muted)' : up ? '#4ade80' : '#f87171'

  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        {canRemove && (
          <button onClick={() => onRemove(symbol)} style={{ background:'none', border:'none', color:'var(--text-faint)', cursor:'pointer', padding:0, display:'flex', alignItems:'center' }}>
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

function IndexCard({ label, symbol }) {
  const [quote,   setQuote]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getQuote(symbol).then(d => { setQuote(d); setLoading(false) }).catch(() => setLoading(false))
  }, [symbol])

  const change = quote ? quote.c - quote.pc : null
  const pct    = quote ? ((change / quote.pc) * 100) : null
  const up     = change >= 0

  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'14px 12px', textAlign:'center' }}>
      <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:6 }}>{label}</p>
      {loading ? (
        <p style={{ color:'var(--text-faint)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif' }}>—</p>
      ) : (
        <>
          <p style={{ color:'var(--text-primary)', fontSize:16, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.02em' }}>${fmt(quote?.c)}</p>
          <p style={{ color: up ? '#4ade80' : '#f87171', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', fontWeight:600, marginTop:2 }}>{fmtPct(pct)}</p>
        </>
      )}
    </div>
  )
}

function NewsCard({ item }) {
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ display:'block', textDecoration:'none', padding:'14px 16px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12 }}>
      <p style={{ color:'var(--text-primary)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', fontWeight:600, marginBottom:4, lineHeight:1.4 }}>{item.headline}</p>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <p style={{ color:'var(--text-muted)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'0.08em' }}>{item.source}</p>
        <p style={{ color:'var(--text-faint)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif' }}>{timeAgo(item.datetime)}</p>
      </div>
    </a>
  )
}

export default function FinanceTracker() {
  const [visible,     setVisible]     = useState(false)
  const [watchlist,   setWatchlist]   = useState(DEFAULT_SYMBOLS)
  const [news,        setNews]        = useState([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [showSearch,  setShowSearch]  = useState(false)
  const [query,       setQuery]       = useState('')
  const [results,     setResults]     = useState([])
  const [searching,   setSearching]   = useState(false)
  const [lastRefresh, setLastRefresh] = useState(Date.now())
  const [activeTab,   setActiveTab]   = useState('markets') // markets | news

  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t) }, [])

  useEffect(() => {
    setNewsLoading(true)
    getMarketNews().then(d => { setNews(d); setNewsLoading(false) }).catch(() => setNewsLoading(false))
  }, [lastRefresh])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      try { setResults(await searchSymbol(query)) }
      finally { setSearching(false) }
    }, 400)
    return () => clearTimeout(t)
  }, [query])

  const addSymbol = (symbol) => {
    if (!watchlist.includes(symbol)) setWatchlist(w => [...w, symbol])
    setShowSearch(false); setQuery(''); setResults([])
  }

  const removeSymbol = (symbol) => {
    if (DEFAULT_SYMBOLS.includes(symbol)) return
    setWatchlist(w => w.filter(s => s !== symbol))
  }

  const refresh = () => setLastRefresh(Date.now())

  const anim = (d=0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(12px)',
    transition: `opacity 0.5s ease ${d}ms, transform 0.5s ease ${d}ms`,
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital@1&display=swap');
        * { box-sizing: border-box; }
        .ax-tab-fin:hover { background: var(--bg-card-hover) !important; }
        .ax-sym-result:hover { background: var(--bg-card-hover) !important; }
      `}</style>

      <div style={{ padding:'24px 16px 120px', maxWidth:480, margin:'0 auto' }}>

        {/* Header */}
        <div style={{ ...anim(0), display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div>
            <h1 style={{ color:'var(--text-primary)', fontSize:26, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.02em' }}>Markets</h1>
            <p style={{ color:'var(--text-muted)', fontSize:12, fontFamily:"'EB Garamond',serif", fontStyle:'italic', marginTop:2 }}>Live market data</p>
          </div>
          <button onClick={refresh} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'8px 12px', color:'var(--text-secondary)', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>
            {Ico.refresh()} Refresh
          </button>
        </div>

        {/* Tabs */}
        <div style={{ ...anim(40), display:'flex', gap:8, marginBottom:20 }}>
          {[['markets','Markets'],['news','News']].map(([key, label]) => (
            <button key={key} className="ax-tab-fin" onClick={() => setActiveTab(key)} style={{
              flex:1, padding:'10px', borderRadius:10, border:'1px solid var(--border)',
              background: activeTab===key ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: activeTab===key ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize:12, fontWeight: activeTab===key ? 700 : 400,
              fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer',
              letterSpacing:'0.08em', textTransform:'uppercase',
            }}>{label}</button>
          ))}
        </div>

        {/* Markets Tab */}
        {activeTab === 'markets' && (
          <div style={anim(80)}>

            {/* Index Overview */}
            <div style={{ marginBottom:24 }}>
              <SectionHead title="Indices" sub="ETF proxies" />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                <IndexCard label="DOW"    symbol="DIA" />
                <IndexCard label="S&P 500" symbol="SPY" />
                <IndexCard label="NASDAQ" symbol="QQQ" />
              </div>
            </div>

            {/* Watchlist */}
            <div style={{ marginBottom:20 }}>
              <SectionHead title="Watchlist" sub={`${watchlist.filter(s => !['DIA','SPY','QQQ'].includes(s)).length} stocks`} />
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {watchlist.filter(s => !['DIA','SPY','QQQ'].includes(s)).map(s => (
                  <QuoteCard key={s} symbol={s} onRemove={removeSymbol} canRemove={!DEFAULT_SYMBOLS.includes(s)} />
                ))}
              </div>
            </div>

            {/* Add symbol */}
            {showSearch ? (
              <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:16, marginBottom:16 }}>
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
          </div>
        )}

        {/* News Tab */}
        {activeTab === 'news' && (
          <div style={anim(80)}>
            <SectionHead title="Market News" sub="General" />
            {newsLoading ? (
              <p style={{ color:'var(--text-muted)', fontSize:13, fontFamily:"'EB Garamond',serif", fontStyle:'italic', textAlign:'center', padding:'32px 0' }}>Loading news…</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {news.map((item, i) => <NewsCard key={i} item={item} />)}
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </>
  )
}
