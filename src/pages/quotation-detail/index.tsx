import React, { useMemo } from 'react';
import { View, Text, useRouter } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { mockQuotations } from '@/data/mockQuotations';
import { formatPrice } from '@/utils/price';
import { formatDate } from '@/utils/date';
import styles from './index.module.scss';

const statusConfig: Record<string, { label: string; class: string }> = {
  draft: { label: '草稿', class: 'statusDraft' },
  sent: { label: '已发送', class: 'statusSent' },
  accepted: { label: '已接受', class: 'statusAccepted' },
  rejected: { label: '已拒绝', class: 'statusRejected' }
};

const QuotationDetailPage: React.FC = () => {
  const router = useRouter();
  const quotationId = router.params.id;

  const quotation = useMemo(() => mockQuotations.find(q => q.id === quotationId), [quotationId]);

  if (!quotation) {
    return (
      <View className={styles.container}>
        <Text>报价单不存在</Text>
      </View>
    );
  }

  const status = statusConfig[quotation.status];

  const handleSend = () => {
    console.log('[QuotationDetail] 发送报价单');
    Taro.showToast({ title: '报价单已发送', icon: 'success' });
  };

  const handleShare = () => {
    console.log('[QuotationDetail] 分享报价单');
    Taro.showToast({ title: '功能开发中', icon: 'none' });
  };

  const handleExport = () => {
    console.log('[QuotationDetail] 导出报价单');
    Taro.showToast({ title: '功能开发中', icon: 'none' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.title}>{quotation.orderTitle}</Text>
          <Text className={styles.subtitle}>客户：{quotation.clientName}</Text>
          <Text className={styles.price}>{formatPrice(quotation.totalPrice)}</Text>
          <View className={classnames(styles.statusTag, styles[status.class])}>
            <Text>{status.label}</Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>基本信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>创建时间</Text>
            <Text className={styles.infoValue}>{formatDate(quotation.createdAt)}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>有效期至</Text>
            <Text className={styles.infoValue}>{formatDate(quotation.validUntil)}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>报价单号</Text>
            <Text className={styles.infoValue}>{quotation.id.toUpperCase()}</Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>费用明细</Text>
          {quotation.items.map((item, index) => (
            <View key={index} className={styles.breakdownItem}>
              <View className={styles.breakdownInfo}>
                <Text className={styles.breakdownName}>{item.name}</Text>
                <Text className={styles.breakdownDesc}>{item.description}</Text>
              </View>
              <Text className={styles.breakdownPrice}>{formatPrice(item.price)}</Text>
            </View>
          ))}
          <View className={styles.totalRow}>
            <Text className={styles.totalLabel}>总计</Text>
            <Text className={styles.totalPrice}>{formatPrice(quotation.totalPrice)}</Text>
          </View>
          <Text className={styles.validity}>报价有效期至 {formatDate(quotation.validUntil)}</Text>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.btnSecondary} onClick={handleExport}>
          <Text>导出</Text>
        </View>
        <View className={styles.btnSecondary} onClick={handleShare}>
          <Text>分享</Text>
        </View>
        {quotation.status === 'draft' && (
          <View className={styles.btnPrimary} onClick={handleSend}>
            <Text>发送给客户</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default QuotationDetailPage;
