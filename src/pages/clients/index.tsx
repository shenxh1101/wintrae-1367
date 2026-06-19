import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { Client } from '@/types';
import { useAppStore } from '@/store';
import ClientCard from '@/components/ClientCard';
import EmptyState from '@/components/EmptyState';
import styles from './index.module.scss';

type SortType = 'recent' | 'orders' | 'spent';

const ClientsPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [sortType, setSortType] = useState<SortType>('recent');
  const clients = useAppStore((state) => state.clients);

  const sortOptions: { value: SortType; label: string }[] = [
    { value: 'recent', label: '最近添加' },
    { value: 'orders', label: '订单数量' },
    { value: 'spent', label: '消费金额' }
  ];

  const filteredClients = useMemo(() => {
    let result = [...clients];

    if (searchText) {
      const keyword = searchText.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(keyword) ||
        c.company.toLowerCase().includes(keyword) ||
        c.email.toLowerCase().includes(keyword)
      );
    }

    switch (sortType) {
      case 'orders':
        result.sort((a, b) => b.totalOrders - a.totalOrders);
        break;
      case 'spent':
        result.sort((a, b) => b.totalSpent - a.totalSpent);
        break;
      case 'recent':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [searchText, sortType, clients]);

  const handleCreateClient = () => {
    console.log('[ClientsPage] 点击新建客户');
    Taro.showToast({ title: '功能开发中', icon: 'none' });
  };

  const handleSortChange = (type: SortType) => {
    console.log('[ClientsPage] 切换排序:', type);
    setSortType(type);
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.titleRow}>
          <Text className={styles.title}>客户资料</Text>
          <Text className={styles.clientCount}>共 {clients.length} 位客户</Text>
        </View>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索客户姓名、公司..."
            placeholderClass={styles.searchPlaceholder}
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.sortRow}>
        <Text className={styles.sortLabel}>排序：</Text>
        <View className={styles.sortOptions}>
          {sortOptions.map((option) => (
            <View
              key={option.value}
              className={classnames(styles.sortOption, {
                [styles.sortOptionActive]: sortType === option.value
              })}
              onClick={() => handleSortChange(option.value)}
            >
              <Text>{option.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {filteredClients.length > 0 ? (
        <View className={styles.clientList}>
          {filteredClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </View>
      ) : (
        <View className={styles.emptyContainer}>
          <EmptyState
            title="暂无客户"
            description="点击右下角按钮添加新客户"
          />
        </View>
      )}

      <View className={styles.fab} onClick={handleCreateClient}>
        <Text className={styles.fabIcon}>+</Text>
      </View>
    </View>
  );
};

export default ClientsPage;
