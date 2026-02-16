import { initDatabase } from '../../../lib/database';
import { assetRepository, activityRepository, marketDataRepository } from '../../../lib/dataAccess';

// 初始化数据库
initDatabase();

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const year = parseInt(url.searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(url.searchParams.get('month') || new Date().getMonth().toString());

    // 获取当月天数
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // 获取所有资产
    const assets = assetRepository.getAll();
    
    // 获取当月的活动记录
    const startDate = new Date(year, month, 1).toISOString();
    const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    
    // 这里简化处理，实际应该根据日期范围查询
    const activities = activityRepository.getAll(1000);
    const monthlyActivities = activities.filter(activity => {
      const activityDate = new Date(activity.createdAt);
      return activityDate.getFullYear() === year && activityDate.getMonth() === month;
    });

    // 计算每天的收益
    const earningsData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dateStr = currentDate.toISOString();
      
      // 过滤当天的活动
      const dayActivities = monthlyActivities.filter(activity => {
        const activityDate = new Date(activity.createdAt);
        return activityDate.getDate() === day;
      });

      // 计算活动变动收益
      let activityChange = 0;
      dayActivities.forEach(activity => {
        if (activity.delta) {
          activityChange += activity.delta;
        }
      });

      // 计算利息收益（简化处理，实际应该根据资产类型和利率计算）
      let interestEarnings = 0;
      assets.forEach(asset => {
        if (asset.interestRate && asset.type === 'bank') {
          // 简单计算日利息
          const dailyRate = asset.interestRate / 100 / 365;
          interestEarnings += asset.amount * dailyRate;
        }
      });

      // 计算市场变动收益（简化处理，实际应该根据市场数据计算）
      let marketChange = 0;
      assets.forEach(asset => {
        if (asset.type === 'investment') {
          // 模拟市场变动
          marketChange += (Math.random() * 2 - 1) * asset.amount * 0.001;
        }
      });

      // 计算总收益
      const total = activityChange + interestEarnings + marketChange;

      earningsData.push({
        date: dateStr,
        total: parseFloat(total.toFixed(2)),
        activity: parseFloat(activityChange.toFixed(2)),
        market: parseFloat(marketChange.toFixed(2)),
        interest: parseFloat(interestEarnings.toFixed(2))
      });
    }

    return new Response(JSON.stringify(earningsData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to get earnings data:', error);
    return new Response(JSON.stringify({ error: 'Failed to get earnings data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
