'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, XCircle, Clock, Shield, Ban, ArrowRight, AlertCircle } from 'lucide-react'
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

    switch (action) {
      case 'approve':
        newStatus = 'APPROVED'
        message = 'Application approved, credential will be issued'
        logAction = 'APPLICATION_APPROVED'
        logType = 'ISSUE'
        break
      case 'reject':
        newStatus = 'REJECTED'
        message = 'Application rejected'
        logAction = 'APPLICATION_REJECTED'
        logType = 'AUDIT'
        break
      case 'revoke':
        newStatus = 'REJECTED' // In real app, this would be a separate revoked state
        message = 'Credential revoked'
        logAction = 'CREDENTIAL_REVOKED'
        logType = 'REVOKE'
        break
    }

    // Update in localStorage
    const updatedApp = { ...app, status: newStatus }
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
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      case 'AUDITING':
        return <AlertCircle className="w-4 h-4" />
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
        return 'warning'
      case 'AUDITING':
        return 'warning'
      case 'APPROVED':
      case 'ISSUED':
        return 'success'
      case 'REJECTED':
        return 'error'
      default:
        return 'accent'
    }
  }

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'ISSUE':
        return <Shield className="w-4 h-4 text-success-600" />
      case 'REVOKE':
        return <Ban className="w-4 h-4 text-error-600" />
      case 'AUDIT':
        return <AlertCircle className="w-4 h-4 text-warning-600" />
      case 'ERROR':
        return <XCircle className="w-4 h-4 text-error-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <TableSkeleton />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-accent-900 mb-2">Admin Dashboard</h1>
        <p className="text-accent-600">
          Review applications, manage credentials, and monitor events
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Pending', value: applications.filter(a => a.status === 'PENDING').length, color: 'warning' },
          { label: 'Under Audit', value: applications.filter(a => a.status === 'AUDITING').length, color: 'warning' },
          { label: 'Approved', value: applications.filter(a => ['APPROVED', 'ISSUED'].includes(a.status)).length, color: 'success' },
          { label: 'Rejected', value: applications.filter(a => a.status === 'REJECTED').length, color: 'error' },
        ].map((stat) => (
          <div key={stat.label} className="card p-6 text-center">
            <div className={`text-3xl font-bold text-${stat.color}-600 mb-1`}>{stat.value}</div>
            <div className="text-sm text-accent-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-accent-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'applications'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-accent-500 hover:text-accent-700 hover:border-accent-300'
              }`}
            >
              Applications
            </button>
            <button
              onClick={() => setActiveTab('log')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'log'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-accent-500 hover:text-accent-700 hover:border-accent-300'
              }`}
            >
              Event Log
            </button>
          </nav>
        </div>
      </div>

      {/* Applications Table */}
      {activeTab === 'applications' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-accent-200">
              <thead className="bg-accent-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-accent-500 uppercase tracking-wider">
                    Application
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-accent-500 uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-accent-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-accent-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-accent-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-accent-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-accent-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-accent-900">{app.ownerName}</div>
                        <div className="text-sm text-accent-500 font-mono truncate">
                          {app.agentDid}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-accent-900">{app.riskScore}</div>
                        <div className="ml-2 w-16 bg-accent-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              app.riskScore > 70 ? 'bg-error-500' :
                              app.riskScore > 40 ? 'bg-warning-500' : 'bg-success-500'
                            }`}
                            style={{ width: `${app.riskScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`status-${getStatusColor(app.status)} px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1`}>
                        {getStatusIcon(app.status)}
                        <span>{app.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-accent-500">
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {app.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleAction(app.id, 'approve')}
                              className="btn-success text-xs px-3 py-1"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(app.id, 'reject')}
                              className="btn-error text-xs px-3 py-1"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                        {app.status === 'ISSUED' && (
                          <button
                            onClick={() => handleAction(app.id, 'revoke')}
                            className="btn-warning text-xs px-3 py-1"
                          >
                            <Ban className="w-3 h-3 mr-1" />
                            Revoke
                          </button>
                        )}
                        <Link href={`/status/${app.id}`} className="btn-ghost text-xs px-3 py-1">
                          View
                        </Link>
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
        <div className="card">
          <div className="divide-y divide-accent-200">
            {eventLog.map((entry) => (
              <div key={entry.id} className="px-6 py-4 flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getLogIcon(entry.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-accent-900">
                    {entry.action.replace('_', ' ')}
                  </div>
                  <div className="text-sm text-accent-600 mt-1">
                    {entry.details}
                  </div>
                  <div className="text-xs text-accent-500 mt-1">
                    {new Date(entry.timestamp).toLocaleString()} • {entry.agentDid}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Link href="/apply" className="btn-secondary flex-1 text-center">
          New Application
        </Link>
        <Link href="/verify" className="btn-primary flex-1 text-center">
          Verify Credential
        </Link>
      </div>
    </div>
  )
}