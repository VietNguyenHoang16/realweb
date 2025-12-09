const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Lấy DATABASE_URL từ command line argument hoặc environment variable
const connectionString = process.argv[2] || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not provided!');
  console.error('\nUsage:');
  console.error('  node scripts/run-schema-with-url.js "postgresql://user:pass@host:port/db"');
  console.error('  OR');
  console.error('  DATABASE_URL="postgresql://..." node scripts/run-schema-with-url.js');
  console.error('\n⚠️  Note: If your DATABASE_URL has postgres.railway.internal,');
  console.error('   you need to get the PUBLIC hostname from Railway Variables (PGHOST)');
  process.exit(1);
}

// Kiểm tra nếu là internal hostname
if (connectionString.includes('postgres.railway.internal')) {
  console.error('⚠️  WARNING: You are using internal hostname (postgres.railway.internal)');
  console.error('   This will NOT work from your local machine!');
  console.error('\n   Please get the PUBLIC hostname from Railway:');
  console.error('   1. Go to Railway Dashboard');
  console.error('   2. Click on PostgreSQL service');
  console.error('   3. Go to Variables tab');
  console.error('   4. Copy PGHOST value (should be like: containers-us-west-xxx.railway.app)');
  console.error('   5. Replace postgres.railway.internal with the PGHOST value');
  console.error('\n   Example:');
  console.error('   postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway');
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
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
    
    // Mask password in connection string for logging
    const maskedUrl = connectionString.replace(/:[^:@]+@/, ':****@');
    console.log('🚀 Running schema on database...');
    console.log('Database:', maskedUrl);
    console.log('');
    
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
    
    console.log('\n🎉 Database schema setup complete!');
    
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
      console.error('   Make sure username and password are correct.');
    } else if (error.code === '3D000') {
      console.error('\n⚠️  Database does not exist!');
      console.error('   Please create the database first.');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Cannot connect to database server!');
      console.error('   Possible reasons:');
      console.error('   1. Using internal hostname (postgres.railway.internal) - need public hostname');
      console.error('   2. Database server is not accessible from your IP');
      console.error('   3. Hostname is incorrect');
      console.error('\n   Solution: Get PUBLIC hostname from Railway Variables (PGHOST)');
    } else {
      console.error('Error code:', error.code);
      console.error('Error details:', error);
    }
    
    await pool.end();
    process.exit(1);
  }
}

runSchema();

