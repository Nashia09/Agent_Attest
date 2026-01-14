'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, XCircle, Clock, Shield, Ban, ArrowRight, AlertCircle, Activity, FileText } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'
import { TableSkeleton } from '@/components/LoadingStates'

interface Application {
  id: string
  agentDid: string
  ownerName: string
  status: 'PENDING' | 'AUDITING' | 'APPROVED' | 'REJECTED' | 'ISSUED'
  riskScore: number
  submittedAt: string
  claimedPermissions: string[]
  credentialId?: string
}

interface LogEntry {
  id: string
  timestamp: string
  action: string
  agentDid: string
  details: string
  type: 'ISSUE' | 'REVOKE' | 'AUDIT' | 'ERROR'
}

export default function DashboardPage() {
  const { toast } = useToast()
  const [applications, setApplications] = useState<Application[]>([])
  const [eventLog, setEventLog] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'applications' | 'log'>('applications')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = () => {
    // Load applications from localStorage
    const storedApps: Application[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('application_')) {
        const app = JSON.parse(localStorage.getItem(key)!)
        storedApps.push(app)
      }
    }

    // Add mock applications if none exist
    if (storedApps.length === 0) {
      const mockApps: Application[] = [
        {
          id: 'app_demo_1',
          agentDid: 'did:example:agent123',
          ownerName: 'Demo Agent 1',
          status: 'PENDING',
          riskScore: 45,
          submittedAt: new Date(Date.now() - 3600000).toISOString(),
          claimedPermissions: ['read', 'write']
        },
        {
          id: 'app_demo_2',
          agentDid: 'did:example:agent456',
          ownerName: 'Demo Agent 2',
          status: 'AUDITING',
          riskScore: 75,
          submittedAt: new Date(Date.now() - 7200000).toISOString(),
          claimedPermissions: ['read', 'write', 'high-value']
        },
        {
          id: 'app_demo_3',
          agentDid: 'did:example:agent789',
          ownerName: 'Demo Agent 3',
          status: 'ISSUED',
          riskScore: 25,
          submittedAt: new Date(Date.now() - 86400000).toISOString(),
          claimedPermissions: ['read']
        }
      ]
      storedApps.push(...mockApps)
    }

    // Mock event log
    const mockLog: LogEntry[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        action: 'CREDENTIAL_ISSUED',
        agentDid: 'did:example:agent789',
        details: 'Credential issued with read permissions',
        type: 'ISSUE'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        action: 'AUDIT_COMPLETED',
        agentDid: 'did:example:agent456',
        details: 'Risk score: 75 - requires admin review',
        type: 'AUDIT'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        action: 'CREDENTIAL_REVOKED',
        agentDid: 'did:example:agent_old',
        details: 'Revoked due to policy violation',
        type: 'REVOKE'
      }
    ]

    setApplications(storedApps.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()))
    setEventLog(mockLog)
    setIsLoading(false)
  }

  const handleAction = async (applicationId: string, action: 'approve' | 'reject' | 'revoke') => {
    const app = applications.find(a => a.id === applicationId)
    if (!app) return

    // Update application status
    let newStatus: Application['status']
    let message: string
    let logAction: string
    let logType: LogEntry['type']
    let credentialId = app.credentialId

    setIsLoading(true)

    try {
      if (action === 'approve') {
        const res = await fetch(`/api/admin/issue/${applicationId}`, { method: 'POST' })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to issue credential')

        newStatus = 'ISSUED' // Directly set to ISSUED
        message = `Credential issued. Tx: ${data.credential.transactionId}`
        logAction = 'CREDENTIAL_ISSUED'
        logType = 'ISSUE'
        credentialId = data.credential.id
      } else if (action === 'revoke') {
        const targetId = credentialId || applicationId // Use stored credentialId (txHash) if available
        const res = await fetch(`/api/admin/revoke/${targetId}`, { method: 'POST' })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to revoke credential')

        newStatus = 'REJECTED' // Treat revoked as rejected/revoked
        message = `Credential revoked. Tx: ${data.revocation.transactionId}`
        logAction = 'CREDENTIAL_REVOKED'
        logType = 'REVOKE'
      } else {
        // Reject
        newStatus = 'REJECTED'
        message = 'Application rejected'
        logAction = 'APPLICATION_REJECTED'
        logType = 'AUDIT'
      }

      // Update in localStorage
      const updatedApp = { ...app, status: newStatus, credentialId }
      localStorage.setItem(`application_${applicationId}`, JSON.stringify(updatedApp))

      // Update state
      setApplications(prev => prev.map(a => a.id === applicationId ? updatedApp : a))

      // Add to event log
      const logEntry: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action: logAction,
        agentDid: app.agentDid,
        details: message,
        type: logType
      }
      setEventLog(prev => [logEntry, ...prev])

      toast('success', action.charAt(0).toUpperCase() + action.slice(1) + 'd', message)
    } catch (error: any) {
      console.error('Action failed:', error)
      toast('error', 'Action Failed', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      case 'AUDITING':
        return <Activity className="w-4 h-4" />
      case 'APPROVED':
      case 'ISSUED':
        return <CheckCircle className="w-4 h-4" />
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-warning-400 bg-warning-400/10 border-warning-400/20'
      case 'AUDITING':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      case 'APPROVED':
      case 'ISSUED':
        return 'text-success-400 bg-success-400/10 border-success-400/20'
      case 'REJECTED':
        return 'text-error-400 bg-error-400/10 border-error-400/20'
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    }
  }

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'ISSUE':
        return <Shield className="w-4 h-4 text-success-400" />
      case 'REVOKE':
        return <Ban className="w-4 h-4 text-error-400" />
      case 'AUDIT':
        return <AlertCircle className="w-4 h-4 text-warning-400" />
      case 'ERROR':
        return <XCircle className="w-4 h-4 text-error-400" />
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <TableSkeleton />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-accent-400">
            Review applications, manage credentials, and monitor network events
          </p>
        </div>
        <Link href="/apply" className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider relative overflow-hidden bg-surface-100 text-white hover:bg-surface-200 border border-white/10 hover:border-primary-400/50 backdrop-blur-sm flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          New Application
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Pending', value: applications.filter(a => a.status === 'PENDING').length, color: 'text-warning-400', icon: Clock },
          { label: 'Under Audit', value: applications.filter(a => a.status === 'AUDITING').length, color: 'text-blue-400', icon: Activity },
          { label: 'Active Credentials', value: applications.filter(a => ['APPROVED', 'ISSUED'].includes(a.status)).length, color: 'text-success-400', icon: Shield },
          { label: 'Rejected/Revoked', value: applications.filter(a => a.status === 'REJECTED').length, color: 'text-error-400', icon: Ban },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-xl border border-white/10 bg-surface-900 shadow-xl transition-all hover:border-primary-500/30 relative overflow-hidden p-6 border-white/5 backdrop-blur-sm">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-white/10">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'applications'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-gray-400 hover:text-white hover:border-white/20'
                }`}
            >
              Applications
            </button>
            <button
              onClick={() => setActiveTab('log')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'log'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-gray-400 hover:text-white hover:border-white/20'
                }`}
            >
              Event Log
            </button>
          </nav>
        </div>
      </div>

      {/* Applications Table */}
      {activeTab === 'applications' && (
        <div className="rounded-xl border border-white/10 bg-surface-900 shadow-xl transition-all hover:border-primary-500/30 relative overflow-hidden overflow-hidden border-white/10 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Application
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">{app.ownerName}</div>
                        <div className="text-xs text-gray-500 font-mono truncate max-w-[150px]">
                          {app.agentDid}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="text-sm font-medium w-8 text-right mr-3">{app.riskScore}</div>
                        <div className="w-24 bg-white/10 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${app.riskScore > 70 ? 'bg-error-500' :
                              app.riskScore > 40 ? 'bg-warning-500' : 'bg-success-500'
                              }`}
                            style={{ width: `${app.riskScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center w-fit space-x-1.5 ${getStatusColor(app.status)}`}>
                        {getStatusIcon(app.status)}
                        <span>{app.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {app.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleAction(app.id, 'approve')}
                              className="p-1.5 rounded bg-success-500/10 text-success-400 hover:bg-success-500/20 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction(app.id, 'reject')}
                              className="p-1.5 rounded bg-error-500/10 text-error-400 hover:bg-error-500/20 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {app.status === 'ISSUED' && (
                          <button
                            onClick={() => handleAction(app.id, 'revoke')}
                            className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider relative overflow-hidden bg-warning-500/20 text-warning-400 border border-warning-500/50 hover:bg-warning-500/30 text-xs px-3 py-1.5 flex items-center"
                          >
                            <Ban className="w-3 h-3 mr-1" />
                            Revoke
                          </button>
                        )}
                        {/* <Link href={`/status/${app.id}`} className="p-1.5 rounded bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </Link> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Event Log */}
      {activeTab === 'log' && (
        <div className="rounded-xl border border-white/10 bg-surface-900 shadow-xl transition-all hover:border-primary-500/30 relative overflow-hidden border-white/10 backdrop-blur-md">
          <div className="divide-y divide-white/5">
            {eventLog.map((entry) => (
              <div key={entry.id} className="px-6 py-4 flex items-start space-x-4 hover:bg-white/5 transition-colors">
                <div className={`mt-1 p-1.5 rounded-full bg-white/5 ${entry.type === 'ISSUE' ? 'text-success-400' :
                  entry.type === 'REVOKE' ? 'text-error-400' :
                    entry.type === 'AUDIT' ? 'text-warning-400' : 'text-gray-400'
                  }`}>
                  {getLogIcon(entry.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <div className="text-sm font-medium text-white">
                      {entry.action.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    {entry.details}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 font-mono">
                    {entry.agentDid}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}