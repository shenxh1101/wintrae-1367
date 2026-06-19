import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import { useAppStore } from '@/store';
import { formatPrice } from '@/utils/price';
import { formatDate as formatDateFn, getMonthLabel } from '@/utils/date';
import { statusLabels } from '@/types';
import styles from './index.module.scss';

const StatisticsPage: React.FC = () => {
  const statistics = useAppStore((state) => state.getStatistics());

  const maxIncome = useMemo(() => {
    return Math.max(...statistics.monthlyIncome.map(m => m.income));
  }, [statistics]);

  const currentMonthIncome = useMemo(() => {
    const currentMonth = statistics.monthlyIncome[statistics.monthlyIncome.length - 1];
    return currentMonth?.income || 0;
  }, [statistics]);

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
          <Text className={styles.overviewAmount}>{formatPrice(statistics.totalIncome)}</Text>
          <View className={styles.overviewGrid}>
            <View className={styles.overviewItem}>
              <Text className={styles.overviewValue}>{statistics.completedOrders}</Text>
              <Text className={styles.overviewLabel}>已完成</Text>
            </View>
            <View className={styles.overviewItem}>
              <Text className={styles.overviewValue}>{statistics.pendingOrders}</Text>
              <Text className={styles.overviewLabel}>进行中</Text>
            </View>
            <View className={styles.overviewItem}>
              <Text className={styles.overviewValue}>{formatPrice(statistics.averagePrice)}</Text>
              <Text className={styles.overviewLabel}>平均单价</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>月收入趋势</Text>
          <View className={styles.chartContainer}>
            <View className={styles.chartBars}>
              {statistics.monthlyIncome.map((item, index) => {
                const height = maxIncome > 0 ? (item.income / maxIncome) * 200 : 0;
                const isCurrent = index === statistics.monthlyIncome.length - 1;
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
              <Text className={styles.statsCardValue}>{statistics.monthlyIncome[statistics.monthlyIncome.length - 1]?.orderCount || 0}</Text>
              <Text className={styles.statsCardLabel}>本月订单</Text>
            </View>
            <View className={styles.statsCard}>
              <Text className={styles.statsCardValue}>{statistics.overdueOrders.length}</Text>
              <Text className={styles.statsCardLabel}>逾期订单</Text>
            </View>
            <View className={styles.statsCard}>
              <Text className={styles.statsCardValue}>
                {statistics.completedOrders + statistics.pendingOrders}
              </Text>
              <Text className={styles.statsCardLabel}>总订单数</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>逾期订单 ({statistics.overdueOrders.length})</Text>
          {statistics.overdueOrders.length > 0 ? (
            <View className={styles.overdueList}>
              {statistics.overdueOrders.map(order => (
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
