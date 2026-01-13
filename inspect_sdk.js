const { AmadeusSDK } = require('@amadeus-protocol/sdk');
const sdk = new AmadeusSDK();

console.log('SDK Keys:', Object.keys(sdk));
console.log('Chain Keys:', Object.keys(sdk.chain));
console.log('Transaction Keys:', Object.keys(sdk.transaction));

// Check if 'config' or similar exists
for (let key in sdk) {
    if (key.toLowerCase().includes('config') || key.toLowerCase().includes('network')) {
        console.log(`Found potential config key: ${key}`);
    }
}
