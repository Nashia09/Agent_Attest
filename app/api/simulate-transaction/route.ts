import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agent_did, credential_id, amount } = body

    if (!agent_did && !credential_id) {
      return NextResponse.json(
        { error: 'Either agent_did or credential_id is required' },
        { status: 400 }
      )
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      )
    }

    // Mock credential lookup
    const mockCredential = {
      id: credential_id || 'cred_demo_' + Date.now().toString(36),
      agent_did: agent_did || 'did:example:agent123',
      status: 'ACTIVE',
      max_transaction_value: 10000,
      permissions: ['read', 'write', 'execute']
    }

    // Simulate transaction authorization logic
    let allowed = true
    let reason = 'Transaction approved'
    let risk_score = 10

    if (mockCredential.status === 'REVOKED') {
      allowed = false
      reason = 'Credential is revoked'
      risk_score = 100
    } else if (mockCredential.status === 'EXPIRED') {
      allowed = false
      reason = 'Credential has expired'
      risk_score = 90
    } else if (mockCredential.max_transaction_value && amount > mockCredential.max_transaction_value) {
      allowed = false
      reason = `Amount $${amount} exceeds credential limit of $${mockCredential.max_transaction_value}`
      risk_score = 80
    } else if (amount > 5000) {
      risk_score = 40
      reason = 'High-value transaction requires additional verification'
    }

    return NextResponse.json({
      allowed,
      reason,
      risk_score,
      credential_id: mockCredential.id,
      agent_did: mockCredential.agent_did,
      amount
    })

  } catch (error) {
    console.error('Simulate transaction API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}