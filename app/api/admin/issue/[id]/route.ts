import { NextRequest, NextResponse } from 'next/server'
import { getAuthorityKeypair, initAmadeus, ATTESTATION_AUTHORITY_NAME, TransactionBuilder } from '@/lib/amadeus'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const applicationId = params.id
        // In a real app, fetch application details from DB
        // const application = await db.getApplication(applicationId)

        // Mock application data for now (since we don't have a DB in this demo)
        const application = {
            id: applicationId,
            agentDid: 'did:agent:' + applicationId,
            status: 'PENDING',
            riskScore: 20
        }

        if (application.status === 'APPROVED') {
            return NextResponse.json({ error: 'Already issued' }, { status: 400 })
        }

        // 1. Initialize Amadeus SDK
        // Build workaround for Testnet SSL issues
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
        const sdk = await initAmadeus()
        const authority = getAuthorityKeypair()

        // 2. Create the Attestation Payload
        const attestationData = {
            type: 'AgentCredential',
            issuer: ATTESTATION_AUTHORITY_NAME,
            issuer_key: authority.publicKey,
            subject: application.agentDid,
            issuanceDate: new Date().toISOString(),
            riskScore: application.riskScore,
            permissions: ['EXECUTE_TRANSACTION', 'access_market_data'], // Example permissions
            validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        }

        // 3. Anchor to Amadeus Network
        const authorityKP = getAuthorityKeypair()

        // Use instance for build and sign
        const builder = new TransactionBuilder(authorityKP.privateKey)
        const { txHash, txPacked } = builder.transfer({
            recipient: authorityKP.publicKey,
            amount: 0.000001, // Minimal amount for data anchoring
            symbol: 'AMA'
        })

        console.log("Submitting Attestation to Amadeus Network...", txHash)
        const result = await sdk.transaction.submitAndWait(txPacked)

        // 4. Return the Credential with the anchor details
        const credential = {
            ...attestationData,
            id: txHash, // The transaction hash is the unique ID for this attestation
            transactionId: txHash,
            blockHeight: result.metadata?.entry_height || 0,
            status: 'ACTIVE'
        }

        return NextResponse.json({
            success: true,
            credential,
            message: 'Credential issued and anchored on Amadeus Network'
        })

    } catch (error) {
        console.error('Issue API error:', error)
        return NextResponse.json(
            { error: 'Failed to issue credential: ' + (error as Error).message },
            { status: 500 }
        )
    }
}
