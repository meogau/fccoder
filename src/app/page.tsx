import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import GlitchText from '@/components/GlitchText'
import TerminalAnimation from '@/components/TerminalAnimation'
import { getAllPlayers } from '@/lib/db/playerModel'
import { getTeamInfo } from '@/lib/db/teamModel'
import { getAllMatches, getUpcomingMatches } from '@/lib/db/matchModel'

// Enable ISR - revalidate every 60 seconds
export const revalidate = 60

export default async function HomePage() {
  // Fetch data directly from DynamoDB (Server-side)
  const [players, teamInfo, allMatchesResult, upcomingMatches] = await Promise.all([
    getAllPlayers({ isActive: true }),
    getTeamInfo(),
    getAllMatches(),
    getUpcomingMatches(1)
  ])

  const allMatches = allMatchesResult.data

  // Calculate team statistics
  const completedMatches = allMatches.filter(match => match.status === 'completed')
  const totalGoals = completedMatches.reduce((sum, match) => sum + match.goalsFor, 0)

  let wins = 0, draws = 0, losses = 0
  completedMatches.forEach(match => {
    if (match.goalsFor > match.goalsAgainst) wins++
    else if (match.goalsFor === match.goalsAgainst) draws++
    else losses++
  })

  const winRate = completedMatches.length > 0 ? Math.round((wins / completedMatches.length) * 100) : 0
  const nextMatch = upcomingMatches[0] || null

  const teamStats = {
    totalPlayers: players.length,
    activePlayers: players.filter(p => p.isActive).length,
    totalMatches: completedMatches.length,
    totalGoals,
    wins,
    draws,
    losses,
    winRate
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

            {/* Terminal Simulation (Client Component for animation) */}
            <TerminalAnimation />

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

              {nextMatch ? (
                <div className="font-mono text-sm space-y-2">
                  <div className="text-cyber-light-gray">
                    <span className="text-neon-blue">opponent:</span> &quot;{nextMatch.opponent}&quot;
                  </div>
                  <div className="text-cyber-light-gray">
                    <span className="text-neon-blue">date:</span> &quot;{new Date(nextMatch.date).toISOString()}&quot;
                  </div>
                  <div className="text-cyber-light-gray">
                    <span className="text-neon-blue">stadium:</span> &quot;{nextMatch.isHome ? '/dev/stadium/home' : '/dev/stadium/away'}&quot;
                  </div>
                  <div className="text-cyber-light-gray">
                    <span className="text-neon-blue">venue:</span> &quot;{nextMatch.venue}&quot;
                  </div>
                  <div className="text-cyber-light-gray">
                    <span className="text-neon-blue">status:</span> &quot;{nextMatch.status}&quot;
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
                      <Image
                        src={teamInfo.coverPhoto}
                        alt="FC Coder Team"
                        width={800}
                        height={600}
                        className="w-full h-80 object-cover"
                        priority
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
                {teamStats.activePlayers}
              </div>
              <div className="text-cyber-gray text-sm">
                Active Players ({teamStats.totalPlayers} total)
              </div>
            </div>

            <div className="code-block rounded-lg p-6 text-center scanline">
              <div className="font-mono text-neon-blue text-lg mb-2">let GOALS_SCORED</div>
              <div className="text-4xl font-bold text-neon-green mb-2">
                {teamStats.totalGoals}
              </div>
              <div className="text-cyber-gray text-sm">Total Goals Scored</div>
            </div>

            <div className="code-block rounded-lg p-6 text-center scanline">
              <div className="font-mono text-neon-blue text-lg mb-2">var MATCHES_PLAYED</div>
              <div className="text-4xl font-bold text-neon-green mb-2">
                {teamStats.totalMatches}
              </div>
              <div className="text-cyber-gray text-sm">
                W:{teamStats.wins} D:{teamStats.draws} L:{teamStats.losses}
              </div>
            </div>

            <div className="code-block rounded-lg p-6 text-center scanline">
              <div className="font-mono text-neon-blue text-lg mb-2">function WIN_RATE()</div>
              <div className="text-4xl font-bold text-neon-green mb-2">
                {teamStats.winRate}%
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
