import { NextResponse } from 'next/server';
import { dbManager } from '../../../../lib/database';
import { v4 as uuidv4 } from 'uuid';
import {
  mockAssets,
  mockLiabilities,
  mockFireConfig,
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

    // Check if user already has assets
    const existingAssets = await adapter.get('SELECT * FROM assets WHERE user_id = ? LIMIT 1', [userId]);

    if (existingAssets) {
      return NextResponse.json({
        success: true,
        message: 'Data already initialized',
        initialized: false
      });
    }

    const now = new Date().toISOString();

    // Create ID mapping for accounts, assets, liabilities to maintain referential integrity
    const accountIdMap = new Map<string, string>();
    const assetIdMap = new Map<string, string>();
    const liabilityIdMap = new Map<string, string>();

    // Initialize Accounts with new unique IDs
    for (const account of mockAccounts) {
      const newId = `${userId}-account-${uuidv4().slice(0, 8)}`;
      accountIdMap.set(account.id, newId);

      await adapter.run(
        `INSERT INTO accounts (id, user_id, name, type, currency, created_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [newId, userId, account.name, account.type, account.currency, account.createdAt, account.notes]
      );
    }

    // Initialize Assets with new unique IDs
    for (const asset of mockAssets) {
      const newId = `${userId}-asset-${uuidv4().slice(0, 8)}`;
      assetIdMap.set(asset.id, newId);

      // Map account ID if exists
      const newAccountId = asset.accountId ? accountIdMap.get(asset.accountId) : null;

      await adapter.run(
        `INSERT INTO assets (id, user_id, name, type, currency, amount, include_in_fire, account_id, quantity, unit_price, interest_rate, start_date, end_date, valuation_method, updated_at, created_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newId,
          userId,
          asset.name,
          asset.type,
          asset.currency,
          asset.amount,
          asset.includeInFire ? 1 : 0,
          newAccountId || null,
          asset.quantity || null,
          asset.unitPrice || null,
          asset.interestRate || null,
          asset.startDate || null,
          asset.endDate || null,
          asset.valuationMethod,
          asset.updatedAt,
          asset.createdAt,
          asset.notes || null
        ]
      );
    }

    // Initialize Liabilities with new unique IDs
    for (const liability of mockLiabilities) {
      const newId = `${userId}-liability-${uuidv4().slice(0, 8)}`;
      liabilityIdMap.set(liability.id, newId);

      await adapter.run(
        `INSERT INTO liabilities (id, user_id, name, type, currency, balance, interest_rate, start_date, end_date, updated_at, created_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newId,
          userId,
          liability.name,
          liability.type,
          liability.currency,
          liability.balance,
          liability.interestRate || null,
          liability.startDate || null,
          liability.endDate || null,
          liability.updatedAt,
          liability.createdAt,
          liability.notes || null
        ]
      );
    }

    // Initialize Transactions with mapped asset IDs
    for (const transaction of mockTransactions) {
      const newId = `${userId}-transaction-${uuidv4().slice(0, 8)}`;

      // Map asset IDs if they exist
      const newFromAssetId = transaction.fromAssetId ? assetIdMap.get(transaction.fromAssetId) : null;
      const newToAssetId = transaction.toAssetId ? assetIdMap.get(transaction.toAssetId) : null;

      await adapter.run(
        `INSERT INTO transactions (id, user_id, type, from_asset_id, to_asset_id, amount, currency, fee, date, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newId,
          userId,
          transaction.type,
          newFromAssetId || null,
          newToAssetId || null,
          transaction.amount,
          transaction.currency,
          transaction.fee || null,
          transaction.date,
          transaction.notes || null,
          transaction.createdAt
        ]
      );
    }

    // Initialize Payments with mapped liability IDs
    for (const payment of mockPayments) {
      const newId = `${userId}-payment-${uuidv4().slice(0, 8)}`;

      // Map liability ID
      const newLiabilityId = liabilityIdMap.get(payment.liabilityId);

      if (newLiabilityId) {
        await adapter.run(
          `INSERT INTO payments (id, user_id, liability_id, amount, date, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [newId, userId, newLiabilityId, payment.amount, payment.date, payment.notes || null, payment.createdAt]
        );
      }
    }

    // Initialize Market Data (shared across users, use original IDs)
    for (const marketData of mockMarketData) {
      try {
        await adapter.run(
          `INSERT INTO market_data (id, symbol, price, updated_at, source) VALUES (?, ?, ?, ?, ?)`,
          [marketData.id, marketData.symbol, marketData.price, marketData.updatedAt, marketData.source]
        );
      } catch (error: any) {
        // Skip if market data already exists (shared across users)
        if (error.code !== '23505') {
          throw error;
        }
      }
    }

    // Initialize FireConfig
    try {
      await adapter.run(
        `INSERT INTO fire_config (id, annual_expense, swr, updated_at, created_at) VALUES (?, ?, ?, ?, ?)`,
        [userId, mockFireConfig.annualExpense, mockFireConfig.swr, now, now]
      );
    } catch (error: any) {
      if (error.code !== '23505') {
        throw error;
      }
    }

    // Initialize UserSettings
    try {
      await adapter.run(
        `INSERT INTO user_settings (id, base_currency, privacy_mode, updated_at, created_at) VALUES (?, ?, ?, ?, ?)`,
        [userId, mockUserSettings.baseCurrency, mockUserSettings.privacyMode ? 1 : 0, now, now]
      );
    } catch (error: any) {
      if (error.code !== '23505') {
        throw error;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Demo data initialized successfully',
      initialized: true
    });
  } catch (error) {
    console.error('Error initializing demo data:', error);
    return NextResponse.json(
      { error: 'Failed to initialize demo data' },
      { status: 500 }
    );
  }
}
