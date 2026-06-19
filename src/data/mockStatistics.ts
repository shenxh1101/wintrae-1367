import type { Statistics } from '@/types';
import { mockOrders } from './mockOrders';
import { mockQuotations } from './mockQuotations';

const deliveredOrders = mockOrders.filter(o => o.status === 'delivered');
const pendingOrders = mockOrders.filter(o => o.status !== 'delivered');
const acceptedQuotations = mockQuotations.filter(q => q.status === 'accepted');

export const mockStatistics: Statistics = {
  totalIncome: acceptedQuotations.reduce((sum, q) => sum + q.totalPrice, 0),
  monthlyIncome: [
    { month: '2026-01', income: 12500, orderCount: 4 },
    { month: '2026-02', income: 8800, orderCount: 3 },
    { month: '2026-03', income: 15200, orderCount: 5 },
    { month: '2026-04', income: 18600, orderCount: 6 },
    { month: '2026-05', income: 22400, orderCount: 7 },
    { month: '2026-06', income: 28500, orderCount: 8 }
  ],
  overdueOrders: mockOrders.filter(o => {
    const deadline = new Date(o.deadline);
    const today = new Date();
    return today > deadline && o.status !== 'delivered';
  }),
  completedOrders: deliveredOrders.length,
  pendingOrders: pendingOrders.length,
  averagePrice: acceptedQuotations.length > 0
    ? Math.round(acceptedQuotations.reduce((sum, q) => sum + q.totalPrice, 0) / acceptedQuotations.length)
    : 0
};
