'use client'

import Link from 'next/link'
import { IMatch } from '@/models/Match'

interface MatchCommitProps {
  match: IMatch
}

export default function MatchCommit({ match }: MatchCommitProps) {
  const getMatchResult = () => {
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
      case 'WIN': return 'text-neon-green'
      case 'LOSS': return 'text-red-400'
      case 'DRAW': return 'text-neon-orange'
      case 'LIVE': return 'text-neon-blue animate-pulse'
      case 'SCHEDULED': return 'text-cyber-gray'
      case 'CANCELLED': return 'text-red-400'
      default: return 'text-cyber-gray'
    }
  }

  const getResultIcon = () => {
    const result = getMatchResult()
    switch (result) {
      case 'WIN': return '✅'
      case 'LOSS': return '❌'
      case 'DRAW': return '⚖️'
      case 'LIVE': return '🔴'
      case 'SCHEDULED': return '📅'
      case 'CANCELLED': return '🚫'
      default: return '⚽'
    }
  }

  const generateCommitHash = () => {
    return String(match.id).substring(0, 8)
  }

  const formatMatchScore = () => {
    if (match.status === 'scheduled') {
      return `vs ${match.opponent}`
    }
    if (match.status === 'cancelled') {
      return `vs ${match.opponent} (cancelled)`
    }
    return `${match.goalsFor}-${match.goalsAgainst} vs ${match.opponent}`
  }

  const getCommitMessage = () => {
    const result = getMatchResult()
    const score = formatMatchScore()
    
    switch (result) {
      case 'WIN':
        return `Deployed a ${score} victory in ${match.competition}`
      case 'LOSS':
        return `Refactoring needed after a ${score} result in ${match.competition}`
      case 'DRAW':
        return `Merged a ${score} draw in ${match.competition}`
      case 'LIVE':
        return `Currently debugging live match vs ${match.opponent}`
      case 'SCHEDULED':
        return `Scheduled deployment: ${score} in ${match.competition}`
      case 'CANCELLED':
        return `Rollback: ${score} in ${match.competition}`
      default:
        return `Match vs ${match.opponent} in ${match.competition}`
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'just now'
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  return (
    <Link href={`/matches/${match.id}`} className="block hover:bg-cyber-darker/30 transition-colors duration-200 rounded p-4">
      <div className="flex items-start space-x-4">
        {/* Commit Icon and Line */}
        <div className="flex flex-col items-center">
          <div className={`w-3 h-3 rounded-full border-2 ${getResultColor()} bg-current`}></div>
          <div className="w-0.5 h-8 bg-cyber-gray/30 mt-2"></div>
        </div>

        {/* Commit Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-lg">{getResultIcon()}</span>
            <span className={`font-mono text-sm font-bold px-2 py-1 rounded ${getResultColor()} bg-current/20`}>
              [{getMatchResult()}]
            </span>
            <span className="font-mono text-sm text-cyber-gray">
              commit {generateCommitHash()}:
            </span>
          </div>

          <h3 className="text-cyber-light-gray font-mono text-base mb-2 hover:text-neon-green transition-colors duration-200">
            {getCommitMessage()}
          </h3>

          <div className="flex flex-wrap items-center space-x-4 text-sm text-cyber-gray font-mono">
            <span>{formatDate(match.date.toString())}</span>
            <span>{match.isHome ? '🏠 Home' : '✈️ Away'}</span>
            <span>📍 {match.venue}</span>
            {match.attendance && (
              <span>👥 {match.attendance.toLocaleString()}</span>
            )}
          </div>

          {/* Match Stats for completed matches */}
          {match.status === 'completed' && match.playerStats.length > 0 && (
            <div className="mt-3 text-xs font-mono text-cyber-gray">
              <span className="text-neon-blue">stats:</span> {match.playerStats.length} players featured
              {match.playerStats.filter(p => p.goals > 0).length > 0 && (
                <span className="ml-2">
                  ⚽ {match.playerStats.reduce((sum, p) => sum + p.goals, 0)} goals
                </span>
              )}
              {match.playerStats.filter(p => p.assists > 0).length > 0 && (
                <span className="ml-2">
                  🎯 {match.playerStats.reduce((sum, p) => sum + p.assists, 0)} assists
                </span>
              )}
            </div>
          )}
        </div>

        {/* Match Date */}
        <div className="text-right text-xs font-mono text-cyber-gray">
          <div>{new Date(match.date).toLocaleDateString()}</div>
          <div>{new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>
    </Link>
  )
}