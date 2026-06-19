import React, { useMemo } from 'react';
import { View, Text, Image, useRouter } from '@tarojs/components';
import { useAppStore } from '@/store';
import { formatPrice } from '@/utils/price';
import { formatDate } from '@/utils/date';
import { statusLabels } from '@/types';
import styles from './index.module.scss';

const ClientDetailPage: React.FC = () => {
  const router = useRouter();
  const clientId = router.params.id;
  const clients = useAppStore((state) => state.clients);
  const orders = useAppStore((state) => state.orders);
  const quotations = useAppStore((state) => state.quotations);

  const client = useMemo(() => clients.find(c => c.id === clientId), [clients, clientId]);
  const clientOrders = useMemo(() => orders.filter(o => o.clientId === clientId), [orders, clientId]);

  if (!client) {
    return (
      <View className={styles.container}>
        <Text>客户不存在</Text>
      </View>
    );
  }

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.profile}>
          <Image className={styles.avatar} src={client.avatar} mode="aspectFill" />
          <View className={styles.profileInfo}>
            <Text className={styles.name}>{client.name}</Text>
            <Text className={styles.company}>{client.company}</Text>
            <Text className={styles.contact}>📧 {client.email} | 📱 {client.phone}</Text>
          </View>
        </View>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{client.totalOrders}</Text>
          <Text className={styles.statLabel}>订单数</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue} style={{ color: '#10B981' }}>{formatPrice(client.totalSpent)}</Text>
          <Text className={styles.statLabel}>总消费</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue} style={{ color: '#F59E0B' }}>{formatDate(client.createdAt, 'M月DD日')}</Text>
          <Text className={styles.statLabel}>添加时间</Text>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>联系信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>邮箱</Text>
            <Text className={styles.infoValue}>{client.email}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>电话</Text>
            <Text className={styles.infoValue}>{client.phone}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>公司</Text>
            <Text className={styles.infoValue}>{client.company}</Text>
          </View>
        </View>

        {client.note && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>客户备注</Text>
            <Text className={styles.note}>{client.note}</Text>
          </View>
        )}

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>历史订单 ({clientOrders.length})</Text>
          {clientOrders.length > 0 ? (
            <View className={styles.orderList}>
              {clientOrders.map(order => {
                const quotation = quotations.find(q => q.id === order.quotationId);
                return (
                  <View key={order.id} className={styles.orderItem}>
                    <View className={styles.orderInfo}>
                      <Text className={styles.orderTitle}>{order.title}</Text>
                      <Text className={styles.orderDate}>
                        {formatDate(order.createdAt)} · {statusLabels[order.status]}
                      </Text>
                    </View>
                    {quotation && (
                      <Text className={styles.orderPrice}>{formatPrice(quotation.totalPrice)}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <Text className={styles.emptyText}>暂无订单记录</Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default ClientDetailPage;
