export type CourseStandardStatus =
  | 'draft'
  | 'submitted'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'needs_revision'
  | 'finalized'
  | 'published';

export interface StatusConfig {
  label: string;
  color: string;
  antdColor: string;
  description: string;
  nextStates: CourseStandardStatus[];
}

export const COURSE_STANDARD_STATUS_CONFIG: Record<CourseStandardStatus, StatusConfig> = {
  draft: {
    label: '草稿',
    color: 'bg-gray-100 text-gray-700',
    antdColor: 'default',
    description: '初始创建状态',
    nextStates: ['pending_review']
  },
  submitted: {
    label: '已提交',
    color: 'bg-teal-100 text-teal-700',
    antdColor: 'cyan',
    description: '文件已提交，待提交审核',
    nextStates: ['pending_review']
  },
  pending_review: {
    label: '待审核',
    color: 'bg-blue-100 text-blue-700',
    antdColor: 'blue',
    description: '已提交等待审核',
    nextStates: ['approved', 'rejected']
  },
  approved: {
    label: '审核通过',
    color: 'bg-cyan-100 text-cyan-700',
    antdColor: 'cyan',
    description: '审核通过待批准',
    nextStates: ['finalized']
  },
  rejected: {
    label: '审核不通过',
    color: 'bg-red-100 text-red-700',
    antdColor: 'red',
    description: '审核未通过',
    nextStates: ['needs_revision']
  },
  needs_revision: {
    label: '需要修订',
    color: 'bg-orange-100 text-orange-700',
    antdColor: 'orange',
    description: '需要修订后重新提交',
    nextStates: ['pending_review']
  },
  finalized: {
    label: '已批准',
    color: 'bg-green-100 text-green-700',
    antdColor: 'green',
    description: '最终批准完成',
    nextStates: ['published']
  },
  published: {
    label: '已发布',
    color: 'bg-purple-100 text-purple-700',
    antdColor: 'purple',
    description: '正式发布使用',
    nextStates: []
  }
};

export const getStatusConfig = (status: CourseStandardStatus): StatusConfig => {
  return COURSE_STANDARD_STATUS_CONFIG[status] || COURSE_STANDARD_STATUS_CONFIG.draft;
};

export const getStatusLabel = (status: CourseStandardStatus): string => {
  return getStatusConfig(status).label;
};

export const getStatusColor = (status: CourseStandardStatus): string => {
  return getStatusConfig(status).color;
};

export const getStatusAntdColor = (status: CourseStandardStatus): string => {
  return getStatusConfig(status).antdColor;
};

export const getStatusDescription = (status: CourseStandardStatus): string => {
  return getStatusConfig(status).description;
};

export const canTransitionTo = (from: CourseStandardStatus, to: CourseStandardStatus): boolean => {
  const config = getStatusConfig(from);
  return config.nextStates.includes(to);
};

export const getNextStates = (status: CourseStandardStatus): CourseStandardStatus[] => {
  return getStatusConfig(status).nextStates;
};

export const getStatusFlowDescription = (): string => {
  return `
    草稿 → 待审核 → 审核通过 → 已批准 → 已发布
                ↓
            审核不通过 → 待修订 ⤴
  `;
};
