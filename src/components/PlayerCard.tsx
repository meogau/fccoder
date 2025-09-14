'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IPlayer } from '@/models/Player'

interface PlayerCardProps {
  player: IPlayer
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const [isHovered, setIsHovered] = useState(false)

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
      case 'AI Engineer': return '🤖'
      default: return '💻'
    }
  }

  return (
    <Link
      href={`/players/${player._id}`}
      className="block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`code-block rounded-lg p-6 transition-all duration-300 hover:scale-105 ${
        isHovered ? 'neon-border border-neon-green' : ''
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-neon-green/20 rounded-full flex items-center justify-center border border-neon-green/50 relative overflow-hidden">
              {player.avatar ? (
                <img 
                  src={player.avatar} 
                  alt={player.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-neon-green font-mono font-bold text-lg">
                  {player.shirtNumber}
                </span>
              )}
              {/* Shirt number overlay for avatar */}
              {player.avatar && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-neon-green rounded-full flex items-center justify-center border border-cyber-dark">
                  <span className="text-cyber-dark font-mono font-bold text-xs">
                    {player.shirtNumber}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-neon-green font-mono font-bold text-lg mb-1">
                {player.name}
              </h3>
              <div className="flex items-center space-x-2">
                <p className={`text-sm font-mono ${getPositionColor(player.position)}`}>
                  {player.position}
                </p>
              </div>
            </div>
          </div>
          <div className="text-2xl">
            {getDevRoleIcon(player.devRole)}
          </div>
        </div>

        {/* Dev Role */}
        <div className="mb-4">
          <div className="font-mono text-xs text-cyber-gray mb-1">
            <span className="text-neon-blue">role:</span>
          </div>
          <div className="text-neon-green font-mono text-sm bg-cyber-darker/50 px-3 py-1 rounded border border-neon-green/20">
            "{player.devRole}"
          </div>
        </div>

        {/* Stats - Hidden by default, shown on hover */}
        <div className={`transition-all duration-300 overflow-hidden ${
          isHovered ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="border-t border-neon-green/20 pt-4 space-y-2">
            <div className="font-mono text-xs">
              <span className="text-neon-blue">const</span>{' '}
              <span className="text-neon-green">goals</span> ={' '}
              <span className="text-neon-orange">{player.goals}</span>;
            </div>
            <div className="font-mono text-xs">
              <span className="text-neon-blue">let</span>{' '}
              <span className="text-neon-green">assists</span> ={' '}
              <span className="text-neon-orange">{player.assists}</span>;
            </div>
            <div className="font-mono text-xs">
              <span className="text-neon-blue">var</span>{' '}
              <span className="text-neon-green">matchesPlayed</span> ={' '}
              <span className="text-neon-orange">{player.matchesPlayed}</span>;
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-neon-green/20 space-y-2">
          {/* Team Role */}
          {player.teamRole && (
            <div className="flex items-center justify-center">
              <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center space-x-1 ${
                player.teamRole === 'captain' 
                  ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30' :
                player.teamRole === 'vice-captain' 
                  ? 'bg-blue-400/20 text-blue-400 border border-blue-400/30' :
                  'bg-cyber-darker text-cyber-gray border border-cyber-gray/30'
              }`}>
                <span>
                  {player.teamRole === 'captain' ? '👑' : 
                   player.teamRole === 'vice-captain' ? '⭐' : '🛡️'}
                </span>
                <span>
                  {player.teamRole === 'captain' ? 'CAPTAIN' :
                   player.teamRole === 'vice-captain' ? 'VICE CAPTAIN' : 
                   'MEMBER'}
                </span>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs font-mono text-cyber-gray">
            <span>#{player.shirtNumber}</span>
            <span className={player.isActive ? 'text-neon-green' : 'text-red-400'}>
              {player.isActive ? 'active' : 'inactive'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-cyber-gray">
            <span>Age: {new Date().getFullYear() - (player.birthYear || 0)}</span>
            <span>Joined: {player.joinDate ? new Date(player.joinDate).getFullYear() : 'N/A'}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}