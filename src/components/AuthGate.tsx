import { useState } from 'react'
import { useStore } from '../lib/store'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  )
}

export function AuthGate() {
  const { signIn, signUp, signInWithGoogle, showToast } = useStore()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function emailSubmit() {
    if (!email.trim() || !pw) { setErr('Enter email and password'); return }
    setBusy(true); setErr(null)
    const fn = mode === 'in' ? signIn : signUp
    const error = await fn(email.trim(), pw)
    setBusy(false)
    if (error) { setErr(error); return }
    if (mode === 'up') showToast('Account created — if email confirmation is on, check your inbox')
  }

  async function google() {
    setBusy(true); setErr(null)
    const error = await signInWithGoogle()
    if (error) { setErr(error); setBusy(false) }
    // on success the browser redirects to Google
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg,rgba(34,227,255,.12),rgba(139,92,255,.14) 55%,rgba(255,79,216,.12))' }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-grad grid place-items-center font-black text-lg shadow-glowViolet">P</div>
          <div><b className="text-2xl tracking-[3px] font-extrabold">PULSE</b>
            <span className="block text-[10px] tracking-[5px] text-muted">FITNESS OS</span></div>
        </div>
        <div>
          <h1 className="text-[44px] leading-tight font-extrabold tracking-tight">Train smarter.<br />Track everything.</h1>
          <p className="text-muted mt-4 text-[15px] max-w-md leading-relaxed">
            Workouts, nutrition, body composition and an adaptive coach — all in one futuristic,
            cloud-synced dashboard. Your data, on every device.
          </p>
          <div className="flex gap-2 mt-7 flex-wrap">
            {['Workouts', 'Nutrition', 'InBody', 'AI Coach', 'Friends'].map((t) => (
              <span key={t} className="px-3 py-1.5 rounded-full text-xs font-semibold text-txt"
                style={{ background: 'rgba(18,24,42,.6)', border: '1px solid rgba(120,160,255,.22)' }}>{t}</span>
            ))}
          </div>
        </div>
        <div className="text-muted2 text-xs">Secured by Supabase · Row-level data isolation</div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-[380px]">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-grad grid place-items-center font-black shadow-glowViolet">P</div>
            <b className="text-xl tracking-[3px] font-extrabold">PULSE</b>
          </div>
          <h2 className="text-2xl font-extrabold">{mode === 'in' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="text-muted text-sm mt-1 mb-6">{mode === 'in' ? 'Sign in to access your dashboard.' : 'Start tracking in under a minute.'}</p>

          <button className="btn w-full justify-center bg-white text-[#1a1a1a] border-0 hover:brightness-95" disabled={busy} onClick={google}>
            <GoogleIcon /> Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5 text-muted2 text-xs">
            <div className="h-px flex-1 bg-line2" />OR<div className="h-px flex-1 bg-line2" />
          </div>

          <label className="label">Email</label>
          <input className="input mb-3" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <label className="label">Password</label>
          <input className="input" type="password" autoComplete={mode === 'in' ? 'current-password' : 'new-password'} value={pw}
            onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && emailSubmit()} placeholder="••••••••" />

          {err && <div className="text-red text-[13px] mt-3">{err}</div>}

          <button className="btn btn-primary w-full justify-center mt-5" disabled={busy} onClick={emailSubmit}>
            {busy ? 'Working…' : mode === 'in' ? 'Sign in' : 'Create account'}
          </button>

          <div className="text-center text-sm text-muted mt-5">
            {mode === 'in' ? "Don't have an account? " : 'Already have an account? '}
            <button className="text-cyan font-semibold" onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setErr(null) }}>
              {mode === 'in' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
