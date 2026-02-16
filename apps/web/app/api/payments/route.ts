import { initDatabase } from '../../../lib/database';
import {
  paymentRepository,
  liabilityRepository,
  activityRepository
} from '../../../lib/dataAccess';

// 初始化数据库
initDatabase();

export async function GET() {
  try {
    const payments = paymentRepository.getAll();
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
  try {
    const paymentData = await request.json();
    
    // 创建还款记录
    const payment = paymentRepository.create(paymentData);
    
    // 更新负债余额
    const liability = liabilityRepository.getById(paymentData.liabilityId);
    if (liability) {
      const updatedBalance = liability.balance - paymentData.amount;
      const updatedLiability = liabilityRepository.update(paymentData.liabilityId, {
        balance: updatedBalance
      });
      
      if (updatedLiability) {
        // 记录活动
        activityRepository.create({
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