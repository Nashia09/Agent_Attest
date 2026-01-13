import { generateKeypair } from '@amadeus-protocol/sdk';
import crypto from 'crypto';

async function main() {
    console.log("Generating Amadeus Agent Identity...");

    // Generate Keypair
    const keys = generateKeypair();

    // In Amadeus, DIDs are typically did:amadeus:<publicKey>
    const did = `did:amadeus:${keys.publicKey}`;

    // Generate a random Artifact Hash (simulating compiled agent code)
    const randomBuffer = crypto.randomBytes(32);
    const artifactHash = crypto.createHash('sha256').update(randomBuffer).digest('hex');

    console.log("\n--- Agent Created Successfully ---");
    console.log("DID:", did);
    console.log("Artifact Hash:", artifactHash);
    console.log("Private Key (Save this!):", keys.privateKey);
    console.log("----------------------------------");
    console.log("\nCopy these values into the AgentAttest 'Apply' form.");
}

main().catch(console.error);
