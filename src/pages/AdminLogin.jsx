import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [waiting,  setWaiting]  = useState(false)
  const [code,     setCode]     = useState(null)
  const [status,   setStatus]   = useState('pending')
  const nav = useNavigate()

  // Polling
  useEffect(() => {
    if (!waiting || !code) return
    const iv = setInterval(async () => {
      try {
        const { data } = await axios.post('/api/admin/check', { code })
        setStatus(data.status)
        if (data.status === 'approved') {
          clearInterval(iv)
          toast.success('Kirish tasdiqlandi!')
          setTimeout(() => nav('/admin'), 500)
        } else if (data.status === 'rejected' || data.status === 'expired') {
          clearInterval(iv)
          setWaiting(false)
        }
      } catch {}
    }, 2000)
    return () => clearInterval(iv)
  }, [waiting, code])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await axios.post('/api/admin/login', { username, password })
      if (data.code) {
        setCode(data.code)
        setWaiting(true)
        setStatus('pending')
      }
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Xato')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative">
      {/* BG */}
      <div className="absolute inset-0 opacity-5"
           style={{ backgroundImage: 'linear-gradient(#ff6b35 1px,transparent 1px),linear-gradient(90deg,#ff6b35 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="card-dark rounded-3xl p-8 w-full max-w-sm relative z-10">
        {/* Top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-ember-500 to-transparent" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-ember-500/10 border border-ember-500/30 mb-4">
            <Shield size={28} className="text-ember-400" />
          </div>
          <h1 className="section-title text-xl text-white">Admin Panel</h1>
          <p className="text-white/30 text-xs mt-1 font-mono">ArtiCraft Management</p>
        </div>

        {!waiting ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-white/40 mb-2 uppercase tracking-widest font-mono">Login</label>
              <input value={username} onChange={e=>setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                           placeholder-white/20 outline-none focus:border-ember-500/50 font-mono text-sm transition-colors"
                placeholder="admin" required />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-2 uppercase tracking-widest font-mono">Parol</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                           placeholder-white/20 outline-none focus:border-ember-500/50 font-mono text-sm transition-colors"
                placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 size={16} className="animate-spin"/>Yuklanmoqda...</> : 'Kirish →'}
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            {status === 'pending' && (
              <>
                <div className="w-16 h-16 border-2 border-ember-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Telegram orqali tasdiqlang</h3>
                <p className="text-white/40 text-sm">Telegramingizga xabar yuborildi.<br/>✅ yoki ❌ tugmasini bosing.</p>
                <Clock size={14} className="text-white/20 mx-auto mt-4" />
              </>
            )}
            {status === 'rejected' && (
              <>
                <XCircle size={48} className="text-red-400 mx-auto mb-4" />
                <h3 className="text-red-400 font-semibold mb-2">Rad etildi</h3>
                <button onClick={() => setWaiting(false)} className="btn-primary px-6 py-2.5 rounded-xl text-sm mt-4">
                  Qayta urinish
                </button>
              </>
            )}
            {status === 'expired' && (
              <>
                <Clock size={48} className="text-gold-400 mx-auto mb-4" />
                <h3 className="text-gold-400 font-semibold mb-2">Vaqt tugadi</h3>
                <button onClick={() => setWaiting(false)} className="btn-primary px-6 py-2.5 rounded-xl text-sm mt-4">
                  Qayta kirish
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
