import pool from './db';
import fs from 'fs';
import path from 'path';

export async function initDatabase() {
  try {
    const schemaPath = path.join(process.cwd(), 'lib', 'db-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

