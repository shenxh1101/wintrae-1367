import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store';
import { formatPrice } from '@/utils/price';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const statistics = useAppStore((state) => state.getStatistics());
  const menuData = [
    {
      section: '业务管理',
      items: [
        { icon: '📊', title: '收入统计', desc: '查看月收入与业务趋势', action: () => Taro.navigateTo({ url: '/pages/statistics/index' }) },
        { icon: '📦', title: '文件交付', desc: '管理交付文件与收款确认', action: () => Taro.navigateTo({ url: '/pages/delivery/index' }) }
      ]
    },
    {
      section: '其他',
      items: [
        { icon: '⚙️', title: '设置', desc: '应用设置与偏好', action: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) },
        { icon: '💬', title: '意见反馈', desc: '帮助我们改进产品', action: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) },
        { icon: '❓', title: '帮助中心', desc: '常见问题与使用指南', action: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) },
        { icon: 'ℹ️', title: '关于我们', desc: '版本信息与服务条款', action: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) }
      ]
    }
  ];

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.header}>
        <View className={styles.profile}>
          <View className={styles.avatar}>
            <Text className={styles.avatarText}>🎨</Text>
          </View>
          <View className={styles.profileInfo}>
            <Text className={styles.name}>插画师小王</Text>
            <Text className={styles.title}>自由职业插画师 · 接单中</Text>
          </View>
        </View>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{formatPrice(statistics.totalIncome)}</Text>
          <Text className={styles.statLabel}>总收入</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue} style={{ color: '#10B981' }}>{statistics.completedOrders}</Text>
          <Text className={styles.statLabel}>已完成</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue} style={{ color: '#F59E0B' }}>{statistics.pendingOrders}</Text>
          <Text className={styles.statLabel}>进行中</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue} style={{ color: '#6366F1' }}>{formatPrice(statistics.averagePrice)}</Text>
          <Text className={styles.statLabel}>均价</Text>
        </View>
      </View>

      <View className={styles.menuList}>
        {menuData.map((section, sectionIndex) => (
          <View key={sectionIndex}>
            <Text className={styles.sectionTitle}>{section.section}</Text>
            <View className={styles.menuSection}>
              {section.items.map((item, itemIndex) => (
                <View
                  key={itemIndex}
                  className={styles.menuItem}
                  onClick={item.action}
                >
                  <View className={styles.menuIcon}>
                    <Text>{item.icon}</Text>
                  </View>
                  <View className={styles.menuContent}>
                    <Text className={styles.menuTitle}>{item.title}</Text>
                    {item.desc && <Text className={styles.menuDesc}>{item.desc}</Text>}
                  </View>
                  <Text className={styles.menuArrow}>›</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <Text className={styles.version}>插画师工作台 v1.0.0</Text>
    </ScrollView>
  );
};

export default MinePage;
