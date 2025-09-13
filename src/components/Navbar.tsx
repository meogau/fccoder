'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  const navLinks = [
    { href: '/', label: 'home', command: './' },
    { href: '/players', label: 'squad', command: './players' },
    { href: '/matches', label: 'matches', command: './matches' },
    { href: '/admin', label: 'admin', command: './admin' },
  ]

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true
    if (href !== '/' && pathname.startsWith(href)) return true
    return false
  }

  return (
    <nav className="sticky top-0 z-50 bg-cyber-dark/95 backdrop-blur-sm border-b border-neon-green/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-neon-green rounded border border-neon-green/50 flex items-center justify-center font-mono font-bold text-cyber-dark">
              FC
            </div>
            <span className="font-mono text-neon-green text-lg font-bold">
              FC_CODER
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              // Show admin link only if user is logged in
              if (link.href === '/admin' && !user) return null
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-mono text-sm transition-all duration-300 hover:text-neon-green relative group ${
                    isActive(link.href) 
                      ? 'text-neon-green' 
                      : 'text-cyber-light-gray'
                  }`}
                >
                  <span className="text-cyber-gray mr-1">$</span>
                  {link.command}
                  {isActive(link.href) && (
                    <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-neon-green"></div>
                  )}
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neon-blue transition-all duration-300 group-hover:w-full"></div>
                </Link>
              )
            })}
            
            {/* Auth Actions */}
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="font-mono text-xs text-cyber-gray">
                  <span className="text-neon-green">admin@</span>fccoder
                </span>
                <button
                  onClick={logout}
                  className="font-mono text-sm text-red-400 hover:text-red-300 transition-colors duration-300"
                >
                  ./logout()
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="font-mono text-sm text-cyber-light-gray hover:text-neon-green transition-colors duration-300"
              >
                <span className="text-cyber-gray mr-1">$</span>
                ./login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-cyber-light-gray hover:text-neon-green transition-colors duration-200"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-cyber-darker/95 border-t border-neon-green/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 font-mono text-sm transition-all duration-300 hover:text-neon-green hover:bg-neon-green/10 rounded ${
                    isActive(link.href) 
                      ? 'text-neon-green bg-neon-green/10' 
                      : 'text-cyber-light-gray'
                  }`}
                >
                  <span className="text-cyber-gray mr-1">$</span>
                  {link.command}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}