import { NextResponse } from 'next/server';
import { dbManager } from '../../../../lib/database';
import {
  assetRepository,
  liabilityRepository,
  fireMemberRepository,
  userSettingsRepository,
  accountRepository,
  transactionRepository,
  paymentRepository,
  marketDataRepository,
  activityRepository
} from '../../../../lib/dataAccess';
import {
  mockAssets,
  mockLiabilities,
  mockFireMembers,
  mockUserSettings,
  mockAccounts,
  mockTransactions,
  mockPayments,
  mockMarketData
} from '@firing/utils';

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo';
    
    const adapter = dbManager.getAdapter();

    // Delete all data for user
    // Note: order matters if there are foreign key constraints, but for now we delete everything
    // Tables with potential foreign keys should be deleted first if cascading is not enabled
    // payments -> liabilities
    // transactions -> assets
    // assets -> accounts (if implemented)
    const tables = [
      'payments',
      'transactions',
      'activities',
      'market_data',
      'assets',
      'liabilities',
      'accounts',
      'fire_members',
      'user_settings'
    ];

    for (const table of tables) {
      try {
        // Skip tables that don't have user_id column (market_data)
        if (['market_data'].includes(table)) {
          // For tables without user_id, delete all rows
          await adapter.run(`DELETE FROM ${table}`);
        } else {
          await adapter.run(`DELETE FROM ${table} WHERE user_id = ?`, [userId]);
        }
      } catch (e) {
        console.warn(`Failed to delete from ${table}:`, e);
        // Continue with other tables
      }
    }

    // Re-seed data (same logic as init)
    
    // Initialize Accounts
    for (const account of mockAccounts) {
      const { id, ...accountData } = account;
      await accountRepository.create(userId, accountData);
    }

    // Initialize Assets
    for (const asset of mockAssets) {
      const { id, createdAt, updatedAt, ...assetData } = asset;
      await assetRepository.create(userId, assetData);
    }

    // Initialize Liabilities
    for (const liability of mockLiabilities) {
      const { id, createdAt, updatedAt, ...liabilityData } = liability;
      await liabilityRepository.create(userId, liabilityData);
    }

    // Initialize Transactions
    for (const transaction of mockTransactions) {
      const { id, createdAt, ...transactionData } = transaction;
      await transactionRepository.create(userId, transactionData);
    }

    // Initialize Payments
    for (const payment of mockPayments) {
      const { id, createdAt, ...paymentData } = payment;
      await paymentRepository.create(userId, paymentData);
    }

    // Initialize Market Data
    for (const marketData of mockMarketData) {
      const { id, ...marketDataData } = marketData;
      await marketDataRepository.upsert(marketDataData.symbol, marketDataData.price, marketDataData.source);
    }

    // Initialize FireMembers
    for (const member of mockFireMembers) {
      const { id, createdAt, updatedAt, userId: _, ...memberData } = member;
      await fireMemberRepository.create(userId, memberData);
    }

    // Initialize UserSettings
    const { id: usId, createdAt: usCreatedAt, updatedAt: usUpdatedAt, ...userSettingsData } = mockUserSettings;
    await userSettingsRepository.update(userId, userSettingsData);

    return NextResponse.json({ 
      success: true, 
      message: 'Demo data reset successfully' 
    });
  } catch (error) {
    console.error('Error resetting demo data:', error);
    return NextResponse.json(
      { error: 'Failed to reset demo data' },
      { status: 500 }
    );
  }
}
