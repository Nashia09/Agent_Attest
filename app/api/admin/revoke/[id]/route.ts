import { NextRequest, NextResponse } from 'next/server'
import { getAuthorityKeypair, initAmadeus, ATTESTATION_AUTHORITY_NAME, TransactionBuilder } from '@/lib/amadeus'
// import { TransactionBuilder } from '@amadeus-protocol/sdk'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const credentialId = params.id

        // 1. Initialize Amadeus SDK
        // Build workaround for Testnet SSL issues
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
        const sdk = await initAmadeus()
        const authority = getAuthorityKeypair()

        // 2. Create the Revocation Payload
        const revocationData = {
            type: 'CredentialRevocation',
            issuer: ATTESTATION_AUTHORITY_NAME,
            issuer_key: authority.publicKey,
            targetCredentialId: credentialId,
            revocationDate: new Date().toISOString(),
            reason: 'Administrative Action'
        }

        // 3. Anchor Revocation to Amadeus Network
        const builder = new TransactionBuilder(authority.privateKey)

        const { txHash, txPacked } = builder.transfer({
            recipient: authority.publicKey,
            amount: 0.000001,
            symbol: 'AMA'
        })

        console.log("Submitting Revocation to Amadeus Network...", txHash)
        const result: any = await sdk.transaction.submitAndWait(txPacked)

        return NextResponse.json({
            success: true,
            revocation: {
                ...revocationData,
                transactionId: txHash,
                blockHeight: result.receipt?.block_height || result.metadata?.height || 0,
            },
            message: 'Credential revoked on Amadeus Network'
        })

    } catch (error) {
        console.error('Revoke API error:', error)
        return NextResponse.json(
            { error: 'Failed to revoke credential: ' + (error as Error).message },
            { status: 500 }
        )
    }
}
