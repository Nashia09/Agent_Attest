'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Play,
  FileText,
  Search,
  Shield,
  CheckCircle,
  XCircle,
  Ban,
  ArrowRight,
  Clock,
  RefreshCw
} from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

interface DemoStep {
  id: string
  title: string
  description: string
  icon: React.ElementType
  status: 'pending' | 'running' | 'completed' | 'failed'
  action: () => Promise<void>
}

export default function DemoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [demoResults, setDemoResults] = useState<{
    applicationId?: string
    credentialId?: string
    transactionBlocked?: boolean
  }>({})

  const steps: DemoStep[] = [
    {
      id: 'apply',
      title: 'Submit Application',
      description: 'Agent submits credential application with DID and artifact hash',
      icon: FileText,
      status: 'pending',
      action: async () => {
        // Simulate application submission
        await new Promise(resolve => setTimeout(resolve, 2000))
        const applicationId = 'app_demo_' + Date.now().toString(36)
        const application = {
          id: applicationId,
          agentDid: 'did:demo:agent123',
          artifactHash: 'demo_hash_' + Date.now().toString(36),
          ownerName: 'Demo Agent',
          contactEmail: 'demo@example.com',
          claimedPermissions: ['read', 'write', 'execute'],
          status: 'PENDING',
          submittedAt: new Date().toISOString(),
          riskScore: 35
        }
        localStorage.setItem(`application_${applicationId}`, JSON.stringify(application))
        setDemoResults(prev => ({ ...prev, applicationId }))
        toast('success', 'Application submitted', `ID: ${applicationId}`)
      }
    },
    {
      id: 'audit',
      title: 'Risk Assessment',
      description: 'System performs automated audit and calculates risk score',
      icon: Search,
      status: 'pending',
      action: async () => {
        await new Promise(resolve => setTimeout(resolve, 1500))
        const app = JSON.parse(localStorage.getItem(`application_${demoResults.applicationId}`)!)
        app.status = 'AUDITING'
        app.auditReport = {
          findings: ['Clean security history', 'Valid DID document', 'Low-risk permissions requested'],
          recommendations: ['Approve for standard processing'],
          riskFactors: ['Low transaction volume expected']
        }
        localStorage.setItem(`application_${demoResults.applicationId}`, JSON.stringify(app))
        toast('success', 'Audit completed', 'Risk score: 35/100 (Low)')
      }
    },
    {
      id: 'issue',
      title: 'Issue Credential',
      description: 'Admin approves and issues verifiable credential',
      icon: Shield,
      status: 'pending',
      action: async () => {
        await new Promise(resolve => setTimeout(resolve, 1500))
        const credentialId = 'cred_demo_' + Date.now().toString(36)
        const app = JSON.parse(localStorage.getItem(`application_${demoResults.applicationId}`)!)
        app.status = 'ISSUED'
        app.credentialId = credentialId
        app.issuedAt = new Date().toISOString()
        localStorage.setItem(`application_${demoResults.applicationId}`, JSON.stringify(app))

        // Store credential
        const credential = {
          id: credentialId,
          agentDid: app.agentDid,
          artifactHash: app.artifactHash,
          ownerName: app.ownerName,
          contactEmail: app.contactEmail,
          permissions: app.claimedPermissions,
          status: 'ACTIVE',
          issuedAt: app.issuedAt,
          maxTransactionValue: 10000,
          anchorTx: 'tx_demo_' + Date.now().toString(36)
        }
        localStorage.setItem(`credential_${credentialId}`, JSON.stringify(credential))

        setDemoResults(prev => ({ ...prev, credentialId }))
        toast('success', 'Credential issued', `ID: ${credentialId}`)
      }
    },
    {
      id: 'verify',
      title: 'Verify Credential',
      description: 'Verifier checks credential validity and permissions',
      icon: CheckCircle,
      status: 'pending',
      action: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const credential = JSON.parse(localStorage.getItem(`credential_${demoResults.credentialId}`)!)
        if (credential.status === 'ACTIVE') {
          toast('success', 'Credential verified', 'Status: ACTIVE, Permissions: read, write, execute')
        } else {
          throw new Error('Credential verification failed')
        }
      }
    },
    {
      id: 'simulate',
      title: 'Simulate Transaction',
      description: 'Test transaction authorization within limits',
      icon: ArrowRight,
      status: 'pending',
      action: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const credential = JSON.parse(localStorage.getItem(`credential_${demoResults.credentialId}`)!)
        const amount = 5000 // Within 10k limit

        if (amount <= credential.maxTransactionValue) {
          toast('success', 'Transaction approved', `$${amount.toLocaleString()} within limit`)
          setDemoResults(prev => ({ ...prev, transactionBlocked: false }))
        } else {
          toast('error', 'Transaction blocked', 'Amount exceeds credential limit')
          setDemoResults(prev => ({ ...prev, transactionBlocked: true }))
        }
      }
    },
    {
      id: 'revoke',
      title: 'Revoke Credential',
      description: 'Admin revokes credential for immediate blocking',
      icon: Ban,
      status: 'pending',
      action: async () => {
        await new Promise(resolve => setTimeout(resolve, 1500))
        const credential = JSON.parse(localStorage.getItem(`credential_${demoResults.credentialId}`)!)
        credential.status = 'REVOKED'
        credential.revokedAt = new Date().toISOString()
        credential.revocationReason = 'Demo revocation'
        localStorage.setItem(`credential_${demoResults.credentialId}`, JSON.stringify(credential))
        toast('warning', 'Credential revoked', 'All transactions will be blocked')
      }
    },
    {
      id: 'block',
      title: 'Verify Blocking',
      description: 'Confirm that revoked credential blocks new transactions',
      icon: XCircle,
      status: 'pending',
      action: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const credential = JSON.parse(localStorage.getItem(`credential_${demoResults.credentialId}`)!)
        if (credential.status === 'REVOKED') {
          toast('error', 'Transaction blocked', 'Credential is revoked - access denied')
          setDemoResults(prev => ({ ...prev, transactionBlocked: true }))
        } else {
          throw new Error('Blocking verification failed')
        }
      }
    }
  ]

  const runDemo = async () => {
    setIsRunning(true)
    setCurrentStep(0)
    setDemoResults({})

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i)
      try {
        await steps[i].action()
        // Update step status
        steps[i].status = 'completed'
      } catch (error) {
        steps[i].status = 'failed'
        toast('error', 'Demo failed', `Step ${i + 1} failed`)
        break
      }
    }

    setIsRunning(false)
    toast('success', 'Demo completed', 'All steps finished successfully')
  }

  const resetDemo = () => {
    setCurrentStep(0)
    setIsRunning(false)
    setDemoResults({})
    steps.forEach(step => step.status = 'pending')
    // Clean up demo data
    Object.keys(localStorage).forEach(key => {
      if (key.includes('demo_')) {
        localStorage.removeItem(key)
      }
    })
  }

  return (
    <div className="max-w-5xl mx-auto py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">AgentAttest Demo</h1>
        <p className="text-accent-400 max-w-2xl mx-auto">
          Experience the complete credential lifecycle in under 2 minutes, from application to revocation.
        </p>
      </div>

      {/* Demo Controls */}
      <div className="rounded-xl border border-white/10 bg-surface-900 shadow-xl transition-all hover:border-primary-500/30 relative overflow-hidden p-8 mb-8 text-center bg-surface-100/30 backdrop-blur-lg border-primary-500/20">
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <button
            onClick={runDemo}
            disabled={isRunning}
            className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider relative overflow-hidden bg-primary-600 text-white hover:bg-primary-500 shadow-[0_0_15px_rgba(139,92,246,0.5)] px-8 py-4 text-lg inline-flex items-center justify-center min-w-[200px]"
          >
            {isRunning ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Running Demo...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Start Demo
              </>
            )}
          </button>
          <button
            onClick={resetDemo}
            disabled={isRunning}
            className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider relative overflow-hidden bg-surface-100 text-white hover:bg-surface-200 border border-white/10 hover:border-primary-400/50 backdrop-blur-sm px-8 py-4 text-lg inline-flex items-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Reset State
          </button>
        </div>
        <p className="text-sm text-gray-400">
          This demo simulates blockchain interactions and automated verification steps
        </p>
      </div>

      {/* Demo Steps */}
      <div className="space-y-4 mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = isRunning && currentStep === index
          const isCompleted = step.status === 'completed'
          const isFailed = step.status === 'failed'

          let statusColor = 'border-white/5 bg-surface-100/10'
          if (isActive) statusColor = 'border-primary-500 ring-1 ring-primary-500 bg-primary-900/10'
          if (isCompleted) statusColor = 'border-success-500/50 bg-success-900/10'
          if (isFailed) statusColor = 'border-error-500/50 bg-error-900/10'

          return (
            <div
              key={step.id}
              className={`rounded-xl border border-white/10 bg-surface-900 shadow-xl transition-all hover:border-primary-500/30 relative overflow-hidden p-4 transition-all duration-300 ${statusColor} hover:border-white/20`}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-success-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.4)]' :
                    isFailed ? 'bg-error-500 text-white' :
                      isActive ? 'bg-primary-500 text-white animate-pulse-slow' :
                        'bg-surface-200/50 text-gray-500'
                    }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : isFailed ? (
                    <XCircle className="w-5 h-5" />
                  ) : isActive ? (
                    <Clock className="w-5 h-5 animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${isActive || isCompleted ? 'text-white' : 'text-gray-400'}`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-400">{step.description}</p>
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  STEP {String(index + 1).padStart(2, '0')}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Demo Results */}
      {Object.keys(demoResults).length > 0 && (
        <div className="rounded-xl border border-white/10 bg-surface-900 shadow-xl transition-all hover:border-primary-500/30 relative overflow-hidden p-6 mb-8 border-primary-500/30 bg-surface-100/20 backdrop-blur-md">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-primary-400" />
            Live Demo Results
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {demoResults.applicationId && (
              <div className="p-3 bg-white/5 rounded border border-white/5">
                <span className="text-xs text-gray-400 block mb-1">Generated Application ID</span>
                <div className="font-mono text-sm text-primary-300">{demoResults.applicationId}</div>
              </div>
            )}
            {demoResults.credentialId && (
              <div className="p-3 bg-white/5 rounded border border-white/5">
                <span className="text-xs text-gray-400 block mb-1">Issued Credential ID</span>
                <div className="font-mono text-sm text-success-300">{demoResults.credentialId}</div>
              </div>
            )}
            {demoResults.transactionBlocked !== undefined && (
              <div className={`p-3 rounded border ${demoResults.transactionBlocked ? 'bg-error-500/10 border-error-500/30' : 'bg-success-500/10 border-success-500/30'}`}>
                <span className="text-xs text-gray-400 block mb-1">Transaction Status</span>
                <div className={`font-bold flex items-center ${demoResults.transactionBlocked ? 'text-error-400' : 'text-success-400'}`}>
                  {demoResults.transactionBlocked ? <XCircle className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  {demoResults.transactionBlocked ? 'BLOCKED' : 'ALLOWED'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Link href="/apply" className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider relative overflow-hidden bg-surface-100 text-white hover:bg-surface-200 border border-white/10 hover:border-primary-400/50 backdrop-blur-sm flex-1 text-center py-4 text-base">
          Submit Real Application
        </Link>
        <Link href="/verify" className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider relative overflow-hidden bg-primary-600 text-white hover:bg-primary-500 shadow-[0_0_15px_rgba(139,92,246,0.5)] flex-1 text-center py-4 text-base">
          Verify Credentials
        </Link>
        <Link href="/dashboard" className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider relative overflow-hidden bg-surface-100 text-white hover:bg-surface-200 border border-white/10 hover:border-primary-400/50 backdrop-blur-sm flex-1 text-center py-4 text-base">
          Admin Dashboard
        </Link>
      </div>

      {/* Demo Notes */}
      <div className="mt-12 p-6 rounded-xl bg-surface-50/5 text-center border border-white/5">
        <h3 className="font-semibold text-gray-300 mb-2">Technical Note</h3>
        <p className="text-sm text-gray-400 max-w-3xl mx-auto">
          This demo runs primarily in your browser using local storage to simulate the workflow.
          The production version uses the Amadeus Network SDK to anchor credentials on-chain
          with real cryptographic signatures found in <code>/lib/amadeus.ts</code>.
        </p>
      </div>
    </div>
  )
}