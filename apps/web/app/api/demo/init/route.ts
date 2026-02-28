import { NextResponse } from 'next/server';
import { initializeDatabase } from '../../../../lib/database';
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

    // Check if user already has assets
    const existingAssets = await assetRepository.getAll(userId);
    
    if (existingAssets.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Data already initialized',
        initialized: false 
      });
    }

    // Initialize Assets
    for (const asset of mockAssets) {
      // Create new asset object without id, createdAt, updatedAt
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
