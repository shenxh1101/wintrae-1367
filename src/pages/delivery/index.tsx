import React, { useMemo, useState } from 'react';
import { View, Text, Image, useRouter, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import { formatPrice } from '@/utils/price';
import { formatDate } from '@/utils/date';
import { statusLabels } from '@/types';
import type { DeliveryFile } from '@/types';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

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
  const rawOrderId = router.params.orderId;

  const orders = useAppStore((state) => state.orders);
  const quotations = useAppStore((state) => state.quotations);
  const deliveries = useAppStore((state) => state.deliveries);
  const confirmPayment = useAppStore((state) => state.confirmPayment);
  const addDeliveryFile = useAppStore((state) => state.addDeliveryFile);

  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(rawOrderId);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    fileName: '',
    fileType: 'final' as 'final' | 'preview' | 'source',
    fileSize: ''
  });

  const orderId = selectedOrderId;

  const order = useMemo(() => (orderId ? orders.find(o => o.id === orderId) : undefined), [orders, orderId]);
  const quotation = useMemo(() => (orderId ? quotations.find(q => q.orderId === orderId) : undefined), [quotations, orderId]);
  const delivery = useMemo(() => (orderId ? deliveries[orderId] : undefined), [deliveries, orderId]);

  const files = delivery?.files || [];
  const paymentConfirmed = delivery?.paymentConfirmed || false;

  const handleSelectOrder = (id: string) => {
    setSelectedOrderId(id);
  };

  const handleUploadFormChange = (field: string, value: any) => {
    setUploadForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddFile = () => {
    if (!uploadForm.fileName) {
      Taro.showToast({ title: '请输入文件名', icon: 'none' });
      return;
    }
    if (!orderId) return;

    const today = new Date().toISOString().split('T')[0];
    const newFile: DeliveryFile = {
      id: `f${Date.now()}`,
      name: uploadForm.fileName,
      type: uploadForm.fileType,
      url: uploadForm.fileType === 'source' ? '' : 'https://picsum.photos/seed/delivery/800/600',
      size: uploadForm.fileSize || '1MB',
      uploadedAt: today
    };

    addDeliveryFile(orderId, newFile);
    Taro.showToast({ title: '文件已添加', icon: 'success' });
    setShowUploadForm(false);
    setUploadForm({
      fileName: '',
      fileType: 'final',
      fileSize: ''
    });
  };

  const handleCancelUpload = () => {
    setShowUploadForm(false);
  };

  const handleDownload = (file: DeliveryFile) => {
    console.log('[Delivery] 下载文件:', file.name);
    Taro.showToast({ title: `开始下载 ${file.name}`, icon: 'none' });
  };

  const handleConfirmPayment = () => {
    if (!orderId) return;
    const amount = quotation?.totalPrice || 0;
    Taro.showModal({
      title: '确认收款',
      content: `确认已收到 ${formatPrice(amount)} 款项？`,
      success: (res) => {
        if (res.confirm) {
          confirmPayment(orderId, amount);
          Taro.showToast({ title: '收款已确认', icon: 'success' });
        }
      }
    });
  };

  const handleDeliver = () => {
    console.log('[Delivery] 发送交付');
    Taro.showToast({ title: '交付文件已发送给客户', icon: 'success' });
  };

  if (!orderId) {
    return (
      <View className={styles.container}>
        <ScrollView className={styles.scroll} scrollY>
          <View className={styles.content}>
            <View className={styles.section}>
              <Text className={styles.sectionTitle}>选择订单</Text>
              <Text className={styles.sectionDesc}>请选择要管理交付文件的订单</Text>
              {orders.length > 0 ? (
                <View className={styles.orderSelectList}>
                  {orders.map(o => {
                    const d = deliveries[o.id];
                    const confirmed = d?.paymentConfirmed;
                    return (
                      <View
                        key={o.id}
                        className={styles.orderSelectItem}
                        onClick={() => handleSelectOrder(o.id)}
                      >
                        <View className={styles.orderSelectMain}>
                          <Text className={styles.orderSelectTitle}>{o.title}</Text>
                          <Text className={styles.orderSelectMeta}>
                            客户：{o.clientName} · {statusLabels[o.status]}
                          </Text>
                        </View>
                        <View className={styles.orderSelectRight}>
                          <StatusTag status={o.status} size="small" />
                          {confirmed && <Text className={styles.paidTag}>已收款</Text>}
                          <Text className={styles.orderSelectArrow}>›</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View className={styles.emptyBox}>
                  <Text className={styles.emptyText}>暂无订单</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!order) {
    return (
      <View className={styles.container}>
        <View className={styles.content}>
          <Text>订单不存在</Text>
        </View>
      </View>
    );
  }

  const previewImages = files.filter(f => f.type !== 'source');

  return (
    <View className={styles.container}>
      <ScrollView className={styles.scroll} scrollY>
        <View className={styles.content}>
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>订单信息</Text>
            <View className={styles.orderInfo}>
              <View>
                <Text className={styles.orderTitle}>{order.title}</Text>
                <Text className={styles.orderMeta}>
                  客户：{order.clientName} · 交付日期：{delivery?.deliveredAt || formatDate(new Date().toISOString())}
                </Text>
              </View>
              <StatusTag status={order.status} size="small" />
            </View>
          </View>

          {showUploadForm && (
            <View className={styles.uploadFormCard}>
              <Text className={styles.formTitle}>添加交付文件</Text>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>
                  <Text className={styles.required}>*</Text>文件名
                </Text>
                <Input
                  className={styles.input}
                  placeholder="例如：最终稿_角色设计.png"
                  value={uploadForm.fileName}
                  onInput={(e) => handleUploadFormChange('fileName', e.detail.value)}
                />
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>文件类型</Text>
                <View className={styles.optionRow}>
                  {(['final', 'preview', 'source'] as const).map((type) => (
                    <View
                      key={type}
                      className={classnames(styles.option, {
                        [styles.optionActive]: uploadForm.fileType === type
                      })}
                      onClick={() => handleUploadFormChange('fileType', type)}
                    >
                      <Text>{typeLabels[type]}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>文件大小</Text>
                <Input
                  className={styles.input}
                  placeholder="例如：2.5MB"
                  value={uploadForm.fileSize}
                  onInput={(e) => handleUploadFormChange('fileSize', e.detail.value)}
                />
              </View>

              <View className={styles.formActions}>
                <View className={styles.btnCancel} onClick={handleCancelUpload}>
                  <Text>取消</Text>
                </View>
                <View className={styles.btnSubmit} onClick={handleAddFile}>
                  <Text>添加文件</Text>
                </View>
              </View>
            </View>
          )}

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>预览图</Text>
            {previewImages.length > 0 ? (
              <View className={styles.previewGrid}>
                {previewImages.map((file) => (
                  <View key={file.id} className={styles.previewItem}>
                    <Image className={styles.previewImage} src={file.url} mode="aspectFill" />
                    <View className={styles.previewBadge}>
                      <Text className={styles.previewBadgeText}>{typeLabels[file.type]}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className={styles.emptyBox}>
                <Text className={styles.emptyText}>暂无预览图</Text>
              </View>
            )}
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>文件列表 ({files.length})</Text>
            {files.length > 0 ? (
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
            ) : (
              <View className={styles.emptyBox}>
                <Text className={styles.emptyText}>暂无文件</Text>
              </View>
            )}
            <View className={styles.uploadArea} onClick={() => setShowUploadForm(true)}>
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
      </ScrollView>

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
