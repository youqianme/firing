#!/usr/bin/env node
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });
dotenv.config({ path: join(__dirname, '../../config/.env.example') });

import { DatabaseManager, DatabaseAdapter } from '@firing/data-access';

async function loadAdapter() {
  if (process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL) {
    const connectionString = process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL || '';
    console.log('Using Neon (Postgres) database adapter');
    const { NeonDatabaseAdapter } = await import('../apps/web/lib/neon-adapter.js');
    return new NeonDatabaseAdapter(connectionString);
  } else if (process.env.TURSO_DATABASE_URL || process.env.LIBSQL_URL) {
    const url = process.env.TURSO_DATABASE_URL || process.env.LIBSQL_URL || '';
    const authToken = process.env.TURSO_AUTH_TOKEN || process.env.LIBSQL_AUTH_TOKEN;
    console.log('Using LibSQL/Turso database adapter');
    const { LibsqlDatabaseAdapter } = await import('../apps/web/lib/libsql-adapter.js');
    return new LibsqlDatabaseAdapter(url, authToken);
  } else {
    throw new Error('No database configuration found. Please set POSTGRES_URL or NEON_DATABASE_URL or TURSO_DATABASE_URL');
  }
}

async function main() {
  console.log('Starting database initialization...');
  try {
    const adapter = await loadAdapter();
    const dbManager = DatabaseManager.getInstance(adapter);
    
    console.log('Initializing database tables...');
    await dbManager.initialize();
    
    console.log('Database initialized successfully!');
    
    await dbManager.close();
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

main();
