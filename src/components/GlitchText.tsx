'use client'

import { useEffect, useState } from 'react'

interface GlitchTextProps {
  text: string
  className?: string
  glitchIntensity?: 'low' | 'medium' | 'high'
  triggerGlitch?: boolean
}

export default function GlitchText({ 
  text, 
  className = '', 
  glitchIntensity = 'medium',
  triggerGlitch = false
}: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false)
  const [displayText, setDisplayText] = useState(text)

  const glitchChars = '!<>-_\\/[]{}—=+*^?#________'
  
  const intensitySettings = {
    low: { duration: 200, frequency: 0.1 },
    medium: { duration: 400, frequency: 0.2 },
    high: { duration: 600, frequency: 0.3 }
  }

  useEffect(() => {
    if (triggerGlitch) {
      setIsGlitching(true)
      const { duration, frequency } = intensitySettings[glitchIntensity]
      
      const glitchInterval = setInterval(() => {
        if (Math.random() < frequency) {
          const glitchedText = text
            .split('')
            .map(char => 
              Math.random() < 0.1 && char !== ' ' 
                ? glitchChars[Math.floor(Math.random() * glitchChars.length)]
                : char
            )
            .join('')
          setDisplayText(glitchedText)
        } else {
          setDisplayText(text)
        }
      }, 50)

      const timeout = setTimeout(() => {
        clearInterval(glitchInterval)
        setDisplayText(text)
        setIsGlitching(false)
      }, duration)

      return () => {
        clearInterval(glitchInterval)
        clearTimeout(timeout)
      }
    }
  }, [triggerGlitch, text, glitchIntensity])

  return (
    <span 
      className={`glitch-text ${isGlitching ? 'animate-glitch' : ''} ${className}`}
      data-text={displayText}
    >
      {displayText}
    </span>
  )
}