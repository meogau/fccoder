'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { ITeam } from '@/models/Team'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminTeamPage() {
  const { user } = useAuth()
  const [teamInfo, setTeamInfo] = useState<ITeam | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    biography: '',
    foundedYear: '',
    location: '',
    coverPhoto: ''
  })
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string>('')

  useEffect(() => {
    if (user) {
      fetchTeamInfo()
    }
  }, [user])

  const fetchTeamInfo = async () => {
    try {
      const response = await fetch('/api/team')
      const data = await response.json()
      if (data.success) {
        setTeamInfo(data.data)
        setFormData({
          name: data.data.name || '',
          biography: data.data.biography || '',
          foundedYear: data.data.foundedYear?.toString() || new Date().getFullYear().toString(),
          location: data.data.location || '',
          coverPhoto: data.data.coverPhoto || ''
        })
        setCoverPreview(data.data.coverPhoto || '')
      }
    } catch (error) {
      console.error('Error fetching team info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      let coverPhotoUrl = formData.coverPhoto

      // Handle cover photo upload if file is selected
      if (coverFile) {
        const formDataUpload = new FormData()
        formDataUpload.append('file', coverFile)
        formDataUpload.append('folder', 'team')
        formDataUpload.append('fileName', 'team_cover')

        const uploadResponse = await fetch('/api/upload/s3', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('fc-coder-token')}`
          },
          body: formDataUpload
        })

        const uploadData = await uploadResponse.json()
        console.log('Upload response:', uploadData)
        if (uploadData.success) {
          coverPhotoUrl = uploadData.url
          console.log('New cover photo URL:', coverPhotoUrl)
        } else {
          console.error('Upload failed:', uploadData.error)
          alert('Upload failed: ' + uploadData.error)
          return
        }
      }

      const response = await fetch('/api/team/protected', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fc-coder-token')}`
        },
        body: JSON.stringify({
          ...formData,
          foundedYear: parseInt(formData.foundedYear),
          coverPhoto: coverPhotoUrl
        })
      })

      const data = await response.json()
      console.log('Team update response:', data)
      if (data.success) {
        console.log('Updated team data:', data.data)
        setTeamInfo(data.data)
        setShowEditForm(false)
        setCoverFile(null)
        // Refresh page to ensure latest data
        window.location.reload()
        alert('Team information updated successfully!')
      } else {
        console.error('Team update error:', data.error)
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error saving team info:', error)
      alert('Failed to save team information')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      setCoverFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string)
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="text-cyber-gray hover:text-neon-green font-mono text-sm mb-2 inline-block">
              ← back to admin
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold font-mono text-neon-green">
              <span className="text-cyber-gray">// </span>TEAM_MANAGEMENT
            </h1>
            <p className="text-cyber-gray font-mono mt-2">
              Manage team information, cover photo, and biography
            </p>
          </div>
          
          <button
            onClick={() => setShowEditForm(!showEditForm)}
            className="px-6 py-3 bg-neon-green text-cyber-dark font-mono font-bold rounded hover:bg-neon-blue transition-all duration-300"
          >
            {showEditForm ? 'cancel()' : 'editTeam()'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="code-block rounded-lg p-8">
              <div className="font-mono text-cyber-gray">
                Loading team information<span className="animate-pulse">...</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Current Team Info Display */}
            {!showEditForm && teamInfo && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Cover Photo */}
                <div className="code-block rounded-lg overflow-hidden">
                  <div className="bg-cyber-darker/50 px-6 py-3 border-b border-neon-green/20">
                    <h2 className="text-xl font-mono text-neon-green">
                      <span className="text-cyber-gray">// </span>COVER_PHOTO
                    </h2>
                  </div>
                  <div className="p-6">
                    {teamInfo.coverPhoto ? (
                      <img 
                        src={teamInfo.coverPhoto} 
                        alt="Team Cover"
                        className="w-full h-64 object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-64 bg-cyber-darker/50 border-2 border-dashed border-neon-green/30 rounded flex flex-col items-center justify-center">
                        <div className="text-4xl mb-2">📸</div>
                        <div className="font-mono text-cyber-gray text-sm">
                          No cover photo uploaded
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Info */}
                <div className="code-block rounded-lg">
                  <div className="bg-cyber-darker/50 px-6 py-3 border-b border-neon-green/20">
                    <h2 className="text-xl font-mono text-neon-green">
                      <span className="text-cyber-gray">// </span>TEAM_INFO
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <div className="font-mono text-neon-blue text-sm mb-1">name:</div>
                      <div className="font-mono text-cyber-light-gray">{teamInfo.name}</div>
                    </div>
                    <div>
                      <div className="font-mono text-neon-blue text-sm mb-1">founded:</div>
                      <div className="font-mono text-cyber-light-gray">{teamInfo.foundedYear}</div>
                    </div>
                    <div>
                      <div className="font-mono text-neon-blue text-sm mb-1">location:</div>
                      <div className="font-mono text-cyber-light-gray">{teamInfo.location}</div>
                    </div>
                    <div>
                      <div className="font-mono text-neon-blue text-sm mb-1">biography:</div>
                      <div className="font-mono text-cyber-light-gray text-sm leading-relaxed">
                        {teamInfo.biography}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Form */}
            {showEditForm && (
              <div className="code-block rounded-lg p-6">
                <h2 className="text-xl font-mono text-neon-green mb-6">
                  <span className="text-cyber-gray">// </span>EDIT_TEAM_INFO
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Cover Photo Upload */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="mb-4">
                      <label className="block text-sm font-mono text-cyber-gray mb-2 text-center">
                        <span className="text-neon-blue">coverPhoto:</span>
                      </label>
                      
                      <div className="flex flex-col items-center">
                        {/* Cover Preview */}
                        <div className="w-full max-w-md h-48 rounded border-2 border-neon-green/30 bg-cyber-darker/50 flex items-center justify-center mb-4 overflow-hidden">
                          {coverPreview ? (
                            <img 
                              src={coverPreview} 
                              alt="Cover preview" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center">
                              <div className="text-4xl mb-2">📸</div>
                              <div className="text-xs font-mono text-cyber-gray">No Image</div>
                            </div>
                          )}
                        </div>
                        
                        {/* Upload Button */}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverChange}
                          className="hidden"
                          id="cover-upload"
                        />
                        <label
                          htmlFor="cover-upload"
                          className="px-4 py-2 bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded font-mono text-sm hover:bg-neon-blue/30 cursor-pointer transition-all duration-300"
                        >
                          uploadCover()
                        </label>
                        
                        {coverFile && (
                          <div className="mt-2 text-xs font-mono text-cyber-gray text-center">
                            {coverFile.name} ({(coverFile.size / 1024 / 1024).toFixed(2)}MB)
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
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-mono text-cyber-gray mb-2">
                        <span className="text-neon-blue">foundedYear:</span>
                      </label>
                      <input
                        type="number"
                        name="foundedYear"
                        value={formData.foundedYear}
                        onChange={handleInputChange}
                        required
                        min="2000"
                        max={new Date().getFullYear()}
                        className="w-full px-4 py-2 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-mono text-cyber-gray mb-2">
                        <span className="text-neon-blue">location:</span>
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-mono text-cyber-gray mb-2">
                      <span className="text-neon-blue">biography:</span>
                    </label>
                    <textarea
                      name="biography"
                      value={formData.biography}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-2 bg-cyber-darker border border-neon-green/30 rounded font-mono text-cyber-light-gray focus:border-neon-green focus:outline-none resize-none"
                      placeholder="Tell the story of your team..."
                    />
                  </div>


                  <div className="flex items-center space-x-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-neon-green text-cyber-dark font-mono font-bold rounded hover:bg-neon-blue transition-all duration-300 disabled:opacity-50"
                    >
                      {saving ? 'saving...' : 'update()'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditForm(false)}
                      className="px-6 py-2 bg-cyber-darker border border-red-400/30 text-red-400 font-mono rounded hover:bg-red-400/10 transition-all duration-300"
                    >
                      cancel()
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}