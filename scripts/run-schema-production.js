const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Lấy connection string từ environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not found in environment variables');
  console.error('Please set DATABASE_URL in .env.local or as environment variable');
  console.error('\nExample:');
  console.error('  DATABASE_URL=postgresql://user:password@host:port/database');
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
});

async function runSchema() {
  try {
    console.log('📖 Reading schema file...');
    const schemaPath = path.join(__dirname, '..', 'lib', 'db-schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ Schema file not found:', schemaPath);
      process.exit(1);
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🚀 Running schema on database...');
    console.log('Database:', connectionString.replace(/:[^:@]+@/, ':****@')); // Hide password
    
    // Chạy schema
    await pool.query(schema);
    
    console.log('✅ Schema executed successfully!');
    console.log('📊 Tables created:');
    console.log('   - users');
    console.log('   - books');
    console.log('   - loans');
    console.log('   - loan_history');
    
    // Kiểm tra các bảng đã được tạo
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('\n✅ Verified tables:');
    result.rows.forEach(row => {
      console.log('   -', row.table_name);
    });
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running schema:', error.message);
    
    if (error.code === '42P07') {
      console.error('\n⚠️  Some tables already exist. This is OK if you\'ve run the schema before.');
      console.error('   The schema uses CREATE TABLE IF NOT EXISTS, so it\'s safe to run again.');
    } else if (error.code === '28P01') {
      console.error('\n⚠️  Authentication failed!');
      console.error('   Please check your DATABASE_URL connection string.');
    } else if (error.code === '3D000') {
      console.error('\n⚠️  Database does not exist!');
      console.error('   Please create the database first.');
    } else {
      console.error('Error code:', error.code);
      console.error('Error details:', error);
    }
    
    await pool.end();
    process.exit(1);
  }
}

runSchema();

