'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Clock, AlertCircle, Shield, FileText, ArrowRight } from 'lucide-react'
import { CardSkeleton } from '@/components/LoadingStates'

interface Application {
  id: string
  agentDid: string
  artifactHash: string
  ownerName: string
  contactEmail: string
  claimedPermissions: string[]
  status: 'PENDING' | 'AUDITING' | 'APPROVED' | 'REJECTED' | 'ISSUED'
  submittedAt: string
  riskScore: number
  auditReport?: {
    findings: string[]
    recommendations: string[]
    riskFactors: string[]
  }
  credentialId?: string
  issuedAt?: string
}

export default function StatusPage() {
  const params = useParams()
  const applicationId = params.applicationId as string
  const [application, setApplication] = useState<Application | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadApplication()
  }, [applicationId])

  const loadApplication = () => {
    const stored = localStorage.getItem(`application_${applicationId}`)
    if (stored) {
      setApplication(JSON.parse(stored))
    } else {
      // Mock application for demo
      setApplication({
        id: applicationId,
        agentDid: 'did:example:agent123',
        artifactHash: 'a1b2c3d4e5f6789012345678901234567890abcdef',
        ownerName: 'Demo Agent',
        contactEmail: 'demo@example.com',
        claimedPermissions: ['read', 'write'],
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
        riskScore: 45
      })
    }
    setIsLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5" />
      case 'AUDITING':
        return <AlertCircle className="w-5 h-5" />
      case 'APPROVED':
      case 'ISSUED':
        return <CheckCircle className="w-5 h-5" />
      case 'REJECTED':
        return <AlertCircle className="w-5 h-5" />
      default:
        return <Clock className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning'
      case 'AUDITING':
        return 'warning'
      case 'APPROVED':
        return 'success'
      case 'ISSUED':
        return 'success'
      case 'REJECTED':
        return 'error'
      default:
        return 'accent'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pending Review'
      case 'AUDITING':
        return 'Under Audit'
      case 'APPROVED':
        return 'Approved'
      case 'ISSUED':
        return 'Credential Issued'
      case 'REJECTED':
        return 'Rejected'
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <CardSkeleton />
      </div>
    )
  }

  if (!application) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-8 text-center">
          <AlertCircle className="w-12 h-12 text-error-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-accent-900 mb-2">Application Not Found</h1>
          <p className="text-accent-600 mb-6">
            The application ID {applicationId} could not be found.
          </p>
          <Link href="/apply" className="btn-primary">
            Submit New Application
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-sm text-accent-600 hover:text-accent-900 flex items-center mb-4">
          <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-accent-900 mb-2">Application Status</h1>
        <p className="text-accent-600">Track your credential application progress</p>
      </div>

      {/* Status Overview */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-accent-900">Application #{application.id}</h2>
            <p className="text-sm text-accent-600">Submitted {new Date(application.submittedAt).toLocaleDateString()}</p>
          </div>
          <div className={`status-${getStatusColor(application.status)} px-4 py-2 rounded-full flex items-center space-x-2`}>
            {getStatusIcon(application.status)}
            <span className="font-medium">{getStatusText(application.status)}</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="relative">
          <div className="absolute left-0 right-0 top-4 h-0.5 bg-accent-200"></div>
          <div className="relative flex justify-between">
            {[
              { step: 'submitted', label: 'Submitted', completed: true },
              { step: 'auditing', label: 'Audit', completed: ['AUDITING', 'APPROVED', 'REJECTED', 'ISSUED'].includes(application.status) },
              { step: 'approved', label: 'Approved', completed: ['APPROVED', 'ISSUED'].includes(application.status) },
              { step: 'issued', label: 'Issued', completed: application.status === 'ISSUED' },
            ].map((item, index) => (
              <div key={item.step} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    item.completed
                      ? 'bg-success-600 text-white'
                      : 'bg-accent-200 text-accent-500'
                  }`}
                >
                  {item.completed ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <div className="w-3 h-3 bg-current rounded-full"></div>
                  )}
                </div>
                <span className={`text-sm mt-2 ${item.completed ? 'text-accent-900' : 'text-accent-500'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Application Details */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-accent-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Application Details
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-accent-600">Agent DID</span>
              <div className="font-mono text-sm text-accent-900">{application.agentDid}</div>
            </div>
            <div>
              <span className="text-sm text-accent-600">Artifact Hash</span>
              <div className="font-mono text-sm text-accent-900">{application.artifactHash}</div>
            </div>
            <div>
              <span className="text-sm text-accent-600">Owner</span>
              <div className="text-accent-900">{application.ownerName}</div>
            </div>
            <div>
              <span className="text-sm text-accent-600">Contact</span>
              <div className="text-accent-900">{application.contactEmail}</div>
            </div>
            <div>
              <span className="text-sm text-accent-600">Requested Permissions</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {application.claimedPermissions.map((perm) => (
                  <span key={perm} className="px-2 py-1 bg-accent-100 text-accent-700 text-xs rounded">
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-accent-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Risk Assessment
          </h3>
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-accent-900">{application.riskScore}</div>
            <div className="text-sm text-accent-600">Risk Score (0-100)</div>
          </div>
          <div className="bg-accent-200 rounded-full h-3 mb-4">
            <div
              className={`h-3 rounded-full ${
                application.riskScore > 70 ? 'bg-error-500' :
                application.riskScore > 40 ? 'bg-warning-500' : 'bg-success-500'
              }`}
              style={{ width: `${application.riskScore}%` }}
            ></div>
          </div>
          <div className="text-sm text-accent-600">
            {application.riskScore > 70 ? 'High risk - requires additional review' :
             application.riskScore > 40 ? 'Medium risk - standard processing' : 'Low risk - expedited processing'}
          </div>
        </div>
      </div>

      {/* Audit Report */}
      {application.auditReport && (
        <div className="card p-6 mt-6">
          <h3 className="text-lg font-semibold text-accent-900 mb-4">Audit Report</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-accent-900 mb-2">Findings</h4>
              <ul className="list-disc list-inside text-accent-600 space-y-1">
                {application.auditReport.findings.map((finding, i) => (
                  <li key={i}>{finding}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-accent-900 mb-2">Recommendations</h4>
              <ul className="list-disc list-inside text-accent-600 space-y-1">
                {application.auditReport.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Credential Details */}
      {application.credentialId && (
        <div className="card p-6 mt-6">
          <h3 className="text-lg font-semibold text-accent-900 mb-4">Credential Details</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-accent-600">Credential ID</span>
              <div className="font-mono text-sm text-accent-900">{application.credentialId}</div>
            </div>
            <div>
              <span className="text-sm text-accent-600">Issued</span>
              <div className="text-accent-900">{new Date(application.issuedAt!).toLocaleDateString()}</div>
            </div>
            <div className="pt-4">
              <Link href={`/verify?credential=${application.credentialId}`} className="btn-primary">
                Verify Credential
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Link href="/verify" className="btn-secondary flex-1 text-center">
          Verify Another Credential
        </Link>
        <Link href="/apply" className="btn-primary flex-1 text-center">
          Submit New Application
        </Link>
      </div>
    </div>
  )
}