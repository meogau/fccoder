'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import TerminalCommand from '@/components/TerminalCommand'
import GlitchText from '@/components/GlitchText'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Show form after terminal animation
    const timer = setTimeout(() => setShowForm(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('fc-coder-token', data.token)
        // Use window.location.href to ensure a full page reload with the new token
        window.location.href = '/admin'
      } else {
        setError('Invalid credentials. Please try again.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handleTerminalComplete = () => {
    setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-cyber-dark text-cyber-light-gray">
      <Navbar />

      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <GlitchText 
              text="ADMIN ACCESS"
              className="text-4xl font-bold text-neon-green mb-4"
              glitchIntensity="medium"
              triggerGlitch={true}
            />
            <p className="font-mono text-cyber-gray">
              <span className="text-neon-blue">//</span> Restricted Area - Authorization Required
            </p>
          </div>

          {/* Terminal Simulation */}
          <div className="code-block rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4 pb-2 border-b border-neon-green/20">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="ml-4 text-sm text-cyber-gray font-mono">
                security-terminal — fc-coder@localhost
              </span>
            </div>
            
            <div className="space-y-3">
              <TerminalCommand
                command="sudo ./authenticate --admin"
                response="🔐 Admin authentication required"
                onComplete={handleTerminalComplete}
              />
              
              {showForm && (
                <div className="mt-4 text-sm font-mono text-cyber-gray">
                  <div>📋 Please provide your credentials</div>
                  <div className="text-neon-green">✓ Security protocols active</div>
                </div>
              )}
            </div>
          </div>

          {/* Login Form */}
          {showForm && (
            <div className="code-block rounded-lg p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-mono text-cyber-gray mb-2">
                    <span className="text-neon-blue">email:</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray placeholder-cyber-gray focus:border-neon-green focus:outline-none focus:ring-1 focus:ring-neon-green"
                    placeholder="admin@fccoder.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-cyber-gray mb-2">
                    <span className="text-neon-blue">password:</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray placeholder-cyber-gray focus:border-neon-green focus:outline-none focus:ring-1 focus:ring-neon-green"
                    placeholder="Enter admin password"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded p-3">
                    <div className="font-mono text-red-400 text-sm">
                      <span className="mr-2">❌</span>
                      {error}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-neon-green text-cyber-dark font-mono font-bold rounded hover:bg-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-green focus:ring-offset-2 focus:ring-offset-cyber-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'authenticating...' : './login()'}
                </button>
              </form>
            </div>
          )}


          {/* Security Notice */}
          <div className="text-center text-xs font-mono text-cyber-gray">
            <p>
              <span className="text-red-400">⚠️</span> Unauthorized access is prohibited
            </p>
            <p className="mt-1">
              <span className="text-neon-green">🔒</span> All activities are logged
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}