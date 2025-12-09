const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'library_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function checkAdmin() {
  try {
    // Check admin account
    const result = await pool.query(
      'SELECT id, username, email, full_name, role FROM users WHERE username = $1 OR role = $2',
      ['admin', 'admin']
    );

    if (result.rows.length === 0) {
      console.log('❌ No admin account found!');
    } else {
      console.log('✅ Admin account(s) found:');
      result.rows.forEach((user, index) => {
        console.log(`\nAdmin ${index + 1}:`);
        console.log('  ID:', user.id);
        console.log('  Username:', user.username);
        console.log('  Email:', user.email);
        console.log('  Full Name:', user.full_name);
        console.log('  Role:', user.role);
      });
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkAdmin();

