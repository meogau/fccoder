'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { IPlayer } from '@/models/Player'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminPlayersPage() {
  const { user } = useAuth()
  const [players, setPlayers] = useState<IPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<IPlayer | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    shirtNumber: '',
    position: 'Midfielder',
    birthYear: '',
    joinDate: '',
    nationality: '',
    bio: '',
    devRole: 'Full-stack Developer',
    teamRole: 'member',
    avatar: '',
    phoneNumber: ''
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')

  const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward']
  const devRoles = [
    'Frontend Engineer', 'Backend Engineer', 'Full-stack Developer',
    'DevOps Engineer', 'UI/UX Designer', 'Mobile Developer', 'Data Engineer',
    'QA Engineer', 'Project Manager', 'Tech Lead', 'Software Architect', 'AI Engineer'
  ]

  const teamRoles = [
    { value: 'captain', label: 'Captain', icon: 'C' },
    { value: 'vice-captain', label: 'Vice Captain', icon: 'V' },
    { value: 'member', label: 'Member', icon: 'M' }
  ]

  useEffect(() => {
    if (user) {
      fetchPlayers()
    }
  }, [user])

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players')
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
      }
    } catch (error) {
      console.error('Error fetching players:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let avatarUrl = formData.avatar

      // Handle avatar upload if file is selected
      if (avatarFile) {
        const formDataUpload = new FormData()
        formDataUpload.append('avatar', avatarFile)
        formDataUpload.append('playerName', formData.name.replace(/\s+/g, '_'))

        const uploadResponse = await fetch('/api/upload/avatar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('fc-coder-token')}`
          },
          body: formDataUpload
        })

        const uploadData = await uploadResponse.json()
        if (uploadData.success) {
          avatarUrl = uploadData.avatarUrl
        }
      }

      const isEditing = showEditForm && editingPlayer
      const url = isEditing ? `/api/players/protected/${editingPlayer._id}` : '/api/players/protected'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fc-coder-token')}`
        },
        body: JSON.stringify({
          ...formData,
          shirtNumber: parseInt(formData.shirtNumber),
          birthYear: parseInt(formData.birthYear),
          joinDate: new Date(formData.joinDate).toISOString(),
          teamRole: formData.teamRole,
          avatar: avatarUrl,
          phoneNumber: formData.phoneNumber
        })
      })

      const data = await response.json()
      if (data.success) {
        resetForm()
        fetchPlayers()
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error saving player:', error)
      alert('Failed to save player')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      shirtNumber: '',
      position: 'Midfielder',
      birthYear: '',
      joinDate: '',
      nationality: '',
      bio: '',
      devRole: 'Full-stack Developer',
      teamRole: 'member',
      avatar: '',
      phoneNumber: ''
    })
    setAvatarFile(null)
    setAvatarPreview('')
    setShowAddForm(false)
    setShowEditForm(false)
    setEditingPlayer(null)
  }

  const handleEdit = (player: IPlayer) => {
    setEditingPlayer(player)
    const joinDateStr = player.joinDate ? new Date(player.joinDate).toISOString().split('T')[0] : ''
    setFormData({
      name: player.name,
      shirtNumber: player.shirtNumber.toString(),
      position: player.position,
      birthYear: player.birthYear?.toString() || '',
      joinDate: joinDateStr,
      nationality: player.nationality || '',
      bio: player.bio || '',
      devRole: player.devRole,
      teamRole: player.teamRole || 'member',
      avatar: player.avatar || '',
      phoneNumber: player.phoneNumber || ''
    })
    setAvatarPreview(player.avatar || '')
    setShowAddForm(false)
    setShowEditForm(true)
  }

  const handleDelete = async (playerId: string) => {
    if (confirm('Are you sure you want to delete this player?')) {
      try {
        const response = await fetch(`/api/players/protected/${playerId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('fc-coder-token')}`
          }
        })

        const data = await response.json()
        if (data.success) {
          fetchPlayers()
        } else {
          alert('Error: ' + data.error)
        }
      } catch (error) {
        console.error('Error deleting player:', error)
        alert('Failed to delete player')
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size must be less than 5MB')
        return
      }
      
      setAvatarFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
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
              <span className="text-cyber-gray">// </span>PLAYER_MANAGEMENT
            </h1>
            <p className="text-cyber-gray font-mono mt-2">
              Manage squad members and their dev roles
            </p>
          </div>
          
          <button
            onClick={() => {
              if (showEditForm) {
                resetForm()
              } else {
                setShowAddForm(!showAddForm)
              }
            }}
            className="px-6 py-3 bg-neon-green text-cyber-dark font-mono font-bold rounded hover:bg-neon-blue transition-all duration-300"
          >
            {showAddForm || showEditForm ? 'cancel()' : 'addPlayer()'}
          </button>
        </div>

        {/* Add/Edit Player Form */}
        {(showAddForm || showEditForm) && (
          <div className="code-block rounded-lg p-6 mb-8">
            <h2 className="text-xl font-mono text-neon-green mb-6">
              <span className="text-cyber-gray">// </span>{showEditForm ? 'EDIT_PLAYER' : 'ADD_NEW_PLAYER'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center mb-6">
                <div className="mb-4">
                  <label className="block text-sm font-mono text-cyber-gray mb-2 text-center">
                    <span className="text-neon-blue">avatar:</span>
                  </label>
                  
                  <div className="flex flex-col items-center">
                    {/* Avatar Preview */}
                    <div className="w-32 h-32 rounded-full border-2 border-neon-green/30 bg-cyber-darker/50 flex items-center justify-center mb-4 overflow-hidden">
                      {avatarPreview ? (
                        <img 
                          src={avatarPreview} 
                          alt="Avatar preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="text-4xl mb-2">👤</div>
                          <div className="text-xs font-mono text-cyber-gray">No Image</div>
                        </div>
                      )}
                    </div>
                    
                    {/* Upload Button */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="px-4 py-2 bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded font-mono text-sm hover:bg-neon-blue/30 cursor-pointer transition-all duration-300"
                    >
                      uploadImage()
                    </label>
                    
                    {avatarFile && (
                      <div className="mt-2 text-xs font-mono text-cyber-gray text-center">
                        {avatarFile.name} ({(avatarFile.size / 1024 / 1024).toFixed(2)}MB)
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-mono text-cyber-gray mb-2">
                    <span className="text-neon-blue">name:</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
                    placeholder="Enter player name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-cyber-gray mb-2">
                    <span className="text-neon-blue">shirtNumber:</span>
                  </label>
                  <input
                    type="number"
                    name="shirtNumber"
                    value={formData.shirtNumber}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="99"
                    className="w-full px-4 py-2 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
                    placeholder="1-99"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-cyber-gray mb-2">
                    <span className="text-neon-blue">position:</span>
                  </label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
                  >
                    {positions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-mono text-cyber-gray mb-2">
                    <span className="text-neon-blue">birthYear:</span>
                  </label>
                  <input
                    type="number"
                    name="birthYear"
                    value={formData.birthYear}
                    onChange={handleInputChange}
                    required
                    min="1970"
                    max={new Date().getFullYear() - 16}
                    className="w-full px-4 py-2 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
                    placeholder="e.g., 1990"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-cyber-gray mb-2">
                    <span className="text-neon-blue">joinDate:</span>
                  </label>
                  <input
                    type="date"
                    name="joinDate"
                    value={formData.joinDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-cyber-gray mb-2">
                    <span className="text-neon-blue">phoneNumber:</span> (for notifications)
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
                    placeholder="+84xxxxxxxxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-cyber-gray mb-2">
                    <span className="text-neon-blue">devRole:</span>
                  </label>
                  <select
                    name="devRole"
                    value={formData.devRole}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
                  >
                    {devRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-mono text-cyber-gray mb-2">
                    <span className="text-neon-blue">teamRole:</span>
                  </label>
                  <select
                    name="teamRole"
                    value={formData.teamRole}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
                  >
                    {teamRoles.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.icon} {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-mono text-cyber-gray mb-2">
                  <span className="text-neon-blue">bio:</span> (optional)
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none resize-none"
                  placeholder="Player biography and background..."
                />
              </div>

              <div className="flex items-center space-x-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-neon-green text-cyber-dark font-mono font-bold rounded hover:bg-neon-blue transition-all duration-300"
                >
                  {showEditForm ? 'update()' : 'create()'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-cyber-darker border border-red-400/30 text-red-400 font-mono rounded hover:bg-red-400/10 transition-all duration-300"
                >
                  cancel()
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Players List */}
        <div className="code-block rounded-lg">
          <div className="bg-cyber-darker/50 px-6 py-3 border-b border-neon-green/20 rounded-t-lg">
            <h2 className="text-xl font-mono text-neon-green">
              <span className="text-cyber-gray">// </span>CURRENT_SQUAD ({players.length})
            </h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="font-mono text-cyber-gray">
                  Loading players<span className="animate-pulse">...</span>
                </div>
              </div>
            ) : players.length === 0 ? (
              <div className="text-center py-8">
                <div className="font-mono text-cyber-gray">
                  No players found. Add your first player!
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {players.map((player) => (
                  <div key={String(player._id)} className="flex items-center justify-between p-4 bg-cyber-darker/30 rounded border border-neon-green/10 hover:border-neon-green/30 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-neon-green/20 rounded-full flex items-center justify-center border border-neon-green/50 relative overflow-hidden">
                        {player.avatar ? (
                          <img 
                            src={player.avatar} 
                            alt={player.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-neon-green font-mono font-bold text-sm">
                            {player.shirtNumber}
                          </span>
                        )}
                        {/* Shirt number overlay for avatar */}
                        {player.avatar && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-neon-green rounded-full flex items-center justify-center border border-cyber-dark">
                            <span className="text-cyber-dark font-mono font-bold text-xs">
                              {player.shirtNumber}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-mono font-bold text-neon-green">
                          {player.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm font-mono text-cyber-gray">
                          <span className={`px-2 py-1 rounded font-bold ${
                            player.teamRole === 'captain' ? 'bg-neon-green/20 text-neon-green border border-neon-green/30' :
                            player.teamRole === 'vice-captain' ? 'bg-neon-green/20 text-neon-green border border-neon-green/30' :
                            'bg-cyber-darker text-cyber-gray border border-cyber-gray/30'
                          }`}>
                            {player.teamRole === 'captain' ? 'C' :
                             player.teamRole === 'vice-captain' ? 'V' : 
                             'M'}
                          </span>
                          <span>•</span>
                          <span>{player.position}</span>
                          <span>•</span>
                          <span>{player.devRole}</span>
                          <span>•</span>
                          <span>Age: {new Date().getFullYear() - (player.birthYear || 0)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm font-mono text-cyber-gray">
                      <div className="text-right">
                        <div>⚽ {player.goals} goals</div>
                        <div>🎯 {player.assists} assists</div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        player.isActive 
                          ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                          : 'bg-red-400/20 text-red-400 border border-red-400/30'
                      }`}>
                        {player.isActive ? 'active' : 'inactive'}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(player)}
                          className="px-3 py-1 bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded font-mono text-xs hover:bg-neon-blue/30 transition-all duration-300"
                        >
                          edit()
                        </button>
                        <button
                          onClick={() => handleDelete(String(player._id))}
                          className="px-3 py-1 bg-red-400/20 text-red-400 border border-red-400/30 rounded font-mono text-xs hover:bg-red-400/30 transition-all duration-300"
                        >
                          delete()
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}