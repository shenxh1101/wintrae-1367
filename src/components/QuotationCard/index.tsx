import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { Quotation } from '@/types';
import { formatPrice } from '@/utils/price';
import { formatDate } from '@/utils/date';
import styles from './index.module.scss';

interface QuotationCardProps {
  quotation: Quotation;
}

const statusConfig = {
  draft: { label: '草稿', color: '#9CA3AF', bg: '#F3F4F6' },
  sent: { label: '已发送', color: '#6366F1', bg: '#EEF2FF' },
  accepted: { label: '已接受', color: '#10B981', bg: '#ECFDF5' },
  rejected: { label: '已拒绝', color: '#EF4444', bg: '#FEF2F2' }
};

const QuotationCard: React.FC<QuotationCardProps> = ({ quotation }) => {
  const config = statusConfig[quotation.status];

  const handleClick = () => {
    console.log('[QuotationCard] 点击报价单:', quotation.id);
    Taro.navigateTo({
      url: `/pages/quotation-detail/index?id=${quotation.id}`
    });
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <View className={classnames(styles.statusTag)} style={{ backgroundColor: config.bg, color: config.color }}>
          <Text className={styles.statusText}>{config.label}</Text>
        </View>
        <Text className={styles.date}>{formatDate(quotation.createdAt)}</Text>
      </View>

      <Text className={styles.title}>{quotation.orderTitle}</Text>
      <Text className={styles.client}>客户：{quotation.clientName}</Text>

      <View className={styles.priceRow}>
        <View className={styles.priceInfo}>
          <Text className={styles.priceLabel}>报价金额</Text>
          <Text className={styles.price}>{formatPrice(quotation.totalPrice)}</Text>
        </View>
        <View className={styles.priceBreakdown}>
          <Text className={styles.breakdownItem}>
            基础 {formatPrice(quotation.basePrice)} × {quotation.complexityMultiplier}
          </Text>
          {quotation.urgentSurcharge > 0 && (
            <Text className={styles.breakdownItem}>+ 加急 {formatPrice(Math.round(quotation.urgentSurcharge))}</Text>
          )}
          {quotation.commercialSurcharge > 0 && (
            <Text className={styles.breakdownItem}>+ 授权 {formatPrice(Math.round(quotation.commercialSurcharge))}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default QuotationCard;
