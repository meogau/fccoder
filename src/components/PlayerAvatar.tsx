'use client'

import { useState } from 'react'

interface PlayerAvatarProps {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  shirtNumber?: number
  className?: string
}

export default function PlayerAvatar({ 
  src, 
  alt, 
  size = 'md', 
  shirtNumber,
  className = '' 
}: PlayerAvatarProps) {
  const [imageError, setImageError] = useState(false)
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  }

  const badgeSizes = {
    sm: 'w-3 h-3 text-xs',
    md: 'w-6 h-6 text-xs',
    lg: 'w-8 h-8 text-sm',
    xl: 'w-10 h-10 text-base'
  }

  const showImage = src && !imageError

  return (
    <div className={`${sizeClasses[size]} bg-neon-green/20 rounded-full flex items-center justify-center border border-neon-green/50 relative overflow-hidden ${className}`}>
      {showImage ? (
        <img 
          src={src} 
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="text-center">
          {shirtNumber ? (
            <span className="text-neon-green font-mono font-bold text-lg">
              {shirtNumber}
            </span>
          ) : (
            <div className="text-2xl">👤</div>
          )}
        </div>
      )}
      
      {/* Shirt number overlay for avatar */}
      {showImage && shirtNumber && (
        <div className={`absolute -bottom-1 -right-1 ${badgeSizes[size]} bg-neon-green rounded-full flex items-center justify-center border border-cyber-dark`}>
          <span className="text-cyber-dark font-mono font-bold">
            {shirtNumber}
          </span>
        </div>
      )}
    </div>
  )
}