// 标准备案和目录发布相关类型定义
export enum AuditStatus {
  //草稿 = 0,
  draft = 0,
  pendding = 1,
  approved = 2,
  rejected = 3,
  //published = 4,
}
// 审核详情
export interface AuditDetail {
  id: number;
  createUser: number;
  createDept: number;
  createTime: string;
  updateUser: number;
  updateTime: string;
  status: number;
  isDeleted: number;
  tenantId: string;
  careerStandardId: number;
  auditStage: number; // 1=内审, 2=专家审查, 3=专业委员会
  auditStatus: number; // 1=通过, 2=未通过
  auditUserId: number;
  auditUserName: string;
  auditUserTitle: string;
  auditUserInstitution: string;
  auditDate: string;
  auditScope: string;
  auditReason: string;
  suggestion: string;
  careerStandardFileName: string;
  careerStandardFileNo: string;
  standardVersion: string;
  careerId: number;
  careerCode: string;
  careerName: string;
}

// 修订详情
export interface ReviseDetail {
  id: number;
  createUser: number;
  createDept: number;
  createTime: string;
  updateUser: number;
  updateTime: string;
  status: number;
  isDeleted: number;
  tenantId: string;
  careerStandardId: number;
  auditStage: number;
  careerStandardAuditDetailId: number;
  reviseUserId: string;
  reviseUserName: string;
  reviseRemark: string;
  suggestion: string;
  preface: string;
  corePurpose: string;
  scope: string;
  overview: string;
}

// 术语定义
export interface StandardTerm {
  id: number;
  createUser: number;
  createDept: number;
  createTime: string;
  updateUser: number;
  updateTime: string;
  status: number;
  isDeleted: number;
  tenantId: string;
  careerStandardId: number;
  termName: string;
  termDefinition: string;
}

// 职业标准完整信息
export interface CareerStandardVO {
  id: string;
  createUser: number;
  createDept: number;
  createTime: string;
  updateUser: number;
  updateTime: string;
  status: number;
  isDeleted: number;
  tenantId: string;
  careerStandardFileName: string;
  careerStandardFileNo: string;
  standardVersion: string;
  careerStandardMapId: number;
  standardId: number;
  industryId: number;
  careerId: number;
  isCurrent: number;
  publishDate: string;
  preface: string;
  corePurpose: string;
  scope: string;
  overview: string;
  appendixAttach: string;
  auditStatus: number;
  auditUserId: number;
  auditDate: string;
  currentAuditStage: number;
  nextAuditStage: number;
  auditReason: string;
  auditLog: string;
  remark: string;
  careerStandardMapName: string;
  standardName: string;
  industryCode: string;
  industryName: string;
  careerCode: string;
  careerName: string;
  auditUserName: string;
  auditDetails: AuditDetail[];
  reviseDetails: ReviseDetail[];
  careerStandardTermList: StandardTerm[];
  createUserName: string;
  searchStatusTitle: string;
  publishStatus?: string
}

// 分页排序
export interface PageOrder {
  column: string;
  asc: boolean;
}

// 分页响应
export interface PageResponse<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  orders: PageOrder[];
  optimizeCountSql: boolean;
  searchCount: boolean;
  optimizeJoinOfCountSql: boolean;
  maxLimit: number;
  countId: string;
  pages: number;
}

// 标准备案列表请求参数
export interface FilingListParams {
  current?: number;
  size?: number;
  careerStandardFileNameLike?: string; // 标准名称模糊查询
  careerId?: number; // 职业领域ID
  auditStatus?: number; // 审核状态
  currentAuditStage?: number; // 当前审核阶段
}

// 标准目录列表请求参数
export interface DirectoryListParams {
  current?: number;
  size?: number;
  careerStandardFileNameLike?: string; // 标准名称模糊查询
  careerId?: number; // 职业领域ID
  publishDate?: string; // 发布日期
}

// 备案操作参数
export interface FilingSubmitParams {
  careerStandardId: number;
  filingNumber?: string;
  filingDate?: string;
}

// 发布操作参数
export interface PublishParams {
  careerStandardId: number;
  publishDate?: string;
}
