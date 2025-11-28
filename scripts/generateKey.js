// scripts/generate-key.js
const crypto = require('crypto');

function generateEncryptionKey() {
  // Generate 32 bytes for AES-256
  const key = crypto.randomBytes(32).toString('hex');
  
  console.log('Generated Encryption Key:');
  console.log('Hex:', key);
  console.log('Length:', key.length, 'characters');
  console.log('\nAdd to your .env.local:');
  console.log(`NEXT_PUBLIC_ENCRYPTION_KEY=${key}`);
  
  return key;
}

// Generate multiple keys for different environments
console.log('=== DEVELOPMENT KEY ===');
generateEncryptionKey();

console.log('\n=== PRODUCTION KEY ==='); 
generateEncryptionKey();

console.log('\n=== STAGING KEY ===');
generateEncryptionKey();