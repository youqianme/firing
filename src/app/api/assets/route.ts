import { initDatabase } from '../../../lib/database';
import {
  assetRepository,
  activityRepository
} from '../../../lib/dataAccess';

// 初始化数据库
initDatabase();

export async function GET() {
  try {
    const assets = assetRepository.getAll();
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
  try {
    const assetData = await request.json();
    const newAsset = assetRepository.create(assetData);
    
    // 记录活动
    activityRepository.create({
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

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing asset id' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    const assetData = await request.json();
    const existingAsset = assetRepository.getById(id);
    
    if (existingAsset) {
      const updatedAsset = assetRepository.update(id, assetData);
      if (updatedAsset) {
        // 记录活动
        activityRepository.create({
          action: 'UPDATE',
          objectType: 'ASSET',
          objectId: updatedAsset.id,
          objectName: updatedAsset.name,
          amount: updatedAsset.amount,
          currency: updatedAsset.currency,
          oldAmount: existingAsset.amount,
          delta: updatedAsset.amount - existingAsset.amount,
          notes: '更新资产'
        });
        
        return new Response(JSON.stringify(updatedAsset), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    }
    
    return new Response(JSON.stringify({ error: 'Asset not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update asset' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing asset id' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    const existingAsset = assetRepository.getById(id);
    if (existingAsset) {
      const success = assetRepository.delete(id);
      if (success) {
        // 记录活动
        activityRepository.create({
          action: 'DELETE',
          objectType: 'ASSET',
          objectId: existingAsset.id,
          objectName: existingAsset.name,
          amount: existingAsset.amount,
          currency: existingAsset.currency,
          notes: '删除资产'
        });
        
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    }
    
    return new Response(JSON.stringify({ error: 'Asset not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete asset' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
