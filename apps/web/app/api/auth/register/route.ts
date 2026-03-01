import { NextResponse } from 'next/server';
import { dbManager, initializeDatabase } from '../../../../lib/database';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const oldUserId = request.headers.get('x-user-id');
    const body = await request.json();
    const { username } = body;

    if (!oldUserId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Ensure database is initialized
    await initializeDatabase();
    
    const adapter = dbManager.getAdapter();
    const newUserId = `user-${uuidv4()}`;

    try {
      await adapter.beginTransaction();

      // Update tables where userId is a column
      const tablesWithUserId = [
        'assets',
        'liabilities',
        'payments',
        'transactions',
        'accounts',
        'activities'
      ];

      for (const table of tablesWithUserId) {
        await adapter.run(
          `UPDATE ${table} SET userId = ? WHERE userId = ?`,
          [newUserId, oldUserId]
        );
      }

      // Update tables where id IS the userId
      // fireConfig
      const fireConfig = await adapter.get('SELECT * FROM fireConfig WHERE id = ?', [oldUserId]);
      if (fireConfig) {
        await adapter.run(
          `UPDATE fireConfig SET id = ? WHERE id = ?`,
          [newUserId, oldUserId]
        );
      } else {
        // Create default if missing
        const now = new Date().toISOString();
        await adapter.run(
          `INSERT INTO fireConfig (id, annualExpense, swr, updatedAt, createdAt) VALUES (?, ?, ?, ?, ?)`,
          [newUserId, 0, 4, now, now]
        );
      }

      // userSettings
      const userSettings = await adapter.get('SELECT * FROM userSettings WHERE id = ?', [oldUserId]);
      if (userSettings) {
        await adapter.run(
          `UPDATE userSettings SET id = ? WHERE id = ?`,
          [newUserId, oldUserId]
        );
      } else {
        // Create default if missing
        const now = new Date().toISOString();
        await adapter.run(
          `INSERT INTO userSettings (id, baseCurrency, privacyMode, updatedAt, createdAt) VALUES (?, ?, ?, ?, ?)`,
          [newUserId, 'CNY', 0, now, now]
        );
      }

      await adapter.commit();

      return NextResponse.json({ 
        success: true, 
        userId: newUserId,
        message: 'Registration successful' 
      });

    } catch (error) {
      await adapter.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
