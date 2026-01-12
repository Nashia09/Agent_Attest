'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Upload, FileText, Check, AlertCircle, ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'
import CryptoJS from 'crypto-js'

interface FormData {
  agentDid: string
  artifactHash: string
  ownerName: string
  contactEmail: string
  claimedPermissions: string[]
}

const PERMISSION_OPTIONS = [
  { value: 'read', label: 'Read Access', description: 'Read data and queries' },
  { value: 'write', label: 'Write Access', description: 'Modify and update data' },
  { value: 'execute', label: 'Execute Operations', description: 'Run operations and commands' },
  { value: 'high-value', label: 'High-Value Transactions', description: 'Process transactions >$10K' },
  { value: 'sensitive', label: 'Sensitive Data Access', description: 'Access to confidential information' },
]

export default function ApplyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCalculatingHash, setIsCalculatingHash] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    agentDid: '',
    artifactHash: '',
    ownerName: '',
    contactEmail: '',
    claimedPermissions: []
  })

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsCalculatingHash(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as any)
      const hash = CryptoJS.SHA256(wordArray).toString()
      
      setFormData(prev => ({ ...prev, artifactHash: hash }))
      toast('success', 'File hash calculated', `SHA256: ${hash.substring(0, 16)}...`)
    } catch (error) {
      toast('error', 'Failed to calculate file hash', 'Please try again')
    } finally {
      setIsCalculatingHash(false)
    }
  }

  const handlePermissionToggle = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      claimedPermissions: prev.claimedPermissions.includes(permission)
        ? prev.claimedPermissions.filter(p => p !== permission)
        : [...prev.claimedPermissions, permission]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const applicationId = 'app_' + Date.now().toString(36)
      
      // Store in localStorage for demo purposes
      const application = {
        id: applicationId,
        ...formData,
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
        riskScore: calculateRiskScore(formData)
      }
      
      localStorage.setItem(`application_${applicationId}`, JSON.stringify(application))
      
      toast('success', 'Application submitted successfully', `ID: ${applicationId}`)
      router.push(`/status/${applicationId}`)
    } catch (error) {
      toast('error', 'Failed to submit application', 'Please try again')
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateRiskScore = (data: FormData): number => {
    let score = 30 // Base score
    if (data.claimedPermissions.includes('high-value')) score += 30
    if (data.claimedPermissions.includes('sensitive')) score += 25
    if (data.claimedPermissions.length > 3) score += 15
    return Math.min(100, Math.max(0, score))
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Link href="/" className="text-sm text-accent-600 hover:text-accent-900 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>
      </div>

      <div className="card p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-accent-900 mb-2">Apply for Agent Credentials</h1>
          <p className="text-accent-600">
            Submit your agent's decentralized identifier (DID) and artifact hash for verification.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Agent DID */}
          <div>
            <label htmlFor="agentDid" className="block text-sm font-medium text-accent-900 mb-2">
              Agent DID *
            </label>
            <input
              id="agentDid"
              type="text"
              required
              className="input"
              placeholder="did:example:123456789"
              value={formData.agentDid}
              onChange={(e) => setFormData(prev => ({ ...prev, agentDid: e.target.value }))}
            />
            <p className="text-sm text-accent-500 mt-1">
              Your agent's decentralized identifier
            </p>
          </div>

          {/* Artifact Hash/File Upload */}
          <div>
            <label className="block text-sm font-medium text-accent-900 mb-2">
              Artifact Hash or File Upload *
            </label>
            
            {/* File Upload */}
            <div className="mb-4">
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".json,.txt,.bin"
              />
              <label
                htmlFor="file-upload"
                className="btn-secondary cursor-pointer inline-flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isCalculatingHash ? 'Calculating...' : 'Upload File'}
              </label>
            </div>

            {/* Manual Hash Input */}
            <div className="relative">
              <input
                id="artifactHash"
                type="text"
                required
                className="input pr-10"
                placeholder="SHA256 hash of your artifact"
                value={formData.artifactHash}
                onChange={(e) => setFormData(prev => ({ ...prev, artifactHash: e.target.value }))}
              />
              {formData.artifactHash && (
                <Check className="w-5 h-5 text-success-600 absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>
            <p className="text-sm text-accent-500 mt-1">
              Upload a file to auto-calculate hash, or paste your SHA256 hash manually
            </p>
          </div>

          {/* Owner Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ownerName" className="block text-sm font-medium text-accent-900 mb-2">
                Owner Name *
              </label>
              <input
                id="ownerName"
                type="text"
                required
                className="input"
                placeholder="John Doe"
                value={formData.ownerName}
                onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-accent-900 mb-2">
                Contact Email *
              </label>
              <input
                id="contactEmail"
                type="email"
                required
                className="input"
                placeholder="john@example.com"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
              />
            </div>
          </div>

          {/* Claimed Permissions */}
          <div>
            <label className="block text-sm font-medium text-accent-900 mb-4">
              Claimed Permissions *
            </label>
            <div className="space-y-3">
              {PERMISSION_OPTIONS.map((permission) => (
                <label
                  key={permission.value}
                  className="flex items-start space-x-3 p-3 rounded-lg border border-accent-200 hover:bg-accent-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-accent-300 rounded"
                    checked={formData.claimedPermissions.includes(permission.value)}
                    onChange={() => handlePermissionToggle(permission.value)}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-accent-900">
                      {permission.label}
                    </div>
                    <div className="text-sm text-accent-500">
                      {permission.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-sm text-accent-500 mt-2">
              Select all permissions your agent requires
            </p>
          </div>

          {/* Risk Score Preview */}
          {formData.claimedPermissions.length > 0 && (
            <div className="bg-accent-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-accent-900">Estimated Risk Score</h3>
                  <p className="text-sm text-accent-600">Based on requested permissions</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-accent-900">
                    {calculateRiskScore(formData)}
                  </div>
                  <div className="text-sm text-accent-600">/ 100</div>
                </div>
              </div>
              <div className="mt-3 bg-accent-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    calculateRiskScore(formData) > 70 ? 'bg-error-500' :
                    calculateRiskScore(formData) > 40 ? 'bg-warning-500' : 'bg-success-500'
                  }`}
                  style={{ width: `${calculateRiskScore(formData)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-accent-200">
            <Link href="/" className="btn-ghost">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !formData.artifactHash || formData.claimedPermissions.length === 0}
              className="btn-primary"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

