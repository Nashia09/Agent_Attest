'use client'

import { useState, useEffect } from 'react'
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
  AlertCircle
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-accent-900 mb-2">AgentAttest Demo</h1>
        <p className="text-accent-600">
          Complete credential lifecycle demonstration in under 2 minutes
        </p>
      </div>

      {/* Demo Controls */}
      <div className="card p-6 mb-8 text-center">
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <button
            onClick={runDemo}
            disabled={isRunning}
            className="btn-primary px-8 py-3 text-lg inline-flex items-center justify-center"
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
            className="btn-secondary px-8 py-3 text-lg"
          >
            Reset
          </button>
        </div>
        <p className="text-sm text-accent-500">
          This demo will run through the complete credential lifecycle automatically
        </p>
      </div>

      {/* Demo Steps */}
      <div className="space-y-4 mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = isRunning && currentStep === index
          const isCompleted = step.status === 'completed'
          const isFailed = step.status === 'failed'

          return (
            <div
              key={step.id}
              className={`card p-4 transition-all ${
                isActive ? 'ring-2 ring-primary-500' :
                isCompleted ? 'bg-success-50 border-success-200' :
                isFailed ? 'bg-error-50 border-error-200' : ''
              }`}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-success-600 text-white' :
                    isFailed ? 'bg-error-600 text-white' :
                    isActive ? 'bg-primary-600 text-white' :
                    'bg-accent-200 text-accent-500'
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
                  <h3 className="font-semibold text-accent-900">{step.title}</h3>
                  <p className="text-sm text-accent-600">{step.description}</p>
                </div>
                <div className="text-sm text-accent-500">
                  Step {index + 1} of {steps.length}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Demo Results */}
      {Object.keys(demoResults).length > 0 && (
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-semibold text-accent-900 mb-4">Demo Results</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {demoResults.applicationId && (
              <div>
                <span className="text-sm text-accent-600">Application ID</span>
                <div className="font-mono text-sm text-accent-900">{demoResults.applicationId}</div>
              </div>
            )}
            {demoResults.credentialId && (
              <div>
                <span className="text-sm text-accent-600">Credential ID</span>
                <div className="font-mono text-sm text-accent-900">{demoResults.credentialId}</div>
              </div>
            )}
            {demoResults.transactionBlocked !== undefined && (
              <div>
                <span className="text-sm text-accent-600">Transaction Blocking</span>
                <div className={`font-medium ${demoResults.transactionBlocked ? 'text-error-600' : 'text-success-600'}`}>
                  {demoResults.transactionBlocked ? 'BLOCKED ✓' : 'ALLOWED ✓'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/apply" className="btn-secondary flex-1 text-center">
          Submit Real Application
        </Link>
        <Link href="/verify" className="btn-primary flex-1 text-center">
          Verify Credentials
        </Link>
        <Link href="/dashboard" className="btn-primary flex-1 text-center">
          Admin Dashboard
        </Link>
      </div>

      {/* Demo Notes */}
      <div className="mt-8 card p-6 bg-accent-50">
        <h3 className="font-semibold text-accent-900 mb-2">Demo Notes</h3>
        <ul className="text-sm text-accent-600 space-y-1">
          <li>• All data is stored locally in your browser for demonstration purposes</li>
          <li>• The demo simulates a complete credential lifecycle in seconds</li>
          <li>• In production, each step would involve real cryptographic operations</li>
          <li>• Risk scores are calculated based on requested permissions and agent history</li>
          <li>• Revocation is instant and blocks all subsequent transactions</li>
        </ul>
      </div>
    </div>
  )
}