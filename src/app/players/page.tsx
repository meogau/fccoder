'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import PlayerCard from '@/components/PlayerCard'
import TerminalCommand from '@/components/TerminalCommand'
import { IPlayer } from '@/models/Player'

export default function PlayersPage() {
  const [players, setPlayers] = useState<IPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterPosition, setFilterPosition] = useState<string>('')
  const [filterDevRole, setFilterDevRole] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<string>('shirtNumber')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward']
  const devRoles = [
    'Frontend Engineer', 'Backend Engineer', 'Full-stack Developer',
    'DevOps Engineer', 'UI/UX Designer', 'Mobile Developer', 'Data Engineer',
    'QA Engineer', 'Project Manager', 'Tech Lead', 'Software Architect'
  ]

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/players?isActive=true')
      const data = await response.json()
      
      if (data.success) {
        // Sort by team role (captain -> vice-captain -> member), then by shirt number
        const sortedPlayers = data.data.sort((a: IPlayer, b: IPlayer) => {
          const roleOrder = { captain: 0, 'vice-captain': 1, member: 2 }
          const aRole = (a.teamRole as keyof typeof roleOrder) || 'member'
          const bRole = (b.teamRole as keyof typeof roleOrder) || 'member'
          
          if (roleOrder[aRole] !== roleOrder[bRole]) {
            return roleOrder[aRole] - roleOrder[bRole]
          }
          return a.shirtNumber - b.shirtNumber
        })
        setPlayers(sortedPlayers)
      } else {
        setError('Failed to fetch players')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Error fetching players:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.devRole.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPosition = !filterPosition || player.position === filterPosition
    const matchesDevRole = !filterDevRole || player.devRole === filterDevRole
    
    return matchesSearch && matchesPosition && matchesDevRole
  })

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    let aValue: any = a[sortBy as keyof IPlayer]
    let bValue: any = b[sortBy as keyof IPlayer]
    
    // Handle string comparisons
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const clearFilters = () => {
    setFilterPosition('')
    setFilterDevRole('')
    setSearchTerm('')
  }

  return (
    <div className="min-h-screen bg-cyber-dark text-cyber-light-gray">
      <Navbar />

      {/* Header Section */}
      <section className="py-16 bg-cyber-darker/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold font-mono text-neon-green mb-4">
              <span className="text-cyber-gray">// </span>SQUAD_MEMBERS
            </h1>
            <p className="text-xl text-cyber-gray font-mono">
              Team.getPlayers().filter(player =&gt; player.isActive)
            </p>
          </div>

          {/* Terminal Command */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="code-block rounded-lg p-6">
              <div className="flex items-center mb-4 pb-2 border-b border-neon-green/20">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="ml-4 text-sm text-cyber-gray font-mono">
                  squad-manager — fc-coder@localhost
                </span>
              </div>
              
              <TerminalCommand
                command="npm run get-squad --active"
                response={`✅ Fetching active squad members...\n📊 Found ${players.length} active players\n🎯 Ready to display squad data`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-cyber-dark/50 border-y border-neon-green/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <label className="block text-sm font-mono text-cyber-gray mb-2">
                <span className="text-neon-blue">search:</span>
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search players or dev roles..."
                className="w-full px-4 py-2 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
              />
            </div>

            {/* Position Filter */}
            <div className="min-w-[200px]">
              <label className="block text-sm font-mono text-cyber-gray mb-2">
                <span className="text-neon-blue">position:</span>
              </label>
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
                className="w-full px-4 py-2 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
              >
                <option value="">All Positions</option>
                {positions.map(position => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
            </div>

            {/* Dev Role Filter */}
            <div className="min-w-[200px]">
              <label className="block text-sm font-mono text-cyber-gray mb-2">
                <span className="text-neon-blue">devRole:</span>
              </label>
              <select
                value={filterDevRole}
                onChange={(e) => setFilterDevRole(e.target.value)}
                className="w-full px-4 py-2 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
              >
                <option value="">All Roles</option>
                {devRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="min-w-[180px]">
              <label className="block text-sm font-mono text-cyber-gray mb-2">
                <span className="text-neon-blue">sortBy:</span>
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
              >
                <option value="teamRole">Team Role</option>
                <option value="shirtNumber">Shirt Number</option>
                <option value="name">Name</option>
                <option value="matchesPlayed">Matches Played</option>
                <option value="goals">Goals Scored</option>
                <option value="assists">Assists</option>
                <option value="position">Position</option>
                <option value="devRole">Dev Role</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="min-w-[120px]">
              <label className="block text-sm font-mono text-cyber-gray mb-2">
                <span className="text-neon-blue">order:</span>
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full px-4 py-2 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
              >
                <option value="asc">ASC ↑</option>
                <option value="desc">DESC ↓</option>
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-neon-green/20 text-neon-green border border-neon-green/30 rounded font-mono hover:bg-neon-green hover:text-cyber-dark transition-all duration-300"
            >
              clear()
            </button>
          </div>
        </div>
      </section>

      {/* Players Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center">
              <div className="code-block rounded-lg p-8 max-w-md mx-auto">
                <div className="font-mono text-cyber-gray">
                  Loading squad data<span className="animate-pulse">...</span>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="code-block rounded-lg p-8 max-w-md mx-auto border-red-500/50">
                <div className="font-mono text-red-400">
                  Error: {error}
                </div>
                <button 
                  onClick={fetchPlayers}
                  className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded font-mono hover:bg-red-500 hover:text-white transition-all duration-300"
                >
                  retry()
                </button>
              </div>
            </div>
          ) : sortedPlayers.length === 0 ? (
            <div className="text-center">
              <div className="code-block rounded-lg p-8 max-w-md mx-auto">
                <div className="font-mono text-cyber-gray">
                  No players found matching your criteria
                </div>
                <button 
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-neon-green/20 text-neon-green border border-neon-green/30 rounded font-mono hover:bg-neon-green hover:text-cyber-dark transition-all duration-300"
                >
                  clearFilters()
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Results Counter */}
              <div className="mb-8 text-center">
                <p className="font-mono text-cyber-gray">
                  <span className="text-neon-blue">results:</span> {sortedPlayers.length} 
                  <span className="text-cyber-gray"> / </span>
                  <span className="text-neon-green">{players.length}</span> players
                </p>
              </div>

              {/* Players Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedPlayers.map((player) => (
                  <PlayerCard key={String(player._id)} player={player} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}