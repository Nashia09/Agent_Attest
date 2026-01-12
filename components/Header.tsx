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
    <header className="bg-white border-b border-accent-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-accent-900">AgentAttest</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-accent-600 hover:text-accent-900 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            
            {/* User Role Selector */}
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as any)}
              className="text-sm font-medium text-accent-600 bg-accent-50 border border-accent-200 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Select user role"
            >
              <option value="agent">Agent</option>
              <option value="verifier">Verifier</option>
              <option value="admin">Admin</option>
            </select>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-accent-600 hover:text-accent-900 hover:bg-accent-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-accent-200">
            <nav className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-accent-600 hover:text-accent-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-accent-200">
                <label htmlFor="mobile-role-select" className="block text-sm font-medium text-accent-600 mb-2">
                  User Role
                </label>
                <select
                  id="mobile-role-select"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as any)}
                  className="w-full text-sm font-medium text-accent-600 bg-accent-50 border border-accent-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
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