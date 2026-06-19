import React, { useMemo, useState } from 'react';
import { View, Text, Image, useRouter, Input, Textarea, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { statusLabels, type OrderStatus } from '@/types';
import { useAppStore } from '@/store';
import { formatDate } from '@/utils/date';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

const statusFlow: OrderStatus[] = ['consultation', 'draft', 'lineart', 'coloring', 'revision', 'delivered'];

const ProgressDetailPage: React.FC = () => {
  const router = useRouter();
  const orderId = router.params.orderId;

  const orders = useAppStore((state) => state.orders);
  const progressRecords = useAppStore((state) => state.progressRecords);
  const addProgressRecord = useAppStore((state) => state.addProgressRecord);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    status: 'draft' as OrderStatus,
    description: '',
    feedback: '',
    revisionNumber: 0,
    attachments: ''
  });

  const order = useMemo(() => orders.find(o => o.id === orderId), [orders, orderId]);
  const orderProgressRecords = useMemo(
    () => progressRecords.filter(p => p.orderId === orderId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [progressRecords, orderId]
  );

  const handleAddProgress = () => {
    setShowForm(true);
    if (order) {
      setFormData(prev => ({ ...prev, status: order.status }));
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.description) {
      Taro.showToast({ title: '请填写阶段说明', icon: 'none' });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const attachments = formData.attachments
      ? formData.attachments.split(/[,，\n]/).map(s => s.trim()).filter(Boolean)
      : [];

    addProgressRecord({
      orderId: orderId!,
      orderTitle: order?.title || '',
      status: formData.status,
      date: today,
      description: formData.description,
      feedback: formData.feedback,
      revisionNumber: formData.revisionNumber,
      attachments
    });

    Taro.showToast({ title: '记录已添加', icon: 'success' });
    setShowForm(false);
    setFormData({
      status: order?.status || 'draft',
      description: '',
      feedback: '',
      revisionNumber: 0,
      attachments: ''
    });
  };

  const handleCancel = () => {
    setShowForm(false);
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
      <ScrollView className={styles.scroll} scrollY>
        <View className={styles.content}>
          <View className={styles.header}>
            <Text className={styles.orderTitle}>{order.title}</Text>
            <Text className={styles.clientName}>
              客户：{order.clientName} · 当前状态：
              <StatusTag status={order.status} size="small" />
            </Text>
          </View>

          {showForm && (
            <View className={styles.formCard}>
              <Text className={styles.formTitle}>添加进度记录</Text>
              
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>阶段</Text>
                <View className={styles.optionRow}>
                  {statusFlow.map((status) => (
                    <View
                      key={status}
                      className={classnames(styles.option, {
                        [styles.optionActive]: formData.status === status
                      })}
                      onClick={() => handleFormChange('status', status)}
                    >
                      <Text>{statusLabels[status]}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>
                  <Text className={styles.required}>*</Text>阶段说明
                </Text>
                <Textarea
                  className={styles.textarea}
                  placeholder="请输入当前阶段的工作说明..."
                  value={formData.description}
                  onInput={(e) => handleFormChange('description', e.detail.value)}
                />
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>客户反馈</Text>
                <Textarea
                  className={styles.textarea}
                  placeholder="请输入客户的反馈意见..."
                  value={formData.feedback}
                  onInput={(e) => handleFormChange('feedback', e.detail.value)}
                />
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>修改次数</Text>
                <Input
                  className={styles.input}
                  type="number"
                  placeholder="0"
                  value={String(formData.revisionNumber)}
                  onInput={(e) => handleFormChange('revisionNumber', parseInt(e.detail.value) || 0)}
                />
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>附件说明</Text>
                <Textarea
                  className={styles.textarea}
                  placeholder="请输入附件说明，多个用逗号分隔（例如：草图01.png, 参考图.jpg）"
                  value={formData.attachments}
                  onInput={(e) => handleFormChange('attachments', e.detail.value)}
                />
              </View>

              <View className={styles.formActions}>
                <View className={styles.btnCancel} onClick={handleCancel}>
                  <Text>取消</Text>
                </View>
                <View className={styles.btnSubmit} onClick={handleSubmit}>
                  <Text>保存记录</Text>
                </View>
              </View>
            </View>
          )}

          {orderProgressRecords.length > 0 ? (
            <View className={styles.timeline}>
              {statusFlow.map((status, index) => {
                const isActive = statusFlow.indexOf(order.status) >= index;
                const record = orderProgressRecords.find(p => p.status === status);
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
                              <Text className={styles.attachmentsLabel}>
                                附件：{record.attachments.join(', ')}
                              </Text>
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
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.btnPrimary} onClick={handleAddProgress}>
          <Text>添加进度记录</Text>
        </View>
      </View>
    </View>
  );
};

export default ProgressDetailPage;
