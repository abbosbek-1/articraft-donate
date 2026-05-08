import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, Clock, XCircle, Home } from 'lucide-react'
import axios from 'axios'

export default function SuccessPage() {
  const [params] = useSearchParams()
  const orderId  = params.get('order')
  const [order, setOrder] = useState(null)
  const [tries, setTries] = useState(0)

  useEffect(() => {
    if (!orderId) return
    const poll = setInterval(async () => {
      try {
        const { data } = await axios.get(`/api/orders/${orderId}`)
        setOrder(data)
        setTries(t => t + 1)
        if (data.status === 'completed' || data.status === 'paid' || data.status === 'cancelled' || tries > 20) {
          clearInterval(poll)
        }
      } catch {}
    }, 3000)
    return () => clearInterval(poll)
  }, [orderId])

  const statusMap = {
    pending_payment: { icon: <Clock size={56} className="text-gold-400 mx-auto" />, label: 'To\'lov kutilmoqda', color: '#ffd700', desc: 'MirPay to\'lovi tasdiqlanmoqda...' },
    pending_manual:  { icon: <Clock size={56} className="text-gold-400 mx-auto" />, label: 'Admin tekshirmoqda', color: '#ffd700', desc: 'Admin to\'lovni tekshiradi va bonusni beradi' },
    paid:            { icon: <CheckCircle size={56} className="text-green-400 mx-auto" />, label: 'To\'lov qabul qilindi!', color: '#4ade80', desc: 'Admin tez orada bonus beradi' },
    completed:       { icon: <CheckCircle size={56} className="text-ember-400 mx-auto" />, label: 'Bajarildi!', color: '#ff6b35', desc: 'Bonusingiz berildi. Yaxshi o\'ynang!' },
    cancelled:       { icon: <XCircle size={56} className="text-red-400 mx-auto" />, label: 'Bekor qilindi', color: '#f87171', desc: 'Muammo bo\'lsa admin bilan bog\'laning' },
  }

  const s = order ? (statusMap[order.status] || statusMap['pending_payment']) : statusMap['pending_payment']

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="card-dark rounded-3xl p-10 max-w-md w-full text-center"
           style={{ borderColor: s.color + '33' }}>
        <div className="mb-6">{s.icon}</div>
        <h2 className="section-title text-2xl text-white mb-2">{s.label}</h2>
        <p className="text-white/50 text-sm mb-6">{s.desc}</p>

        {order && (
          <div className="bg-white/5 rounded-2xl p-4 mb-6 text-left space-y-2">
            <Row label="Order ID"   val={order.id}       mono />
            <Row label="Oyinchi"    val={order.username} />
            <Row label="Mahsulot"   val={`${order.type} — ${order.item_id}`} />
            <Row label="Summa"      val={`${order.amount?.toLocaleString()} so'm`} />
          </div>
        )}

        {!order && (
          <div className="flex justify-center mb-6">
            <div className="w-8 h-8 border-2 border-ember-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <Link to="/" className="btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-2 text-sm">
          <Home size={16} /> Bosh sahifaga
        </Link>
      </div>
    </div>
  )
}

function Row({ label, val, mono }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-white/40 text-xs uppercase tracking-wider">{label}</span>
      <span className={`text-white text-sm ${mono ? 'font-mono' : ''}`}>{val}</span>
    </div>
  )
}
