import { FireMember, FireMemberCalculation, FireCalculation } from '@firing/types';
import { DatabaseManager } from '../database/manager';

/**
 * 根据性别计算法定退休年龄（2026年渐进式延迟退休政策）
 * 简化规则：男性60岁，女性55岁
 */
export function getRetirementAgeByGender(gender: 'male' | 'female'): number {
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
 * FIRE成员仓库，负责处理FIRE成员相关的数据访问操作
 */
export class FireMemberRepository {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  /**
   * 获取所有FIRE成员
   * @param userId 用户ID
   * @returns FIRE成员列表
   */
  async getAll(userId: string): Promise<FireMember[]> {
    const adapter = this.dbManager.getAdapter();
    const results = await adapter.all('SELECT * FROM fire_members WHERE user_id = ? ORDER BY created_at ASC', [userId]);
    return results.map(row => this.mapToFireMember(row));
  }

  /**
   * 获取单个FIRE成员
   * @param id 成员ID
   * @returns FIRE成员对象
   */
  async getById(id: string): Promise<FireMember | null> {
    const adapter = this.dbManager.getAdapter();
    const result = await adapter.get('SELECT * FROM fire_members WHERE id = ?', [id]);
    return result ? this.mapToFireMember(result) : null;
  }

  /**
   * 创建FIRE成员
   * @param userId 用户ID
   * @param member 成员数据
   * @returns 创建的FIRE成员
   */
  async create(userId: string, member: Omit<FireMember, 'id' | 'userId' | 'updatedAt' | 'createdAt'>): Promise<FireMember> {
    const adapter = this.dbManager.getAdapter();
    const now = new Date().toISOString();
    const id = `fire_member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 如果没有提供退休年龄，根据性别自动估算
    const retirementAge = member.retirementAge ?? getRetirementAgeByGender(member.gender);

    const newMember: FireMember = {
      id,
      userId,
      name: member.name,
      gender: member.gender,
      birthDate: member.birthDate,
      retirementAge,
      monthlyExpense: member.monthlyExpense,
      targetRetirementAsset: member.targetRetirementAsset,
      updatedAt: now,
      createdAt: now
    };

    await adapter.run(
      `INSERT INTO fire_members (id, user_id, name, gender, birth_date, retirement_age, monthly_expense, target_retirement_asset, updated_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newMember.id,
        newMember.userId,
        newMember.name,
        newMember.gender,
        newMember.birthDate,
        newMember.retirementAge,
        newMember.monthlyExpense,
        newMember.targetRetirementAsset,
        newMember.updatedAt,
        newMember.createdAt
      ]
    );

    return newMember;
  }

  /**
   * 更新FIRE成员
   * @param id 成员ID
   * @param member 部分成员数据
   * @returns 更新后的FIRE成员
   */
  async update(id: string, member: Partial<FireMember>): Promise<FireMember | null> {
    const adapter = this.dbManager.getAdapter();
    const now = new Date().toISOString();

    const existing = await this.getById(id);
    if (!existing) {
      return null;
    }

    // 如果修改了性别但没有修改退休年龄，自动重新估算
    let retirementAge = member.retirementAge ?? existing.retirementAge;
    if (member.gender && !member.retirementAge) {
      retirementAge = getRetirementAgeByGender(member.gender);
    }

    const updatedMember = { ...existing, ...member, retirementAge, updatedAt: now };

    await adapter.run(
      `UPDATE fire_members SET 
        name = ?,
        gender = ?,
        birth_date = ?,
        retirement_age = ?,
        monthly_expense = ?,
        target_retirement_asset = ?,
        updated_at = ?
       WHERE id = ?`,
      [
        updatedMember.name,
        updatedMember.gender,
        updatedMember.birthDate,
        updatedMember.retirementAge,
        updatedMember.monthlyExpense,
        updatedMember.targetRetirementAsset,
        now,
        id
      ]
    );

    return this.getById(id);
  }

  /**
   * 删除FIRE成员
   * @param id 成员ID
   * @returns 是否成功删除
   */
  async delete(id: string): Promise<boolean> {
    const adapter = this.dbManager.getAdapter();
    const result = await adapter.run('DELETE FROM fire_members WHERE id = ?', [id]);
    return result.changes > 0;
  }

  /**
   * 计算FIRE数据
   * @param members 成员列表
   * @param currentFireAssets 当前FIRE资产
   * @returns FIRE计算结果
   */
  calculateFireMetrics(members: FireMember[], currentFireAssets: number): FireCalculation {
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

    // 计算总体进度
    const fireProgress = totalNeeded > 0 ? Math.min(100, (currentFireAssets / totalNeeded) * 100) : 0;
    const fireGap = totalNeeded - currentFireAssets;

    return {
      members: memberCalculations,
      totalMonthlyExpense,
      totalNeeded,
      currentFireAssets,
      fireProgress,
      fireGap
    };
  }

  /**
   * 将数据库结果映射到FIRE成员对象
   * @param row 数据库行
   * @returns FIRE成员对象
   */
  private mapToFireMember(row: any): FireMember {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      gender: row.gender,
      birthDate: row.birth_date,
      retirementAge: row.retirement_age,
      monthlyExpense: row.monthly_expense,
      targetRetirementAsset: row.target_retirement_asset,
      updatedAt: row.updated_at,
      createdAt: row.created_at
    };
  }
}
