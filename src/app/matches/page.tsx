'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import MatchCommit from '@/components/MatchCommit'
import TerminalCommand from '@/components/TerminalCommand'
import { IMatch } from '@/models/Match'

export default function MatchesPage() {
  const [matches, setMatches] = useState<IMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const filterOptions = [
    { value: 'all', label: 'All Matches', command: '--all' },
    { value: 'completed', label: 'Completed', command: '--completed' },
    { value: 'scheduled', label: 'Upcoming', command: '--scheduled' },
    { value: 'live', label: 'Live', command: '--live' }
  ]

  useEffect(() => {
    fetchMatches()
  }, [page, filter])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sort: 'date',
        order: 'desc'
      })
      
      if (filter !== 'all') {
        params.append('status', filter)
      }

      const response = await fetch(`/api/matches?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setMatches(data.data)
        setTotalPages(data.pagination.pages)
      } else {
        setError('Failed to fetch matches')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Error fetching matches:', err)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredMatchesCount = () => {
    return matches.length
  }

  const getStatsForFilter = () => {
    if (filter === 'all') return matches.length
    return matches.filter(match => match.status === filter).length
  }

  return (
    <div className="min-h-screen bg-cyber-dark text-cyber-light-gray">
      <Navbar />

      {/* Header Section */}
      <section className="py-16 bg-cyber-darker/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold font-mono text-neon-green mb-4">
              <span className="text-cyber-gray">// </span>MATCH_HISTORY
            </h1>
            <p className="text-xl text-cyber-gray font-mono">
              git log --oneline --graph --all
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
                  git-log — fc-coder@localhost
                </span>
              </div>
              
              <TerminalCommand
                command={`git log ${filterOptions.find(f => f.value === filter)?.command || '--all'}`}
                response={`✅ Fetching commit history...\n📊 Found ${matches.length} commits\n🎯 Displaying match history`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-cyber-dark/50 border-y border-neon-green/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center space-x-2">
              <span className="text-sm font-mono text-cyber-gray mr-4">
                <span className="text-neon-blue">filter:</span>
              </span>
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setFilter(option.value)
                    setPage(1)
                  }}
                  className={`px-4 py-2 rounded font-mono text-sm transition-all duration-300 ${
                    filter === option.value
                      ? 'bg-neon-green text-cyber-dark border border-neon-green'
                      : 'bg-cyber-darker border border-neon-green/30 text-cyber-light-gray hover:border-neon-green hover:text-neon-green'
                  }`}
                >
                  {option.command}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="text-sm font-mono text-cyber-gray">
              <span className="text-neon-blue">matches:</span> {matches.length}
              <span className="mx-2">/</span>
              <span className="text-neon-green">page:</span> {page}/{totalPages}
            </div>
          </div>
        </div>
      </section>

      {/* Matches Timeline */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center">
              <div className="code-block rounded-lg p-8 max-w-md mx-auto">
                <div className="font-mono text-cyber-gray">
                  Loading match history<span className="animate-pulse">...</span>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="code-block rounded-lg p-8 max-w-md mx-auto border-red-500/50">
                <div className="font-mono text-red-400 mb-4">
                  Error: {error}
                </div>
                <button 
                  onClick={fetchMatches}
                  className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded font-mono hover:bg-red-500 hover:text-white transition-all duration-300"
                >
                  retry()
                </button>
              </div>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center">
              <div className="code-block rounded-lg p-8 max-w-md mx-auto">
                <div className="font-mono text-cyber-gray">
                  No matches found for the selected filter
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {/* Git-style timeline */}
              <div className="bg-cyber-darker/20 rounded-lg border border-neon-green/20 overflow-hidden">
                {matches.map((match, index) => (
                  <div key={match._id} className={`${index < matches.length - 1 ? 'border-b border-cyber-gray/20' : ''}`}>
                    <MatchCommit match={match} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-4 mt-8">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded font-mono text-sm transition-all duration-300 ${
                      page === 1
                        ? 'bg-cyber-darker/50 text-cyber-gray cursor-not-allowed'
                        : 'bg-cyber-darker border border-neon-green/30 text-cyber-light-gray hover:border-neon-green hover:text-neon-green'
                    }`}
                  >
                    ← prev
                  </button>

                  <div className="flex items-center space-x-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-8 h-8 rounded font-mono text-sm transition-all duration-300 ${
                            page === pageNum
                              ? 'bg-neon-green text-cyber-dark'
                              : 'bg-cyber-darker border border-neon-green/30 text-cyber-light-gray hover:border-neon-green hover:text-neon-green'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className={`px-4 py-2 rounded font-mono text-sm transition-all duration-300 ${
                      page === totalPages
                        ? 'bg-cyber-darker/50 text-cyber-gray cursor-not-allowed'
                        : 'bg-cyber-darker border border-neon-green/30 text-cyber-light-gray hover:border-neon-green hover:text-neon-green'
                    }`}
                  >
                    next →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}