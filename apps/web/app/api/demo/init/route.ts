import { NextResponse } from 'next/server';
import { initializeDatabase } from '../../../../lib/database';
import { 
  assetRepository, 
  liabilityRepository, 
  fireConfigRepository, 
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
    
    // Ensure database is initialized
    await initializeDatabase();

    // Check if user already has assets
    const existingAssets = await assetRepository.getAll(userId);
    
    if (existingAssets.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Data already initialized',
        initialized: false 
      });
    }

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

    // Initialize FireConfig
    const { id: fcId, createdAt: fcCreatedAt, updatedAt: fcUpdatedAt, ...fireConfigData } = mockFireConfig;
    await fireConfigRepository.upsert(userId, fireConfigData);

    // Initialize UserSettings
    const { id: usId, createdAt: usCreatedAt, updatedAt: usUpdatedAt, ...userSettingsData } = mockUserSettings;
    await userSettingsRepository.update(userId, userSettingsData);

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
