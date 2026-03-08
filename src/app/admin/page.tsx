'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalPlayers: 0,
    activePlayers: 0,
    totalMatches: 0,
    upcomingMatches: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [playersRes, matchesRes] = await Promise.all([
        fetch('/api/players'),
        fetch('/api/matches')
      ])
      
      const playersData = await playersRes.json()
      const matchesData = await matchesRes.json()
      
      if (playersData.success && matchesData.success) {
        setStats({
          totalPlayers: playersData.data.length,
          activePlayers: playersData.data.filter((p: any) => p.isActive).length,
          totalMatches: matchesData.pagination.total,
          upcomingMatches: matchesData.data.filter((m: any) => m.status === 'scheduled').length
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const adminModules = [
    {
      title: 'Player Management',
      description: 'Add, edit, and manage squad members',
      href: '/admin/players',
      icon: '👥',
      stats: `${stats.activePlayers}/${stats.totalPlayers} active`,
      color: 'neon-green'
    },
    {
      title: 'Match Management',
      description: 'Schedule and manage team matches',
      href: '/admin/matches',
      icon: '⚽',
      stats: `${stats.upcomingMatches} upcoming`,
      color: 'neon-blue'
    },
    {
      title: 'Team Management',
      description: 'Edit team info, cover photo, and biography',
      href: '/admin/team',
      icon: '🏆',
      stats: 'Team profile',
      color: 'neon-orange'
    },
    {
      title: 'Team Statistics',
      description: 'View comprehensive team analytics',
      href: '/admin/stats',
      icon: '📊',
      stats: 'Coming soon',
      color: 'neon-pink'
    },
    {
      title: 'System Settings',
      description: 'Configure application settings',
      href: '/admin/settings',
      icon: '⚙️',
      stats: 'System config',
      color: 'cyber-gray'
    }
  ]

  return (
    <div className="min-h-screen bg-cyber-dark text-cyber-light-gray">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold font-mono text-neon-green mb-4">
            <span className="text-cyber-gray">// </span>ADMIN_PANEL
          </h1>
          <p className="text-xl text-cyber-gray font-mono">
            System administration and team management
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="code-block rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">👥</div>
              <div className="text-right">
                <div className="text-2xl font-bold text-neon-green font-mono">
                  {loading ? '...' : stats.totalPlayers}
                </div>
                <div className="text-xs text-cyber-gray font-mono">Total Players</div>
              </div>
            </div>
            <div className="text-sm font-mono text-cyber-gray">
              <span className="text-neon-green">{stats.activePlayers}</span> active
            </div>
          </div>

          <div className="code-block rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">⚽</div>
              <div className="text-right">
                <div className="text-2xl font-bold text-neon-blue font-mono">
                  {loading ? '...' : stats.totalMatches}
                </div>
                <div className="text-xs text-cyber-gray font-mono">Total Matches</div>
              </div>
            </div>
            <div className="text-sm font-mono text-cyber-gray">
              <span className="text-neon-blue">{stats.upcomingMatches}</span> upcoming
            </div>
          </div>

          <div className="code-block rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">🚀</div>
              <div className="text-right">
                <div className="text-2xl font-bold text-neon-orange font-mono">
                  24/7
                </div>
                <div className="text-xs text-cyber-gray font-mono">System Status</div>
              </div>
            </div>
            <div className="text-sm font-mono text-cyber-gray">
              <span className="text-neon-green">●</span> operational
            </div>
          </div>

          <div className="code-block rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">💻</div>
              <div className="text-right">
                <div className="text-2xl font-bold text-neon-pink font-mono">
                  v1.0
                </div>
                <div className="text-xs text-cyber-gray font-mono">FC Coder</div>
              </div>
            </div>
            <div className="text-sm font-mono text-cyber-gray">
              <span className="text-neon-pink">●</span> latest build
            </div>
          </div>
        </div>

        {/* Admin Modules */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold font-mono text-neon-green mb-8">
            <span className="text-cyber-gray">// </span>ADMIN_MODULES
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminModules.map((module) => (
              <Link
                key={module.href}
                href={module.href}
                className="block group"
              >
                <div className="code-block rounded-lg p-6 hover:scale-105 transition-all duration-300 group-hover:neon-border border-transparent">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">{module.icon}</div>
                    <div className={`text-sm font-mono px-2 py-1 rounded bg-${module.color}/20 text-${module.color} border border-${module.color}/30`}>
                      {module.stats}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-mono font-bold text-neon-green mb-2 group-hover:text-neon-blue transition-colors duration-300">
                    {module.title}
                  </h3>
                  
                  <p className="text-cyber-gray text-sm leading-relaxed mb-4">
                    {module.description}
                  </p>
                  
                  <div className="flex items-center text-sm font-mono text-cyber-gray group-hover:text-neon-green transition-colors duration-300">
                    <span className="mr-2">$</span>
                    <span>cd {module.href}</span>
                    <span className="ml-auto">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions Terminal */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold font-mono text-neon-green mb-8">
            <span className="text-cyber-gray">// </span>QUICK_ACTIONS
          </h2>
          
          <div className="code-block rounded-lg p-6">
            <div className="flex items-center mb-4 pb-2 border-b border-neon-green/20">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="ml-4 text-sm text-cyber-gray font-mono">
                admin-terminal — fc-coder@localhost
              </span>
            </div>
            
            <div className="space-y-3 font-mono text-sm">
              <div className="flex items-center text-cyber-light-gray">
                <span className="text-cyber-gray mr-2">$</span>
                <Link href="/admin/players" className="hover:text-neon-green transition-colors duration-200">
                  ./manage-players --add-new
                </Link>
              </div>
              <div className="flex items-center text-cyber-light-gray">
                <span className="text-cyber-gray mr-2">$</span>
                <Link href="/admin/matches" className="hover:text-neon-green transition-colors duration-200">
                  ./schedule-match --upcoming
                </Link>
              </div>
              <div className="flex items-center text-cyber-light-gray">
                <span className="text-cyber-gray mr-2">$</span>
                <span className="text-cyber-gray">./backup-database --auto</span>
              </div>
              <div className="flex items-center text-cyber-light-gray">
                <span className="text-cyber-gray mr-2">$</span>
                <span className="text-cyber-gray">./generate-reports --monthly</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="border-t border-neon-green/20 pt-8">
          <div className="text-center text-sm font-mono text-cyber-gray">
            <p>
              <span className="text-neon-green">System:</span> FC Coder Management v1.0.0
              <span className="mx-4">|</span>
              <span className="text-neon-blue">Node:</span> Runtime Active
              <span className="mx-4">|</span>
              <span className="text-neon-orange">DB:</span> DynamoDB Connected
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}