'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, Shield, CheckCircle, XCircle, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

interface Credential {
  id: string
  agentDid: string
  artifactHash: string
  ownerName: string
  contactEmail: string
  permissions: string[]
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED'
  issuedAt: string
  expiresAt?: string
  revokedAt?: string
  revocationReason?: string
  anchorTx?: string
  maxTransactionValue?: number
}

interface TransactionSimulation {
  allowed: boolean
  reason: string
  riskScore: number
}

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [credential, setCredential] = useState<Credential | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [simulation, setSimulation] = useState<TransactionSimulation | null>(null)
  const [transactionAmount, setTransactionAmount] = useState('')

  // Auto-search if credential ID is in URL
  useEffect(() => {
    const credentialId = searchParams.get('credential')
    if (credentialId) {
      setSearchQuery(credentialId)
      handleSearch(credentialId)
    }
  }, [searchParams])

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery.trim()
    if (!searchTerm) {
      toast('warning', 'Please enter a credential ID or agent DID')
      return
    }

    setIsLoading(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock credential data
      const mockCredential: Credential = {
        id: searchTerm.startsWith('cred_') ? searchTerm : `cred_${Date.now()}`,
        agentDid: 'did:example:agent123',
        artifactHash: 'a1b2c3d4e5f6789012345678901234567890abcdef',
        ownerName: 'Demo Agent',
        contactEmail: 'demo@example.com',
        permissions: ['read', 'write', 'execute'],
        status: searchTerm.includes('revoked') ? 'REVOKED' : 'ACTIVE',
        issuedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days from now
        anchorTx: 'tx_abc123def456',
        maxTransactionValue: 10000
      }

      if (searchTerm.includes('revoked')) {
        mockCredential.revokedAt = new Date(Date.now() - 3600000).toISOString()
        mockCredential.revocationReason = 'Security policy violation'
      }

      setCredential(mockCredential)
      toast('success', 'Credential found', `Status: ${mockCredential.status}`)
    } catch (error) {
      toast('error', 'Credential not found', 'Please check the ID and try again')
      setCredential(null)
    } finally {
      setIsLoading(false)
    }
  }

  const simulateTransaction = async () => {
    if (!credential || !transactionAmount) {
      toast('warning', 'Please enter a transaction amount')
      return
    }

    const amount = parseFloat(transactionAmount)
    if (isNaN(amount) || amount <= 0) {
      toast('warning', 'Please enter a valid amount')
      return
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      let allowed = true
      let reason = 'Transaction approved'
      let riskScore = 10

      if (credential.status === 'REVOKED') {
        allowed = false
        reason = 'Credential is revoked'
        riskScore = 100
      } else if (credential.status === 'EXPIRED') {
        allowed = false
        reason = 'Credential has expired'
        riskScore = 90
      } else if (credential.maxTransactionValue && amount > credential.maxTransactionValue) {
        allowed = false
        reason = `Amount exceeds limit of $${credential.maxTransactionValue.toLocaleString()}`
        riskScore = 80
      } else if (amount > 5000) {
        riskScore = 40
        reason = 'High-value transaction requires additional verification'
      }

      setSimulation({ allowed, reason, riskScore })
      toast(allowed ? 'success' : 'error', allowed ? 'Transaction Approved' : 'Transaction Blocked', reason)
    } catch (error) {
      toast('error', 'Simulation failed', 'Please try again')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-5 h-5 text-success-600" />
      case 'REVOKED':
        return <XCircle className="w-5 h-5 text-error-600" />
      case 'EXPIRED':
        return <AlertCircle className="w-5 h-5 text-warning-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-accent-600" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-sm text-accent-600 hover:text-accent-900 flex items-center mb-4">
          <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-accent-900 mb-2">Verify Credential</h1>
        <p className="text-accent-600">
          Query agent credentials and simulate transaction authorization
        </p>
      </div>

      {/* Search */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-accent-900 mb-2">
              Credential ID or Agent DID
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                className="input pr-10"
                placeholder="cred_123456789 or did:example:agent123"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Search className="w-5 h-5 text-accent-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="btn-primary h-10"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </button>
          </div>
        </div>
        <p className="text-sm text-accent-500 mt-2">
          Try "cred_demo_active" or "cred_demo_revoked" for demo data
        </p>
      </div>

      {/* Credential Details */}
      {credential && (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Credential Info */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-accent-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Credential Details
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-accent-600">Credential ID</span>
                <div className="font-mono text-sm text-accent-900">{credential.id}</div>
              </div>
              <div>
                <span className="text-sm text-accent-600">Agent DID</span>
                <div className="font-mono text-sm text-accent-900">{credential.agentDid}</div>
              </div>
              <div>
                <span className="text-sm text-accent-600">Artifact Hash</span>
                <div className="font-mono text-sm text-accent-900">{credential.artifactHash}</div>
              </div>
              <div>
                <span className="text-sm text-accent-600">Owner</span>
                <div className="text-accent-900">{credential.ownerName}</div>
              </div>
              <div>
                <span className="text-sm text-accent-600">Status</span>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(credential.status)}
                  <span className="font-medium">{credential.status}</span>
                </div>
              </div>
              {credential.revokedAt && (
                <div>
                  <span className="text-sm text-accent-600">Revoked</span>
                  <div className="text-error-600">
                    {new Date(credential.revokedAt).toLocaleDateString()} - {credential.revocationReason}
                  </div>
                </div>
              )}
              {credential.anchorTx && (
                <div>
                  <span className="text-sm text-accent-600">Anchor Transaction</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm text-accent-900">{credential.anchorTx}</span>
                    <button className="text-primary-600 hover:text-primary-700">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Permissions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-accent-900 mb-4">Granted Permissions</h3>
            <div className="space-y-2 mb-4">
              {credential.permissions.map((perm) => (
                <div key={perm} className="flex items-center justify-between p-2 bg-accent-50 rounded">
                  <span className="text-accent-900 capitalize">{perm}</span>
                  <CheckCircle className="w-4 h-4 text-success-600" />
                </div>
              ))}
            </div>
            {credential.maxTransactionValue && (
              <div className="p-3 bg-primary-50 rounded">
                <div className="text-sm text-accent-600">Max Transaction Value</div>
                <div className="text-lg font-semibold text-accent-900">
                  ${credential.maxTransactionValue.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transaction Simulation */}
      {credential && (
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-semibold text-accent-900 mb-4">Transaction Simulation</h3>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label htmlFor="amount" className="block text-sm font-medium text-accent-900 mb-2">
                Transaction Amount ($)
              </label>
              <input
                id="amount"
                type="number"
                className="input"
                placeholder="1000"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={simulateTransaction}
                disabled={isLoading || !transactionAmount}
                className="btn-primary h-10"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Simulate'
                )}
              </button>
            </div>
          </div>

          {/* Simulation Result */}
          {simulation && (
            <div className={`p-4 rounded-lg ${simulation.allowed ? 'bg-success-50 border border-success-200' : 'bg-error-50 border border-error-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {simulation.allowed ? (
                    <CheckCircle className="w-5 h-5 text-success-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-error-600" />
                  )}
                  <span className={`font-semibold ${simulation.allowed ? 'text-success-900' : 'text-error-900'}`}>
                    {simulation.allowed ? 'TRANSACTION ALLOWED' : 'TRANSACTION BLOCKED'}
                  </span>
                </div>
                <div className="text-sm text-accent-600">
                  Risk: {simulation.riskScore}/100
                </div>
              </div>
              <p className={`text-sm ${simulation.allowed ? 'text-success-700' : 'text-error-700'}`}>
                {simulation.reason}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/apply" className="btn-secondary flex-1 text-center">
          Submit Application
        </Link>
        <Link href="/dashboard" className="btn-primary flex-1 text-center">
          Admin Dashboard
        </Link>
      </div>
    </div>
  )
}