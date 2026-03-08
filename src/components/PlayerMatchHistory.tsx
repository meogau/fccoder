'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface PlayerStat {
  playerId: string
  goals: number
  assists: number
  yellowCards: number
  redCards: number
  isStarter: boolean
}

interface Match {
  id: string
  opponent: string
  date: string
  venue: string
  isHome: boolean
  goalsFor: number
  goalsAgainst: number
  status: 'scheduled' | 'live' | 'completed' | 'cancelled'
  competition: string
  playerStats: PlayerStat[]
}

interface PlayerMatchHistoryProps {
  playerId: string
}

export default function PlayerMatchHistory({ playerId }: PlayerMatchHistoryProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPlayerMatches()
  }, [playerId])

  const fetchPlayerMatches = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/players/${playerId}/matches`)
      const data = await response.json()

      if (data.success) {
        setMatches(data.data)
      } else {
        setError('Failed to load match history')
      }
    } catch (err) {
      setError('Failed to load match history')
      console.error('Error fetching player matches:', err)
    } finally {
      setLoading(false)
    }
  }

  const getPlayerStats = (match: Match): PlayerStat | undefined => {
    return match.playerStats.find(stat => stat.playerId === playerId)
  }

  const getMatchResult = (match: Match): 'WIN' | 'DRAW' | 'LOSS' | 'SCHEDULED' | 'CANCELLED' => {
    if (match.status === 'scheduled') return 'SCHEDULED'
    if (match.status === 'cancelled') return 'CANCELLED'
    if (match.goalsFor > match.goalsAgainst) return 'WIN'
    if (match.goalsFor < match.goalsAgainst) return 'LOSS'
    return 'DRAW'
  }

  const getResultColor = (result: string) => {
    switch (result) {
      case 'WIN': return 'text-neon-green bg-neon-green/20 border-neon-green/30'
      case 'LOSS': return 'text-red-400 bg-red-400/20 border-red-400/30'
      case 'DRAW': return 'text-neon-orange bg-neon-orange/20 border-neon-orange/30'
      case 'SCHEDULED': return 'text-cyber-gray bg-cyber-gray/20 border-cyber-gray/30'
      case 'CANCELLED': return 'text-red-400 bg-red-400/20 border-red-400/30'
      default: return 'text-cyber-gray bg-cyber-gray/20 border-cyber-gray/30'
    }
  }

  if (loading) {
    return (
      <div className="code-block rounded-lg p-8 text-center">
        <div className="font-mono text-cyber-gray">
          Loading match history<span className="animate-pulse">...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="code-block rounded-lg p-8 text-center border-red-500/50">
        <div className="font-mono text-red-400">
          Error: {error}
        </div>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="code-block rounded-lg p-8 text-center">
        <div className="font-mono text-cyber-gray">
          No match history available
        </div>
      </div>
    )
  }

  return (
    <div className="code-block rounded-lg">
      <div className="bg-cyber-darker/50 px-6 py-3 border-b border-neon-green/20 rounded-t-lg">
        <h2 className="text-xl font-mono text-neon-green">
          <span className="text-cyber-gray">// </span>MATCH_HISTORY ({matches.length} matches)
        </h2>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {matches.map((match) => {
            const playerStats = getPlayerStats(match)
            const result = getMatchResult(match)

            return (
              <Link
                key={match.id}
                href={`/matches/${match.id}`}
                className="block group"
              >
                <div className="bg-cyber-darker/30 rounded p-4 border border-neon-green/10 hover:border-neon-green/30 transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-mono font-bold text-neon-green group-hover:text-neon-blue transition-colors">
                          vs {match.opponent}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-mono border ${getResultColor(result)}`}>
                          {result}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-xs font-mono text-cyber-gray">
                        <span>
                          <span className="text-neon-blue">date:</span> {new Date(match.date).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>
                          <span className="text-neon-blue">venue:</span> {match.isHome ? '🏠' : '✈️'} {match.venue}
                        </span>
                        <span>•</span>
                        <span>
                          <span className="text-neon-blue">competition:</span> {match.competition}
                        </span>
                      </div>
                    </div>

                    {match.status === 'completed' && (
                      <div className="text-right">
                        <div className="text-2xl font-mono font-bold">
                          <span className={match.goalsFor > match.goalsAgainst ? 'text-neon-green' : 'text-cyber-light-gray'}>
                            {match.goalsFor}
                          </span>
                          <span className="text-cyber-gray mx-2">-</span>
                          <span className={match.goalsAgainst > match.goalsFor ? 'text-red-400' : 'text-cyber-light-gray'}>
                            {match.goalsAgainst}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Player Performance in this Match */}
                  {playerStats && match.status === 'completed' && (
                    <div className="mt-3 pt-3 border-t border-neon-green/10">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        {/* Goals & Assists - Highlighted Section */}
                        <div className="flex items-center gap-2">
                          <div className="bg-neon-green/10 border border-neon-green/30 rounded px-3 py-1 flex items-center space-x-2">
                            <span className="text-base">⚽</span>
                            <div>
                              <div className="text-[10px] font-mono text-neon-blue uppercase">Goals</div>
                              <div className="text-lg font-mono font-bold text-neon-green leading-none">
                                {playerStats.goals}
                              </div>
                            </div>
                          </div>

                          <div className="bg-neon-blue/10 border border-neon-blue/30 rounded px-3 py-1 flex items-center space-x-2">
                            <span className="text-base">🎯</span>
                            <div>
                              <div className="text-[10px] font-mono text-neon-blue uppercase">Assists</div>
                              <div className="text-lg font-mono font-bold text-neon-blue leading-none">
                                {playerStats.assists}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Additional Stats */}
                        <div className="flex items-center space-x-2 text-xs font-mono text-cyber-gray">
                          {playerStats.isStarter && (
                            <div className="flex items-center space-x-1 bg-cyber-darker/50 px-2 py-0.5 rounded border border-neon-green/20">
                              <span className="text-neon-green text-xs">⭐</span>
                              <span className="text-neon-green text-[10px]">STARTER</span>
                            </div>
                          )}

                          {playerStats.yellowCards > 0 && (
                            <div className="flex items-center space-x-1 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/30">
                              <span className="text-xs">🟨</span>
                              <span className="text-yellow-400 text-[10px]">{playerStats.yellowCards}</span>
                            </div>
                          )}

                          {playerStats.redCards > 0 && (
                            <div className="flex items-center space-x-1 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/30">
                              <span className="text-xs">🟥</span>
                              <span className="text-red-400 text-[10px]">{playerStats.redCards}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
