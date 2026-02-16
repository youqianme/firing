import { initDatabase } from '../../../lib/database';
import { userSettingsRepository, assetRepository, liabilityRepository, transactionRepository, activityRepository, fireConfigRepository } from '../../../lib/dataAccess';

// 初始化数据库
initDatabase();

export async function GET() {
  try {
    // 获取用户设置
    const settings = userSettingsRepository.get();
    
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
    const updatedSettings = userSettingsRepository.update(data);
    
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
    const db = require('../../../lib/database').getDb();
    
    // 按照依赖关系删除数据
    db.exec('DELETE FROM payments');
    db.exec('DELETE FROM transactions');
    db.exec('DELETE FROM activities');
    db.exec('DELETE FROM assets');
    db.exec('DELETE FROM liabilities');
    db.exec('DELETE FROM accounts');
    db.exec('DELETE FROM marketData');
    db.exec('DELETE FROM fireConfig');
    
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
