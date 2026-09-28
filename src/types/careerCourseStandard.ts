export interface CourseStandard {
  id: number;
  courseId?: number;
  courseName?: string;
  courseStandardName?: string;
  careerId?: number;
  careerName?: string;
  levelId?: string;
  levelName?: string;
  abilityId?: string;
  abilityName?: string;
  auditStatus?: number;
  auditUserId?: string;
  auditDate?: string;
  submitTime?: string;
  reviewTime?: string;
  courseCode: string;
}

export interface CourseAuditDetail {
  id: number;
  courseStandardId?: number;
  courseId?: number;
  auditStatus?: number;
  auditUserId?: string;
  auditUserName?: string;
  auditUserTitle?: string;
  auditUserInstitution?: string;
  auditDate?: string;
  auditScoe?: string;
  auditReason?: string;
  advantage?: string;
  disadvantage?: string;
  suggestion?: string;
  finalAuditFlag?: number;
  courseName?: string;
  careerName?: string;
  courseCode: string;
}

export interface CareerCourseStandardQueryParams {
  careerId?: number;
  levelId?: string;
  abilityId?: string;
  auditStatus?: number;
  page?: number;
  size?: number;
}

export interface CareerCourseStandardAuditParams {
  id: number;
  courseId?: number;
  auditStatus: number;
  auditUserName?: string;
  auditUserId?: string;
  auditUserTitle?: string;
  auditUserInstitution?: string;
  auditDate?: string;
  auditReason?: string;
  advantage?: string;
  disadvantage?: string;
  suggestion?: string;
  auditScoe?: string;
  finalAuditFlag?: number;
}
