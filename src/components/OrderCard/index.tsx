import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { complexityLabels, authorizationLabels } from '@/types';
import type { Order } from '@/types';
import { getDeadlineStatus, isOverdue } from '@/utils/date';
import { formatPrice } from '@/utils/price';
import StatusTag from '@/components/StatusTag';
import { mockQuotations } from '@/data/mockQuotations';
import styles from './index.module.scss';

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const deadlineInfo = getDeadlineStatus(order.deadline);
  const quotation = mockQuotations.find(q => q.id === order.quotationId);
  const overdue = isOverdue(order.deadline);

  const handleClick = () => {
    console.log('[OrderCard] 点击订单:', order.id);
    Taro.navigateTo({
      url: `/pages/order-detail/index?id=${order.id}`
    });
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <StatusTag status={order.status} size="small" />
        <View className={classnames(styles.deadline, {
          [styles.overdue]: overdue,
          [styles.urgent]: deadlineInfo.status === 'urgent' && !overdue
        })}>
          <Text className={styles.deadlineText}>{deadlineInfo.text}</Text>
        </View>
      </View>

      <Text className={styles.title}>{order.title}</Text>
      <Text className={styles.client}>客户：{order.clientName}</Text>

      <View className={styles.tags}>
        <View className={styles.tag}>
          <Text className={styles.tagText}>{order.size}</Text>
        </View>
        <View className={styles.tag}>
          <Text className={styles.tagText}>{complexityLabels[order.complexity]}</Text>
        </View>
        <View className={styles.tag}>
          <Text className={styles.tagText}>{authorizationLabels[order.authorizationScope]}</Text>
        </View>
        {order.isUrgent && (
          <View className={classnames(styles.tag, styles.urgentTag)}>
            <Text className={styles.tagText}>加急</Text>
          </View>
        )}
      </View>

      <View className={styles.footer}>
        <View className={styles.revision}>
          <Text className={styles.revisionText}>修改 {order.revisionCount}/{order.maxRevisions}</Text>
        </View>
        {quotation && (
          <Text className={styles.price}>{formatPrice(quotation.totalPrice)}</Text>
        )}
      </View>
    </View>
  );
};

export default OrderCard;
