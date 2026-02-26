import { initializeDatabase } from '../../../lib/database';
import {
  transactionRepository,
  assetRepository,
  activityRepository
} from '../../../lib/dataAccess';
// 移除类型导入，直接使用字符串值

// 初始化数据库
initializeDatabase();

export async function GET() {
  try {
    const transactions = await transactionRepository.getAll();
    return new Response(JSON.stringify(transactions), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to get transactions' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(request: Request) {
  try {
    const transactionData = await request.json();
    
    // 创建交易记录
    const transaction = await transactionRepository.create(transactionData);
    
    if (transactionData.type === 'transfer') {
      // 处理转账交易
      const fromAsset = await assetRepository.getById(transactionData.fromAssetId);
      const toAsset = await assetRepository.getById(transactionData.toAssetId);
      
      if (fromAsset && toAsset) {
        // 更新资产余额
        const updatedFromAsset = await assetRepository.update(transactionData.fromAssetId, {
          amount: fromAsset.amount - transactionData.amount
        });
        
        const updatedToAsset = await assetRepository.update(transactionData.toAssetId, {
          amount: toAsset.amount + transactionData.amount
        });
        
        if (updatedFromAsset && updatedToAsset) {
          // 记录活动
          await activityRepository.create({
            action: 'TRANSFER',
            objectType: 'TRANSACTION',
            objectId: transaction.id,
            objectName: `转账: ${updatedFromAsset.name} → ${updatedToAsset.name}`,
            amount: transactionData.amount,
            currency: transactionData.currency,
            notes: '转账交易'
          });
          
          return new Response(JSON.stringify({ transaction, updatedFromAsset, updatedToAsset }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }
      }
    } else if (transactionData.type === 'time_deposit_redemption') {
      // 处理定期兑付交易
      const timeDepositAsset = await assetRepository.getById(transactionData.fromAssetId);
      const cashAsset = await assetRepository.getById(transactionData.toAssetId);
      
      if (timeDepositAsset && cashAsset) {
        // 更新现金资产余额
        const updatedCashAsset = await assetRepository.update(transactionData.toAssetId, {
          amount: cashAsset.amount + transactionData.amount
        });
        
        // 删除定期存款资产
        await assetRepository.delete(transactionData.fromAssetId);
        
        if (updatedCashAsset) {
          // 记录活动
          await activityRepository.create({
            action: 'REDEEM',
            objectType: 'TRANSACTION',
            objectId: transaction.id,
            objectName: `定期兑付: ${timeDepositAsset.name} → ${updatedCashAsset.name}`,
            amount: transactionData.amount,
            currency: transactionData.currency,
            notes: '定期兑付交易'
          });
          
          return new Response(JSON.stringify({ transaction, updatedCashAsset, deletedAssetId: transactionData.fromAssetId }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }
      }
    }
    
    return new Response(JSON.stringify({ error: 'Failed to process transaction' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create transaction' }), {
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
      return new Response(JSON.stringify({ error: 'Missing transaction id' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // 获取交易记录
    const transaction = await transactionRepository.getById(id);
    if (transaction) {
      // 删除交易记录
      await transactionRepository.delete(id);
      
      // 回滚资产余额
      if (transaction.fromAssetId && transaction.toAssetId) {
        const fromAsset = await assetRepository.getById(transaction.fromAssetId);
        const toAsset = await assetRepository.getById(transaction.toAssetId);
        
        if (fromAsset && toAsset) {
          if (transaction.type === 'transfer') {
            // 回滚转账交易
            await assetRepository.update(transaction.fromAssetId, {
              amount: fromAsset.amount + transaction.amount
            });
            
            await assetRepository.update(transaction.toAssetId, {
              amount: toAsset.amount - transaction.amount
            });
          } else if (transaction.type === 'time_deposit_redemption') {
            // 回滚定期兑付交易
            // 重新创建定期存款资产
            await assetRepository.create({
              name: `定期存款 ${new Date(transaction.date).toISOString().split('T')[0]}`,
              type: 'other',
              currency: transaction.currency,
              amount: transaction.amount,
              includeInFire: true,
              valuationMethod: 'MANUAL'
            });
            
            // 更新现金资产余额
            await assetRepository.update(transaction.toAssetId, {
              amount: toAsset.amount - transaction.amount
            });
          }
        }
      }
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    return new Response(JSON.stringify({ error: 'Transaction not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete transaction' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
