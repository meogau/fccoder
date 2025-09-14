'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { IMatch } from '@/models/Match'
import { IPlayer } from '@/models/Player'

interface PlayerStat {
  playerId: IPlayer
  goals: number
  assists: number
  isStarter: boolean
}

export default function MatchDetailsPage() {
  const params = useParams()
  const matchId = params.id as string
  const [match, setMatch] = useState<IMatch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (matchId) {
      fetchMatchDetails()
    }
  }, [matchId])

  const fetchMatchDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/matches/${matchId}`)
      const data = await response.json()
      
      if (data.success) {
        setMatch(data.data)
      } else {
        setError('Match not found')
      }
    } catch (err) {
      setError('Failed to load match details')
      console.error('Error fetching match details:', err)
    } finally {
      setLoading(false)
    }
  }

  const getMatchResult = () => {
    if (!match) return 'UNKNOWN'
    if (match.status === 'scheduled') return 'SCHEDULED'
    if (match.status === 'live') return 'LIVE'
    if (match.status === 'cancelled') return 'CANCELLED'
    
    if (match.goalsFor > match.goalsAgainst) return 'WIN'
    if (match.goalsFor < match.goalsAgainst) return 'LOSS'
    return 'DRAW'
  }

  const getResultColor = () => {
    const result = getMatchResult()
    switch (result) {
      case 'WIN': return 'text-neon-green bg-neon-green/20 border-neon-green/30'
      case 'LOSS': return 'text-red-400 bg-red-400/20 border-red-400/30'
      case 'DRAW': return 'text-neon-orange bg-neon-orange/20 border-neon-orange/30'
      case 'LIVE': return 'text-neon-blue bg-neon-blue/20 border-neon-blue/30 animate-pulse'
      case 'SCHEDULED': return 'text-cyber-gray bg-cyber-gray/20 border-cyber-gray/30'
      case 'CANCELLED': return 'text-red-400 bg-red-400/20 border-red-400/30'
      default: return 'text-cyber-gray bg-cyber-gray/20 border-cyber-gray/30'
    }
  }

  const getGoalscorers = () => {
    if (!match) return []
    return match.playerStats
      .filter(stat => stat.goals > 0)
      .map(stat => ({
        player: stat.playerId as unknown as IPlayer,
        goals: stat.goals
      }))
  }

  const getAssists = () => {
    if (!match) return []
    return match.playerStats
      .filter(stat => stat.assists > 0)
      .map(stat => ({
        player: stat.playerId as unknown as IPlayer,
        assists: stat.assists
      }))
  }

  const getPlayersList = () => {
    if (!match) return []
    return match.playerStats
      .filter(stat => stat.goals > 0 || stat.assists > 0 || stat.isStarter)
      .sort((a, b) => (b.isStarter ? 1 : 0) - (a.isStarter ? 1 : 0))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-dark text-cyber-light-gray">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="code-block rounded-lg p-8">
              <div className="font-mono text-cyber-gray">
                Loading match details<span className="animate-pulse">...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-cyber-dark text-cyber-light-gray">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="code-block rounded-lg p-8 border-red-500/50">
              <div className="font-mono text-red-400 mb-4">
                Error: {error}
              </div>
              <Link 
                href="/matches"
                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded font-mono hover:bg-red-500 hover:text-white transition-all duration-300"
              >
                ← Back to matches
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cyber-dark text-cyber-light-gray">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/matches" 
            className="text-cyber-gray hover:text-neon-green font-mono text-sm mb-4 inline-block"
          >
            ← back to matches
          </Link>
          
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl md:text-4xl font-bold font-mono text-neon-green">
              <span className="text-cyber-gray">// </span>MATCH_DETAILS
            </h1>
            <div className={`px-4 py-2 rounded font-mono text-sm border ${getResultColor()}`}>
              {getMatchResult()}
            </div>
          </div>
        </div>

        {/* Match Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Match Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Score Card */}
            <div className="code-block rounded-lg p-6">
              <h2 className="text-xl font-mono text-neon-green mb-6">
                <span className="text-cyber-gray">// </span>MATCH_INFO
              </h2>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-mono font-bold text-neon-green mb-2">
                  FC CODER vs {match.opponent}
                </h3>
                
                {match.status === 'completed' && (
                  <div className="text-4xl font-mono font-bold text-cyber-light-gray mb-4">
                    <span className={match.goalsFor > match.goalsAgainst ? 'text-neon-green' : 'text-cyber-light-gray'}>
                      {match.goalsFor}
                    </span>
                    <span className="text-cyber-gray mx-4">-</span>
                    <span className={match.goalsAgainst > match.goalsFor ? 'text-red-400' : 'text-cyber-light-gray'}>
                      {match.goalsAgainst}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm font-mono text-cyber-gray">
                <div className="space-y-2">
                  <div><span className="text-neon-blue">date:</span> {new Date(match.date).toLocaleDateString()}</div>
                  <div><span className="text-neon-blue">time:</span> {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div><span className="text-neon-blue">venue:</span> {match.venue}</div>
                </div>
                <div className="space-y-2">
                  <div><span className="text-neon-blue">competition:</span> {match.competition}</div>
                  <div><span className="text-neon-blue">location:</span> {match.isHome ? '🏠 Home' : '✈️ Away'}</div>
                  <div><span className="text-neon-blue">status:</span> {match.status}</div>
                </div>
              </div>
            </div>

            {/* Goalscorers */}
            {match.status === 'completed' && getGoalscorers().length > 0 && (
              <div className="code-block rounded-lg p-6">
                <h2 className="text-xl font-mono text-neon-green mb-6">
                  <span className="text-cyber-gray">// </span>GOALSCORERS
                </h2>
                
                <div className="space-y-3">
                  {getGoalscorers().map((scorer, index) => (
                    <div key={index} className="flex items-center space-x-4 bg-cyber-darker/30 rounded p-3">
                      <div className="w-8 h-8 bg-neon-green/20 rounded-full flex items-center justify-center border border-neon-green/50">
                        <span className="text-neon-green font-mono font-bold text-sm">
                          {scorer.player.shirtNumber}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-mono font-bold text-neon-green">
                          {scorer.player.name}
                        </div>
                        <div className="text-sm font-mono text-cyber-gray">
                          {scorer.player.position} • {scorer.player.devRole}
                        </div>
                      </div>
                      <div className="font-mono text-neon-green">
                        ⚽ {scorer.goals} {scorer.goals === 1 ? 'goal' : 'goals'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assists */}
            {match.status === 'completed' && getAssists().length > 0 && (
              <div className="code-block rounded-lg p-6">
                <h2 className="text-xl font-mono text-neon-green mb-6">
                  <span className="text-cyber-gray">// </span>ASSISTS
                </h2>
                
                <div className="space-y-3">
                  {getAssists().map((assister, index) => (
                    <div key={index} className="flex items-center space-x-4 bg-cyber-darker/30 rounded p-3">
                      <div className="w-8 h-8 bg-neon-blue/20 rounded-full flex items-center justify-center border border-neon-blue/50">
                        <span className="text-neon-blue font-mono font-bold text-sm">
                          {assister.player.shirtNumber}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-mono font-bold text-neon-blue">
                          {assister.player.name}
                        </div>
                        <div className="text-sm font-mono text-cyber-gray">
                          {assister.player.position} • {assister.player.devRole}
                        </div>
                      </div>
                      <div className="font-mono text-neon-blue">
                        🎯 {assister.assists} {assister.assists === 1 ? 'assist' : 'assists'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Squad List */}
          <div className="space-y-6">
            {match.playerStats.length > 0 && (
              <div className="code-block rounded-lg p-6">
                <h2 className="text-xl font-mono text-neon-green mb-6">
                  <span className="text-cyber-gray">// </span>SQUAD ({getPlayersList().length})
                </h2>
                
                <div className="space-y-3">
                  {getPlayersList().map((stat) => {
                    const player = stat.playerId as unknown as IPlayer
                    return (
                      <div key={String(stat.playerId._id)} className="flex items-center space-x-3 bg-cyber-darker/30 rounded p-3">
                        <div className="w-6 h-6 bg-neon-green/20 rounded-full flex items-center justify-center border border-neon-green/50">
                          <span className="text-neon-green font-mono font-bold text-xs">
                            {player.shirtNumber}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-mono font-bold text-cyber-light-gray text-sm">
                            {player.name}
                            {stat.isStarter && (
                              <span className="ml-2 text-neon-green text-xs">[C]</span>
                            )}
                          </div>
                          <div className="text-xs font-mono text-cyber-gray">
                            {player.position} • #{player.shirtNumber}
                          </div>
                        </div>
                        
                        <div className="text-xs font-mono text-cyber-gray">
                          {stat.goals > 0 && <span className="text-neon-green mr-1">⚽{stat.goals}</span>}
                          {stat.assists > 0 && <span className="text-neon-blue">🎯{stat.assists}</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Match Stats Summary */}
            {match.status === 'completed' && (
              <div className="code-block rounded-lg p-6">
                <h2 className="text-xl font-mono text-neon-green mb-6">
                  <span className="text-cyber-gray">// </span>STATS_SUMMARY
                </h2>
                
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-neon-blue">total_goals:</span>
                    <span className="text-neon-green">{match.goalsFor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neon-blue">total_assists:</span>
                    <span className="text-neon-green">{match.playerStats.reduce((sum, p) => sum + p.assists, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neon-blue">players_featured:</span>
                    <span className="text-neon-green">{getPlayersList().length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neon-blue">result:</span>
                    <span className={getMatchResult() === 'WIN' ? 'text-neon-green' : getMatchResult() === 'LOSS' ? 'text-red-400' : 'text-neon-orange'}>
                      {getMatchResult()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}