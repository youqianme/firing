import { NextResponse } from 'next/server';
import { dbManager, initializeDatabase } from '../../../../lib/database';

export async function POST(request: Request) {
  try {
    await initializeDatabase();
    const adapter = dbManager.getAdapter();

    const tables = [
      'payments', 
      'transactions', 
      'activities', 
      'marketData', 
      'assets', 
      'liabilities', 
      'accounts', 
      'fireConfig', 
      'userSettings'
    ];

    for (const table of tables) {
      try {
        await adapter.run(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        console.log(`Dropped table: ${table}`);
      } catch (e) {
        console.warn(`Failed to drop table ${table}:`, e);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'All tables dropped successfully. They will be recreated on next request.' 
    });
  } catch (error) {
    console.error('Error dropping tables:', error);
    return NextResponse.json(
      { error: 'Failed to drop tables' },
      { status: 500 }
    );
  }
}