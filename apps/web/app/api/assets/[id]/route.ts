import { initializeDatabase } from '../../../../lib/database';
import { assetRepository, activityRepository } from '../../../../lib/dataAccess';

// 初始化数据库
initializeDatabase();

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const existingAsset = await assetRepository.getById(id);
    if (existingAsset) {
      const success = await assetRepository.delete(id);
      if (success) {
        // 记录活动
        await activityRepository.create({
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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const assetData = await request.json();
    const existingAsset = await assetRepository.getById(id);
    
    if (existingAsset) {
      const updatedAsset = await assetRepository.update(id, assetData);
      if (updatedAsset) {
        // 记录活动
        await activityRepository.create({
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
