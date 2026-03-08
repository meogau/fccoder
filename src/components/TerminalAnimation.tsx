'use client'

import { useState, useEffect } from 'react'
import TerminalCommand from './TerminalCommand'

interface TerminalStep {
  command: string
  response: string
}

export default function TerminalAnimation() {
  const [currentStep, setCurrentStep] = useState(0)

  const terminalSteps: TerminalStep[] = [
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

  const handleStepComplete = () => {
    if (currentStep < terminalSteps.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, 500)
    }
  }

  return (
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
  )
}
