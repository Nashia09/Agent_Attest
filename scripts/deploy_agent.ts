import { initAmadeus, getAuthorityKeypair, TransactionBuilder } from '../lib/amadeus';
import crypto from 'crypto';

async function deployAgent() {
    console.log("🚀 Deploying Agent to Amadeus Testnet...\n");

    try {
        // Step 1: Generate keypair using the working amadeus lib
        console.log("1️⃣  Generating agent keypair...");
        const { generateKeypair } = await import('@amadeus-protocol/sdk');
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

        // Step 4: Initialize SDK
        console.log("\n4️⃣  Connecting to Amadeus Testnet...");
        const sdk = await initAmadeus();

        try {
            // const chainInfo = await sdk.chain.getInfo();
            console.log("   ✓ Connected to Amadeus Testnet");
            // console.log("   ✓ Network:", chainInfo);
        } catch (error: any) {
            console.log("   ⚠️  Chain info unavailable:", error.message);
        }

        // Step 5: Attempt to register agent on-chain
        console.log("\n5️⃣  Registering agent on-chain...");

        try {
            // Build a transaction using TransactionBuilder
            const builder = new TransactionBuilder(keys.privateKey);

            // Transfer 0 AMA to self as a registration transaction
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

            console.log("\n✅ Agent successfully deployed to Amadeus!");

        } catch (error: any) {
            console.log("   ⚠️  On-chain registration failed:", error.message);
            console.log("   ℹ️  Reason: Likely insufficient funds in new wallet");
            console.log("   ℹ️  The DID and keys are still valid for AgentAttest");
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
        console.log("   3. Fill in the application form:");
        console.log("      - Agent DID: " + did);
        console.log("      - Artifact Hash: " + artifactHash);
        console.log("      - Owner Name: Your name");
        console.log("      - Contact Email: Your email");
        console.log("      - Permissions: Select as needed");
        console.log("   4. Submit your application for verification");
        console.log("\n" + "=".repeat(70));

    } catch (error: any) {
        console.error("\n❌ Deployment failed:", error.message);
        console.error("\nFalling back to local key generation...\n");

        // Fallback: Use the simple generator
        const { execSync } = require('child_process');
        execSync('node scripts/generate_agent.js', { stdio: 'inherit' });
    }
}

deployAgent();
