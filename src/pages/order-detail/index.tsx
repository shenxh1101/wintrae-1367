import React, { useMemo } from 'react';
import { View, Text, useRouter } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { statusLabels, complexityLabels, authorizationLabels, type OrderStatus } from '@/types';
import { useAppStore } from '@/store';
import StatusTag from '@/components/StatusTag';
import { formatDate, isOverdue, getDeadlineStatus } from '@/utils/date';
import { formatPrice } from '@/utils/price';
import styles from './index.module.scss';

const statusFlow: OrderStatus[] = ['consultation', 'draft', 'lineart', 'coloring', 'revision', 'delivered'];

const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const orderId = router.params.id;

  const orders = useAppStore((state) => state.orders);
  const quotations = useAppStore((state) => state.quotations);
  const progressRecords = useAppStore((state) => state.progressRecords);
  const updateOrderStatus = useAppStore((state) => state.updateOrderStatus);
  const addProgressRecord = useAppStore((state) => state.addProgressRecord);

  const order = useMemo(() => orders.find(o => o.id === orderId), [orders, orderId]);
  const quotation = useMemo(() => quotations.find(q => q.orderId === orderId), [quotations, orderId]);
  const orderProgressRecords = useMemo(
    () => progressRecords.filter(p => p.orderId === orderId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [progressRecords, orderId]
  );

  if (!order) {
    return (
      <View className={styles.container}>
        <View className={styles.content}>
          <Text>订单不存在</Text>
        </View>
      </View>
    );
  }

  const deadlineInfo = getDeadlineStatus(order.deadline);
  const overdue = isOverdue(order.deadline);
  const currentStatusIndex = statusFlow.indexOf(order.status);

  const handleUpdateStatus = () => {
    const nextStatuses = statusFlow.slice(currentStatusIndex + 1);
    if (nextStatuses.length === 0) {
      Taro.showToast({ title: '已完成所有阶段', icon: 'none' });
      return;
    }

    Taro.showActionSheet({
      itemList: nextStatuses.map(s => statusLabels[s]),
      success: (res) => {
        const nextStatus = nextStatuses[res.tapIndex];
        updateOrderStatus(orderId!, nextStatus);
        
        const today = new Date().toISOString().split('T')[0];
        addProgressRecord({
          orderId: orderId!,
          orderTitle: order.title,
          status: nextStatus,
          date: today,
          description: `状态更新为「${statusLabels[nextStatus]}」`,
          feedback: '',
          revisionNumber: order.revisionCount,
          attachments: []
        });

        Taro.showToast({ title: `已更新为${statusLabels[nextStatus]}`, icon: 'success' });
      }
    });
  };

  const handleViewProgress = () => {
    console.log('[OrderDetail] 查看进度');
    Taro.navigateTo({
      url: `/pages/progress-detail/index?orderId=${order.id}`
    });
  };

  const handleViewQuotation = () => {
    if (order.quotationId) {
      console.log('[OrderDetail] 查看报价单:', order.quotationId);
      Taro.navigateTo({
        url: `/pages/quotation-detail/index?id=${order.quotationId}`
      });
    }
  };

  const handleDelivery = () => {
    console.log('[OrderDetail] 交付文件');
    Taro.navigateTo({
      url: `/pages/delivery/index?orderId=${order.id}`
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.content}>
        <View className={styles.headerCard}>
          <View className={styles.headerTop}>
            <View>
              <Text className={styles.title}>{order.title}</Text>
              <Text className={styles.client}>客户：{order.clientName}</Text>
            </View>
            <StatusTag status={order.status} size="medium" />
          </View>

          <Text className={styles.description}>{order.description}</Text>

          <View className={styles.infoGrid}>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>尺寸</Text>
              <Text className={styles.infoValue}>{order.size}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>用途</Text>
              <Text className={styles.infoValue}>{order.usage}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>授权范围</Text>
              <Text className={styles.infoValue}>{authorizationLabels[order.authorizationScope]}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>复杂度</Text>
              <Text className={styles.infoValue}>{complexityLabels[order.complexity]}</Text>
            </View>
          </View>

          <View className={styles.tagRow}>
            <View className={styles.tag}>
              <Text className={styles.tagText}>修改 {order.revisionCount}/{order.maxRevisions}</Text>
            </View>
            {order.isUrgent && (
              <View className={classnames(styles.tag, styles.urgentTag)}>
                <Text className={styles.tagText}>加急订单</Text>
              </View>
            )}
            <View className={classnames(styles.tag, overdue && styles.urgentTag)}>
              <Text className={styles.tagText}>
                截止：{deadlineInfo.text}
              </Text>
            </View>
            {quotation && (
              <View className={styles.tag}>
                <Text className={styles.tagText}>报价：{formatPrice(quotation.totalPrice)}</Text>
              </View>
            )}
          </View>

          <View className={styles.infoGrid}>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>创建时间</Text>
              <Text className={styles.infoValue}>{formatDate(order.createdAt)}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>进度记录</Text>
              <Text className={styles.infoValue}>{orderProgressRecords.length} 条</Text>
            </View>
          </View>
        </View>

        <View className={styles.statusSection}>
          <Text className={styles.sectionTitle}>进度状态</Text>
          <View className={styles.statusTimeline}>
            {statusFlow.map((status, index) => {
              const isActive = index <= currentStatusIndex;
              const record = orderProgressRecords.find(p => p.status === status);
              return (
                <View key={status} className={styles.timelineItem}>
                  <View className={classnames(styles.timelineDot, {
                    [styles.timelineDotActive]: isActive
                  })} />
                  <View className={styles.timelineContent}>
                    <Text className={classnames(styles.timelineStatus, {
                      [styles.timelineStatusInactive]: !isActive
                    })}>
                      {statusLabels[status]}
                    </Text>
                    {record ? (
                      <Text className={styles.timelineDate}>
                        {formatDate(record.date)} · {record.description}
                      </Text>
                    ) : (
                      <Text className={styles.timelineDate}>
                        {isActive ? '进行中...' : '未开始'}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.btnSecondary} onClick={handleViewProgress}>
          <Text>进度记录</Text>
        </View>
        <View className={styles.btnSecondary} onClick={handleViewQuotation}>
          <Text>报价单</Text>
        </View>
        {order.status !== 'delivered' ? (
          <View className={styles.btnPrimary} onClick={handleUpdateStatus}>
            <Text>更新状态</Text>
          </View>
        ) : (
          <View className={styles.btnPrimary} onClick={handleDelivery}>
            <Text>交付管理</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default OrderDetailPage;
