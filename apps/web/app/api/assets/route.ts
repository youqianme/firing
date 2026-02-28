import { initializeDatabase } from '../../../lib/database';
import {
  assetRepository,
  activityRepository
} from '../../../lib/dataAccess';

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id') || 'demo';
  // 确保数据库已初始化
  await initializeDatabase();
  try {
    const assets = await assetRepository.getAll(userId);
    return new Response(JSON.stringify(assets), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to get assets' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id') || 'demo';
  // 确保数据库已初始化
  await initializeDatabase();
  try {
    const assetData = await request.json();
    const newAsset = await assetRepository.create(userId, assetData);
    
    // 记录活动
    await activityRepository.create(userId, {
      action: 'CREATE',
      objectType: 'ASSET',
      objectId: newAsset.id,
      objectName: newAsset.name,
      amount: newAsset.amount,
      currency: newAsset.currency,
      notes: '创建资产'
    });
    
    return new Response(JSON.stringify(newAsset), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create asset' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
