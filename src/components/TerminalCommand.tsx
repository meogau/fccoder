'use client'

import { useState, useEffect } from 'react'

interface TerminalCommandProps {
  command: string
  response?: string
  delay?: number
  showCursor?: boolean
  onComplete?: () => void
}

export default function TerminalCommand({ 
  command, 
  response, 
  delay = 50, 
  showCursor = true,
  onComplete 
}: TerminalCommandProps) {
  const [displayedCommand, setDisplayedCommand] = useState('')
  const [displayedResponse, setDisplayedResponse] = useState('')
  const [showResponse, setShowResponse] = useState(false)
  const [commandComplete, setCommandComplete] = useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (displayedCommand.length < command.length) {
      timeout = setTimeout(() => {
        setDisplayedCommand(command.slice(0, displayedCommand.length + 1))
      }, delay)
    } else if (!commandComplete) {
      setCommandComplete(true)
      setTimeout(() => {
        setShowResponse(true)
      }, 300)
    }

    return () => clearTimeout(timeout)
  }, [displayedCommand, command, delay, commandComplete])

  useEffect(() => {
    if (showResponse && response && displayedResponse.length < response.length) {
      const timeout = setTimeout(() => {
        setDisplayedResponse(response.slice(0, displayedResponse.length + 1))
      }, delay / 2)
      return () => clearTimeout(timeout)
    } else if (showResponse && response && displayedResponse.length === response.length) {
      onComplete?.()
    }
  }, [showResponse, response, displayedResponse, delay, onComplete])

  return (
    <div className="font-mono text-sm">
      <div className="flex items-center text-neon-green">
        <span className="mr-2 text-cyber-light-gray">$</span>
        <span>{displayedCommand}</span>
        {showCursor && !commandComplete && (
          <span className="animate-terminal-cursor">|</span>
        )}
      </div>
      {showResponse && response && (
        <div className="mt-2 text-cyber-light-gray whitespace-pre-line">
          {displayedResponse}
          {showCursor && displayedResponse.length === response.length && (
            <span className="animate-terminal-cursor">|</span>
          )}
        </div>
      )}
    </div>
  )
}