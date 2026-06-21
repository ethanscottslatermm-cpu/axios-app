import { useState, useEffect } from 'react'

const FRONT_URL = '/New%20SVG%202D%20MODEL/Frame%201%20front.svg'
const BACK_URL  = '/New%20SVG%202D%20MODEL/Frame%202%20back.svg'

// viewBox: x y width height — cropped region of the SVG coordinate space (580×1616)
const CONFIG = {
  Chest:      { url: FRONT_URL, ids: ['pectoralis_major_left','pectoralis_major_right'],                                                                          vb: '145 455 290 270', color: '#E85568' },
  Back:       { url: BACK_URL,  ids: ['trapezius_left','trapezius_right','latissimus_dorsi_left','latissimus_dorsi_right','erector_spinae'],                       vb: '120 360 340 410', color: '#32B47C' },
  Shoulders:  { url: FRONT_URL, ids: ['deltoid_anterior_left','deltoid_anterior_right','deltoid_posterior_left','deltoid_posterior_right','base','base_2'],        vb: '65 360 450 250',  color: '#4A8FD4' },
  Biceps:     { url: FRONT_URL, ids: ['biceps_brachii_left','biceps_brachii_right'],                                                                              vb: '55 515 470 300',  color: '#C04462' },
  Triceps:    { url: BACK_URL,  ids: ['triceps_brachii_left','triceps_brachii_right'],                                                                            vb: '55 515 470 300',  color: '#33AAAA' },
  Core:       { url: FRONT_URL, ids: ['upper_abs','lower_abs','external_oblique_left','external_oblique_right','internal_oblique_left','internal_oblique_right'],  vb: '145 715 290 310', color: '#3864B8' },
  Quads:      { url: FRONT_URL, ids: ['quadriceps_femoris_left','quadriceps_femoris_right','adductor_longus_left','adductor_longus_right'],                        vb: '115 1005 350 370', color: '#40AE7E' },
  Hamstrings: { url: BACK_URL,  ids: ['hamstrings_left','hamstrings_right'],                                                                                      vb: '115 1005 350 350', color: '#2E9090' },
  Glutes:     { url: BACK_URL,  ids: ['gluteus_maximus_left','gluteus_maximus_right','gluteus_medius_left','gluteus_medius_right'],                                vb: '135 870 310 230',  color: '#3864B8' },
  Calves:     { url: BACK_URL,  ids: ['gastrocnemius_left','gastrocnemius_right','soleus_left','soleus_right'],                                                   vb: '135 1330 310 250', color: '#3864B8' },
}

// Module-level caches so SVGs are fetched once and thumbnails built once per group
const RAW_CACHE   = {}
const RAW_PENDING = {}
const THUMB_CACHE = {}

function fetchSvg(url) {
  if (RAW_CACHE[url]) return Promise.resolve(RAW_CACHE[url])
  if (!RAW_PENDING[url]) {
    RAW_PENDING[url] = fetch(url).then(r => r.text()).then(t => { RAW_CACHE[url] = t; return t })
  }
  return RAW_PENDING[url]
}

function buildThumbnail(svgText, cfg) {
  const parser = new DOMParser()
  const doc    = parser.parseFromString(svgText, 'image/svg+xml')
  const svg    = doc.documentElement

  svg.setAttribute('viewBox', cfg.vb)
  svg.removeAttribute('width')
  svg.removeAttribute('height')
  svg.setAttribute('style', 'width:100%;height:100%;display:block;')

  const highlighted     = cfg.ids.map(id => `#${id} path`).join(',')
  const highlightedNone = cfg.ids.map(id => `#${id} path[fill="none"]`).join(',')
  const glowTargets     = cfg.ids.join(',')

  const style = doc.createElementNS('http://www.w3.org/2000/svg', 'style')
  style.textContent = `
    path { fill: #0b1020 !important; stroke: rgba(255,255,255,0.04) !important; stroke-width: 0.5px !important; }
    path[fill="none"] { fill: none !important; stroke: rgba(255,255,255,0.04) !important; }
    ${highlighted} { fill: ${cfg.color} !important; stroke: rgba(255,255,255,0.45) !important; stroke-width: 0.7px !important; }
    ${highlightedNone} { fill: none !important; }
    ${glowTargets} { filter: drop-shadow(0 0 6px ${cfg.color}99) drop-shadow(0 0 2px ${cfg.color}ee); }
  `
  svg.insertBefore(style, svg.firstChild)

  return new XMLSerializer().serializeToString(svg).replace(/<\?xml[^?]*\?>/g, '')
}

export default function MuscleThumbnail({ group, size = 52 }) {
  const cfg = CONFIG[group]
  const [html, setHtml] = useState(() => THUMB_CACHE[group] || '')

  useEffect(() => {
    if (!cfg) return
    if (THUMB_CACHE[group]) { setHtml(THUMB_CACHE[group]); return }
    fetchSvg(cfg.url).then(raw => {
      const processed = buildThumbnail(raw, cfg)
      THUMB_CACHE[group] = processed
      setHtml(processed)
    })
  }, [group])

  if (!html) {
    return <div style={{ width: size, height: size, flexShrink: 0, borderRadius: 8, background: 'rgba(255,255,255,0.04)' }} />
  }

  return (
    <div
      style={{ width: size, height: size, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: '#0b1020' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
