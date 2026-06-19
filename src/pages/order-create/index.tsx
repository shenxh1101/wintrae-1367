import React, { useState } from 'react';
import { View, Text, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import {
  complexityLabels,
  authorizationLabels,
  statusLabels,
  type OrderStatus,
  type ComplexityLevel,
  type AuthorizationScope
} from '@/types';
import { useAppStore } from '@/store';
import { calculateTotalPrice, formatPrice } from '@/utils/price';
import styles from './index.module.scss';

const statusOptions: OrderStatus[] = ['consultation', 'draft', 'lineart', 'coloring', 'revision', 'delivered'];
const complexityOptions: ComplexityLevel[] = ['simple', 'medium', 'complex'];
const authorizationOptions: AuthorizationScope[] = ['personal', 'commercial', 'exclusive'];

const OrderCreatePage: React.FC = () => {
  const clients = useAppStore((state) => state.clients);
  const addOrder = useAppStore((state) => state.addOrder);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientId: '',
    clientName: '',
    status: 'consultation' as OrderStatus,
    size: '',
    usage: '',
    authorizationScope: 'personal' as AuthorizationScope,
    deadline: '',
    complexity: 'medium' as ComplexityLevel,
    isUrgent: false,
    maxRevisions: 3
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClientSelect = () => {
    Taro.showActionSheet({
      itemList: clients.map(c => `${c.name} - ${c.company}`),
      success: (res) => {
        const client = clients[res.tapIndex];
        handleInputChange('clientId', client.id);
        handleInputChange('clientName', client.name);
      }
    });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.clientId || !formData.deadline) {
      Taro.showToast({ title: '请填写必要信息', icon: 'none' });
      return;
    }

    const priceInfo = calculateTotalPrice(
      formData.complexity,
      formData.isUrgent,
      formData.authorizationScope
    );

    addOrder({
      title: formData.title,
      description: formData.description || '暂无描述',
      clientId: formData.clientId,
      clientName: formData.clientName,
      status: formData.status,
      size: formData.size || '未指定',
      usage: formData.usage || '未指定',
      authorizationScope: formData.authorizationScope,
      deadline: formData.deadline,
      complexity: formData.complexity,
      isUrgent: formData.isUrgent,
      maxRevisions: formData.maxRevisions
    });

    Taro.showToast({
      title: '订单创建成功',
      icon: 'success',
      duration: 1500
    });

    setTimeout(() => {
      Taro.switchTab({
        url: '/pages/orders/index'
      });
    }, 1500);
  };

  const pricePreview = calculateTotalPrice(
    formData.complexity,
    formData.isUrgent,
    formData.authorizationScope
  );

  return (
    <View className={styles.container}>
      <View className={styles.form}>
        <View className={styles.formSection}>
          <Text className={styles.sectionTitle}>基本信息</Text>

          <View className={styles.formItem}>
            <Text className={styles.label}>
              <Text className={styles.required}>*</Text>订单名称
            </Text>
            <Input
              className={styles.input}
              placeholder="请输入订单名称"
              value={formData.title}
              onInput={(e) => handleInputChange('title', e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>
              <Text className={styles.required}>*</Text>客户
            </Text>
            <View
              className={classnames(styles.input, styles.select)}
              onClick={handleClientSelect}
            >
              <Text style={{ color: formData.clientName ? '#1F2937' : '#9CA3AF' }}>
                {formData.clientName || '请选择客户'}
              </Text>
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>订单描述</Text>
            <Textarea
              className={styles.textarea}
              placeholder="请输入订单描述..."
              value={formData.description}
              onInput={(e) => handleInputChange('description', e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>初始状态</Text>
            <View className={styles.optionRow}>
              {statusOptions.map((status) => (
                <View
                  key={status}
                  className={classnames(styles.option, {
                    [styles.optionActive]: formData.status === status
                  })}
                  onClick={() => handleInputChange('status', status)}
                >
                  <Text>{statusLabels[status]}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.formSection}>
          <Text className={styles.sectionTitle}>项目规格</Text>

          <View className={styles.formItem}>
            <Text className={styles.label}>
              <Text className={styles.required}>*</Text>截止日期
            </Text>
            <Input
              className={styles.input}
              type="digit"
              placeholder="YYYY-MM-DD"
              value={formData.deadline}
              onInput={(e) => handleInputChange('deadline', e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>尺寸</Text>
            <Input
              className={styles.input}
              placeholder="例如：2000x3000px"
              value={formData.size}
              onInput={(e) => handleInputChange('size', e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>用途</Text>
            <Input
              className={styles.input}
              placeholder="例如：游戏宣传、书籍封面"
              value={formData.usage}
              onInput={(e) => handleInputChange('usage', e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>复杂度</Text>
            <View className={styles.optionRow}>
              {complexityOptions.map((level) => (
                <View
                  key={level}
                  className={classnames(styles.option, {
                    [styles.optionActive]: formData.complexity === level
                  })}
                  onClick={() => handleInputChange('complexity', level)}
                >
                  <Text>{complexityLabels[level]}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>授权范围</Text>
            <View className={styles.optionRow}>
              {authorizationOptions.map((scope) => (
                <View
                  key={scope}
                  className={classnames(styles.option, {
                    [styles.optionActive]: formData.authorizationScope === scope
                  })}
                  onClick={() => handleInputChange('authorizationScope', scope)}
                >
                  <Text>{authorizationLabels[scope]}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>最大修改次数</Text>
            <Input
              className={styles.input}
              type="number"
              placeholder="3"
              value={String(formData.maxRevisions)}
              onInput={(e) => handleInputChange('maxRevisions', parseInt(e.detail.value) || 3)}
            />
          </View>

          <View className={styles.formItem}>
            <View className={styles.switchRow} onClick={() => handleInputChange('isUrgent', !formData.isUrgent)}>
              <Text className={styles.switchLabel}>加急订单（+30%费用）</Text>
              <View className={classnames(styles.switch, { [styles.switchActive]: formData.isUrgent })}>
                <View className={styles.switchHandle} />
              </View>
            </View>
          </View>
        </View>

        <View className={styles.formSection}>
          <Text className={styles.sectionTitle}>报价预览</Text>
          <View className={styles.formItem}>
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text className={styles.label}>预估总价</Text>
              <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#10B981' }}>
                {formatPrice(pricePreview.totalPrice)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View
          className={classnames(styles.btnPrimary, {
            [styles.btnDisabled]: !formData.title || !formData.clientId || !formData.deadline
          })}
          onClick={handleSubmit}
        >
          <Text>创建订单</Text>
        </View>
      </View>
    </View>
  );
};

export default OrderCreatePage;
