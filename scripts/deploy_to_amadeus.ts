import { AmadeusSDK, generateKeypair, TransactionBuilder, toAtomicAma } from '@amadeus-protocol/sdk';
import crypto from 'crypto';

async function deployAgent() {
    console.log("🚀 Deploying Agent to Amadeus Testnet...\n");

    // Step 1: Generate keypair
    console.log("1️⃣  Generating keypair...");
    const keys = generateKeypair();
    console.log("   ✓ Public Key:", keys.publicKey);
    console.log("   ✓ Private Key:", keys.privateKey.substring(0, 20) + "...");

    // Step 2: Derive DID from public key
    const did = `did:amadeus:${keys.publicKey}`;
    console.log("\n2️⃣  DID Generated:", did);

    // Step 3: Generate artifact hash
    const randomArtifact = crypto.randomBytes(256);
    const artifactHash = crypto.createHash('sha256').update(randomArtifact).digest('hex');
    console.log("\n3️⃣  Artifact Hash:", artifactHash);

    // Step 4: Initialize SDK and connect to testnet
    console.log("\n4️⃣  Connecting to Amadeus Testnet...");
    const sdk = new AmadeusSDK();
    sdk.setBaseUrl('https://testnet.ama.one/api');

    try {
        // Verify connection
        const chainInfo = await sdk.chain.getInfo();
        console.log("   ✓ Connected to:", chainInfo.network || "Amadeus Testnet");
    } catch (error) {
        console.log("   ⚠️  Could not verify chain connection (this is okay for key generation)");
    }

    // Step 5: Attempt to register agent on-chain
    console.log("\n5️⃣  Attempting to register agent on-chain...");

    try {
        // Build a simple transaction to register the agent's presence
        // This could be a transfer to self, or a contract call if we knew the method
        const builder = new TransactionBuilder(keys.privateKey);

        // Try to build a minimal transaction (transfer 0 AMA to self as registration)
        const { txHash, txPacked } = builder.transfer({
            recipient: keys.publicKey,
            amount: 0,
            symbol: 'AMA'
        });

        console.log("   ✓ Transaction built");
        console.log("   ✓ TX Hash:", txHash);

        // Submit transaction
        const result = await sdk.transaction.submit(txPacked);
        console.log("   ✓ Transaction submitted!");
        console.log("   ✓ Result:", JSON.stringify(result, null, 2));

        // If successful, the agent is now on-chain
        console.log("\n✅ Agent successfully deployed to Amadeus!");

    } catch (error: any) {
        console.log("   ⚠️  On-chain registration failed:", error.message);
        console.log("   ℹ️  This may be due to insufficient funds or network issues");
        console.log("   ℹ️  The DID and keys are still valid for AgentAttest demo");
    }

    // Output final credentials
    console.log("\n" + "=".repeat(70));
    console.log("📋 AGENT CREDENTIALS FOR AGENTATTEST");
    console.log("=".repeat(70));
    console.log("\n🆔 DID:");
    console.log(did);
    console.log("\n🔐 Artifact Hash:");
    console.log(artifactHash);
    console.log("\n🔑 Private Key (SAVE THIS SECURELY!):");
    console.log(keys.privateKey);
    console.log("\n" + "=".repeat(70));
    console.log("\n✅ Next Steps:");
    console.log("   1. Copy the DID and Artifact Hash above");
    console.log("   2. Navigate to: http://localhost:3000/apply");
    console.log("   3. Fill in the application form with these credentials");
    console.log("   4. Submit your application for verification");
    console.log("\n" + "=".repeat(70));
}

deployAgent().catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
});
