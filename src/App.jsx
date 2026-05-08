import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Particles from './components/Particles'
import DonatePage from './pages/DonatePage'
import SuccessPage from './pages/SuccessPage'
import AdminLogin from './pages/AdminLogin'
import AdminPanel from './pages/AdminPanel'

function App() {
  return (
    <div className="min-h-screen" style={{ background: '#050508' }}>
      <Particles />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f0f18',
            color: '#e8e0d4',
            border: '1px solid rgba(255,107,53,0.3)',
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 600,
          },
          success: { iconTheme: { primary: '#ff6b35', secondary: '#050508' } },
          error:   { iconTheme: { primary: '#ff4444', secondary: '#050508' } },
        }}
      />
      <Routes>
        <Route path="/" element={<><Navbar /><DonatePage /></>} />
        <Route path="/donate" element={<Navigate to="/" />} />
        <Route path="/donate/success" element={<><Navbar /><SuccessPage /></>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminPanel />} />
      </Routes>
    </div>
  )
}

export default App
