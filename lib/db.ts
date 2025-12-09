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
  
  if (process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV) {
    console.log('Connecting to PostgreSQL using DATABASE_URL');
  }
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
  if (process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV) {
    console.log('Connecting to PostgreSQL:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password ? '***' : 'not set',
    });
  }

  pool = new Pool(dbConfig);
}

// Test connection (chỉ log, không throw error trong build time)
if (typeof window === 'undefined') {
  // Chỉ chạy trên server side
  pool.on('connect', () => {
    if (process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV) {
      console.log('✅ Connected to PostgreSQL database');
    }
  });

  pool.on('error', (err: any) => {
    // Chỉ log error, không exit trong build time
    if (process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV) {
      console.error('❌ Database connection error:', {
        code: err.code || 'UNKNOWN',
        message: err.message,
        severity: err.severity || 'ERROR',
      });
      
      if (err.code === '28P01') {
        console.error('⚠️  Authentication failed! Please check:');
        console.error('   1. DB_USER and DB_PASSWORD in environment variables');
        console.error('   2. PostgreSQL user exists and password is correct');
        console.error('   3. Database connection string is correct');
      }
    }
  });
}

export default pool;

