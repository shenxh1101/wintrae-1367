import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import { mockStatistics } from '@/data/mockStatistics';
import { formatPrice } from '@/utils/price';
import { formatDate as formatDateFn, getMonthLabel } from '@/utils/date';
import { statusLabels } from '@/types';
import styles from './index.module.scss';

const StatisticsPage: React.FC = () => {
  const maxIncome = useMemo(() => {
    return Math.max(...mockStatistics.monthlyIncome.map(m => m.income));
  }, []);

  const currentMonthIncome = useMemo(() => {
    const currentMonth = mockStatistics.monthlyIncome[mockStatistics.monthlyIncome.length - 1];
    return currentMonth?.income || 0;
  }, []);

  const calculateOverdueDays = (deadline: string): number => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = today.getTime() - deadlineDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <View className={styles.container}>
      <View className={styles.content}>
        <View className={styles.overview}>
          <Text className={styles.overviewTitle}>累计总收入</Text>
          <Text className={styles.overviewAmount}>{formatPrice(mockStatistics.totalIncome)}</Text>
          <View className={styles.overviewGrid}>
            <View className={styles.overviewItem}>
              <Text className={styles.overviewValue}>{mockStatistics.completedOrders}</Text>
              <Text className={styles.overviewLabel}>已完成</Text>
            </View>
            <View className={styles.overviewItem}>
              <Text className={styles.overviewValue}>{mockStatistics.pendingOrders}</Text>
              <Text className={styles.overviewLabel}>进行中</Text>
            </View>
            <View className={styles.overviewItem}>
              <Text className={styles.overviewValue}>{formatPrice(mockStatistics.averagePrice)}</Text>
              <Text className={styles.overviewLabel}>平均单价</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>月收入趋势</Text>
          <View className={styles.chartContainer}>
            <View className={styles.chartBars}>
              {mockStatistics.monthlyIncome.map((item, index) => {
                const height = maxIncome > 0 ? (item.income / maxIncome) * 200 : 0;
                const isCurrent = index === mockStatistics.monthlyIncome.length - 1;
                return (
                  <View key={item.month} className={styles.chartBarWrapper}>
                    <Text className={styles.chartBarValue}>
                      {item.income >= 10000 ? `${(item.income / 10000).toFixed(1)}w` : item.income}
                    </Text>
                    <View
                      className={styles.chartBar}
                      style={{
                        height: `${Math.max(height, 8)}rpx`,
                        opacity: isCurrent ? 1 : 0.6
                      }}
                    />
                    <Text className={styles.chartBarLabel}>{getMonthLabel(item.month)}</Text>
                  </View>
                );
              })}
            </View>
          </View>
          <View className={styles.legendRow}>
            <View className={styles.legendItem}>
              <View className={styles.legendDot} style={{ background: '#7C3AED' }} />
              <Text className={styles.legendText}>月收入</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>数据概览</Text>
          <View className={styles.statsGrid}>
            <View className={styles.statsCard}>
              <Text className={styles.statsCardValue}>{formatPrice(currentMonthIncome)}</Text>
              <Text className={styles.statsCardLabel}>本月收入</Text>
            </View>
            <View className={styles.statsCard}>
              <Text className={styles.statsCardValue}>{mockStatistics.monthlyIncome[mockStatistics.monthlyIncome.length - 1]?.orderCount || 0}</Text>
              <Text className={styles.statsCardLabel}>本月订单</Text>
            </View>
            <View className={styles.statsCard}>
              <Text className={styles.statsCardValue}>{mockStatistics.overdueOrders.length}</Text>
              <Text className={styles.statsCardLabel}>逾期订单</Text>
            </View>
            <View className={styles.statsCard}>
              <Text className={styles.statsCardValue}>
                {mockStatistics.completedOrders + mockStatistics.pendingOrders}
              </Text>
              <Text className={styles.statsCardLabel}>总订单数</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>逾期订单 ({mockStatistics.overdueOrders.length})</Text>
          {mockStatistics.overdueOrders.length > 0 ? (
            <View className={styles.overdueList}>
              {mockStatistics.overdueOrders.map(order => (
                <View key={order.id} className={styles.overdueItem}>
                  <View className={styles.overdueInfo}>
                    <Text className={styles.overdueTitle}>{order.title}</Text>
                    <Text className={styles.overdueMeta}>
                      {order.clientName} · {statusLabels[order.status]} · 截止 {formatDateFn(order.deadline)}
                    </Text>
                  </View>
                  <View className={styles.overdueDays}>
                    <Text className={styles.overdueDaysText}>逾期 {calculateOverdueDays(order.deadline)} 天</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className={styles.emptyOverdue}>
              <Text className={styles.emptyOverdueIcon}>🎉</Text>
              <Text className={styles.emptyOverdueText}>太棒了！没有逾期订单</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default StatisticsPage;
