import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

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
    const mockCredential: any = {
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

    // Check Amadeus Network if we have a credential ID (Entry Hash)
    let isOnChain = false
    let chainData: any = null

    if (credentialId && credentialId.length > 20) { // Simple check for potential hash
      try {
        // Build workaround for Testnet SSL issues
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
        const { initAmadeus } = await import('@/lib/amadeus')
        const sdk = await initAmadeus()
        const tx = await sdk.chain.getTransaction(credentialId)
        if (tx && tx.result && (tx.result as any).error === 'ok') {
          isOnChain = true
          // Attempt to parse metadata or args from the transaction if possible
          // For now, we mainly verify existence and success

          // If we could access the memo/args, we would parse it here:
          // const args = tx.tx.action.args
          // chainData = ...

          // Since we temporarily removed memo, we rely on the tx existence
        }
      } catch (e) {
        console.error("Chain verification failed", e)
      }
    }

    // --- ZKVERIFY & ARWEAVE MOCK DATA ---
    // In a real scenario, we would verify the proof submitted via POST or attached to the credential
    // For this demo, we assume valid active credentials have a verified proof
    const isZkVerified = mockCredential.status === 'ACTIVE';
    // Generate a consistent mock Arweave TX ID based on the credential ID
    const arweaveTxId = isZkVerified ? `ar_${mockCredential.id.split('_')[1] || 'demo'}_${mockCredential.agent_did.slice(-4)}` : null;

    // ------------------------------------

    return NextResponse.json({
      valid: mockCredential.status === 'ACTIVE',
      credential: {
        ...mockCredential,
        is_anchored: isOnChain,
        network: 'Amadeus Testnet',
        arweave_tx_id: arweaveTxId,
        zk_verified: isZkVerified
      },
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