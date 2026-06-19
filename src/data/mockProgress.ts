import type { ProgressRecord } from '@/types';

export const mockProgress: ProgressRecord[] = [
  {
    id: 'p1',
    orderId: 'o1',
    orderTitle: '游戏角色立绘 - 剑士艾伦',
    status: 'consultation',
    date: '2026-06-01',
    description: '客户咨询角色设计需求，初步沟通风格方向',
    feedback: '客户喜欢日系二次元风格，参考《原神》画风',
    revisionNumber: 0,
    attachments: ['https://picsum.photos/id/1/400/600']
  },
  {
    id: 'p2',
    orderId: 'o1',
    orderTitle: '游戏角色立绘 - 剑士艾伦',
    status: 'draft',
    date: '2026-06-03',
    description: '完成初步草图设计，确认构图和角色姿态',
    feedback: '姿态不错，但希望武器更有设计感',
    revisionNumber: 0,
    attachments: ['https://picsum.photos/id/2/400/600']
  },
  {
    id: 'p3',
    orderId: 'o1',
    orderTitle: '游戏角色立绘 - 剑士艾伦',
    status: 'lineart',
    date: '2026-06-08',
    description: '完成线稿，细化服装和武器细节',
    feedback: '线稿很完美，可以开始上色了',
    revisionNumber: 1,
    attachments: ['https://picsum.photos/id/3/400/600']
  },
  {
    id: 'p4',
    orderId: 'o1',
    orderTitle: '游戏角色立绘 - 剑士艾伦',
    status: 'coloring',
    date: '2026-06-15',
    description: '正在进行上色阶段，确定主色调和光影',
    feedback: '等待客户反馈',
    revisionNumber: 1,
    attachments: ['https://picsum.photos/id/6/400/600']
  },
  {
    id: 'p5',
    orderId: 'o2',
    orderTitle: '儿童绘本封面 - 小兔子的冒险',
    status: 'consultation',
    date: '2026-06-05',
    description: '讨论绘本主题和风格，确定为温馨童话风',
    feedback: '客户希望色彩明亮，适合3-6岁儿童',
    revisionNumber: 0,
    attachments: []
  },
  {
    id: 'p6',
    orderId: 'o2',
    orderTitle: '儿童绘本封面 - 小兔子的冒险',
    status: 'draft',
    date: '2026-06-07',
    description: '草图设计：小兔子在森林中的冒险场景',
    feedback: '构图很好，希望小兔子更可爱一些',
    revisionNumber: 0,
    attachments: ['https://picsum.photos/id/1015/400/600']
  },
  {
    id: 'p7',
    orderId: 'o2',
    orderTitle: '儿童绘本封面 - 小兔子的冒险',
    status: 'lineart',
    date: '2026-06-12',
    description: '完成线稿，添加森林背景细节',
    feedback: '等待客户确认',
    revisionNumber: 0,
    attachments: ['https://picsum.photos/id/1018/400/600']
  },
  {
    id: 'p8',
    orderId: 'o3',
    orderTitle: '品牌Logo插画 - 咖啡猫',
    status: 'revision',
    date: '2026-06-10',
    description: '根据客户反馈进行第二次修改',
    feedback: '眼睛改得很好，但是希望杯子的图案更有特色',
    revisionNumber: 2,
    attachments: ['https://picsum.photos/id/20/400/400']
  },
  {
    id: 'p9',
    orderId: 'o8',
    orderTitle: '教材插图系列 - 科学探索',
    status: 'coloring',
    date: '2026-06-01',
    description: '开始第一批4张插图的上色工作',
    feedback: '色彩搭配很适合小学生',
    revisionNumber: 1,
    attachments: ['https://picsum.photos/id/225/400/300']
  },
  {
    id: 'p10',
    orderId: 'o9',
    orderTitle: '游戏皮肤设计 - 夏日海滩',
    status: 'lineart',
    date: '2026-06-12',
    description: '完成3个角色的夏日皮肤线稿',
    feedback: '设计很有夏日感，期待上色效果',
    revisionNumber: 0,
    attachments: ['https://picsum.photos/id/119/400/600']
  }
];
