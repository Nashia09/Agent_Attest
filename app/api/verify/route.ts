import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentDid = searchParams.get('agent_did')
    const credentialId = searchParams.get('credential_id')

    if (!agentDid && !credentialId) {
      return NextResponse.json(
        { error: 'Either agent_did or credential_id is required' },
        { status: 400 }
      )
    }

    // Mock credential data
    const mockCredential = {
      id: credentialId || 'cred_demo_' + Date.now().toString(36),
      agent_did: agentDid || 'did:example:agent123',
      artifact_hash: 'a1b2c3d4e5f6789012345678901234567890abcdef',
      owner_name: 'Demo Agent',
      contact_email: 'demo@example.com',
      permissions: ['read', 'write', 'execute'],
      status: 'ACTIVE',
      issued_at: new Date(Date.now() - 86400000).toISOString(),
      expires_at: new Date(Date.now() + 86400000 * 30).toISOString(),
      anchor_tx: 'tx_abc123def456',
      max_transaction_value: 10000
    }

    // Simulate revoked credential if ID contains 'revoked'
    if (credentialId?.includes('revoked') || agentDid?.includes('revoked')) {
      mockCredential.status = 'REVOKED'
      mockCredential.revoked_at = new Date(Date.now() - 3600000).toISOString()
      mockCredential.revocation_reason = 'Security policy violation'
    }

    return NextResponse.json({
      valid: mockCredential.status === 'ACTIVE',
      credential: mockCredential,
      message: mockCredential.status === 'ACTIVE' ? 'Credential is valid' : `Credential is ${mockCredential.status.toLowerCase()}`
    })

  } catch (error) {
    console.error('Verify API error:', error)
    return NextResponse.json(
      { valid: false, error: 'Credential not found' },
      { status: 404 }
    )
  }
}