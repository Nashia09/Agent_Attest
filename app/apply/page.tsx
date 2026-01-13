'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Upload, FileText, Check, AlertCircle, ArrowLeft, Shield } from 'lucide-react'
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
    <div className="max-w-4xl mx-auto py-12">
      <div className="mb-8">
        <Link href="/" className="text-sm text-primary-400 hover:text-white flex items-center transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>
      </div>

      <div className="rounded-xl border border-white/10 bg-surface-900 shadow-xl transition-all hover:border-primary-500/30 relative overflow-hidden p-8 bg-surface-900/40 border-primary-500/20 backdrop-blur-xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -z-10"></div>

        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary-500/30 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
            <FileText className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Apply for Agent Credentials</h1>
          <p className="text-accent-400 max-w-lg mx-auto">
            Submit your agent's decentralized identifier (DID) and artifact hash for verification on the Amadeus network.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Agent DID */}
            <div className="md:col-span-2">
              <label htmlFor="agentDid" className="block text-sm font-medium text-gray-300 mb-2">
                Agent DID *
              </label>
              <div className="relative group">
                <input
                  id="agentDid"
                  type="text"
                  required
                  className="flex h-11 w-full rounded-lg border border-white/10 bg-surface-50 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-transparent transition-all backdrop-blur-sm text-white pl-10"
                  placeholder="did:example:123456789"
                  value={formData.agentDid}
                  onChange={(e) => setFormData(prev => ({ ...prev, agentDid: e.target.value }))}
                />
                <Shield className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary-400 transition-colors" />
              </div>
              <p className="text-xs text-gray-400 mt-2 ml-1">
                Your agent's decentralized identifier used for on-chain verification
              </p>
            </div>

            {/* Owner Information */}

            <div>
              <label htmlFor="ownerName" className="block text-sm font-medium text-gray-300 mb-2">
                Owner Name *
              </label>
              <input
                id="ownerName"
                type="text"
                required
                className="flex h-11 w-full rounded-lg border border-white/10 bg-surface-50 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-transparent transition-all backdrop-blur-sm text-white"
                placeholder="John Doe"
                value={formData.ownerName}
                onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-300 mb-2">
                Contact Email *
              </label>
              <input
                id="contactEmail"
                type="email"
                required
                className="flex h-11 w-full rounded-lg border border-white/10 bg-surface-50 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-transparent transition-all backdrop-blur-sm text-white"
                placeholder="john@example.com"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
              />
            </div>

            {/* Artifact Hash/File Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Artifact Verification *
              </label>

              <div className="bg-surface-50/50 rounded-xl p-6 border border-dashed border-white/10 hover:border-primary-500/50 transition-colors">
                {/* File Upload */}
                <div className="flex flex-col items-center justify-center mb-6">
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".json,.txt,.bin"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider relative overflow-hidden bg-surface-100 text-white hover:bg-surface-200 border border-white/10 hover:border-primary-400/50 backdrop-blur-sm cursor-pointer inline-flex items-center px-6 py-3"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    {isCalculatingHash ? 'Calculating Hash...' : 'Upload Artifact File'}
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Supported: JSON, TXT, BIN (Max 50MB)
                  </p>
                </div>

                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Or enter hash manually</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                {/* Manual Hash Input */}
                <div className="relative mt-4">
                  <input
                    id="artifactHash"
                    type="text"
                    required
                    className="flex h-11 w-full rounded-lg border border-white/10 bg-surface-50 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-transparent transition-all backdrop-blur-sm text-white pr-10 font-mono text-xs md:text-sm"
                    placeholder="SHA256 hash of your artifact"
                    value={formData.artifactHash}
                    onChange={(e) => setFormData(prev => ({ ...prev, artifactHash: e.target.value }))}
                  />
                  {formData.artifactHash && (
                    <Check className="w-5 h-5 text-success-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Claimed Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4">
              Required Permissions
            </label>
            <div className="grid md:grid-cols-2 gap-3">
              {PERMISSION_OPTIONS.map((permission) => (
                <label
                  key={permission.value}
                  className={`flex items-start space-x-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${formData.claimedPermissions.includes(permission.value)
                    ? 'bg-primary-900/20 border-primary-500/50 shadow-[0_0_10px_rgba(139,92,246,0.1)]'
                    : 'bg-surface-50/30 border-white/5 hover:border-white/20'
                    }`}
                >
                  <div className={`mt-1 h-5 w-5 rounded border flex items-center justify-center transition-colors ${formData.claimedPermissions.includes(permission.value)
                    ? 'bg-primary-500 border-primary-500'
                    : 'border-gray-500 bg-transparent'
                    }`}>
                    {formData.claimedPermissions.includes(permission.value) && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={formData.claimedPermissions.includes(permission.value)}
                    onChange={() => handlePermissionToggle(permission.value)}
                  />
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${formData.claimedPermissions.includes(permission.value) ? 'text-primary-200' : 'text-gray-300'
                      }`}>
                      {permission.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {permission.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Risk Score Preview */}
          {formData.claimedPermissions.length > 0 && (
            <div className="bg-surface-50/30 rounded-xl p-5 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-warning-400 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-white">Estimated Risk Score</h3>
                    <p className="text-xs text-gray-400">Based on selections</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold font-mono ${calculateRiskScore(formData) > 70 ? 'text-error-400' :
                    calculateRiskScore(formData) > 40 ? 'text-warning-400' : 'text-success-400'
                    }`}>
                    {calculateRiskScore(formData)}
                  </div>
                </div>
              </div>
              <div className="w-full bg-surface-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${calculateRiskScore(formData) > 70 ? 'bg-error-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                    calculateRiskScore(formData) > 40 ? 'bg-warning-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-success-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                    }`}
                  style={{ width: `${calculateRiskScore(formData)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-white/10">
            <Link href="/" className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider relative overflow-hidden hover:bg-white/5 text-gray-300 hover:text-white">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !formData.artifactHash || formData.claimedPermissions.length === 0}
              className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider relative overflow-hidden bg-primary-600 text-white hover:bg-primary-500 shadow-[0_0_15px_rgba(139,92,246,0.5)] px-8 py-3"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 mr-2" />
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

