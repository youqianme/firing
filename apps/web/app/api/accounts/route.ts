import { initializeDatabase } from '../../../lib/database';
import {
  accountRepository,
  activityRepository
} from '../../../lib/dataAccess';

// 初始化数据库
initializeDatabase();

export async function GET() {
  try {
    const accounts = await accountRepository.getAll();
    return new Response(JSON.stringify(accounts), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to get accounts' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(request: Request) {
  try {
    const accountData = await request.json();
    const newAccount = await accountRepository.create(accountData);
    
    // 记录活动
    await activityRepository.create({
      action: 'CREATE',
      objectType: 'ACCOUNT',
      objectId: newAccount.id,
      objectName: newAccount.name,
      amount: 0,
      currency: newAccount.currency || 'CNY',
      notes: '创建账户'
    });
    
    return new Response(JSON.stringify(newAccount), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create account' }), {
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
      return new Response(JSON.stringify({ error: 'Missing account id' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    const accountData = await request.json();
    const existingAccount = await accountRepository.getById(id);
    
    if (existingAccount) {
      const updatedAccount = await accountRepository.update(id, accountData);
      if (updatedAccount) {
        // 记录活动
        await activityRepository.create({
          action: 'UPDATE',
          objectType: 'ACCOUNT',
          objectId: updatedAccount.id,
          objectName: updatedAccount.name,
          amount: 0,
          currency: updatedAccount.currency || 'CNY',
          notes: '更新账户'
        });
        
        return new Response(JSON.stringify(updatedAccount), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    }
    
    return new Response(JSON.stringify({ error: 'Account not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update account' }), {
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
      return new Response(JSON.stringify({ error: 'Missing account id' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    const existingAccount = await accountRepository.getById(id);
    if (existingAccount) {
      const success = await accountRepository.delete(id);
      if (success) {
        // 记录活动
        await activityRepository.create({
          action: 'DELETE',
          objectType: 'ACCOUNT',
          objectId: existingAccount.id,
          objectName: existingAccount.name,
          amount: 0,
          currency: existingAccount.currency || 'CNY',
          notes: '删除账户'
        });
        
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    }
    
    return new Response(JSON.stringify({ error: 'Account not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete account' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
