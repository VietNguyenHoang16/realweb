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

async function testConnection() {
  try {
    console.log('Testing PostgreSQL connection...');
    console.log('Config:', {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '5432',
      database: process.env.DB_NAME || 'library_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD ? '***' : 'not set',
    });

    const result = await pool.query('SELECT NOW()');
    console.log('✅ Connection successful!');
    console.log('Database time:', result.rows[0].now);
    
    // Test if database exists and has tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('⚠️  Database exists but no tables found. Run: npm run init-db');
    } else {
      console.log('📊 Tables found:', tablesResult.rows.map(r => r.table_name).join(', '));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === '28P01') {
      console.error('\n⚠️  Authentication failed!');
      console.error('Please check your .env.local file:');
      console.error('  - DB_USER should match your PostgreSQL username');
      console.error('  - DB_PASSWORD should match your PostgreSQL password');
    } else if (error.code === '3D000') {
      console.error('\n⚠️  Database does not exist!');
      console.error('Please create the database first:');
      console.error('  CREATE DATABASE library_db WITH OWNER = postgres ENCODING = \'UTF8\';');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Cannot connect to PostgreSQL server!');
      console.error('Please make sure PostgreSQL is running.');
    }
    
    process.exit(1);
  }
}

testConnection();

