import React, { useState } from 'react'
import { X, User, CreditCard, Loader2, CheckCircle, ExternalLink } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function OrderModal({ item, onClose }) {
  const [username, setUsername] = useState('')
  const [duration, setDuration] = useState('month')
  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(null)

  if (!item) return null

  const price = item.price
    ?? (duration === 'life' ? item.price_life : item.price_month)
    ?? 0

  const handleOrder = async () => {
    if (!username.trim()) { toast.error("Oyinchi nikini kiriting!"); return }
    setLoading(true)
    try {
      const { data } = await axios.post('/api/orders', {
        username:  username.trim(),
        type:      item.type,
        item_id:   item.id,
        duration:  item.price_month ? duration : 'once',
        quantity:  1,
        amount:    price,
        server:    item.server || 'anarxiya'
      })

      if (data.payment_url) {
        // MirPay sahifasiga yo'naltirish
        window.location.href = data.payment_url
      } else {
        // Manual
        setDone({ order_id: data.order_id, manual: true })
      }
    } catch (e) {
      toast.error(e?.response?.data?.error || "Xato yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  const fmt = n => n?.toLocaleString('uz-UZ') + " so'm"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="card-dark rounded-2xl w-full max-w-md relative overflow-hidden"
           style={{ border: `1px solid ${item.color || '#ff6b35'}44` }}>
        {/* Header glow */}
        <div className="absolute top-0 left-0 right-0 h-1 opacity-80"
             style={{ background: `linear-gradient(90deg, transparent, ${item.color || '#ff6b35'}, transparent)` }} />

        <div className="p-6">
          {/* Close */}
          <button onClick={onClose}
            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>

          {done ? (
            /* Muvaffaqiyat */
            <div className="text-center py-6">
              <CheckCircle size={56} className="mx-auto mb-4 text-ember-400" />
              <h3 className="section-title text-xl text-white mb-2">So'rov Yuborildi!</h3>
              <p className="text-white/60 text-sm mb-1">Order ID: <span className="font-mono text-ember-400">{done.order_id}</span></p>
              <p className="text-white/50 text-xs mt-3 leading-relaxed">
                Adminlar tekshirib, sizning <span className="text-gold-400">{username}</span> nikingizga
                bonus berishadi. Telegram orqali xabar keladi.
              </p>
              <button onClick={onClose}
                className="btn-primary mt-6 w-full py-3 rounded-xl text-sm">
                Yopish
              </button>
            </div>
          ) : (
            <>
              {/* Item info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">{item.emoji}</div>
                <div>
                  <h3 className="font-display text-lg text-white">{item.name}</h3>
                  <p className="text-white/50 text-sm">{item.server_label || item.type}</p>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-ember-400 font-bold text-xl font-mono">{fmt(price)}</div>
                </div>
              </div>

              {/* Duration (faqat ranklar uchun) */}
              {item.price_month && item.price_life && (
                <div className="flex gap-2 mb-5">
                  {[
                    { v: 'month', label: '30 kun', price: item.price_month },
                    { v: 'life',  label: 'Umrbod', price: item.price_life  }
                  ].map(d => (
                    <button key={d.v}
                      onClick={() => setDuration(d.v)}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                        duration === d.v
                          ? 'bg-ember-500 text-white'
                          : 'bg-white/5 text-white/50 hover:bg-white/10'
                      }`}>
                      {d.label}<br />
                      <span className="text-xs opacity-80">{fmt(d.price)}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Username */}
              <div className="mb-5">
                <label className="block text-xs text-white/50 mb-2 uppercase tracking-widest font-mono">
                  Minecraft Nik
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Sizning nikingiz..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3
                               text-white placeholder-white/30 outline-none focus:border-ember-500/60
                               font-mono text-sm transition-colors"
                  />
                </div>
              </div>

              {/* Pay button */}
              <button
                onClick={handleOrder}
                disabled={loading}
                className="btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-2 text-sm">
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Yuklanmoqda...</>
                ) : (
                  <><CreditCard size={18} /> MirPay orqali To'lash — {fmt(price)}</>
                )}
              </button>

              <p className="text-center text-white/30 text-xs mt-3">
                🔒 Xavfsiz to'lov · MirPay
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
