import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Taro from '@tarojs/taro';
import type { Order, Client, Quotation, ProgressRecord, DeliveryFile, Statistics } from '@/types';
import { mockOrders } from '@/data/mockOrders';
import { mockClients } from '@/data/mockClients';
import { mockQuotations } from '@/data/mockQuotations';
import { mockProgress } from '@/data/mockProgress';
import { calculateTotalPrice } from '@/utils/price';

export interface DeliveryRecord {
  orderId: string;
  files: DeliveryFile[];
  paymentConfirmed: boolean;
  paymentAmount: number;
  deliveredAt: string;
}

interface AppState {
  orders: Order[];
  clients: Client[];
  quotations: Quotation[];
  progressRecords: ProgressRecord[];
  deliveries: Record<string, DeliveryRecord>;

  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'revisionCount'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getOrder: (orderId: string) => Order | undefined;

  addProgressRecord: (record: Omit<ProgressRecord, 'id'>) => void;
  getProgressByOrderId: (orderId: string) => ProgressRecord[];

  getDeliveryByOrderId: (orderId: string) => DeliveryRecord | undefined;
  addDeliveryFile: (orderId: string, file: DeliveryFile) => void;
  confirmPayment: (orderId: string, amount: number) => void;

  getStatistics: () => Statistics;
}

const getToday = () => new Date().toISOString().split('T')[0];

const initialDeliveries: Record<string, DeliveryRecord> = {
  'o5': {
    orderId: 'o5',
    files: [
      { id: 'f1', name: '最终稿_夏日促销.png', type: 'final', url: 'https://picsum.photos/id/1/800/600', size: '2.1MB', uploadedAt: '2026-06-05' },
      { id: 'f2', name: '预览图_夏日促销.jpg', type: 'preview', url: 'https://picsum.photos/id/2/400/300', size: '500KB', uploadedAt: '2026-06-05' },
      { id: 'f3', name: '源文件_夏日促销.psd', type: 'source', url: '', size: '38MB', uploadedAt: '2026-06-05' }
    ],
    paymentConfirmed: true,
    paymentAmount: 3510,
    deliveredAt: '2026-06-05'
  },
  'o6': {
    orderId: 'o6',
    files: [
      { id: 'f4', name: '最终稿_个人头像.png', type: 'final', url: 'https://picsum.photos/id/3/500/500', size: '800KB', uploadedAt: '2026-05-28' },
      { id: 'f5', name: '预览图_个人头像.jpg', type: 'preview', url: 'https://picsum.photos/id/4/200/200', size: '120KB', uploadedAt: '2026-05-28' }
    ],
    paymentConfirmed: true,
    paymentAmount: 500,
    deliveredAt: '2026-05-28'
  },
  'o11': {
    orderId: 'o11',
    files: [
      { id: 'f6', name: '最终稿_明信片套装.zip', type: 'final', url: 'https://picsum.photos/id/5/800/1200', size: '12MB', uploadedAt: '2026-05-15' },
      { id: 'f7', name: '预览图_春夏秋冬.jpg', type: 'preview', url: 'https://picsum.photos/id/6/400/600', size: '600KB', uploadedAt: '2026-05-15' }
    ],
    paymentConfirmed: true,
    paymentAmount: 2700,
    deliveredAt: '2026-05-15'
  }
};

const taroStorage = {
  getItem: (name: string) => {
    try {
      return Promise.resolve(Taro.getStorageSync(name));
    } catch (e) {
      return Promise.resolve(null);
    }
  },
  setItem: (name: string, value: string) => {
    try {
      Taro.setStorageSync(name, value);
      return Promise.resolve();
    } catch (e) {
      return Promise.resolve();
    }
  },
  removeItem: (name: string) => {
    try {
      Taro.removeStorageSync(name);
      return Promise.resolve();
    } catch (e) {
      return Promise.resolve();
    }
  }
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      orders: [...mockOrders],
      clients: [...mockClients],
      quotations: [...mockQuotations],
      progressRecords: [...mockProgress],
      deliveries: { ...initialDeliveries },

      addOrder: (orderData) => {
        const today = getToday();
        const newId = `o${Date.now()}`;
        const newQuotationId = `q${Date.now()}`;
        const priceInfo = calculateTotalPrice(orderData.complexity, orderData.isUrgent, orderData.authorizationScope);

        const newOrder: Order = {
          ...orderData,
          id: newId,
          createdAt: today,
          revisionCount: 0,
          quotationId: newQuotationId
        };

        const newQuotation: Quotation = {
          id: newQuotationId,
          orderId: newId,
          orderTitle: orderData.title,
          clientId: orderData.clientId,
          clientName: orderData.clientName,
          ...priceInfo,
          items: [
            { name: '基础费用', price: priceInfo.basePrice, description: '插画设计基础费用' },
            { name: '复杂度加成', price: Math.round(priceInfo.basePrice * (priceInfo.complexityMultiplier - 1)), description: `复杂度系数 x${priceInfo.complexityMultiplier}` },
            ...(priceInfo.urgentSurcharge > 0 ? [{ name: '加急费用', price: Math.round(priceInfo.urgentSurcharge), description: '30%加急费' }] : []),
            ...(priceInfo.commercialSurcharge > 0 ? [{ name: '授权费用', price: Math.round(priceInfo.commercialSurcharge), description: orderData.authorizationScope === 'commercial' ? '商业授权 50%' : '独家授权 150%' }] : [])
          ],
          createdAt: today,
          status: 'draft',
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };

        const newProgress: ProgressRecord = {
          id: `p${Date.now()}`,
          orderId: newId,
          orderTitle: orderData.title,
          status: orderData.status,
          date: today,
          description: '订单创建',
          feedback: '',
          revisionNumber: 0,
          attachments: []
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
          quotations: [newQuotation, ...state.quotations],
          progressRecords: [newProgress, ...state.progressRecords]
        }));
      },

      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status } : o
          )
        }));
      },

      getOrder: (orderId) => {
        return get().orders.find((o) => o.id === orderId);
      },

      addProgressRecord: (recordData) => {
        const newRecord: ProgressRecord = {
          ...recordData,
          id: `p${Date.now()}`
        };

        set((state) => ({
          progressRecords: [newRecord, ...state.progressRecords]
        }));
      },

      getProgressByOrderId: (orderId) => {
        return get().progressRecords
          .filter((p) => p.orderId === orderId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getDeliveryByOrderId: (orderId) => {
        return get().deliveries[orderId];
      },

      addDeliveryFile: (orderId, file) => {
        const today = getToday();
        set((state) => {
          const existing = state.deliveries[orderId];
          const quotation = state.quotations.find((q) => q.orderId === orderId);

          if (existing) {
            return {
              deliveries: {
                ...state.deliveries,
                [orderId]: {
                  ...existing,
                  files: [...existing.files, file]
                }
              }
            };
          }

          return {
            deliveries: {
              ...state.deliveries,
              [orderId]: {
                orderId,
                files: [file],
                paymentConfirmed: false,
                paymentAmount: quotation?.totalPrice || 0,
                deliveredAt: today
              }
            }
          };
        });
      },

      confirmPayment: (orderId, amount) => {
        const today = getToday();
        set((state) => {
          const existing = state.deliveries[orderId];

          if (existing) {
            return {
              deliveries: {
                ...state.deliveries,
                [orderId]: {
                  ...existing,
                  paymentConfirmed: true,
                  paymentAmount: amount
                }
              }
            };
          }

          return {
            deliveries: {
              ...state.deliveries,
              [orderId]: {
                orderId,
                files: [],
                paymentConfirmed: true,
                paymentAmount: amount,
                deliveredAt: today
              }
            }
          };
        });
      },

      getStatistics: () => {
        const state = get();
        const deliveredOrders = state.orders.filter((o) => o.status === 'delivered');
        const pendingOrders = state.orders.filter((o) => o.status !== 'delivered');

        const confirmedDeliveries = Object.values(state.deliveries).filter((d) => d.paymentConfirmed);
        const totalIncome = confirmedDeliveries.reduce((sum, d) => sum + d.paymentAmount, 0);

        const monthlyMap = new Map<string, { income: number; orderCount: number }>();
        confirmedDeliveries.forEach((d) => {
          const month = d.deliveredAt.substring(0, 7);
          const current = monthlyMap.get(month) || { income: 0, orderCount: 0 };
          monthlyMap.set(month, {
            income: current.income + d.paymentAmount,
            orderCount: current.orderCount + 1
          });
        });

        const monthlyIncome = Array.from(monthlyMap.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([month, data]) => ({
            month,
            income: data.income,
            orderCount: data.orderCount
          }));

        if (monthlyIncome.length === 0) {
          const now = new Date();
          for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlyIncome.push({ month: key, income: 0, orderCount: 0 });
          }
        }

        const overdueOrders = state.orders.filter((o) => {
          const deadline = new Date(o.deadline);
          const now = new Date();
          return now > deadline && o.status !== 'delivered';
        });

        const averagePrice = confirmedDeliveries.length > 0
          ? Math.round(totalIncome / confirmedDeliveries.length)
          : (state.quotations.filter((q) => q.status === 'accepted').reduce((sum, q) => sum + q.totalPrice, 0) / Math.max(state.quotations.filter((q) => q.status === 'accepted').length, 1));

        return {
          totalIncome,
          completedOrders: deliveredOrders.length,
          pendingOrders: pendingOrders.length,
          averagePrice: Math.round(averagePrice),
          monthlyIncome,
          overdueOrders
        };
      }
    }),
    {
      name: 'illustrator-app-storage',
      storage: createJSONStorage(() => taroStorage),
      partialize: (state) => ({
        orders: state.orders,
        clients: state.clients,
        quotations: state.quotations,
        progressRecords: state.progressRecords,
        deliveries: state.deliveries
      })
    }
  )
);
