import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { Quotation } from '@/types';
import { mockQuotations } from '@/data/mockQuotations';
import QuotationCard from '@/components/QuotationCard';
import EmptyState from '@/components/EmptyState';
import { formatPrice } from '@/utils/price';
import styles from './index.module.scss';

type FilterType = 'all' | 'draft' | 'sent' | 'accepted' | 'rejected';

const QuotationsPage: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all');

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'draft', label: '草稿' },
    { value: 'sent', label: '已发送' },
    { value: 'accepted', label: '已接受' },
    { value: 'rejected', label: '已拒绝' }
  ];

  const stats = useMemo(() => {
    const accepted = mockQuotations.filter(q => q.status === 'accepted');
    const totalIncome = accepted.reduce((sum, q) => sum + q.totalPrice, 0);
    return {
      total: mockQuotations.length,
      accepted: accepted.length,
      totalIncome
    };
  }, []);

  const filteredQuotations = useMemo(() => {
    let quotations = [...mockQuotations];

    if (filter !== 'all') {
      quotations = quotations.filter(q => q.status === filter);
    }

    return quotations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filter]);

  const handleCreateQuotation = () => {
    console.log('[QuotationsPage] 点击新建报价单');
    Taro.showToast({ title: '功能开发中', icon: 'none' });
  };

  const handleFilterChange = (type: FilterType) => {
    console.log('[QuotationsPage] 切换筛选:', type);
    setFilter(type);
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.titleRow}>
          <Text className={styles.title}>报价单</Text>
          <Text className={styles.quotationCount}>共 {mockQuotations.length} 份</Text>
        </View>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.total}</Text>
            <Text className={styles.statLabel}>总报价单</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue} style={{ color: '#10B981' }}>{stats.accepted}</Text>
            <Text className={styles.statLabel}>已接受</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{formatPrice(stats.totalIncome)}</Text>
            <Text className={styles.statLabel}>已确认收入</Text>
          </View>
        </View>
      </View>

      <View className={styles.filterContainer}>
        <ScrollView className={styles.filterScroll} scrollX>
          {filterOptions.map((option) => (
            <View
              key={option.value}
              className={classnames(styles.filterTag, {
                [styles.filterTagActive]: filter === option.value
              })}
              onClick={() => handleFilterChange(option.value)}
            >
              <Text>{option.label}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {filteredQuotations.length > 0 ? (
        <View className={styles.quotationList}>
          {filteredQuotations.map((quotation) => (
            <QuotationCard key={quotation.id} quotation={quotation} />
          ))}
        </View>
      ) : (
        <View className={styles.emptyContainer}>
          <EmptyState
            title="暂无报价单"
            description="点击右下角按钮创建新报价单"
          />
        </View>
      )}

      <View className={styles.fab} onClick={handleCreateQuotation}>
        <Text className={styles.fabIcon}>+</Text>
      </View>
    </View>
  );
};

export default QuotationsPage;
