const crypto = require('crypto');

// Generate a secure random JWT secret
const secret = crypto.randomBytes(32).toString('base64');

console.log('Generated JWT Secret:');
console.log(secret);
console.log('\nAdd this to your .env.local or Vercel environment variables as JWT_SECRET');
console.log('Length:', secret.length, 'characters');

