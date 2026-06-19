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
  const deliveries = useAppStore((state) => state.deliveries);
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

          {deliveries[orderId!] && (
            <View className={classnames(styles.paymentCard, {
              [styles.paymentCardConfirmed]: deliveries[orderId!]?.paymentConfirmed,
              [styles.paymentCardPending]: !deliveries[orderId!]?.paymentConfirmed
            })}>
              <View className={styles.paymentCardRow}>
                <Text className={styles.paymentCardLabel}>收款状态</Text>
                <Text className={classnames(styles.paymentCardStatus, {
                  [styles.paymentStatusGreen]: deliveries[orderId!]?.paymentConfirmed,
                  [styles.paymentStatusOrange]: !deliveries[orderId!]?.paymentConfirmed
                })}>
                  {deliveries[orderId!]?.paymentConfirmed ? '✅ 已确认收款' : '⏳ 等待收款'}
                </Text>
              </View>
              {deliveries[orderId!]?.paymentConfirmed && (
                <View className={styles.paymentCardRow}>
                  <Text className={styles.paymentCardLabel}>收款金额</Text>
                  <Text className={styles.paymentCardAmount}>{formatPrice(deliveries[orderId!]?.paymentAmount || 0)}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View className={styles.statusSection}>
          <Text className={styles.sectionTitle}>进度阶段</Text>
          <View className={styles.stageTimeline}>
            {statusFlow.map((status, index) => {
              const isActive = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              return (
                <View key={status} className={styles.stageItem}>
                  <View className={styles.stageLine}>
                    <View className={classnames(styles.stageDot, {
                      [styles.stageDotActive]: isActive,
                      [styles.stageDotCurrent]: isCurrent
                    })} />
                    {index < statusFlow.length - 1 && <View className={classnames(styles.stageConnector, { [styles.stageConnectorActive]: isActive })} />}
                  </View>
                  <View className={styles.stageContent}>
                    <Text className={classnames(styles.stageLabel, {
                      [styles.stageLabelActive]: isActive
                    })}>
                      {statusLabels[status]}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View className={styles.recordsSection}>
          <Text className={styles.sectionTitle}>全部进度记录 ({orderProgressRecords.length})</Text>
          {orderProgressRecords.length > 0 ? (
            <View className={styles.recordsList}>
              {orderProgressRecords.map((record, recordIndex) => {
                const isLast = recordIndex === orderProgressRecords.length - 1;
                return (
                  <View key={record.id} className={styles.recordItem}>
                    <View className={styles.recordTimeline}>
                      <View className={styles.recordDot} />
                      {!isLast && <View className={styles.recordConnector} />}
                    </View>
                    <View className={styles.recordContent}>
                      <View className={styles.recordHeader}>
                        <StatusTag status={record.status} size="small" />
                        <Text className={styles.recordDate}>{formatDate(record.date)}</Text>
                      </View>
                      <Text className={styles.recordDescription}>{record.description}</Text>
                      {record.feedback && (
                        <View className={styles.recordFeedback}>
                          <Text className={styles.recordFeedbackLabel}>💬 客户反馈</Text>
                          <Text className={styles.recordFeedbackText}>{record.feedback}</Text>
                        </View>
                      )}
                      {record.revisionNumber > 0 && (
                        <View className={styles.recordRevision}>
                          <Text className={styles.recordRevisionText}>🔄 第 {record.revisionNumber} 次修改</Text>
                        </View>
                      )}
                      {record.attachments && record.attachments.length > 0 && (
                        <View className={styles.recordAttachments}>
                          <Text className={styles.recordAttachmentsLabel}>📎 附件：{record.attachments.join('、')}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className={styles.emptyRecords}>
              <Text className={styles.emptyRecordsText}>暂无进度记录</Text>
            </View>
          )}
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
