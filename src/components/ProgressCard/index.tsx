import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { statusLabels, statusColors } from '@/types';
import type { ProgressRecord } from '@/types';
import { formatDate } from '@/utils/date';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

interface ProgressCardProps {
  progress: ProgressRecord;
  isLast?: boolean;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ progress, isLast = false }) => {
  const handleClick = () => {
    console.log('[ProgressCard] 点击进度:', progress.id);
    Taro.navigateTo({
      url: `/pages/progress-detail/index?id=${progress.id}&orderId=${progress.orderId}`
    });
  };

  return (
    <View className={styles.timelineItem}>
      <View className={styles.timelineLine}>
        <View className={styles.timelineDot} style={{ backgroundColor: statusColors[progress.status] }} />
        {!isLast && <View className={styles.timelineConnector} />}
      </View>
      <View className={styles.card} onClick={handleClick}>
        <View className={styles.header}>
          <StatusTag status={progress.status} size="small" />
          <Text className={styles.date}>{formatDate(progress.date)}</Text>
        </View>
        <Text className={styles.orderTitle}>{progress.orderTitle}</Text>
        <Text className={styles.description}>{progress.description}</Text>
        {progress.feedback && (
          <View className={styles.feedback}>
            <Text className={styles.feedbackLabel}>客户反馈</Text>
            <Text className={styles.feedbackText}>{progress.feedback}</Text>
          </View>
        )}
        {progress.attachments && progress.attachments.length > 0 && (
          <View className={styles.attachments}>
            {progress.attachments.map((url, index) => (
              <Image
                key={index}
                className={styles.attachment}
                src={url}
                mode="aspectFill"
              />
            ))}
          </View>
        )}
        {progress.revisionNumber > 0 && (
          <View className={styles.revision}>
            <Text className={styles.revisionText}>第 {progress.revisionNumber} 次修改</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ProgressCard;
