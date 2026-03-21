import { NextResponse } from 'next/server';
import { dbManager } from '../../../../lib/database';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 验证必填字段
    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    const adapter = dbManager.getAdapter();

    // 查找用户
    const user = await adapter.get(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (!user) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 验证密码 - 使用 snake_case 列名
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 返回用户信息（不包含密码）
    return NextResponse.json({
      success: true,
      userId: user.id,
      username: user.username,
      email: user.email,
      message: '登录成功'
    });

  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
