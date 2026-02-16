import { initDatabase } from '../../../lib/database';
import { fireConfigRepository } from '../../../lib/dataAccess';

// 初始化数据库
initDatabase();

export async function GET() {
  try {
    const fireConfig = fireConfigRepository.get();
    return new Response(JSON.stringify(fireConfig), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to get FIRE config' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(request: Request) {
  try {
    const config = await request.json();
    const updatedConfig = fireConfigRepository.upsert(config);
    return new Response(JSON.stringify(updatedConfig), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update FIRE config' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
