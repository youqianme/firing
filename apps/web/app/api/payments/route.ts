import { initializeDatabase } from '../../../lib/database';
import {
  paymentRepository,
  liabilityRepository,
  activityRepository
} from '../../../lib/dataAccess';

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id') || 'demo';
  await initializeDatabase();
  try {
    const payments = await paymentRepository.getAll(userId);
    return new Response(JSON.stringify(payments), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to get payments' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id') || 'demo';
  await initializeDatabase();
  try {
    const paymentData = await request.json();
    
    // 创建还款记录
    const payment = await paymentRepository.create(userId, paymentData);
    
    // 更新负债余额
    const liability = await liabilityRepository.getById(userId, paymentData.liabilityId);
    if (liability) {
      const updatedBalance = liability.balance - paymentData.amount;
      const updatedLiability = await liabilityRepository.update(userId, paymentData.liabilityId, {
        balance: updatedBalance
      });
      
      if (updatedLiability) {
        // 记录活动
        await activityRepository.create(userId, {
          action: 'REPAYMENT',
          objectType: 'LIABILITY',
          objectId: updatedLiability.id,
          objectName: updatedLiability.name,
          amount: paymentData.amount,
          currency: updatedLiability.currency,
          delta: -paymentData.amount,
          notes: '还款记录'
        });
        
        return new Response(JSON.stringify({ payment, updatedLiability }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    }
    
    return new Response(JSON.stringify({ error: 'Failed to update liability balance' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create payment' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
