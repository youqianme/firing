import { NextResponse } from 'next/server';
import { dbManager, initializeDatabase } from '../../../../lib/database';
import { 
  assetRepository, 
  liabilityRepository, 
  fireConfigRepository, 
  userSettingsRepository 
} from '../../../../lib/dataAccess';
import { 
  mockAssets, 
  mockLiabilities, 
  mockFireConfig, 
  mockUserSettings 
} from '@firing/utils';

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo';
    
    // Ensure database is initialized
    await initializeDatabase();
    
    // 注意：这里必须使用 global.dbManager 或者从 lib/database 导入的 dbManager
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
      'marketData', 
      'assets', 
      'liabilities', 
      'accounts', 
      'fireConfig', 
      'userSettings'
    ];

    for (const table of tables) {
      try {
        // Skip tables that don't have userId column (marketData, fireConfig, userSettings)
        if (['marketData', 'fireConfig', 'userSettings'].includes(table)) {
          // For tables without userId, delete all rows
          await adapter.run(`DELETE FROM ${table}`);
        } else {
          await adapter.run(`DELETE FROM ${table} WHERE userId = ?`, [userId]);
        }
      } catch (e) {
        console.warn(`Failed to delete from ${table}:`, e);
        // Continue with other tables
      }
    }

    // Re-seed data (same logic as init)
    
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

    // Initialize FireConfig
    const { id: fcId, createdAt: fcCreatedAt, updatedAt: fcUpdatedAt, ...fireConfigData } = mockFireConfig;
    await fireConfigRepository.upsert(userId, fireConfigData);

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
