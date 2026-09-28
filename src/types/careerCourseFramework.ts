export interface CourseCareerSystemLevel {
  id?: number;
  careerId?: number;
  careerName?: string;
  careerCode: string;
  levelId?: number;
  levelName?: string;
  status?: number;
  auditStatus?: number;
  auditUserId?: string;
  auditDate?: string;
  auditReason?: string;
  auditLog?: string;
  updateTime?: string;
  frameworkStatus?: string;
}

export interface CourseCareerSystemLevelAuditDetail {
  id?: string;
  courseCareerSystemLevelId?: number;
  auditStatus?: number;
  auditUserId?: string;
  auditUserName?: string;
  auditReason?: string;
}

export interface CareerCourseFrameworkQueryParams {
  careerId?: string;
  careerName?: string;
  levelId?: string;
  auditStatus?: number;
  page?: number;
  size?: number;
}

export interface CareerCourseFrameworkAuditParams {
  id: number;
  auditStatus: number;
  auditUserName: string;
  auditReason?: string;
}
