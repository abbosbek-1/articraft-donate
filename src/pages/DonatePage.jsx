import React, { useEffect, useState } from 'react'
import { Sword, Coins, Key, Package, ShieldOff, Star, Zap, ChevronDown } from 'lucide-react'
import axios from 'axios'
import OrderModal from '../components/OrderModal'

const SERVER_TABS = [
  { id: 'anarxiya', label: '🔥 Anarxiya',  desc: 'Asosiy server' },
  { id: 'arti_smp', label: '🌍 Arti SMP',  desc: 'SMP server' },
]

export default function DonatePage() {
  const [data,      setData]      = useState(null)
  const [server,    setServer]    = useState('anarxiya')
  const [selected,  setSelected]  = useState(null)  // OrderModal item
  const [tab,       setTab]       = useState('ranks') // ranks|tokens|keys|shards|other

  useEffect(() => {
    axios.get('/api/data').then(r => setData(r.data)).catch(() => {})
  }, [])

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-2 border-ember-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40 font-mono text-sm">Yuklanmoqda...</p>
      </div>
    </div>
  )

  const fmt = n => n?.toLocaleString('uz-UZ') + " so'm"

  const ranks  = data.ranks?.[server] || []
  const tokens = data.tokens  || []
  const keys   = data.keys    || []
  const shards = data.shards  || []
  const other  = data.other   || []

  const openOrder = (item) => setSelected(item)

  return (
    <div className="relative z-10 pt-16">
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-10"
               style={{ background: 'radial-gradient(circle, #ff6b35 0%, transparent 70%)' }} />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full opacity-5"
               style={{ background: 'radial-gradient(circle, #b366ff 0%, transparent 70%)' }} />
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
             style={{ backgroundImage: 'linear-gradient(#ff6b35 1px,transparent 1px),linear-gradient(90deg,#ff6b35 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative text-center px-6 max-w-4xl mx-auto animate-rise">
          <div className="inline-flex items-center gap-2 bg-ember-500/10 border border-ember-500/30 rounded-full px-4 py-2 mb-8">
            <Zap size={14} className="text-ember-400" />
            <span className="text-ember-400 text-xs font-mono tracking-widest uppercase">Live Server</span>
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          </div>

          <h1 className="section-title text-5xl md:text-7xl text-white mb-4 leading-tight">
            ARTI<span className="text-ember-400 glow-text">CRAFT</span>
          </h1>
          <p className="text-white/40 text-lg font-mono tracking-widest mb-2">
            ⚔ DONATE PANEL ⚔
          </p>
          <p className="text-white/30 text-sm mb-10 font-mono">
            {data.server_ip}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href={data.discord} target="_blank" rel="noreferrer"
               className="btn-primary px-8 py-4 rounded-full text-sm flex items-center gap-2 justify-center">
              <Star size={16} /> Discord'ga Qo'shil
            </a>
            <a href={data.telegram} target="_blank" rel="noreferrer"
               className="px-8 py-4 rounded-full text-sm font-semibold uppercase tracking-wider
                          border border-white/10 text-white/60 hover:border-white/30 hover:text-white
                          transition-all flex items-center gap-2 justify-center">
              <Zap size={16} /> Telegram
            </a>
          </div>

          {/* Stats strip */}
          <div className="flex justify-center gap-8 md:gap-16">
            {[
              { label: 'Online',     val: '47+',   color: '#4ade80' },
              { label: 'Ranklar',    val: ranks.length, color: '#ff6b35' },
              { label: 'Serverlar',  val: '2',     color: '#b366ff' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.val}</div>
                <div className="text-white/30 text-xs uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <a href="#ranks" className="absolute bottom-10 animate-bounce">
          <ChevronDown size={24} className="text-white/20" />
        </a>
      </section>

      {/* ===== SERVER TABS ===== */}
      <section className="sticky top-16 z-40 bg-obsidian-900/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex gap-1 py-3">
          {SERVER_TABS.map(t => (
            <button key={t.id} onClick={() => { setServer(t.id); setTab('ranks') }}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                server === t.id
                  ? 'bg-ember-500 text-white shadow-lg shadow-ember-500/30'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* ===== CATEGORY TABS ===== */}
      <section className="max-w-7xl mx-auto px-6 pt-10 pb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'ranks',  icon: <Sword size={14} />,   label: 'Ranklar' },
            { id: 'tokens', icon: <Coins size={14} />,   label: 'Tokenlar' },
            ...(server === 'arti_smp' ? [
              { id: 'keys',   icon: <Key size={14} />,     label: 'Kalitlar' },
              { id: 'shards', icon: <Star size={14} />,    label: 'Shardlar' },
            ] : []),
            { id: 'other',  icon: <Package size={14} />, label: 'Boshqalar' },
          ].map(c => (
            <button key={c.id} onClick={() => setTab(c.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap text-xs font-semibold uppercase tracking-wider transition-all ${
                tab === c.id
                  ? 'bg-ember-500/20 text-ember-400 border border-ember-500/40'
                  : 'text-white/30 border border-white/5 hover:border-white/15 hover:text-white/60'
              }`}>
              {c.icon}{c.label}
            </button>
          ))}
        </div>
      </section>

      {/* ===== RANKS ===== */}
      {tab === 'ranks' && (
        <section id="ranks" className="max-w-7xl mx-auto px-6 py-8">
          <SectionHeader icon={<Sword size={20} />} title="Rank Donate" sub={`${server === 'anarxiya' ? 'Anarxiya' : 'Arti SMP'} server ranklari`} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
            {ranks.map((rank, i) => (
              <RankCard key={rank.id} rank={rank} index={i} onBuy={(dur) =>
                openOrder({ ...rank, type: 'rank', server, server_label: server, duration: dur })
              } />
            ))}
          </div>
        </section>
      )}

      {/* ===== TOKENS ===== */}
      {tab === 'tokens' && (
        <section id="tokens" className="max-w-7xl mx-auto px-6 py-8">
          <SectionHeader icon={<Coins size={20} />} title="Token Sotib Olish" sub="Oyindagi asosiy valyuta" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
            {tokens.map((t, i) => (
              <div key={i}
                className="card-dark rounded-2xl p-5 text-center rank-card cursor-pointer hover:border-gold-400/40"
                onClick={() => openOrder({ id: `token_${t.amount}`, name: `${t.amount.toLocaleString()} Token`, emoji: '🪙', color: '#ffd700', price: t.price, type: 'token', server })}>
                <div className="text-3xl mb-3">🪙</div>
                <div className="text-gold-300 font-bold text-xl font-mono">{t.amount.toLocaleString()}</div>
                <div className="text-white/40 text-xs mb-4">token</div>
                <div className="text-ember-400 font-bold">{fmt(t.price)}</div>
                <button className="btn-primary w-full mt-4 py-2.5 rounded-xl text-xs">Sotib olish</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== KEYS (Arti SMP) ===== */}
      {tab === 'keys' && server === 'arti_smp' && (
        <section id="keys" className="max-w-7xl mx-auto px-6 py-8">
          <SectionHeader icon={<Key size={20} />} title="Krit Kalitlari" sub="Maxsus mukofotlar oching" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
            {keys.map(k => (
              <div key={k.id}
                className="card-dark rounded-2xl p-5 text-center rank-card cursor-pointer"
                style={{ borderColor: k.color + '33' }}
                onClick={() => openOrder({ ...k, type: 'key', server, price: k.price })}>
                <div className="text-3xl mb-3" style={{ filter: `drop-shadow(0 0 8px ${k.color})` }}>{k.emoji}</div>
                <div className="font-semibold text-white mb-1">{k.name}</div>
                <div className="font-bold mt-3" style={{ color: k.color }}>{fmt(k.price)}</div>
                <button className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all"
                        style={{ background: k.color + '30', border: `1px solid ${k.color}50` }}>
                  Sotib olish
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== SHARDS (Arti SMP) ===== */}
      {tab === 'shards' && server === 'arti_smp' && (
        <section id="shards" className="max-w-7xl mx-auto px-6 py-8">
          <SectionHeader icon={<Star size={20} />} title="Shard Sotib Olish" sub="Oyindagi donate valyutasi" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
            {shards.map((s, i) => (
              <div key={i}
                className="card-dark rounded-2xl p-6 text-center rank-card cursor-pointer hover:border-arcane-400/40"
                onClick={() => openOrder({ id: `shard_${s.amount}`, name: `${s.amount.toLocaleString()} Shard`, emoji: '💠', color: '#b366ff', price: s.price, type: 'shard', server })}>
                <div className="text-4xl mb-4">💠</div>
                <div className="text-arcane-400 font-bold text-2xl font-mono">{s.amount.toLocaleString()}</div>
                <div className="text-white/40 text-xs mb-4">shard</div>
                <div className="text-ember-400 font-bold text-xl">{fmt(s.price)}</div>
                <button className="btn-primary w-full mt-5 py-3 rounded-xl text-sm">Sotib olish</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== OTHER ===== */}
      {tab === 'other' && (
        <section id="other" className="max-w-7xl mx-auto px-6 py-8">
          <SectionHeader icon={<Package size={20} />} title="Boshqalar" sub="Unban, Titul va boshqa xizmatlar" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
            {other.map(o => (
              <div key={o.id}
                className="card-dark rounded-2xl p-6 rank-card cursor-pointer hover:border-ember-500/40"
                onClick={() => openOrder({ ...o, type: 'other', server, price: o.price })}>
                <div className="text-4xl mb-4">{o.emoji}</div>
                <h3 className="text-white font-bold text-lg mb-1">{o.name}</h3>
                <p className="text-white/40 text-sm mb-4">{o.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-ember-400 font-bold text-xl font-mono">{fmt(o.price)}</span>
                  <button className="btn-primary px-5 py-2.5 rounded-xl text-xs">Olish</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== FOOTER ===== */}
      <footer className="mt-20 border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="font-display text-2xl text-white mb-2">
            ARTI<span className="text-ember-400">CRAFT</span>
          </div>
          <p className="text-white/20 text-sm font-mono mb-6">{data.server_ip}</p>
          <div className="flex justify-center gap-8">
            <a href={data.discord} className="text-white/30 hover:text-white/70 text-sm transition-colors">Discord</a>
            <a href={data.telegram} className="text-white/30 hover:text-white/70 text-sm transition-colors">Telegram</a>
            <a href="/admin/login" className="text-white/10 hover:text-white/30 text-sm transition-colors">Admin</a>
          </div>
          <p className="text-white/10 text-xs mt-8">© 2024 ArtiCraft. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>

      {/* Order Modal */}
      {selected && <OrderModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function SectionHeader({ icon, title, sub }) {
  return (
    <div className="flex items-start gap-4 mb-2">
      <div className="p-3 bg-ember-500/10 rounded-xl text-ember-400 border border-ember-500/20 mt-1">
        {icon}
      </div>
      <div>
        <h2 className="section-title text-2xl md:text-3xl text-white">{title}</h2>
        <p className="text-white/40 text-sm mt-1">{sub}</p>
      </div>
    </div>
  )
}

function RankCard({ rank, index, onBuy }) {
  const [hovered, setHovered] = useState(false)
  const fmt = n => n?.toLocaleString('uz-UZ') + " so'm"

  return (
    <div
      className="card-dark rounded-2xl overflow-hidden rank-card cursor-default"
      style={{
        borderColor: hovered ? rank.color + '66' : rank.color + '22',
        animationDelay: `${index * 0.1}s`,
        boxShadow: hovered ? `0 20px 60px ${rank.color}22` : 'none',
        transition: 'all 0.3s'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top bar */}
      <div className="h-1" style={{ background: `linear-gradient(90deg, transparent, ${rank.color}, transparent)` }} />

      <div className="p-6">
        {/* Rank header */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-4xl">{rank.emoji}</span>
          <div>
            <h3 className="font-display text-lg font-bold text-white">{rank.name}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: rank.color }} />
              <span className="text-xs font-mono" style={{ color: rank.color }}>VIP Rank</span>
            </div>
          </div>
        </div>

        {/* Prices */}
        <div className="space-y-2 mb-5">
          {rank.price_month && (
            <div className="flex items-center justify-between bg-white/3 rounded-xl px-4 py-3">
              <span className="text-white/50 text-sm">30 kun</span>
              <span className="text-white font-bold font-mono">{fmt(rank.price_month)}</span>
            </div>
          )}
          {rank.price_life && (
            <div className="flex items-center justify-between rounded-xl px-4 py-3"
                 style={{ background: rank.color + '15', border: `1px solid ${rank.color}30` }}>
              <span className="text-sm" style={{ color: rank.color + 'cc' }}>Umrbod ♾</span>
              <span className="font-bold font-mono" style={{ color: rank.color }}>{fmt(rank.price_life)}</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          {rank.price_month && (
            <button onClick={() => onBuy('month')}
              className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              style={{ background: rank.color + '20', border: `1px solid ${rank.color}40`, color: rank.color }}
              onMouseOver={e => e.currentTarget.style.background = rank.color + '35'}
              onMouseOut={e => e.currentTarget.style.background = rank.color + '20'}>
              30 Kun
            </button>
          )}
          {rank.price_life && (
            <button onClick={() => onBuy('life')}
              className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all"
              style={{ background: rank.color, boxShadow: `0 4px 15px ${rank.color}40` }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}>
              Umrbod
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
