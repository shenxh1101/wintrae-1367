export type OrderStatus = 'consultation' | 'draft' | 'lineart' | 'coloring' | 'revision' | 'delivered';

export type ComplexityLevel = 'simple' | 'medium' | 'complex';

export type AuthorizationScope = 'personal' | 'commercial' | 'exclusive';

export interface Client {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  company: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  note: string;
}

export interface Order {
  id: string;
  title: string;
  description: string;
  clientId: string;
  clientName: string;
  status: OrderStatus;
  size: string;
  usage: string;
  authorizationScope: AuthorizationScope;
  deadline: string;
  createdAt: string;
  complexity: ComplexityLevel;
  isUrgent: boolean;
  revisionCount: number;
  maxRevisions: number;
  quotationId?: string;
}

export interface QuotationItem {
  name: string;
  price: number;
  description: string;
}

export interface Quotation {
  id: string;
  orderId: string;
  orderTitle: string;
  clientId: string;
  clientName: string;
  basePrice: number;
  complexityMultiplier: number;
  urgentSurcharge: number;
  commercialSurcharge: number;
  totalPrice: number;
  items: QuotationItem[];
  createdAt: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  validUntil: string;
}

export interface ProgressRecord {
  id: string;
  orderId: string;
  orderTitle: string;
  status: OrderStatus;
  date: string;
  description: string;
  feedback: string;
  revisionNumber: number;
  attachments: string[];
}

export interface DeliveryFile {
  id: string;
  name: string;
  type: 'final' | 'preview' | 'source';
  url: string;
  size: string;
  uploadedAt: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  orderTitle: string;
  clientId: string;
  files: DeliveryFile[];
  deliveredAt: string;
  paymentConfirmed: boolean;
  paymentAmount: number;
  note: string;
}

export interface MonthlyIncome {
  month: string;
  income: number;
  orderCount: number;
}

export interface Statistics {
  totalIncome: number;
  monthlyIncome: MonthlyIncome[];
  overdueOrders: Order[];
  completedOrders: number;
  pendingOrders: number;
  averagePrice: number;
}

export const statusLabels: Record<OrderStatus, string> = {
  consultation: '咨询',
  draft: '草稿',
  lineart: '线稿',
  coloring: '上色',
  revision: '修改',
  delivered: '已交付'
};

export const statusColors: Record<OrderStatus, string> = {
  consultation: '#6366F1',
  draft: '#9CA3AF',
  lineart: '#F59E0B',
  coloring: '#7C3AED',
  revision: '#EF4444',
  delivered: '#10B981'
};

export const complexityLabels: Record<ComplexityLevel, string> = {
  simple: '简单',
  medium: '中等',
  complex: '复杂'
};

export const authorizationLabels: Record<AuthorizationScope, string> = {
  personal: '个人使用',
  commercial: '商业授权',
  exclusive: '独家授权'
};
