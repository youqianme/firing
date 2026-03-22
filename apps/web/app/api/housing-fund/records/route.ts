import { NextRequest } from 'next/server';
import { dbManager } from '../../../../lib/database';
import { generateId } from '@firing/utils';

// 公积金变动记录转换函数
const toHousingFundRecord = (row: any) => ({
  id: row.id,
  assetId: row.asset_id,
  type: row.type,
  amount: row.amount,
  personalAmount: row.personal_amount,
  companyAmount: row.company_amount,
  date: row.date,
  reason: row.reason,
  notes: row.notes,
  createdAt: row.created_at,
});

// 获取数据库适配器
const getAdapter = () => dbManager.getAdapter();

// GET /api/housing-fund/records?assetId=xxx - 获取记录列表
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || 'demo';
  
  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');
    
    if (!assetId) {
      return new Response(JSON.stringify({ error: 'Missing assetId parameter' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    const adapter = getAdapter();
    const rows = await adapter.execute(
      'SELECT * FROM housing_fund_records WHERE asset_id = ? AND user_id = ? ORDER BY date DESC, created_at DESC',
      [assetId, userId]
    );
    
    const records = rows.map(toHousingFundRecord);
    
    return new Response(JSON.stringify(records), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to get housing fund records:', error);
    return new Response(JSON.stringify({ error: 'Failed to get records' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// POST /api/housing-fund/records - 创建记录
export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || 'demo';
  
  try {
    const recordData = await request.json();
    
    // 验证必填字段
    if (!recordData.assetId || !recordData.type || recordData.amount === undefined || !recordData.date) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // 验证类型
    const validTypes = ['deposit', 'withdraw', 'interest'];
    if (!validTypes.includes(recordData.type)) {
      return new Response(JSON.stringify({ error: 'Invalid record type' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    const id = generateId().toString();
    const now = new Date().toISOString();
    
    const adapter = getAdapter();
    
    // 插入记录
    await adapter.run(
      `INSERT INTO housing_fund_records (id, user_id, asset_id, type, amount, personal_amount, company_amount, date, reason, notes, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        recordData.assetId,
        recordData.type,
        recordData.amount,
        recordData.personalAmount || 0,
        recordData.companyAmount || 0,
        recordData.date,
        recordData.reason || null,
        recordData.notes || null,
        now
      ]
    );
    
    // 更新资产金额
    const assetRow = await adapter.get(
      'SELECT amount FROM assets WHERE id = ? AND user_id = ?',
      [recordData.assetId, userId]
    );
    
    if (assetRow) {
      let newAmount = assetRow.amount;
      if (recordData.type === 'deposit' || recordData.type === 'interest') {
        newAmount += recordData.amount;
      } else if (recordData.type === 'withdraw') {
        newAmount -= recordData.amount;
      }
      
      await adapter.run(
        'UPDATE assets SET amount = ?, updated_at = ? WHERE id = ? AND user_id = ?',
        [newAmount, now, recordData.assetId, userId]
      );
    }
    
    const newRecord = {
      id,
      assetId: recordData.assetId,
      type: recordData.type,
      amount: recordData.amount,
      personalAmount: recordData.personalAmount || 0,
      companyAmount: recordData.companyAmount || 0,
      date: recordData.date,
      reason: recordData.reason,
      notes: recordData.notes,
      createdAt: now,
    };
    
    return new Response(JSON.stringify(newRecord), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to create housing fund record:', error);
    return new Response(JSON.stringify({ error: 'Failed to create record' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// DELETE /api/housing-fund/records?id=xxx - 删除记录
export async function DELETE(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || 'demo';
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing id parameter' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    const adapter = getAdapter();
    
    // 获取记录信息
    const recordRow = await adapter.get(
      'SELECT * FROM housing_fund_records WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (!recordRow) {
      return new Response(JSON.stringify({ error: 'Record not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // 回滚资产金额
    const assetRow = await adapter.get(
      'SELECT amount FROM assets WHERE id = ? AND user_id = ?',
      [recordRow.asset_id, userId]
    );
    
    if (assetRow) {
      let newAmount = assetRow.amount;
      if (recordRow.type === 'deposit' || recordRow.type === 'interest') {
        newAmount -= recordRow.amount;
      } else if (recordRow.type === 'withdraw') {
        newAmount += recordRow.amount;
      }
      
      const now = new Date().toISOString();
      await adapter.run(
        'UPDATE assets SET amount = ?, updated_at = ? WHERE id = ? AND user_id = ?',
        [newAmount, now, recordRow.asset_id, userId]
      );
    }
    
    // 删除记录
    await adapter.run(
      'DELETE FROM housing_fund_records WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to delete housing fund record:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete record' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
