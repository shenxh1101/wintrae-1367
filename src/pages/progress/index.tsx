import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import { statusLabels, type OrderStatus } from '@/types';
import { mockProgress } from '@/data/mockProgress';
import ProgressCard from '@/components/ProgressCard';
import EmptyState from '@/components/EmptyState';
import { formatDate } from '@/utils/date';
import styles from './index.module.scss';

const ProgressPage: React.FC = () => {
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  const statusOptions: (OrderStatus | 'all')[] = ['all', 'consultation', 'draft', 'lineart', 'coloring', 'revision', 'delivered'];

  const today = formatDate(new Date().toISOString(), 'M月D日');

  const stats = useMemo(() => {
    const thisWeek = mockProgress.filter(p => {
      const date = new Date(p.date);
      const now = new Date();
      const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    });
    const totalRevisions = mockProgress.filter(p => p.revisionNumber > 0).length;
    return {
      total: mockProgress.length,
      thisWeek: thisWeek.length,
      revisions: totalRevisions
    };
  }, []);

  const filteredProgress = useMemo(() => {
    let records = [...mockProgress];

    if (filter !== 'all') {
      records = records.filter(p => p.status === filter);
    }

    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filter]);

  const handleFilterChange = (type: OrderStatus | 'all') => {
    console.log('[ProgressPage] 切换筛选:', type);
    setFilter(type);
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.titleRow}>
          <Text className={styles.title}>进度记录</Text>
          <Text className={styles.todayText}>{today}</Text>
        </View>
        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{stats.total}</Text>
            <Text className={styles.statLabel}>总记录</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue} style={{ color: '#7C3AED' }}>{stats.thisWeek}</Text>
            <Text className={styles.statLabel}>本周新增</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue} style={{ color: '#F59E0B' }}>{stats.revisions}</Text>
            <Text className={styles.statLabel}>修改记录</Text>
          </View>
        </View>
      </View>

      <View className={styles.filterContainer}>
        <ScrollView className={styles.filterScroll} scrollX>
          {statusOptions.map((status) => (
            <View
              key={status}
              className={classnames(styles.filterTag, {
                [styles.filterTagActive]: filter === status
              })}
              onClick={() => handleFilterChange(status)}
            >
              <Text>{status === 'all' ? '全部' : statusLabels[status]}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {filteredProgress.length > 0 ? (
        <View className={styles.progressList}>
          {filteredProgress.map((progress, index) => (
            <ProgressCard
              key={progress.id}
              progress={progress}
              isLast={index === filteredProgress.length - 1}
            />
          ))}
        </View>
      ) : (
        <View className={styles.emptyContainer}>
          <EmptyState
            title="暂无进度记录"
            description="在订单详情中添加进度记录"
          />
        </View>
      )}
    </View>
  );
};

export default ProgressPage;
