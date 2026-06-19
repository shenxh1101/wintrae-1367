import React, { useState, useMemo } from 'react';
import { View, Text, Image, useRouter } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { mockOrders } from '@/data/mockOrders';
import { mockQuotations } from '@/data/mockQuotations';
import { formatPrice } from '@/utils/price';
import { formatDate } from '@/utils/date';
import type { DeliveryFile } from '@/types';
import styles from './index.module.scss';

const mockFiles: DeliveryFile[] = [
  { id: 'f1', name: '最终稿_剑士艾伦.png', type: 'final', url: 'https://picsum.photos/id/1/800/1200', size: '2.5MB', uploadedAt: '2026-06-18' },
  { id: 'f2', name: '预览图_剑士艾伦.jpg', type: 'preview', url: 'https://picsum.photos/id/2/400/600', size: '800KB', uploadedAt: '2026-06-18' },
  { id: 'f3', name: '源文件_剑士艾伦.psd', type: 'source', url: '', size: '45MB', uploadedAt: '2026-06-18' },
  { id: 'f4', name: '表情差分_剑士艾伦.png', type: 'final', url: 'https://picsum.photos/id/3/800/1200', size: '1.8MB', uploadedAt: '2026-06-18' }
];

const typeLabels: Record<string, string> = {
  final: '最终',
  preview: '预览',
  source: '源文件'
};

const typeIcons: Record<string, string> = {
  final: '🖼️',
  preview: '👁️',
  source: '📁'
};

const DeliveryPage: React.FC = () => {
  const router = useRouter();
  const orderId = router.params.orderId || 'o1';

  const order = useMemo(() => mockOrders.find(o => o.id === orderId), [orderId]);
  const quotation = useMemo(() => mockQuotations.find(q => q.orderId === orderId), [orderId]);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [files] = useState<DeliveryFile[]>(mockFiles);

  if (!order) {
    return (
      <View className={styles.container}>
        <Text>订单不存在</Text>
      </View>
    );
  }

  const handleUpload = () => {
    console.log('[Delivery] 上传文件');
    Taro.showToast({ title: '功能开发中', icon: 'none' });
  };

  const handleDownload = (file: DeliveryFile) => {
    console.log('[Delivery] 下载文件:', file.name);
    Taro.showToast({ title: `开始下载 ${file.name}`, icon: 'none' });
  };

  const handleConfirmPayment = () => {
    console.log('[Delivery] 确认收款');
    Taro.showModal({
      title: '确认收款',
      content: `确认已收到 ${formatPrice(quotation?.totalPrice || 0)} 款项？`,
      success: (res) => {
        if (res.confirm) {
          setPaymentConfirmed(true);
          Taro.showToast({ title: '收款已确认', icon: 'success' });
        }
      }
    });
  };

  const handleDeliver = () => {
    console.log('[Delivery] 发送交付');
    Taro.showToast({ title: '交付文件已发送给客户', icon: 'success' });
  };

  const previewImages = files.filter(f => f.type !== 'source');

  return (
    <View className={styles.container}>
      <View className={styles.content}>
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>订单信息</Text>
          <View className={styles.orderInfo}>
            <View>
              <Text className={styles.orderTitle}>{order.title}</Text>
              <Text className={styles.orderMeta}>客户：{order.clientName} · 交付日期：{formatDate(new Date().toISOString())}</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>预览图</Text>
          <View className={styles.previewGrid}>
            {previewImages.map((file, index) => (
              <View key={file.id} className={styles.previewItem}>
                <Image className={styles.previewImage} src={file.url} mode="aspectFill" />
                <View className={styles.previewBadge}>
                  <Text className={styles.previewBadgeText}>{typeLabels[file.type]}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>文件列表 ({files.length})</Text>
          <View className={styles.fileList}>
            {files.map(file => (
              <View key={file.id} className={styles.fileItem}>
                <View className={styles.fileIcon}>
                  <Text>{typeIcons[file.type]}</Text>
                </View>
                <View className={styles.fileInfo}>
                  <Text className={styles.fileName}>{file.name}</Text>
                  <Text className={styles.fileMeta}>{typeLabels[file.type]} · {file.size} · {file.uploadedAt}</Text>
                </View>
                <View className={styles.fileAction} onClick={() => handleDownload(file)}>
                  <Text className={styles.fileActionText}>下载</Text>
                </View>
              </View>
            ))}
          </View>
          <View className={styles.uploadArea} onClick={handleUpload}>
            <Text className={styles.uploadIcon}>📤</Text>
            <Text className={styles.uploadText}>点击上传更多文件</Text>
          </View>
        </View>

        <View className={styles.paymentSection}>
          <Text className={styles.sectionTitle}>收款确认</Text>
          <View className={styles.paymentRow}>
            <Text className={styles.paymentLabel}>应收金额</Text>
            <Text className={styles.paymentAmount}>{formatPrice(quotation?.totalPrice || 0)}</Text>
          </View>
          <View className={classnames(styles.paymentStatus, {
            [styles.paymentStatusConfirmed]: paymentConfirmed,
            [styles.paymentStatusPending]: !paymentConfirmed
          })}>
            <Text className={classnames(styles.paymentStatusText, {
              [styles.confirmedText]: paymentConfirmed,
              [styles.pendingText]: !paymentConfirmed
            })}>
              {paymentConfirmed ? '✅ 收款已确认' : '⏳ 等待收款确认'}
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.btnSecondary} onClick={handleDeliver}>
          <Text>发送交付</Text>
        </View>
        {!paymentConfirmed ? (
          <View className={styles.btnSuccess} onClick={handleConfirmPayment}>
            <Text>确认收款</Text>
          </View>
        ) : (
          <View className={styles.btnPrimary}>
            <Text>已完成</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default DeliveryPage;
