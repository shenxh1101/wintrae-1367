import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export const formatDate = (date: string, format: string = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

export const formatRelative = (date: string): string => {
  return dayjs(date).fromNow();
};

export const isOverdue = (deadline: string): boolean => {
  return dayjs().isAfter(dayjs(deadline), 'day');
};

export const getDeadlineStatus = (deadline: string): {
  status: 'normal' | 'urgent' | 'overdue';
  text: string;
} => {
  const deadlineDate = dayjs(deadline);
  const now = dayjs();

  if (now.isAfter(deadlineDate, 'day')) {
    return { status: 'overdue', text: '已逾期' };
  }

  const diffDays = deadlineDate.diff(now, 'day');

  if (diffDays <= 2) {
    return { status: 'urgent', text: `还剩${diffDays + 1}天` };
  }

  return { status: 'normal', text: formatDate(deadline) };
};

export const getMonthLabel = (month: string): string => {
  return dayjs(month).format('M月');
};
