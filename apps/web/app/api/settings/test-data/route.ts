import { NextResponse } from 'next/server';
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

// 生成演示数据（与游客账户系统保持一致）
export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id') || 'demo';
  try {
    // 检查是否已存在数据（避免重复生成）
    const existingAssets = await assetRepository.getAll(userId);
    if (existingAssets.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: '数据已存在，如需重置请使用"重置为演示数据"功能',
        initialized: false 
      });
    }

    // 初始化 Assets
    for (const asset of mockAssets) {
      const { id, createdAt, updatedAt, ...assetData } = asset;
      await assetRepository.create(userId, assetData);
    }

    // 初始化 Liabilities
    for (const liability of mockLiabilities) {
      const { id, createdAt, updatedAt, ...liabilityData } = liability;
      await liabilityRepository.create(userId, liabilityData);
    }

    // 初始化 FIRE 配置
    const { id: fcId, createdAt: fcCreatedAt, updatedAt: fcUpdatedAt, ...fireConfigData } = mockFireConfig;
    await fireConfigRepository.upsert(userId, fireConfigData);

    // 初始化用户设置
    const { id: usId, createdAt: usCreatedAt, updatedAt: usUpdatedAt, ...userSettingsData } = mockUserSettings;
    await userSettingsRepository.update(userId, userSettingsData);

    return NextResponse.json({ 
      success: true, 
      message: '演示数据生成成功',
      initialized: true
    });
  } catch (error) {
    console.error('Failed to generate demo data:', error);
    return NextResponse.json(
      { error: 'Failed to generate demo data' },
      { status: 500 }
    );
  }
}
