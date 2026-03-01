import { initializeDatabase } from '../../../lib/database';
import { activityRepository } from '../../../lib/dataAccess';

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id') || 'demo';
  await initializeDatabase();
  try {
    const url = new URL(request.url);
    const filter = url.searchParams.get('filter') || 'ALL';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50');
    const offset = (page - 1) * pageSize;

    let activities;
    if (filter === 'ALL') {
      activities = await activityRepository.getAll(userId, pageSize, offset);
    } else {
      activities = await activityRepository.getByObjectType(userId, filter as any, pageSize, offset);
    }

    return new Response(JSON.stringify(activities), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to get activities' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
