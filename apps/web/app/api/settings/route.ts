import { initializeDatabase } from '../../../lib/database';
import { userSettingsRepository, assetRepository, liabilityRepository, transactionRepository, activityRepository, fireConfigRepository } from '../../../lib/dataAccess';

// 初始化数据库
initializeDatabase();

export async function GET() {
  try {
    // 获取用户设置
    const settings = await userSettingsRepository.get();
    
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
  try {
    const data = await request.json();
    
    // 保存用户设置
    const updatedSettings = await userSettingsRepository.update(data);
    
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

export async function DELETE() {
  try {
    // 清空所有数据（危险操作）
    const { dbManager } = require('../../../lib/database');
    const adapter = dbManager.getAdapter();
    
    // 按照依赖关系删除数据
    await adapter.run('DELETE FROM payments');
    await adapter.run('DELETE FROM transactions');
    await adapter.run('DELETE FROM activities');
    await adapter.run('DELETE FROM assets');
    await adapter.run('DELETE FROM liabilities');
    await adapter.run('DELETE FROM accounts');
    await adapter.run('DELETE FROM marketData');
    await adapter.run('DELETE FROM fireConfig');
    
    // 保留用户设置
    
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
