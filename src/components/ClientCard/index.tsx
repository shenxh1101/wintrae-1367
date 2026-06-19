import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import type { Client } from '@/types';
import { formatPrice } from '@/utils/price';
import { formatDate } from '@/utils/date';
import styles from './index.module.scss';

interface ClientCardProps {
  client: Client;
}

const ClientCard: React.FC<ClientCardProps> = ({ client }) => {
  const handleClick = () => {
    console.log('[ClientCard] 点击客户:', client.id);
    Taro.navigateTo({
      url: `/pages/client-detail/index?id=${client.id}`
    });
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <Image className={styles.avatar} src={client.avatar} mode="aspectFill" />
      <View className={styles.info}>
        <View className={styles.header}>
          <Text className={styles.name}>{client.name}</Text>
          <Text className={styles.company}>{client.company}</Text>
        </View>
        <View className={styles.stats}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{client.totalOrders}</Text>
            <Text className={styles.statLabel}>订单</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{formatPrice(client.totalSpent)}</Text>
            <Text className={styles.statLabel}>总消费</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{formatDate(client.createdAt, 'M月DD日')}</Text>
            <Text className={styles.statLabel}>添加</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ClientCard;
