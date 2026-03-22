import { fireMemberRepository, assetRepository, liabilityRepository } from '../../../lib/dataAccess';
import { FireMember, FireMemberCalculation, FireCalculation } from '@firing/types';

/**
 * 根据性别计算法定退休年龄
 * 男性：60岁
 * 女性：55岁
 */
function getRetirementAgeByGender(gender: 'male' | 'female'): number {
  return gender === 'male' ? 60 : 55;
}

/**
 * 计算距离退休的月数
 */
function calculateMonthsToRetirement(birthDate: string, retirementAge: number): number {
  const birth = new Date(birthDate);
  const retirementDate = new Date(birth);
  retirementDate.setFullYear(birth.getFullYear() + retirementAge);

  const now = new Date();

  // 如果已经过了退休年龄，返回0
  if (now >= retirementDate) {
    return 0;
  }

  // 计算月数差
  const yearDiff = retirementDate.getFullYear() - now.getFullYear();
  const monthDiff = retirementDate.getMonth() - now.getMonth();

  return Math.max(0, yearDiff * 12 + monthDiff);
}

/**
 * 计算FIRE数据
 * 使用净资产 = 资产 - 负债
 */
function calculateFireMetrics(
  members: FireMember[],
  currentFireAssets: number,
  totalLiabilities: number
): FireCalculation {
  // 计算每个成员的数据
  const memberCalculations: FireMemberCalculation[] = members.map(member => {
    const monthsToRetirement = calculateMonthsToRetirement(member.birthDate, member.retirementAge);
    const personalTotalNeeded = member.monthlyExpense * monthsToRetirement + member.targetRetirementAsset;

    return {
      memberId: member.id,
      name: member.name,
      gender: member.gender,
      birthDate: member.birthDate,
      retirementAge: member.retirementAge,
      monthsToRetirement,
      monthlyExpense: member.monthlyExpense,
      targetRetirementAsset: member.targetRetirementAsset,
      personalTotalNeeded
    };
  });

  // 计算家庭总计
  const totalMonthlyExpense = memberCalculations.reduce((sum, m) => sum + m.monthlyExpense, 0);
  const totalNeeded = memberCalculations.reduce((sum, m) => sum + m.personalTotalNeeded, 0);

  // 计算净资产 = 资产 - 负债
  const netWorth = currentFireAssets - totalLiabilities;

  // 计算总体进度（基于净资产）
  const fireProgress = totalNeeded > 0 ? Math.min(100, (netWorth / totalNeeded) * 100) : 0;
  const fireGap = totalNeeded - netWorth;

  return {
    members: memberCalculations,
    totalMonthlyExpense,
    totalNeeded,
    currentFireAssets,
    totalLiabilities,
    netWorth,
    fireProgress,
    fireGap
  };
}

// GET: 获取所有成员和计算结果
export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id') || 'demo';
  try {
    // 获取所有成员
    const members = await fireMemberRepository.getAll(userId);

    // 获取资产
    const assets = await assetRepository.getAll(userId);
    const currentFireAssets = assets
      .filter(asset => asset.includeInFire)
      .reduce((total, asset) => total + asset.amount, 0);

    // 获取负债
    const liabilities = await liabilityRepository.getAll(userId);
    const totalLiabilities = liabilities.reduce((total, liability) => total + liability.balance, 0);

    // 计算FIRE指标（使用净资产）
    const calculation = calculateFireMetrics(members, currentFireAssets, totalLiabilities);

    return new Response(JSON.stringify({
      members,
      calculation
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to get FIRE data:', error);
    return new Response(JSON.stringify({ error: 'Failed to get FIRE data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// POST: 创建新成员
export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id') || 'demo';
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.name || !body.gender || !body.birthDate) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // 如果没有提供退休年龄，根据性别自动估算
    const retirementAge = body.retirementAge ?? getRetirementAgeByGender(body.gender);

    // 创建成员
    const newMember = await fireMemberRepository.create(userId, {
      name: body.name,
      gender: body.gender,
      birthDate: body.birthDate,
      retirementAge,
      monthlyExpense: body.monthlyExpense || 0,
      targetRetirementAsset: body.targetRetirementAsset || 0,
    });

    // 重新获取所有成员并计算
    const members = await fireMemberRepository.getAll(userId);
    const assets = await assetRepository.getAll(userId);
    const currentFireAssets = assets
      .filter(asset => asset.includeInFire)
      .reduce((total, asset) => total + asset.amount, 0);
    const liabilities = await liabilityRepository.getAll(userId);
    const totalLiabilities = liabilities.reduce((total, liability) => total + liability.balance, 0);
    const calculation = calculateFireMetrics(members, currentFireAssets, totalLiabilities);

    return new Response(JSON.stringify({
      member: newMember,
      members,
      calculation
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to create FIRE member:', error);
    return new Response(JSON.stringify({ error: 'Failed to create FIRE member' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// PUT: 更新成员
export async function PUT(request: Request) {
  const userId = request.headers.get('x-user-id') || 'demo';
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Member ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // 如果修改了性别但没有修改退休年龄，自动重新估算
    if (updates.gender && !updates.retirementAge) {
      updates.retirementAge = getRetirementAgeByGender(updates.gender);
    }

    // 更新成员
    const updatedMember = await fireMemberRepository.update(userId, id, updates);

    if (!updatedMember) {
      return new Response(JSON.stringify({ error: 'Member not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // 重新获取所有成员并计算
    const members = await fireMemberRepository.getAll(userId);
    const assets = await assetRepository.getAll(userId);
    const currentFireAssets = assets
      .filter(asset => asset.includeInFire)
      .reduce((total, asset) => total + asset.amount, 0);
    const liabilities = await liabilityRepository.getAll(userId);
    const totalLiabilities = liabilities.reduce((total, liability) => total + liability.balance, 0);
    const calculation = calculateFireMetrics(members, currentFireAssets, totalLiabilities);

    return new Response(JSON.stringify({
      member: updatedMember,
      members,
      calculation
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to update FIRE member:', error);
    return new Response(JSON.stringify({ error: 'Failed to update FIRE member' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// DELETE: 删除成员
export async function DELETE(request: Request) {
  const userId = request.headers.get('x-user-id') || 'demo';
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Member ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // 检查是否至少保留一个成员
    const existingMembers = await fireMemberRepository.getAll(userId);
    if (existingMembers.length <= 1) {
      return new Response(JSON.stringify({ error: 'At least one member must be kept' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // 删除成员
    const success = await fireMemberRepository.delete(userId, id);

    if (!success) {
      return new Response(JSON.stringify({ error: 'Member not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // 重新获取所有成员并计算
    const members = await fireMemberRepository.getAll(userId);
    const assets = await assetRepository.getAll(userId);
    const currentFireAssets = assets
      .filter(asset => asset.includeInFire)
      .reduce((total, asset) => total + asset.amount, 0);
    const liabilities = await liabilityRepository.getAll(userId);
    const totalLiabilities = liabilities.reduce((total, liability) => total + liability.balance, 0);
    const calculation = calculateFireMetrics(members, currentFireAssets, totalLiabilities);

    return new Response(JSON.stringify({
      members,
      calculation
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to delete FIRE member:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete FIRE member' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
