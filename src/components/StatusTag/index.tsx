import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { statusLabels, statusColors } from '@/types';
import type { OrderStatus } from '@/types';
import styles from './index.module.scss';

interface StatusTagProps {
  status: OrderStatus;
  size?: 'small' | 'medium' | 'large';
}

const StatusTag: React.FC<StatusTagProps> = ({ status, size = 'medium' }) => {
  const label = statusLabels[status];
  const color = statusColors[status];

  return (
    <View
      className={classnames(styles.tag, styles[size])}
      style={{ backgroundColor: `${color}15`, color }}
    >
      <Text className={styles.dot} style={{ backgroundColor: color }} />
      <Text className={styles.text}>{label}</Text>
    </View>
  );
};

export default StatusTag;
