'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { IPlayer } from '@/models/Player'

export default function PlayerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [player, setPlayer] = useState<IPlayer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchPlayer(params.id as string)
    }
  }, [params.id])

  const fetchPlayer = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/players/${id}`)
      const data = await response.json()
      
      if (data.success) {
        setPlayer(data.data)
      } else {
        setError('Player not found')
      }
    } catch (err) {
      setError('Failed to load player')
      console.error('Error fetching player:', err)
    } finally {
      setLoading(false)
    }
  }

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'Goalkeeper': return 'text-yellow-400'
      case 'Defender': return 'text-blue-400'
      case 'Midfielder': return 'text-green-400'
      case 'Forward': return 'text-red-400'
      default: return 'text-cyber-light-gray'
    }
  }

  const getDevRoleIcon = (devRole: string) => {
    switch (devRole) {
      case 'Frontend Engineer': return '🎨'
      case 'Backend Engineer': return '⚙️'
      case 'Full-stack Developer': return '🚀'
      case 'DevOps Engineer': return '🔧'
      case 'UI/UX Designer': return '🎯'
      case 'Mobile Developer': return '📱'
      case 'Data Engineer': return '📊'
      case 'QA Engineer': return '🧪'
      case 'Project Manager': return '📋'
      case 'Tech Lead': return '👑'
      case 'Software Architect': return '🏗️'
      default: return '💻'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-dark text-cyber-light-gray">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="code-block rounded-lg p-8 text-center">
            <div className="font-mono text-cyber-gray">
              Loading player data<span className="animate-pulse">...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-cyber-dark text-cyber-light-gray">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="code-block rounded-lg p-8 text-center border-red-500/50">
            <div className="font-mono text-red-400 mb-4">
              Error: {error || 'Player not found'}
            </div>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-neon-green/20 text-neon-green border border-neon-green/30 rounded font-mono hover:bg-neon-green hover:text-cyber-dark transition-all duration-300"
            >
              goBack()
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cyber-dark text-cyber-light-gray">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-8 px-4 py-2 bg-cyber-darker border border-neon-green/30 text-cyber-light-gray rounded font-mono hover:bg-neon-green/10 hover:border-neon-green transition-all duration-300"
        >
          ← back
        </button>

        {/* README Header */}
        <div className="code-block rounded-lg mb-8">
          <div className="bg-cyber-darker/50 px-6 py-3 border-b border-neon-green/20 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-neon-green font-mono">📄</div>
                <h1 className="text-xl font-mono text-neon-green">README.md</h1>
              </div>
              <div className="flex items-center space-x-2 text-xs font-mono text-cyber-gray">
                <span>Joined: {new Date(player.joinedDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Player Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 mb-6">
                {/* Avatar */}
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-neon-green/50 bg-cyber-darker/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {player.avatar ? (
                    <img 
                      src={player.avatar} 
                      alt={player.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl md:text-5xl mb-2">👤</div>
                      <div className="text-xs font-mono text-cyber-gray">No Avatar</div>
                    </div>
                  )}
                </div>
                
                {/* Name and Title */}
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold font-mono text-neon-green mb-2">
                    &lt;{player.name.replace(/\s+/g, '')} /&gt;
                  </h1>
                  <div className="flex items-center space-x-2 text-lg">
                    <span>{getDevRoleIcon(player.devRole)}</span>
                    <span className="font-mono text-cyber-light-gray">{player.devRole}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <span className="px-3 py-1 bg-neon-green/20 text-neon-green rounded-full text-sm font-mono border border-neon-green/30">
                  #{player.shirtNumber}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-mono border ${getPositionColor(player.position)} bg-current/20 border-current/30`}>
                  {player.position}
                </span>
                <span className="px-3 py-1 bg-neon-blue/20 text-neon-blue rounded-full text-sm font-mono border border-neon-blue/30">
                  {player.nationality}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-mono border ${
                  player.isActive 
                    ? 'text-neon-green bg-neon-green/20 border-neon-green/30' 
                    : 'text-red-400 bg-red-400/20 border-red-400/30'
                }`}>
                  {player.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Bio Section */}
            {player.bio && (
              <div className="mb-8">
                <h2 className="text-2xl font-mono text-neon-green mb-4">## About</h2>
                <div className="bg-cyber-darker/30 rounded px-4 py-3 border-l-4 border-neon-blue">
                  <p className="text-cyber-light-gray leading-relaxed">{player.bio}</p>
                </div>
              </div>
            )}

            {/* Stats Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-mono text-neon-green mb-4">## Player Stats</h2>
              <div className="bg-cyber-darker/30 rounded p-4">
                <pre className="font-mono text-sm text-cyber-light-gray">
{`{
  "playerInfo": {
    "name": "${player.name}",
    "age": ${new Date().getFullYear() - (player.birthYear || 0)},
    "nationality": "${player.nationality}",
    "position": "${player.position}",
    "shirtNumber": ${player.shirtNumber}
  },
  "devProfile": {
    "role": "${player.devRole}",
    "joinedDate": "${new Date(player.joinedDate).toISOString().split('T')[0]}"
  },
  "footballStats": {
    "matchesPlayed": ${player.matchesPlayed},
    "goals": ${player.goals},
    "assists": ${player.assists},
    "isActive": ${player.isActive}
  }
}`}
                </pre>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="mb-8">
              <h2 className="text-2xl font-mono text-neon-green mb-4">## Performance Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-cyber-darker/30 rounded p-4 border border-neon-green/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neon-green font-mono">
                      {player.goals}
                    </div>
                    <div className="text-sm text-cyber-gray font-mono">Goals</div>
                  </div>
                </div>
                <div className="bg-cyber-darker/30 rounded p-4 border border-neon-blue/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neon-blue font-mono">
                      {player.assists}
                    </div>
                    <div className="text-sm text-cyber-gray font-mono">Assists</div>
                  </div>
                </div>
                <div className="bg-cyber-darker/30 rounded p-4 border border-neon-orange/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neon-orange font-mono">
                      {player.matchesPlayed}
                    </div>
                    <div className="text-sm text-cyber-gray font-mono">Matches</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mb-8">
              <h2 className="text-2xl font-mono text-neon-green mb-4">## Technical Stack</h2>
              <div className="bg-cyber-darker/30 rounded p-4">
                <div className="font-mono text-sm text-cyber-light-gray">
                  <div className="mb-2">
                    <span className="text-neon-blue">Primary Role:</span> {player.devRole}
                  </div>
                  <div className="mb-2">
                    <span className="text-neon-blue">Field Position:</span> {player.position}
                  </div>
                  <div className="mb-2">
                    <span className="text-neon-blue">Team Experience:</span> {
                      Math.floor((new Date().getTime() - new Date(player.joinedDate).getTime()) / (1000 * 60 * 60 * 24))
                    } days
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-neon-green/20 pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between text-sm font-mono text-cyber-gray">
                <div>
                  <span className="text-neon-green">Created:</span> {new Date(player.joinedDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="text-neon-green">Player ID:</span> {String(player._id)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}