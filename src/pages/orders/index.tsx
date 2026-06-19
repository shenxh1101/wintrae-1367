import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { statusLabels, type OrderStatus } from '@/types';
import type { Order } from '@/types';
import { mockOrders } from '@/data/mockOrders';
import OrderCard from '@/components/OrderCard';
import EmptyState from '@/components/EmptyState';
import { formatDate } from '@/utils/date';
import styles from './index.module.scss';

const OrdersPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');

  const today = formatDate(new Date().toISOString(), 'YYYY年M月D日');

  const statusOptions: (OrderStatus | 'all')[] = ['all', 'consultation', 'draft', 'lineart', 'coloring', 'revision', 'delivered'];

  const stats = useMemo(() => {
    return {
      total: mockOrders.length,
      inProgress: mockOrders.filter(o => ['draft', 'lineart', 'coloring', 'revision'].includes(o.status)).length,
      consultation: mockOrders.filter(o => o.status === 'consultation').length,
      delivered: mockOrders.filter(o => o.status === 'delivered').length,
      overdue: mockOrders.filter(o => {
        const deadline = new Date(o.deadline);
        const now = new Date();
        return now > deadline && o.status !== 'delivered';
      }).length
    };
  }, []);

  const filteredOrders = useMemo(() => {
    let orders = [...mockOrders];

    if (activeFilter !== 'all') {
      orders = orders.filter(o => o.status === activeFilter);
    }

    if (searchText) {
      const keyword = searchText.toLowerCase();
      orders = orders.filter(o =>
        o.title.toLowerCase().includes(keyword) ||
        o.clientName.toLowerCase().includes(keyword) ||
        o.description.toLowerCase().includes(keyword)
      );
    }

    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [searchText, activeFilter]);

  const handleCreateOrder = () => {
    console.log('[OrdersPage] 点击新建订单');
    Taro.navigateTo({
      url: '/pages/order-create/index'
    });
  };

  const handleFilterChange = (filter: OrderStatus | 'all') => {
    console.log('[OrdersPage] 切换筛选:', filter);
    setActiveFilter(filter);
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.titleRow}>
          <Text className={styles.title}>订单看板</Text>
          <Text className={styles.dateText}>{today}</Text>
        </View>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索订单名称、客户..."
            placeholderClass={styles.searchPlaceholder}
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.statsContainer}>
        <ScrollView className={styles.statsScroll} scrollX>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{stats.total}</Text>
            <Text className={styles.statLabel}>全部订单</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue} style={{ color: '#7C3AED' }}>{stats.inProgress}</Text>
            <Text className={styles.statLabel}>进行中</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue} style={{ color: '#6366F1' }}>{stats.consultation}</Text>
            <Text className={styles.statLabel}>咨询中</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue} style={{ color: '#10B981' }}>{stats.delivered}</Text>
            <Text className={styles.statLabel}>已交付</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue} style={{ color: '#EF4444' }}>{stats.overdue}</Text>
            <Text className={styles.statLabel}>已逾期</Text>
          </View>
        </ScrollView>
      </View>

      <View className={styles.filterContainer}>
        <ScrollView className={styles.filterScroll} scrollX>
          {statusOptions.map((status) => (
            <View
              key={status}
              className={classnames(styles.filterTag, {
                [styles.filterTagActive]: activeFilter === status
              })}
              onClick={() => handleFilterChange(status)}
            >
              <Text>{status === 'all' ? '全部' : statusLabels[status]}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {filteredOrders.length > 0 ? (
        <View className={styles.orderList}>
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </View>
      ) : (
        <View className={styles.emptyContainer}>
          <EmptyState
            title="暂无订单"
            description="点击右下角按钮创建新订单"
          />
        </View>
      )}

      <View className={styles.fab} onClick={handleCreateOrder}>
        <Text className={styles.fabIcon}>+</Text>
      </View>
    </View>
  );
};

export default OrdersPage;
