'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { IMatch } from '@/models/Match'
import { IPlayer } from '@/models/Player'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminMatchesPage() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<IMatch[]>([])
  const [players, setPlayers] = useState<IPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    opponent: '',
    date: '',
    venue: '',
    isHome: true,
    competition: '',
    status: 'scheduled' as 'scheduled' | 'live' | 'completed' | 'cancelled',
    goalsFor: 0,
    goalsAgainst: 0,
    playerStats: [] as Array<{
      playerId: string
      minutesPlayed: number
      goals: number
      assists: number
      isStarter: boolean
    }>
  })

  useEffect(() => {
    if (user) {
      fetchMatches()
      fetchPlayers()
    }
  }, [user])

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches?limit=50&sort=date&order=desc')
      const data = await response.json()
      if (data.success) {
        setMatches(data.data)
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players?isActive=true')
      const data = await response.json()
      if (data.success) {
        setPlayers(data.data)
      }
    } catch (error) {
      console.error('Error fetching players:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation for completed matches
    if (formData.status === 'completed') {
      if (formData.goalsFor < 0 || formData.goalsAgainst < 0) {
        alert('Goals cannot be negative')
        return
      }
    }
    
    try {
      const response = await fetch('/api/matches/protected', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fc-coder-token')}`
        },
        body: JSON.stringify({
          ...formData,
          date: new Date(formData.date).toISOString()
        })
      })

      const data = await response.json()
      if (data.success) {
        resetForm()
        setShowAddForm(false)
        fetchMatches()
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error adding match:', error)
      alert('Failed to add match')
    }
  }

  const resetForm = () => {
    setFormData({
      opponent: '',
      date: '',
      venue: '',
      isHome: true,
      competition: '',
      status: 'scheduled',
      goalsFor: 0,
      goalsAgainst: 0,
      playerStats: []
    })
  }

  const addPlayerStat = () => {
    setFormData(prev => ({
      ...prev,
      playerStats: [...prev.playerStats, {
        playerId: '',
        minutesPlayed: 0,
        goals: 0,
        assists: 0,
        isStarter: false
      }]
    }))
  }

  const removePlayerStat = (index: number) => {
    setFormData(prev => ({
      ...prev,
      playerStats: prev.playerStats.filter((_, i) => i !== index)
    }))
  }

  const updatePlayerStat = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      playerStats: prev.playerStats.map((stat, i) => 
        i === index ? { ...stat, [field]: value } : stat
      )
    }))
  }

  const getMatchResult = (match: IMatch) => {
    if (match.status !== 'completed') return match.status.toUpperCase()
    if (match.goalsFor > match.goalsAgainst) return 'WIN'
    if (match.goalsFor < match.goalsAgainst) return 'LOSS'
    return 'DRAW'
  }

  const getResultColor = (result: string) => {
    switch (result) {
      case 'WIN': return 'text-neon-green bg-neon-green/20 border-neon-green/30'
      case 'LOSS': return 'text-red-400 bg-red-400/20 border-red-400/30'
      case 'DRAW': return 'text-neon-orange bg-neon-orange/20 border-neon-orange/30'
      case 'LIVE': return 'text-neon-blue bg-neon-blue/20 border-neon-blue/30 animate-pulse'
      default: return 'text-cyber-gray bg-cyber-gray/20 border-cyber-gray/30'
    }
  }

  if (!user) {
    return <div>Please login to access this page</div>
  }

  return (
    <div className="min-h-screen bg-cyber-dark text-cyber-light-gray">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="text-cyber-gray hover:text-neon-green font-mono text-sm mb-2 inline-block">
              ← back to admin
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold font-mono text-neon-green">
              <span className="text-cyber-gray">// </span>MATCH_MANAGEMENT
            </h1>
            <p className="text-cyber-gray font-mono mt-2">
              Schedule matches and record results
            </p>
          </div>
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-neon-green text-cyber-dark font-mono font-bold rounded hover:bg-neon-blue transition-all duration-300"
          >
            {showAddForm ? 'cancel()' : 'addMatch()'}
          </button>
        </div>

        {/* Add Match Form */}
        {showAddForm && (
          <div className="code-block rounded-lg p-6 mb-8">
            <h2 className="text-xl font-mono text-neon-green mb-6">
              <span className="text-cyber-gray">// </span>ADD_NEW_MATCH
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Match Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-mono text-cyber-gray mb-2">
                    <span className="text-neon-blue">opponent:</span>
                  </label>
                  <input
                    type="text"
                    value={formData.opponent}
                    onChange={(e) => setFormData(prev => ({ ...prev, opponent: e.target.value }))}
                    required
                    className="w-full px-4 py-2 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
                    placeholder="Team name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-cyber-gray mb-2">
                    <span className="text-neon-blue">date:</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                    className="w-full px-4 py-2 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-cyber-gray mb-2">
                    <span className="text-neon-blue">venue:</span>
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                    required
                    className="w-full px-4 py-2 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
                    placeholder="Stadium name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-cyber-gray mb-2">
                    <span className="text-neon-blue">competition:</span>
                  </label>
                  <input
                    type="text"
                    value={formData.competition}
                    onChange={(e) => setFormData(prev => ({ ...prev, competition: e.target.value }))}
                    required
                    className="w-full px-4 py-2 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
                    placeholder="League or tournament name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-cyber-gray mb-2">
                    <span className="text-neon-blue">location:</span>
                  </label>
                  <select
                    value={formData.isHome.toString()}
                    onChange={(e) => setFormData(prev => ({ ...prev, isHome: e.target.value === 'true' }))}
                    className="w-full px-4 py-2 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
                  >
                    <option value="true">Home</option>
                    <option value="false">Away</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-mono text-cyber-gray mb-2">
                    <span className="text-neon-blue">status:</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-4 py-2 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Score (only if completed or live) */}
              {(formData.status === 'completed' || formData.status === 'live') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-mono text-cyber-gray mb-2">
                      <span className="text-neon-blue">goalsFor:</span>
                      {formData.status === 'completed' && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <input
                      type="number"
                      value={formData.goalsFor}
                      onChange={(e) => setFormData(prev => ({ ...prev, goalsFor: parseInt(e.target.value) || 0 }))}
                      min="0"
                      required={formData.status === 'completed'}
                      className="w-full px-4 py-2 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-mono text-cyber-gray mb-2">
                      <span className="text-neon-blue">goalsAgainst:</span>
                      {formData.status === 'completed' && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <input
                      type="number"
                      value={formData.goalsAgainst}
                      onChange={(e) => setFormData(prev => ({ ...prev, goalsAgainst: parseInt(e.target.value) || 0 }))}
                      min="0"
                      required={formData.status === 'completed'}
                      className="w-full px-4 py-2 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Helper Info */}
              {formData.status === 'completed' && (
                <div className="bg-neon-blue/10 border border-neon-blue/30 rounded p-4">
                  <div className="font-mono text-neon-blue text-sm">
                    <span className="mr-2">💡</span>
                    Tip: For completed matches, add player statistics below to automatically update player profiles.
                  </div>
                </div>
              )}

              {/* Player Stats */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-mono text-neon-green">
                    <span className="text-cyber-gray">// </span>PLAYER_STATS
                  </h3>
                  <button
                    type="button"
                    onClick={addPlayerStat}
                    className="px-4 py-2 bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded font-mono hover:bg-neon-blue/30 transition-all duration-300"
                  >
                    addPlayer()
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.playerStats.map((stat, index) => (
                    <div key={index} className="bg-cyber-darker/30 rounded p-4 border border-neon-green/10">
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <div className="col-span-2">
                          <label className="block text-xs font-mono text-cyber-gray mb-1">Player</label>
                          <select
                            value={stat.playerId}
                            onChange={(e) => updatePlayerStat(index, 'playerId', e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
                          >
                            <option value="">Select player</option>
                            {players.map(player => (
                              <option key={player._id} value={player._id}>
                                #{player.shirtNumber} {player.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-mono text-cyber-gray mb-1">Minutes</label>
                          <input
                            type="number"
                            value={stat.minutesPlayed}
                            onChange={(e) => updatePlayerStat(index, 'minutesPlayed', parseInt(e.target.value) || 0)}
                            min="0"
                            max="120"
                            className="w-full px-3 py-2 text-sm bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono text-cyber-gray mb-1">Goals</label>
                          <input
                            type="number"
                            value={stat.goals}
                            onChange={(e) => updatePlayerStat(index, 'goals', parseInt(e.target.value) || 0)}
                            min="0"
                            className="w-full px-3 py-2 text-sm bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono text-cyber-gray mb-1">Assists</label>
                          <input
                            type="number"
                            value={stat.assists}
                            onChange={(e) => updatePlayerStat(index, 'assists', parseInt(e.target.value) || 0)}
                            min="0"
                            className="w-full px-3 py-2 text-sm bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removePlayerStat(index)}
                            className="w-full px-3 py-2 text-sm bg-red-500/20 text-red-400 border border-red-500/30 rounded font-mono hover:bg-red-500/30 transition-all duration-300"
                          >
                            remove()
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-neon-green text-cyber-dark font-mono font-bold rounded hover:bg-neon-blue transition-all duration-300"
                >
                  create()
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm()
                    setShowAddForm(false)
                  }}
                  className="px-6 py-2 bg-cyber-darker border border-red-400/30 text-red-400 font-mono rounded hover:bg-red-400/10 transition-all duration-300"
                >
                  cancel()
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Matches List */}
        <div className="code-block rounded-lg">
          <div className="bg-cyber-darker/50 px-6 py-3 border-b border-neon-green/20 rounded-t-lg">
            <h2 className="text-xl font-mono text-neon-green">
              <span className="text-cyber-gray">// </span>MATCH_HISTORY ({matches.length})
            </h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="font-mono text-cyber-gray">
                  Loading matches<span className="animate-pulse">...</span>
                </div>
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-8">
                <div className="font-mono text-cyber-gray">
                  No matches found. Schedule your first match!
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => {
                  const result = getMatchResult(match)
                  return (
                    <div key={match._id} className="flex items-center justify-between p-4 bg-cyber-darker/30 rounded border border-neon-green/10 hover:border-neon-green/30 transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className={`px-3 py-1 rounded text-xs font-mono border ${getResultColor(result)}`}>
                          {result}
                        </div>
                        
                        <div>
                          <h3 className="font-mono font-bold text-neon-green">
                            FC Coder vs {match.opponent}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm font-mono text-cyber-gray">
                            <span>{new Date(match.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{match.venue}</span>
                            <span>•</span>
                            <span>{match.competition}</span>
                            <span>•</span>
                            <span>{match.isHome ? '🏠 Home' : '✈️ Away'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm font-mono text-cyber-gray">
                        {match.status === 'completed' && (
                          <div className="text-right">
                            <div className="text-lg font-bold text-neon-green">
                              {match.goalsFor} - {match.goalsAgainst}
                            </div>
                          </div>
                        )}
                        <div className="text-xs">
                          {match.playerStats.length} players
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}