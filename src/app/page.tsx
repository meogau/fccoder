'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import TerminalCommand from '@/components/TerminalCommand'
import GlitchText from '@/components/GlitchText'
import { ITeam } from '@/models/Team'

interface Match {
  _id: string
  opponent: string
  date: string
  venue: string
  isHome: boolean
  status: string
  goalsFor?: number
  goalsAgainst?: number
}

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [nextMatch, setNextMatch] = useState<Match | null>(null)
  const [teamInfo, setTeamInfo] = useState<ITeam | null>(null)
  const [teamStats, setTeamStats] = useState({
    totalPlayers: 0,
    activePlayers: 0,
    totalMatches: 0,
    totalGoals: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    winRate: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  const terminalSteps = [
    {
      command: 'cd /var/www/fc-coder',
      response: ''
    },
    {
      command: 'npm run welcome',
      response: '> fc-coder@1.0.0 welcome\n> node scripts/welcome.js\n\n🟢 Initializing FC Coder Terminal...\n✅ Loading squad data...\n✅ Connecting to match database...\n🎯 System ready!'
    },
    {
      command: './getTeamInfo.sh',
      response: '{\n  "name": "FC Coder",\n  "founded": "2024",\n  "philosophy": "Code by day, score by night",\n  "members": "11+ developers",\n  "status": "ready_to_deploy"\n}'
    }
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchResponse, teamResponse, playersResponse, allMatchesResponse] = await Promise.all([
          fetch('/api/matches?status=scheduled&limit=1'),
          fetch('/api/team'),
          fetch('/api/players'),
          fetch('/api/matches?limit=1000') // Get all matches for statistics
        ])
        
        const matchData = await matchResponse.json()
        if (matchData.success && matchData.data.length > 0) {
          setNextMatch(matchData.data[0])
        }

        const teamData = await teamResponse.json()
        if (teamData.success) {
          setTeamInfo(teamData.data)
        }

        const playersData = await playersResponse.json()
        const allMatchesData = await allMatchesResponse.json()

        if (playersData.success && allMatchesData.success) {
          const players = playersData.data
          const matches = allMatchesData.data
          
          // Calculate team statistics
          const completedMatches = matches.filter((match: any) => match.status === 'completed')
          const totalGoals = completedMatches.reduce((sum: number, match: any) => sum + (match.goalsFor || 0), 0)
          
          let wins = 0, draws = 0, losses = 0
          completedMatches.forEach((match: any) => {
            if (match.goalsFor > match.goalsAgainst) wins++
            else if (match.goalsFor === match.goalsAgainst) draws++
            else losses++
          })
          
          const winRate = completedMatches.length > 0 ? Math.round((wins / completedMatches.length) * 100) : 0
          
          setTeamStats({
            totalPlayers: players.length,
            activePlayers: players.filter((p: any) => p.isActive).length,
            totalMatches: completedMatches.length,
            totalGoals,
            wins,
            draws,
            losses,
            winRate
          })
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleStepComplete = () => {
    if (currentStep < terminalSteps.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, 500)
    }
  }

  return (
    <div className="min-h-screen bg-cyber-dark text-cyber-light-gray">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(100, 255, 218, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(100, 255, 218, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <div className="mb-8">
              <GlitchText 
                text="FC CODER"
                className="text-6xl md:text-8xl font-bold text-neon-green mb-4 animate-neon-pulse"
                glitchIntensity="medium"
                triggerGlitch={true}
              />
              <p className="text-xl md:text-2xl text-cyber-gray font-mono">
                <span className="text-neon-blue">//</span> Where Code Meets Football
              </p>
            </div>

            {/* Terminal Simulation */}
            <div className="max-w-4xl mx-auto code-block rounded-lg p-6 mb-12">
              <div className="flex items-center mb-4 pb-2 border-b border-neon-green/20">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="ml-4 text-sm text-cyber-gray font-mono">
                  terminal — fc-coder@localhost
                </span>
              </div>
              
              <div className="text-left space-y-4">
                {terminalSteps.slice(0, currentStep + 1).map((step, index) => (
                  <TerminalCommand
                    key={index}
                    command={step.command}
                    response={step.response}
                    onComplete={index === currentStep ? handleStepComplete : undefined}
                    showCursor={index === currentStep}
                  />
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                href="/players"
                className="px-8 py-3 bg-neon-green text-cyber-dark font-mono font-bold rounded hover:bg-neon-blue hover:neon-border transition-all duration-300 transform hover:scale-105"
              >
                ./viewSquad()
              </Link>
              <Link
                href="/matches"
                className="px-8 py-3 border border-neon-green text-neon-green font-mono font-bold rounded hover:bg-neon-green hover:text-cyber-dark transition-all duration-300 transform hover:scale-105"
              >
                ./matchHistory()
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Next Match Section */}
      <section className="py-16 bg-cyber-darker/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-mono text-neon-green mb-4">
              <span className="text-cyber-gray">// </span>NEXT_MATCH
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="code-block rounded-lg p-6">
              <div className="flex items-center mb-4">
                <span className="text-neon-green font-mono">$</span>
                <span className="ml-2 font-mono text-cyber-light-gray">./getNextMatch.sh</span>
              </div>
              
              {isLoading ? (
                <div className="font-mono text-cyber-gray">
                  Loading match data<span className="animate-pulse">...</span>
                </div>
              ) : nextMatch ? (
                <div className="font-mono text-sm space-y-2">
                  <div className="text-cyber-light-gray">
                    <span className="text-neon-blue">opponent:</span> "{nextMatch.opponent}"
                  </div>
                  <div className="text-cyber-light-gray">
                    <span className="text-neon-blue">date:</span> "{new Date(nextMatch.date).toISOString()}"
                  </div>
                  <div className="text-cyber-light-gray">
                    <span className="text-neon-blue">stadium:</span> "{nextMatch.isHome ? '/dev/stadium/home' : '/dev/stadium/away'}"
                  </div>
                  <div className="text-cyber-light-gray">
                    <span className="text-neon-blue">venue:</span> "{nextMatch.venue}"
                  </div>
                  <div className="text-cyber-light-gray">
                    <span className="text-neon-blue">status:</span> "{nextMatch.status}"
                  </div>
                </div>
              ) : (
                <div className="font-mono text-cyber-gray">
                  No upcoming matches scheduled
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Team Info Section */}
      {teamInfo && (
        <section className="py-16 bg-cyber-dark/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-mono text-neon-green mb-4">
                <span className="text-cyber-gray">// </span>ABOUT_THE_TEAM
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Team Cover Photo */}
              <div className="order-2 lg:order-1">
                <div className="code-block rounded-lg overflow-hidden">
                  {teamInfo.coverPhoto ? (
                    <div className="relative">
                      <img 
                        src={teamInfo.coverPhoto} 
                        alt="FC Coder Team"
                        className="w-full h-80 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark/80 via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-4">
                        <div className="font-mono text-neon-green font-bold text-lg">
                          {teamInfo.name}
                        </div>
                        <div className="font-mono text-cyber-gray text-sm">
                          Est. {teamInfo.foundedYear} • {teamInfo.location}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-80 bg-cyber-darker/50 border-2 border-dashed border-neon-green/30 flex flex-col items-center justify-center">
                      <div className="text-6xl mb-4">⚽</div>
                      <div className="font-mono text-neon-green font-bold text-lg">
                        {teamInfo.name}
                      </div>
                      <div className="font-mono text-cyber-gray text-sm">
                        Est. {teamInfo.foundedYear} • {teamInfo.location}
                      </div>
                      <div className="font-mono text-cyber-gray text-xs mt-2">
                        Team photo coming soon...
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Team Biography */}
              <div className="order-1 lg:order-2">
                <div className="code-block rounded-lg p-8">
                  <h3 className="text-xl font-mono text-neon-green mb-6">
                    <span className="text-cyber-gray">// </span>OUR_STORY
                  </h3>
                  
                  <div className="font-mono text-cyber-light-gray text-base leading-relaxed mb-6">
                    {teamInfo.biography.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-mono text-neon-green mb-4">
              <span className="text-cyber-gray">// </span>TEAM_STATS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="code-block rounded-lg p-6 text-center scanline">
              <div className="font-mono text-neon-blue text-lg mb-2">const SQUAD_SIZE</div>
              <div className="text-4xl font-bold text-neon-green mb-2">
                {isLoading ? '...' : teamStats.activePlayers}
              </div>
              <div className="text-cyber-gray text-sm">
                Active Players ({isLoading ? '...' : teamStats.totalPlayers} total)
              </div>
            </div>
            
            <div className="code-block rounded-lg p-6 text-center scanline">
              <div className="font-mono text-neon-blue text-lg mb-2">let GOALS_SCORED</div>
              <div className="text-4xl font-bold text-neon-green mb-2">
                {isLoading ? '...' : teamStats.totalGoals}
              </div>
              <div className="text-cyber-gray text-sm">Total Goals Scored</div>
            </div>
            
            <div className="code-block rounded-lg p-6 text-center scanline">
              <div className="font-mono text-neon-blue text-lg mb-2">var MATCHES_PLAYED</div>
              <div className="text-4xl font-bold text-neon-green mb-2">
                {isLoading ? '...' : teamStats.totalMatches}
              </div>
              <div className="text-cyber-gray text-sm">
                W:{isLoading ? '...' : teamStats.wins} D:{isLoading ? '...' : teamStats.draws} L:{isLoading ? '...' : teamStats.losses}
              </div>
            </div>
            
            <div className="code-block rounded-lg p-6 text-center scanline">
              <div className="font-mono text-neon-blue text-lg mb-2">function WIN_RATE()</div>
              <div className="text-4xl font-bold text-neon-green mb-2">
                {isLoading ? '...' : `${teamStats.winRate}%`}
              </div>
              <div className="text-cyber-gray text-sm">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cyber-darker py-8 border-t border-neon-green/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-mono text-cyber-gray">
            <span className="text-neon-green">©</span> 2024 FC Coder. 
            <span className="text-neon-blue"> // </span>
            Compiled with ❤️ and ⚽
          </p>
        </div>
      </footer>
    </div>
  )
}