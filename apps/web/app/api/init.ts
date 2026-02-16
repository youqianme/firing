import { initDatabase } from '../../lib/database';

// 初始化数据库
initDatabase();

export default function handler(req: Request, res: Response) {
  return new Response(JSON.stringify({ message: 'Database initialized successfully' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
