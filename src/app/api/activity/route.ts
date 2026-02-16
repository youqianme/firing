import { initDatabase } from '../../../lib/database';
import { activityRepository } from '../../../lib/dataAccess';

// 初始化数据库
initDatabase();

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const filter = url.searchParams.get('filter') || 'ALL';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50');
    const offset = (page - 1) * pageSize;

    let activities;
    if (filter === 'ALL') {
      activities = activityRepository.getAll(pageSize, offset);
    } else {
      activities = activityRepository.getByObjectType(filter as any, pageSize, offset);
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
