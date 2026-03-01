import { dbManager, initializeDatabase } from '../../../lib/database';
import { userSettingsRepository, assetRepository, liabilityRepository, transactionRepository, activityRepository, fireConfigRepository } from '../../../lib/dataAccess';

// 初始化数据库
initializeDatabase();

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id') || 'demo';
  try {
    // 获取用户设置
    const settings = await userSettingsRepository.get(userId);
    
    return new Response(JSON.stringify(settings), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to get settings:', error);
    return new Response(JSON.stringify({ error: 'Failed to get settings' }), {
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
    const data = await request.json();
    
    // 保存用户设置
    const updatedSettings = await userSettingsRepository.update(userId, data);
    
    return new Response(JSON.stringify(updatedSettings), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to save settings:', error);
    return new Response(JSON.stringify({ error: 'Failed to save settings' }), {
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
    // 确保数据库已初始化
    await initializeDatabase();

    // 清空当前用户的所有数据（危险操作）
    const adapter = dbManager.getAdapter();
    
    // 按照依赖关系删除数据，仅删除当前用户的数据
    // 和 /api/demo/reset 保持一致的删除顺序
    const tables = [
      'payments', 
      'transactions', 
      'activities', 
      'marketData', 
      'assets', 
      'liabilities', 
      'accounts', 
      'fireConfig', 
      'userSettings'
    ];

    for (const table of tables) {
      try {
        await adapter.run(`DELETE FROM ${table} WHERE userId = ?`, [userId]);
      } catch (e) {
        console.warn(`Failed to delete from ${table}:`, e);
        // Continue with other tables
      }
    }
    
    return new Response(JSON.stringify({ message: 'All data cleared successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to clear data:', error);
    return new Response(JSON.stringify({ error: 'Failed to clear data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
