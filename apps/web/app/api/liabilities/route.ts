import { initializeDatabase } from '../../../lib/database';
import {
  liabilityRepository,
  activityRepository
} from '../../../lib/dataAccess';

// 初始化数据库
initializeDatabase();

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id') || 'demo';
  try {
    const liabilities = await liabilityRepository.getAll(userId);
    return new Response(JSON.stringify(liabilities), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to get liabilities' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id') || 'demo';
  try {
    const liability = await request.json();
    const newLiability = await liabilityRepository.create(userId, liability);
    
    // 记录活动
    await activityRepository.create(userId, {
      action: 'CREATE',
      objectType: 'LIABILITY',
      objectId: newLiability.id,
      objectName: newLiability.name,
      amount: newLiability.balance,
      currency: newLiability.currency,
      notes: '创建负债'
    });
    
    return new Response(JSON.stringify(newLiability), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create liability' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function PUT(request: Request) {
  const userId = request.headers.get('x-user-id') || 'demo';
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing liability id' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    const liabilityData = await request.json();
    const existingLiability = await liabilityRepository.getById(userId, id);
    
    if (existingLiability) {
      const updatedLiability = await liabilityRepository.update(userId, id, liabilityData);
      if (updatedLiability) {
        // 记录活动
        await activityRepository.create(userId, {
          action: 'UPDATE',
          objectType: 'LIABILITY',
          objectId: updatedLiability.id,
          objectName: updatedLiability.name,
          amount: updatedLiability.balance,
          currency: updatedLiability.currency,
          oldAmount: existingLiability.balance,
          delta: updatedLiability.balance - existingLiability.balance,
          notes: '更新负债'
        });
        
        return new Response(JSON.stringify(updatedLiability), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    }
    
    return new Response(JSON.stringify({ error: 'Liability not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update liability' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function DELETE(request: Request) {
  const userId = request.headers.get('x-user-id') || 'demo';
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing liability id' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    const existingLiability = await liabilityRepository.getById(userId, id);
    if (existingLiability) {
      const success = await liabilityRepository.delete(userId, id);
      if (success) {
        // 记录活动
        await activityRepository.create(userId, {
          action: 'DELETE',
          objectType: 'LIABILITY',
          objectId: existingLiability.id,
          objectName: existingLiability.name,
          amount: existingLiability.balance,
          currency: existingLiability.currency,
          notes: '删除负债'
        });
        
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    }
    
    return new Response(JSON.stringify({ error: 'Liability not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete liability' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
