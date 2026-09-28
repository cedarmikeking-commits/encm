export interface MenuItem {
  id: string;
  title: string;
  icon: string;
  path: string;
  children?: MenuItem[];
  isExpanded?: boolean;
}

export interface CourseStats {
  totalCourses: number;
  activeCourses: number;
  pendingReview: number;
  completedCourses: number;
}

export * from './careerCourseFramework';
export * from './careerCourseStandard';
export * from './courseDirectory';