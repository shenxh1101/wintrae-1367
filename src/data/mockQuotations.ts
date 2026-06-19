import type { Quotation } from '@/types';
import { calculateTotalPrice } from '@/utils/price';

const createQuotation = (
  id: string,
  orderId: string,
  orderTitle: string,
  clientId: string,
  clientName: string,
  complexity: 'simple' | 'medium' | 'complex',
  isUrgent: boolean,
  authorizationScope: 'personal' | 'commercial' | 'exclusive',
  status: 'draft' | 'sent' | 'accepted' | 'rejected'
): Quotation => {
  const priceInfo = calculateTotalPrice(complexity, isUrgent, authorizationScope);
  return {
    id,
    orderId,
    orderTitle,
    clientId,
    clientName,
    ...priceInfo,
    items: [
      { name: '基础费用', price: priceInfo.basePrice, description: '插画设计基础费用' },
      { name: '复杂度加成', price: Math.round(priceInfo.basePrice * (priceInfo.complexityMultiplier - 1)), description: `复杂度系数 x${priceInfo.complexityMultiplier}` },
      ...(priceInfo.urgentSurcharge > 0 ? [{ name: '加急费用', price: Math.round(priceInfo.urgentSurcharge), description: '30%加急费' }] : []),
      ...(priceInfo.commercialSurcharge > 0 ? [{ name: '授权费用', price: Math.round(priceInfo.commercialSurcharge), description: authorizationScope === 'commercial' ? '商业授权 50%' : '独家授权 150%' }] : [])
    ],
    createdAt: '2026-06-01',
    status,
    validUntil: '2026-07-01'
  };
};

export const mockQuotations: Quotation[] = [
  createQuotation('q1', 'o1', '游戏角色立绘 - 剑士艾伦', 'c1', '李明', 'complex', true, 'commercial', 'accepted'),
  createQuotation('q2', 'o2', '儿童绘本封面 - 小兔子的冒险', 'c2', '王芳', 'medium', false, 'commercial', 'accepted'),
  createQuotation('q3', 'o3', '品牌Logo插画 - 咖啡猫', 'c3', '张伟', 'medium', true, 'exclusive', 'sent'),
  createQuotation('q4', 'o4', '像素游戏角色包', 'c4', '陈静', 'complex', false, 'personal', 'draft'),
  createQuotation('q5', 'o5', '广告宣传插画 - 夏日促销', 'c5', '刘洋', 'medium', true, 'commercial', 'accepted'),
  createQuotation('q6', 'o6', '个人头像设计', 'c6', '赵雪', 'simple', false, 'personal', 'accepted'),
  createQuotation('q7', 'o7', '动画角色设定 - 魔法少女', 'c7', '孙磊', 'complex', false, 'commercial', 'sent'),
  createQuotation('q8', 'o8', '教材插图系列 - 科学探索', 'c8', '周婷', 'medium', false, 'commercial', 'accepted'),
  createQuotation('q9', 'o9', '游戏皮肤设计 - 夏日海滩', 'c1', '李明', 'complex', false, 'commercial', 'draft'),
  createQuotation('q10', 'o10', '品牌IP形象设计', 'c5', '刘洋', 'complex', false, 'exclusive', 'sent'),
  createQuotation('q11', 'o11', '明信片插画套装', 'c2', '王芳', 'medium', false, 'commercial', 'accepted'),
  createQuotation('q12', 'o12', '表情包设计 - 小恐龙', 'c6', '赵雪', 'simple', false, 'personal', 'draft')
];
