'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Shield, Menu, X } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState<'agent' | 'verifier' | 'admin'>('agent')

  const navigation = [
    { href: '/', label: 'Home' },
    { href: '/apply', label: 'Apply' },
    { href: '/verify', label: 'Verify' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/demo', label: 'Demo' },
  ]

  return (
    <header className="fixed w-full top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Shield className="w-8 h-8 text-primary-500 relative z-10" />
              <div className="absolute inset-0 bg-primary-500/50 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400 group-hover:to-primary-400 transition-all duration-300">
              AgentAttest
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}

            {/* User Role Selector */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as any)}
                className="relative text-sm font-medium text-gray-200 bg-surface-900 border border-white/10 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none cursor-pointer hover:bg-surface-800 transition-colors"
                aria-label="Select user role"
              >
                <option value="agent">Agent</option>
                <option value="verifier">Verifier</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 animate-fade-in bg-background/95 backdrop-blur-xl absolute left-0 right-0 px-4 border-b">
            <nav className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-2 py-1 hover:bg-white/5 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-white/10">
                <label htmlFor="mobile-role-select" className="block text-sm font-medium text-gray-400 mb-2">
                  User Role
                </label>
                <select
                  id="mobile-role-select"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as any)}
                  className="w-full text-sm font-medium text-gray-200 bg-surface-900 border border-white/10 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                  <option value="agent">Agent</option>
                  <option value="verifier">Verifier</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}