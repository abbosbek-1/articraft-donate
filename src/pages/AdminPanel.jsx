import React, { useEffect, useState, useCallback } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingBag, Settings, LogOut,
  CheckCircle, XCircle, Clock, RefreshCw, Search,
  TrendingUp, Users, Package, DollarSign, Save,
  ChevronRight, AlertCircle, Sword, Coins, Key, Star
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

// ===== AUTH CHECK =====
function useAdminAuth() {
  const [auth, setAuth] = useState(null)
  const nav = useNavigate()

  useEffect(() => {
    axios.get('/api/admin/stats')
      .then(() => setAuth(true))
      .catch(() => { setAuth(false); nav('/admin/login') })
  }, [])

  return auth
}

// ===== SIDEBAR =====
function Sidebar({ onLogout }) {
  const location = useLocation()
  const links = [
    { to: '/admin',          icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/admin/orders',   icon: <ShoppingBag size={18} />,     label: 'Orderlar'  },
    { to: '/admin/settings', icon: <Settings size={18} />,        label: 'Sozlamalar'},
  ]

  return (
    <aside className="w-60 min-h-screen border-r border-white/5 flex flex-col" style={{ background: '#08080e' }}>
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="font-display text-lg text-white">
          ARTI<span className="text-ember-400">CRAFT</span>
        </div>
        <div className="text-white/30 text-xs font-mono mt-1">Admin Panel</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map(l => {
          const active = location.pathname === l.to ||
                        (l.to !== '/admin' && location.pathname.startsWith(l.to))
          return (
            <Link key={l.to} to={l.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-ember-500/20 text-ember-400 border border-ember-500/30'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}>
              {l.icon}{l.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/5">
        <button onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/30
                     hover:text-red-400 hover:bg-red-500/10 transition-all w-full">
          <LogOut size={16} /> Chiqish
        </button>
      </div>
    </aside>
  )
}

// ===== STAT CARD =====
function StatCard({ icon, label, value, color, sub }) {
  return (
    <div className="card-dark rounded-2xl p-6" style={{ borderColor: color + '22' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl" style={{ background: color + '15' }}>
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
      <div className="text-3xl font-bold font-mono text-white mb-1">{value}</div>
      <div className="text-white/40 text-sm">{label}</div>
      {sub && <div className="text-xs mt-2" style={{ color }}>{sub}</div>}
    </div>
  )
}

// ===== DASHBOARD =====
function Dashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    axios.get('/api/admin/stats').then(r => setStats(r.data)).catch(() => {})
  }, [])

  if (!stats) return <Spinner />

  return (
    <div>
      <PageHeader title="Dashboard" sub="Umumiy ko'rinish" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Package size={20}/>}     label="Jami Orderlar"   value={stats.total_orders}  color="#ff6b35" />
        <StatCard icon={<Clock size={20}/>}        label="Kutayotgan"      value={stats.pending}       color="#ffd700" sub="Tez bajaring" />
        <StatCard icon={<CheckCircle size={20}/>}  label="Bajarilgan"      value={stats.completed}     color="#4ade80" />
        <StatCard icon={<DollarSign size={20}/>}   label="Daromad"         value={`${(stats.total_revenue/1000).toFixed(0)}k`} color="#b366ff" sub="so'm" />
      </div>

      <div className="mt-8 card-dark rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <AlertCircle size={16} className="text-gold-400" />
          Oxirgi orderlar
        </h3>
        <RecentOrders />
      </div>
    </div>
  )
}

function RecentOrders() {
  const [orders, setOrders] = useState([])
  useEffect(() => {
    axios.get('/api/admin/orders').then(r => setOrders(r.data.orders?.slice(0,5) || [])).catch(()=>{})
  },[])
  return (
    <div className="space-y-2">
      {orders.map(o => (
        <div key={o.id} className="flex items-center gap-4 bg-white/3 rounded-xl px-4 py-3">
          <StatusBadge status={o.status} />
          <span className="text-white/80 text-sm font-semibold">{o.username}</span>
          <span className="text-white/40 text-xs">{o.type} — {o.item_id}</span>
          <span className="ml-auto text-ember-400 font-mono text-sm font-bold">{o.amount?.toLocaleString()} so'm</span>
        </div>
      ))}
      {orders.length === 0 && <p className="text-white/20 text-sm text-center py-4">Orderlar yo'q</p>}
    </div>
  )
}

// ===== ORDERS =====
function Orders() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')

  const load = useCallback(() => {
    setLoading(true)
    axios.get('/api/admin/orders')
      .then(r => setOrders(r.data.orders || []))
      .catch(() => toast.error('Yuklab bo\'lmadi'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id, status) => {
    try {
      await axios.post(`/api/admin/orders/${id}/status`, { status })
      toast.success('Yangilandi!')
      load()
    } catch { toast.error('Xato') }
  }

  const FILTERS = ['all','pending_payment','pending_manual','paid','completed','cancelled']

  const shown = orders
    .filter(o => filter === 'all' || o.status === filter)
    .filter(o =>
      !search ||
      o.username?.toLowerCase().includes(search.toLowerCase()) ||
      o.id?.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div>
      <PageHeader title="Orderlar" sub={`${orders.length} ta order`}>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-white/60 hover:text-white transition-all">
          <RefreshCw size={14} /> Yangilash
        </button>
      </PageHeader>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-4">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              filter === f ? 'bg-ember-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'
            }`}>
            {f === 'all' ? 'Hammasi' : f.replace('_',' ')}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nik yoki ID qidirish..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-white
                     placeholder-white/20 outline-none focus:border-ember-500/40 font-mono transition-colors" />
      </div>

      {loading ? <Spinner /> : (
        <div className="space-y-3">
          {shown.map(o => (
            <div key={o.id} className="card-dark rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <StatusBadge status={o.status} />
                  <div>
                    <div className="text-white font-bold">{o.username}</div>
                    <div className="text-white/40 text-xs font-mono mt-0.5">#{o.id} · {o.created_at}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-ember-400 font-bold font-mono text-lg">{o.amount?.toLocaleString()} so'm</div>
                  <div className="text-white/40 text-xs">{o.type} — {o.item_id} · {o.duration}</div>
                </div>
              </div>

              {(o.status === 'pending_manual' || o.status === 'pending_payment' || o.status === 'paid') && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                  <button onClick={() => updateStatus(o.id, 'completed')}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all">
                    ✅ Bajarildi
                  </button>
                  <button onClick={() => updateStatus(o.id, 'cancelled')}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all">
                    ❌ Bekor
                  </button>
                </div>
              )}
            </div>
          ))}
          {shown.length === 0 && (
            <div className="text-center py-12 text-white/20">
              <Package size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Orderlar topilmadi</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ===== SETTINGS =====
function AdminSettings() {
  const [data, setData] = useState(null)
  const [tab,  setTab]  = useState('ranks_anarxiya')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    axios.get('/api/admin/data').then(r => setData(r.data)).catch(()=>{})
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await axios.post('/api/admin/data', data)
      toast.success('Saqlandi!')
    } catch { toast.error('Xato') }
    finally { setSaving(false) }
  }

  if (!data) return <Spinner />

  const updateRank = (server, idx, field, val) => {
    const d = { ...data }
    d.ranks[server][idx][field] = field.includes('price') ? parseInt(val)||0 : val
    setData(d)
  }
  const updatePayment = (field, val) => setData({ ...data, [field]: val })

  const settingTabs = [
    { id: 'ranks_anarxiya', label: '🔥 Anarxiya Ranklar' },
    { id: 'ranks_arti_smp', label: '🌍 Arti SMP Ranklar' },
    { id: 'tokens',         label: '🪙 Tokenlar' },
    { id: 'keys',           label: '🔑 Kalitlar' },
    { id: 'shards',         label: '💠 Shardlar' },
    { id: 'payment',        label: '💳 To\'lov' },
  ]

  return (
    <div>
      <PageHeader title="Sozlamalar" sub="Narxlar va ma'lumotlarni tahrirlash">
        <button onClick={save} disabled={saving}
          className="btn-primary px-6 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <Save size={14} />{saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </PageHeader>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {settingTabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              tab === t.id ? 'bg-ember-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'
            }`}>{t.label}</button>
        ))}
      </div>

      {/* Rank editor */}
      {(tab === 'ranks_anarxiya' || tab === 'ranks_arti_smp') && (() => {
        const server = tab === 'ranks_anarxiya' ? 'anarxiya' : 'arti_smp'
        return (
          <div className="space-y-3">
            {(data.ranks[server] || []).map((rank, i) => (
              <div key={rank.id} className="card-dark rounded-2xl p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Field label="Nomi" value={rank.name}       onChange={v => updateRank(server,i,'name',v)} />
                  <Field label="Emoji" value={rank.emoji}     onChange={v => updateRank(server,i,'emoji',v)} />
                  <Field label="30 kun (so'm)" value={rank.price_month} onChange={v => updateRank(server,i,'price_month',v)} type="number" />
                  <Field label="Umrbod (so'm)"  value={rank.price_life}  onChange={v => updateRank(server,i,'price_life',v)}  type="number" />
                </div>
              </div>
            ))}
          </div>
        )
      })()}

      {/* Token editor */}
      {tab === 'tokens' && (
        <div className="space-y-3">
          {data.tokens.map((t, i) => (
            <div key={i} className="card-dark rounded-2xl p-5">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Token miqdori" value={t.amount} type="number"
                  onChange={v => { const d={...data}; d.tokens[i].amount=parseInt(v)||0; setData(d) }} />
                <Field label="Narx (so'm)" value={t.price} type="number"
                  onChange={v => { const d={...data}; d.tokens[i].price=parseInt(v)||0; setData(d) }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Keys editor */}
      {tab === 'keys' && (
        <div className="space-y-3">
          {data.keys.map((k, i) => (
            <div key={k.id} className="card-dark rounded-2xl p-5">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Field label="Nomi" value={k.name} onChange={v => { const d={...data}; d.keys[i].name=v; setData(d) }} />
                <Field label="Emoji" value={k.emoji} onChange={v => { const d={...data}; d.keys[i].emoji=v; setData(d) }} />
                <Field label="Narx (so'm)" value={k.price} type="number"
                  onChange={v => { const d={...data}; d.keys[i].price=parseInt(v)||0; setData(d) }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shards editor */}
      {tab === 'shards' && (
        <div className="space-y-3">
          {data.shards.map((s, i) => (
            <div key={i} className="card-dark rounded-2xl p-5">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Shard miqdori" value={s.amount} type="number"
                  onChange={v => { const d={...data}; d.shards[i].amount=parseInt(v)||0; setData(d) }} />
                <Field label="Narx (so'm)" value={s.price} type="number"
                  onChange={v => { const d={...data}; d.shards[i].price=parseInt(v)||0; setData(d) }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment */}
      {tab === 'payment' && (
        <div className="card-dark rounded-2xl p-6 space-y-4">
          <Field label="Karta raqami"  value={data.payment_card}  onChange={v => updatePayment('payment_card',v)} />
          <Field label="Karta egasi"   value={data.payment_owner} onChange={v => updatePayment('payment_owner',v)} />
          <Field label="Server IP"     value={data.server_ip}     onChange={v => updatePayment('server_ip',v)} />
          <Field label="Discord link"  value={data.discord}       onChange={v => updatePayment('discord',v)} />
          <Field label="Telegram link" value={data.telegram}      onChange={v => updatePayment('telegram',v)} />
        </div>
      )}
    </div>
  )
}

// ===== HELPERS =====
function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs text-white/30 mb-1.5 uppercase tracking-wider font-mono">{label}</label>
      <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white
                   outline-none focus:border-ember-500/50 transition-colors font-mono" />
    </div>
  )
}

function PageHeader({ title, sub, children }) {
  return (
    <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
      <div>
        <h1 className="section-title text-2xl text-white">{title}</h1>
        {sub && <p className="text-white/30 text-sm mt-1">{sub}</p>}
      </div>
      {children && <div className="flex gap-3">{children}</div>}
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    pending_payment: { label: 'To\'lov kutilmoqda', color: '#ffd700' },
    pending_manual:  { label: 'Tekshirilmoqda',    color: '#fb923c' },
    paid:            { label: 'To\'langan',         color: '#60a5fa' },
    completed:       { label: 'Bajarildi',          color: '#4ade80' },
    cancelled:       { label: 'Bekor',              color: '#f87171' },
  }
  const s = map[status] || { label: status, color: '#888' }
  return (
    <span className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap"
          style={{ background: s.color + '20', color: s.color, border: `1px solid ${s.color}40` }}>
      {s.label}
    </span>
  )
}

function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-2 border-ember-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ===== MAIN ADMIN =====
export default function AdminPanel() {
  const nav  = useNavigate()
  const auth = useAdminAuth()

  const logout = async () => {
    await axios.post('/api/admin/logout')
    nav('/admin/login')
  }

  if (auth === null) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-ember-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (auth === false) return null

  return (
    <div className="flex min-h-screen">
      <Sidebar onLogout={logout} />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <Routes>
            <Route index          element={<Dashboard />} />
            <Route path="orders"  element={<Orders />} />
            <Route path="settings" element={<AdminSettings />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
