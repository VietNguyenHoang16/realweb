const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'library_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function createAdmin() {
  try {
    const username = 'admin';
    const email = 'admin@library.com';
    const password = 'admin123';
    const fullName = 'Administrator';

    console.log('Creating admin account...');
    console.log('Username:', username);
    console.log('Email:', email);

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Check if admin already exists
    const existingUser = await pool.query(
      'SELECT id, username, role FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];
      if (user.role === 'admin') {
        console.log('⚠️  Admin account already exists!');
        console.log('User ID:', user.id);
        console.log('Username:', user.username);
        console.log('Role:', user.role);
        
        // Auto-update password if admin exists
        await pool.query(
          'UPDATE users SET password_hash = $1, full_name = $2 WHERE id = $3',
          [passwordHash, fullName, user.id]
        );
        console.log('✅ Admin password updated successfully!');
        await pool.end();
        process.exit(0);
      } else {
        // Update existing user to admin
        await pool.query(
          'UPDATE users SET role = $1, password_hash = $2, full_name = $3 WHERE id = $4',
          ['admin', passwordHash, fullName, user.id]
        );
        console.log('✅ Existing user updated to admin!');
        console.log('User ID:', user.id);
        await pool.end();
        process.exit(0);
      }
    }

    // Create new admin user
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email, full_name, role`,
      [username, email, passwordHash, fullName, 'admin']
    );

    const admin = result.rows[0];
    console.log('✅ Admin account created successfully!');
    console.log('\nAdmin Details:');
    console.log('  ID:', admin.id);
    console.log('  Username:', admin.username);
    console.log('  Email:', admin.email);
    console.log('  Full Name:', admin.full_name);
    console.log('  Role:', admin.role);
    console.log('\nYou can now login with:');
    console.log('  Username: admin');
    console.log('  Password: admin123');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    if (error.code === '28P01') {
      console.error('\n⚠️  Database authentication failed!');
      console.error('Please check your .env.local file and database credentials.');
    } else if (error.code === '3D000') {
      console.error('\n⚠️  Database does not exist!');
      console.error('Please create the database first.');
    }
    await pool.end();
    process.exit(1);
  }
}

createAdmin();

