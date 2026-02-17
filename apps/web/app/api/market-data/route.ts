import { initializeDatabase } from '../../../lib/database';
import { marketDataRepository } from '../../../lib/dataAccess';

// 初始化数据库
initializeDatabase();

export async function GET() {
  try {
    // 获取所有市场数据
    const allMarketData = await marketDataRepository.getAll();
    
    // 转换为前端需要的格式
    const formattedData = {
      usdToCny: allMarketData.find(item => item.symbol === 'USD/CNY')?.price || 7.20,
      hkdToCny: allMarketData.find(item => item.symbol === 'HKD/CNY')?.price || 0.92,
      goldPriceCny: allMarketData.find(item => item.symbol === 'GOLD/CNY')?.price || 480.00
    };
    
    return new Response(JSON.stringify(formattedData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to get market data:', error);
    return new Response(JSON.stringify({ error: 'Failed to get market data' }), {
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
    
    // 保存市场数据
    if (data.usdToCny) {
      await marketDataRepository.upsert('USD/CNY', data.usdToCny);
    }
    
    if (data.hkdToCny) {
      await marketDataRepository.upsert('HKD/CNY', data.hkdToCny);
    }
    
    if (data.goldPriceCny) {
      await marketDataRepository.upsert('GOLD/CNY', data.goldPriceCny);
    }
    
    return new Response(JSON.stringify({ message: 'Market data saved successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to save market data:', error);
    return new Response(JSON.stringify({ error: 'Failed to save market data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
