import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentDid, artifactHash, ownerName, contactEmail, claimedPermissions } = body

    // Validate required fields
    if (!agentDid || !artifactHash || !ownerName || !contactEmail || !claimedPermissions) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate application ID
    const applicationId = 'app_' + Date.now().toString(36) + Math.random().toString(36).substr(2)
    
    // Calculate risk score
    let riskScore = 30 // Base score
    if (claimedPermissions.includes('high-value')) riskScore += 30
    if (claimedPermissions.includes('sensitive')) riskScore += 25
    if (claimedPermissions.length > 3) riskScore += 15
    riskScore = Math.min(100, Math.max(0, riskScore))

    // Create application object
    const application = {
      id: applicationId,
      agentDid,
      artifactHash,
      ownerName,
      contactEmail,
      claimedPermissions,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
      riskScore
    }

    // In a real app, this would be stored in a database
    // For demo purposes, we'll return the application data

    return NextResponse.json({
      application_id: applicationId,
      status: 'PENDING',
      risk_score: riskScore,
      message: 'Application submitted successfully'
    })

  } catch (error) {
    console.error('Apply API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}