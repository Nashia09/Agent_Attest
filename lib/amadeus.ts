import { AmadeusSDK, TransactionBuilder, generateKeypair, derivePublicKeyFromSeedBase58 } from '@amadeus-protocol/sdk'

const AUTHORITY_SEED = process.env.AMADEUS_AUTHORITY_SEED || '4zvwRjX9q4zvwRjX9q4zvwRjX9q4zvwRjX9q4zvwRjX9q4zvwRjX9q4zvwRjX9q4zvwRjX9'

export const sdk = new AmadeusSDK()

export const getAuthorityKeypair = () => {
    try {
        const privateKey = AUTHORITY_SEED
        const publicKey = derivePublicKeyFromSeedBase58(privateKey)
        return { publicKey, privateKey }
    } catch (e) {
        console.error("Error deriving authority keypair, generating fresh one for fallback:", e)
        return generateKeypair()
    }
}

export const initAmadeus = async () => {
    // Set to Testnet public node
    sdk.setBaseUrl('https://testnet.ama.one/api')
    return sdk
}

export { TransactionBuilder }
export const ATTESTATION_AUTHORITY_NAME = "AgentAttest Root Authority"
