import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const { applicationId } = params

    // In a real app, this would query a database
    // For demo purposes, we'll return mock data
    
    const mockApplication = {
      id: applicationId,
      agent_did: 'did:example:agent123',
      artifact_hash: 'a1b2c3d4e5f6789012345678901234567890abcdef',
      owner_name: 'Demo Agent',
      contact_email: 'demo@example.com',
      claimed_permissions: ['read', 'write', 'execute'],
      status: 'PENDING',
      submitted_at: new Date().toISOString(),
      risk_score: 45,
      audit_report: {
        findings: [
          'Clean security history',
          'Valid DID document',
          'Low-risk permissions requested'
        ],
        recommendations: [
          'Approve for standard processing'
        ],
        risk_factors: [
          'Low transaction volume expected'
        ]
      }
    }

    return NextResponse.json(mockApplication)

  } catch (error) {
    console.error('Status API error:', error)
    return NextResponse.json(
      { error: 'Application not found' },
      { status: 404 }
    )
  }
}