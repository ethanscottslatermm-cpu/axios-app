import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-black flex overflow-hidden relative">
      {/* Hero background — drop axios-hero.jpg in public/assets/ */}
      <div
        className="fixed inset-0 bg-cover bg-top z-0"
        style={{ backgroundImage: "url('/assets/axios-hero.jpg')" }}
      />
      {/* Gradient overlay */}
      <div className="fixed inset-0 z-10"
        style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.78) 42%, rgba(0,0,0,0.2) 100%)' }}
      />

      {/* Panel */}
      <div className="relative z-20 flex flex-col justify-center px-14 py-12 w-[440px] min-h-screen">
        {/* Brand */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <svg width="46" height="38" viewBox="0 0 46 38" fill="none">
              <polygon points="0,36 16,2 22,14 9,36" fill="white"/>
              <polygon points="13,36 26,8 32,22 20,36" fill="white" opacity="0.62"/>
              <polygon points="20,36 30,18 34,28 22,36" fill="white" opacity="0.32"/>
            </svg>
            <div className="w-px h-11 bg-white/35" />
            <span className="text-white font-black text-5xl tracking-[0.18em] uppercase leading-none">AXIOS</span>
          </div>
          <p className="text-white/40 text-[10px] tracking-[0.42em] uppercase ml-16">I Am Worthy</p>
        </div>

        {/* Tagline */}
        <div className="mb-8">
          <p className="text-white/28 text-[10px] tracking-[0.25em] uppercase mb-1">Est. 1989</p>
          <p className="text-white/60 text-[15px] font-light leading-relaxed">
            Discipline.<br />Accountability.<br />Personal ownership.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}
          className="bg-white/[0.04] border border-white/[0.12] rounded-sm p-8 backdrop-blur-sm">
          <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase mb-6">Secure Access</p>

          <div className="mb-5">
            <label className="block text-white/40 text-[10px] tracking-[0.22em] uppercase mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full bg-white/[0.06] border border-white/[0.14] rounded-sm text-white px-3.5 py-3 text-sm outline-none focus:border-white/55 placeholder-white/18 transition-colors"
            />
          </div>

          <div className="mb-7">
            <label className="block text-white/40 text-[10px] tracking-[0.22em] uppercase mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••"
              required
              className="w-full bg-white/[0.06] border border-white/[0.14] rounded-sm text-white px-3.5 py-3 text-sm outline-none focus:border-white/55 placeholder-white/18 transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400/80 text-xs mb-4 tracking-wide">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-extrabold text-xs tracking-[0.3em] uppercase py-3.5 rounded-sm hover:opacity-85 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Entering...' : 'Enter'}
          </button>

          <p className="text-white/18 text-[9px] tracking-[0.15em] uppercase text-center mt-5">
            Authorized access only
          </p>
        </form>

        <p className="text-white/14 text-[9px] tracking-[0.15em] uppercase mt-6">
          "Axios" — I am worthy
        </p>
      </div>

      <p className="fixed bottom-6 left-8 text-white/18 text-[9px] tracking-[0.22em] uppercase italic z-20">
        Est 1989
      </p>
    </div>
  )
}
