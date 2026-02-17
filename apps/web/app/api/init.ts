import { initializeDatabase } from '../../lib/database';

// 初始化数据库
initializeDatabase();

export default function handler(req: Request, res: Response) {
  return new Response(JSON.stringify({ message: 'Database initialized successfully' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
