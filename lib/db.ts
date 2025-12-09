import { Pool } from 'pg';

let pool: Pool;

// Hỗ trợ cả DATABASE_URL (connection string) và các biến riêng lẻ
if (process.env.DATABASE_URL) {
  // Production: sử dụng connection string (Railway, Supabase, Neon, etc.)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : false,
  });
  
  console.log('Connecting to PostgreSQL using DATABASE_URL');
} else {
  // Development: sử dụng các biến riêng lẻ
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'library_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  };

  // Log connection info (without password)
  console.log('Connecting to PostgreSQL:', {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
    password: dbConfig.password ? '***' : 'not set',
  });

  pool = new Pool(dbConfig);
}

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', {
    code: err.code,
    message: err.message,
    severity: err.severity,
  });
  
  if (err.code === '28P01') {
    console.error('⚠️  Authentication failed! Please check:');
    console.error('   1. DB_USER and DB_PASSWORD in .env.local');
    console.error('   2. PostgreSQL user exists and password is correct');
    console.error('   3. Database exists: ' + dbConfig.database);
  }
  
  // Don't exit in development, let the app handle it
  if (process.env.NODE_ENV === 'production') {
    process.exit(-1);
  }
});

export default pool;

