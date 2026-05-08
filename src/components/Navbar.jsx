import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Sword } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = [
    { to: '/#ranks',   label: 'Ranklar' },
    { to: '/#tokens',  label: 'Tokenlar' },
    { to: '/#keys',    label: 'Kalitlar' },
    { to: '/#other',   label: 'Boshqalar' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-obsidian-900/95 backdrop-blur-md border-b border-ember-500/20' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <Sword size={22} className="text-ember-400 group-hover:text-gold-300 transition-colors" />
            <div className="absolute inset-0 blur-sm bg-ember-500/40 group-hover:bg-gold-400/40 transition-all" />
          </div>
          <span className="font-display text-lg font-bold tracking-widest text-white group-hover:text-gold-300 transition-colors">
            ARTI<span className="text-ember-400">CRAFT</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.to} href={l.to} className="nav-link">{l.label}</a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="https://discord.gg/articraft"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono text-white/40 hover:text-white/80 transition-colors tracking-wider"
          >
            play.articraft.uz
          </a>
          <Link to="/admin/login" className="text-xs nav-link opacity-30 hover:opacity-100">Admin</Link>
        </div>

        {/* Mobile burger */}
        <button className="md:hidden text-white/70 hover:text-white" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-obsidian-800/98 backdrop-blur-md border-b border-ember-500/20 px-6 py-4 flex flex-col gap-4">
          {links.map(l => (
            <a key={l.to} href={l.to} className="nav-link" onClick={() => setOpen(false)}>{l.label}</a>
          ))}
        </div>
      )}
    </nav>
  )
}
