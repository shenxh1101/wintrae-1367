import React, { useMemo } from 'react';
import { View, Text, Image, useRouter } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { statusLabels, type OrderStatus } from '@/types';
import { mockProgress } from '@/data/mockProgress';
import { mockOrders } from '@/data/mockOrders';
import { formatDate } from '@/utils/date';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

const statusFlow: OrderStatus[] = ['consultation', 'draft', 'lineart', 'coloring', 'revision', 'delivered'];

const ProgressDetailPage: React.FC = () => {
  const router = useRouter();
  const orderId = router.params.orderId;
  const progressId = router.params.id;

  const order = useMemo(() => mockOrders.find(o => o.id === orderId), [orderId]);
  const progressRecords = useMemo(() => mockProgress.filter(p => p.orderId === orderId), [orderId]);
  const currentRecord = useMemo(() => mockProgress.find(p => p.id === progressId), [progressId]);

  const handleAddProgress = () => {
    console.log('[ProgressDetail] 添加进度记录');
    Taro.showToast({ title: '功能开发中', icon: 'none' });
  };

  if (!order) {
    return (
      <View className={styles.container}>
        <Text>订单不存在</Text>
      </View>
    );
  }

  return (
    <View className={styles.container}>
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.orderTitle}>{order.title}</Text>
          <Text className={styles.clientName}>
            客户：{order.clientName} · 当前状态：
            <StatusTag status={order.status} size="small" />
          </Text>
        </View>

        {progressRecords.length > 0 ? (
          <View className={styles.timeline}>
            {statusFlow.map((status, index) => {
              const isActive = statusFlow.indexOf(order.status) >= index;
              const record = progressRecords.find(p => p.status === status);
              return (
                <View key={status} className={styles.timelineItem}>
                  <View className={styles.timelineLine}>
                    <View className={classnames(styles.timelineDot, {
                      [styles.timelineDotInactive]: !isActive
                    })} />
                    {index < statusFlow.length - 1 && <View className={styles.timelineConnector} />}
                  </View>
                  <View className={styles.timelineContent}>
                    <View className={styles.timelineHeader}>
                      <Text className={styles.timelineStatus}>{statusLabels[status]}</Text>
                      {record && (
                        <Text className={styles.timelineDate}>{formatDate(record.date)}</Text>
                      )}
                    </View>
                    {record ? (
                      <>
                        <Text className={styles.timelineDesc}>{record.description}</Text>
                        {record.feedback && (
                          <View className={styles.feedbackCard}>
                            <Text className={styles.feedbackLabel}>客户反馈</Text>
                            <Text className={styles.feedbackText}>{record.feedback}</Text>
                          </View>
                        )}
                        {record.attachments && record.attachments.length > 0 && (
                          <View className={styles.attachments}>
                            {record.attachments.map((url, idx) => (
                              <Image
                                key={idx}
                                className={styles.attachment}
                                src={url}
                                mode="aspectFill"
                              />
                            ))}
                          </View>
                        )}
                        {record.revisionNumber > 0 && (
                          <View className={styles.revisionTag}>
                            <Text className={styles.revisionText}>第 {record.revisionNumber} 次修改</Text>
                          </View>
                        )}
                      </>
                    ) : (
                      <Text className={styles.timelineDesc} style={{ color: '#9CA3AF' }}>
                        {isActive ? '进行中...' : '未开始'}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View className={styles.emptyContainer}>
            <Text className={styles.emptyTitle}>暂无进度记录</Text>
            <Text className={styles.emptyDesc}>点击下方按钮添加第一条进度记录</Text>
          </View>
        )}
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.btnPrimary} onClick={handleAddProgress}>
          <Text>添加进度记录</Text>
        </View>
      </View>
    </View>
  );
};

export default ProgressDetailPage;
