import { NextResponse } from 'next/server';
import { dbManager } from '../../../../lib/database';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, email, oldUserId } = body;

    // 验证必填字段
    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    // 验证用户名长度
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: '用户名长度必须在3-20个字符之间' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度不能少于6个字符' },
        { status: 400 }
      );
    }

    const adapter = dbManager.getAdapter();

    // 检查用户名是否已存在
    const existingUser = await adapter.get(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (existingUser) {
      return NextResponse.json(
        { error: '用户名已被使用' },
        { status: 409 }
      );
    }

    // 生成新用户ID
    const newUserId = `user-${uuidv4()}`;
    const now = new Date().toISOString();

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);

    try {
      await adapter.beginTransaction();

      // 创建用户账户
      await adapter.run(
        `INSERT INTO users (id, username, password_hash, email, updated_at, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [newUserId, username, passwordHash, email || null, now, now]
      );

      // 如果有旧用户ID（游客账户），迁移数据
      if (oldUserId && oldUserId.startsWith('guest-')) {
        // Update tables where user_id is a column
        const tablesWithUserId = [
          'assets',
          'liabilities',
          'payments',
          'transactions',
          'accounts',
          'activities'
        ];

        for (const table of tablesWithUserId) {
          await adapter.run(
            `UPDATE ${table} SET user_id = ? WHERE user_id = ?`,
            [newUserId, oldUserId]
          );
        }

        // Update fire_config
        const fireConfig = await adapter.get('SELECT * FROM fire_config WHERE id = ?', [oldUserId]);
        if (fireConfig) {
          await adapter.run(
            `UPDATE fire_config SET id = ? WHERE id = ?`,
            [newUserId, oldUserId]
          );
        } else {
          await adapter.run(
            `INSERT INTO fire_config (id, annual_expense, swr, updated_at, created_at) VALUES (?, ?, ?, ?, ?)`,
            [newUserId, 0, 4, now, now]
          );
        }

        // Update user_settings
        const userSettings = await adapter.get('SELECT * FROM user_settings WHERE id = ?', [oldUserId]);
        if (userSettings) {
          await adapter.run(
            `UPDATE user_settings SET id = ? WHERE id = ?`,
            [newUserId, oldUserId]
          );
        } else {
          await adapter.run(
            `INSERT INTO user_settings (id, base_currency, privacy_mode, updated_at, created_at) VALUES (?, ?, ?, ?, ?)`,
            [newUserId, 'CNY', 0, now, now]
          );
        }
      } else {
        // 创建默认配置
        await adapter.run(
          `INSERT INTO fire_config (id, annual_expense, swr, updated_at, created_at) VALUES (?, ?, ?, ?, ?)`,
          [newUserId, 0, 4, now, now]
        );

        await adapter.run(
          `INSERT INTO user_settings (id, base_currency, privacy_mode, updated_at, created_at) VALUES (?, ?, ?, ?, ?)`,
          [newUserId, 'CNY', 0, now, now]
        );
      }

      await adapter.commit();

      return NextResponse.json({
        success: true,
        userId: newUserId,
        username: username,
        message: '注册成功'
      });

    } catch (error) {
      await adapter.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
