import React, { useEffect, useRef } from 'react'

export default function Particles() {
  const ref = useRef()

  useEffect(() => {
    const container = ref.current
    const colors = ['#ff6b35','#ffd700','#b366ff','#ff4500']
    const particles = []

    for (let i = 0; i < 25; i++) {
      const p = document.createElement('div')
      const size = Math.random() * 4 + 1
      const color = colors[Math.floor(Math.random() * colors.length)]
      p.className = 'particle'
      p.style.cssText = `
        width:${size}px; height:${size}px;
        background:${color};
        left:${Math.random() * 100}%;
        animation-duration:${Math.random() * 15 + 10}s;
        animation-delay:${Math.random() * -20}s;
        opacity:0.4;
        box-shadow: 0 0 ${size*2}px ${color};
      `
      container.appendChild(p)
      particles.push(p)
    }
    return () => particles.forEach(p => p.remove())
  }, [])

  return <div ref={ref} className="fixed inset-0 overflow-hidden pointer-events-none z-0" />
}
