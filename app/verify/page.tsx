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
      // Real API call
      const res = await fetch(`/api/verify?credential_id=${searchTerm}`)
      const data = await res.json()

      if (!data.valid) {
        throw new Error('Credential not valid or not found')
      }

      // Map API response to UI model
      const apiCred = data.credential

      const realCredential: Credential = {
        id: apiCred.id,
        agentDid: apiCred.agent_did || apiCred.agentDid || 'did:unknown',
        artifactHash: apiCred.artifact_hash || 'N/A',
        ownerName: apiCred.owner_name || 'Unknown Agent',
        contactEmail: apiCred.contact_email || 'N/A',
        permissions: apiCred.permissions || [],
        status: apiCred.status || 'ACTIVE',
        issuedAt: apiCred.issued_at || new Date().toISOString(),
        expiresAt: apiCred.expires_at,
        revokedAt: apiCred.revoked_at,
        revocationReason: apiCred.revocation_reason,
        anchorTx: apiCred.anchor_tx || apiCred.id, // Use ID as anchor if anchor_tx missing
        maxTransactionValue: apiCred.max_transaction_value
      }

      setCredential(realCredential)

      const statusMsg = realCredential.status === 'ACTIVE'
        ? 'Credential Verified on Amadeus Network'
        : `Credential is ${realCredential.status}`

      toast(realCredential.status === 'ACTIVE' ? 'success' : 'error', 'Result Found', statusMsg)
    } catch (error) {
      console.error(error)
      toast('error', 'Credential not found', 'Please check the ID and verify it exists on Amadeus Testnet')
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
        return <CheckCircle className="w-5 h-5 text-success-400" />
      case 'REVOKED':
        return <XCircle className="w-5 h-5 text-error-400" />
      case 'EXPIRED':
        return <AlertCircle className="w-5 h-5 text-warning-400" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-12">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-sm text-primary-400 hover:text-white flex items-center mb-4 transition-colors">
          <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Verify Credential</h1>
        <p className="text-accent-400">
          Query agent credentials and simulate transaction authorization against the blockchain.
        </p>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-white/10 bg-surface-900 shadow-xl transition-all hover:border-primary-500/30 relative overflow-hidden p-6 mb-8 bg-surface-100/30 backdrop-blur-lg border-primary-500/20">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-2">
              Credential ID or Agent DID
            </label>
            <div className="relative group">
              <input
                id="search"
                type="text"
                className="flex h-11 w-full rounded-lg border border-white/10 bg-surface-50 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-transparent transition-all backdrop-blur-sm text-white pr-10 bg-background/50 border-white/10 focus:border-primary-500/50"
                placeholder="cred_123456789 or did:example:agent123"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary-400 transition-colors" />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider relative overflow-hidden bg-primary-600 text-white hover:bg-primary-500 shadow-[0_0_15px_rgba(139,92,246,0.5)] h-11 px-8"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Credential Details */}
      {credential && (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Credential Info */}
          <div className="rounded-xl border border-white/10 bg-surface-900 shadow-xl transition-all hover:border-primary-500/30 relative overflow-hidden p-6 border-white/10 hover:border-primary-500/30 transition-colors bg-surface-100/20 backdrop-blur-md">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-primary-400" />
              Credential Details
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-surface-50/50 rounded-lg border border-white/5">
                <span className="text-xs text-gray-400 block mb-1">Credential ID</span>
                <div className="font-mono text-sm text-primary-300 break-all">{credential.id}</div>
              </div>
              <div>
                <span className="text-sm text-gray-400">Agent DID</span>
                <div className="font-mono text-sm text-white">{credential.agentDid}</div>
              </div>
              <div>
                <span className="text-sm text-gray-400">Artifact Hash</span>
                <div className="font-mono text-sm text-gray-300 truncate">{credential.artifactHash}</div>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3 mt-2">
                <div>
                  <span className="text-sm text-gray-400">Owner</span>
                  <div className="text-white">{credential.ownerName}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Status</span>
                  <div className={`flex items-center space-x-2 mt-1 px-3 py-1 rounded-full text-xs font-bold border ${credential.status === 'ACTIVE' ? 'bg-success-500/10 text-success-400 border-success-500/20' :
                    credential.status === 'REVOKED' ? 'bg-error-500/10 text-error-400 border-error-500/20' :
                      'bg-warning-500/10 text-warning-400 border-warning-500/20'
                    }`}>
                    {getStatusIcon(credential.status)}
                    <span>{credential.status}</span>
                  </div>
                </div>
              </div>

              {credential.revokedAt && (
                <div className="p-3 bg-error-500/10 border border-error-500/30 rounded-lg">
                  <span className="text-sm text-error-400 font-semibold block mb-1">Revocation Details</span>
                  <div className="text-sm text-error-200">
                    <div>Date: {new Date(credential.revokedAt).toLocaleDateString()}</div>
                    <div>Reason: {credential.revocationReason}</div>
                  </div>
                </div>
              )}

              {credential.anchorTx && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <span className="text-sm text-gray-400">Amadeus Anchor</span>
                  <div className="flex items-center justify-between mt-1 p-2 bg-black/20 rounded">
                    <span className="font-mono text-xs text-secondary-400 truncate max-w-[200px]">{credential.anchorTx}</span>
                    <a
                      href={`https://explorer.ama.one/entry/${credential.anchorTx}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-white flex items-center text-xs font-medium transition-colors"
                    >
                      Explorer <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Permissions & Simulation */}
          <div className="space-y-6">
            <div className="rounded-xl border border-white/10 bg-surface-900 shadow-xl transition-all hover:border-primary-500/30 relative overflow-hidden p-6 border-white/10 hover:border-secondary-500/30 transition-colors bg-surface-100/20 backdrop-blur-md">
              <h3 className="text-lg font-semibold text-white mb-4">Granted Permissions</h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {credential.permissions.map((perm) => (
                  <div key={perm} className="flex items-center p-2 bg-surface-50/50 border border-white/5 rounded">
                    <CheckCircle className="w-4 h-4 text-success-400 mr-2" />
                    <span className="text-gray-200 capitalize text-sm">{perm}</span>
                  </div>
                ))}
              </div>
              {credential.maxTransactionValue && (
                <div className="p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg">
                  <div className="text-xs text-primary-300 uppercase tracking-widest mb-1">Max Transaction Value</div>
                  <div className="text-2xl font-bold text-white font-mono">
                    ${credential.maxTransactionValue.toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {/* Transaction Simulation */}
            <div className="rounded-xl border border-white/10 bg-surface-900 shadow-xl transition-all hover:border-primary-500/30 relative overflow-hidden p-6 border-white/10 bg-surface-900/40 backdrop-blur-md">
              <h3 className="text-lg font-semibold text-white mb-4">Transaction Simulation</h3>
              <div className="flex flex-col gap-4 mb-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                    Transaction Amount ($)
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="amount"
                      type="number"
                      className="flex h-11 w-full rounded-lg border border-white/10 bg-surface-50 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-transparent transition-all backdrop-blur-sm text-white flex-1"
                      placeholder="Enter amount..."
                      value={transactionAmount}
                      onChange={(e) => setTransactionAmount(e.target.value)}
                    />
                    <button
                      onClick={simulateTransaction}
                      disabled={isLoading || !transactionAmount}
                      className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider relative overflow-hidden bg-surface-100 text-white hover:bg-surface-200 border border-white/10 hover:border-primary-400/50 backdrop-blur-sm whitespace-nowrap"
                    >
                      {isLoading ? '...' : 'Verify'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Simulation Result */}
              {simulation && (
                <div className={`p-4 rounded-lg border animate-fade-in ${simulation.allowed ? 'bg-success-500/10 border-success-500/30' : 'bg-error-500/10 border-error-500/30'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {simulation.allowed ? (
                        <CheckCircle className="w-5 h-5 text-success-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-error-400" />
                      )}
                      <span className={`font-bold text-sm ${simulation.allowed ? 'text-success-400' : 'text-error-400'}`}>
                        {simulation.allowed ? 'AUTHORIZED' : 'BLOCKED'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 px-2 py-1 bg-black/20 rounded">
                      Risk: {simulation.riskScore}/100
                    </div>
                  </div>
                  <p className={`text-sm ${simulation.allowed ? 'text-success-200' : 'text-error-200'}`}>
                    {simulation.reason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Link href="/apply" className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider relative overflow-hidden bg-surface-100 text-white hover:bg-surface-200 border border-white/10 hover:border-primary-400/50 backdrop-blur-sm flex-1 text-center py-4 text-base">
          Submit New Application
        </Link>
        <Link href="/dashboard" className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider relative overflow-hidden bg-primary-600 text-white hover:bg-primary-500 shadow-[0_0_15px_rgba(139,92,246,0.5)] flex-1 text-center py-4 text-base">
          Go to Admin Dashboard
        </Link>
      </div>
    </div>
  )
}