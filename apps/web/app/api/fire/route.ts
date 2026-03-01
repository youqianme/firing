import { initializeDatabase } from '../../../lib/database';
import { fireConfigRepository } from '../../../lib/dataAccess';

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id') || 'demo';
  await initializeDatabase();
  try {
    const fireConfig = await fireConfigRepository.get(userId);
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
  const userId = request.headers.get('x-user-id') || 'demo';
  await initializeDatabase();
  try {
    const config = await request.json();
    const updatedConfig = await fireConfigRepository.upsert(userId, config);
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
