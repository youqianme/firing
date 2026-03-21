#!/usr/bin/env node
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });
dotenv.config({ path: join(__dirname, '../../config/.env.example') });

import { DatabaseManager } from '@firing/data-access';

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

async function executeSqlFile(adapter, filePath) {
  console.log(`Executing SQL file: ${filePath}`);
  const sql = readFileSync(filePath, 'utf-8');
  
  // Split SQL by semicolon to execute statements individually
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  for (const statement of statements) {
    await adapter.run(statement);
  }
  
  console.log(`Executed ${statements.length} SQL statements`);
}

async function main() {
  console.log('Starting database initialization...');
  try {
    const adapter = await loadAdapter();
    const dbManager = DatabaseManager.getInstance(adapter);
    
    const sqlFilePath = join(__dirname, '../packages/data-access/sql/schema.sql');
    await executeSqlFile(adapter, sqlFilePath);
    
    console.log('Database initialized successfully!');
    
    await dbManager.close();
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

main();
