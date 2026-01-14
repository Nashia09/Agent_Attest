const crypto = require('crypto');

// Base58 encoding (Bitcoin alphabet)
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function toBase58(buffer) {
    const bytes = Buffer.from(buffer);
    const digits = [0];

    for (let i = 0; i < bytes.length; i++) {
        let carry = bytes[i];
        for (let j = 0; j < digits.length; j++) {
            carry += digits[j] << 8;
            digits[j] = carry % 58;
            carry = (carry / 58) | 0;
        }
        while (carry > 0) {
            digits.push(carry % 58);
            carry = (carry / 58) | 0;
        }
    }

    // Add leading zeros
    for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
        digits.push(0);
    }

    return digits.reverse().map(d => BASE58_ALPHABET[d]).join('');
}

async function main() {
    console.log("Generating Amadeus Agent Identity...\n");

    // Generate a 64-byte private key (seed)
    const privateKeySeed = crypto.randomBytes(64);
    const privateKeyBase58 = toBase58(privateKeySeed);

    // Generate a 32-byte public key (simplified - in reality this would be derived from the seed)
    const publicKey = crypto.randomBytes(32);
    const publicKeyBase58 = toBase58(publicKey);

    // Create DID
    const did = `did:amadeus:${publicKeyBase58}`;

    // Generate a random Artifact Hash (SHA256 of random data)
    const randomArtifact = crypto.randomBytes(256);
    const artifactHash = crypto.createHash('sha256').update(randomArtifact).digest('hex');

    console.log("--- Agent Created Successfully ---");
    console.log("\nDID:", did);
    console.log("\nArtifact Hash:", artifactHash);
    console.log("\nPrivate Key (Save this!):", privateKeyBase58);
    console.log("\n----------------------------------");
    console.log("\n✓ Copy the DID and Artifact Hash into the AgentAttest 'Apply' form");
    console.log("✓ Navigate to: http://localhost:3000/apply");
}

main().catch(console.error);
