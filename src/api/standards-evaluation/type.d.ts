// 通用分页响应
export interface PageResponse<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

// 通用 API 响应
export interface ApiResponse<T> {
  code: number;
  success: boolean;
  data: T;
  msg: string;
}

// 专家委员会审议统计数据
export interface ExpertCommitteeReviewStatistics {
  pendingReviewTotalNum: number;  // 待审议总数
  pendingReviewNum: number;       // 待审议
  reviewPassNum: number;          // 已通过
  reviewNoPassNum: number;        // 未通过
}

// 审议详情记录（后端实际返回的结构）
export interface AuditDetailRecord {
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
  auditStage: number;  // 审核阶段
  auditStatus: number;  // 审核状态
  auditUserId: number;
  auditUserName: string;
  auditUserTitle: string;
  auditUserInstitution: string;
  auditDate: string;
  auditScope: string;
  auditReason: string;
  suggestion: string;
  careerId?: number;
  careerName?: string;
  careerCode?: string;
  careerStandardFileName?: string;
  careerStandardFileNo?: string;
  standardVersion?: string;
}

// 职业领域标准详情 (来自 /career/careerstandard/detail/{id})
export interface CareerStandardVO {
  id?: number;
  careerStandardFileName?: string;
  careerStandardFileNo?: string;
  standardVersion?: string;
  careerId?: number;
  careerName?: string;
  careerCode?: string;
  industryId?: number;
  industryName?: string;
  industryCode?: string;
  standardId?: number;
  standardName?: string;
  careerStandardMapId?: number;
  careerStandardMapName?: string;

  // 文档内容字段
  preface?: string;              // 引言
  corePurpose?: string;          // 核心目的
  scope?: string;                // 适用范围说明
  overview?: string;             // 总述
  appendixAttach?: string;       // 附录附件

  // 术语列表
  careerStandardTermList?: CareerStandardTermVO[];

  // 审核流水
  auditDetails?: CareerStandardAuditDetailVO[];

  // 修订流水
  reviseDetails?: CareerStandardReviseVO[];

  // 状态字段
  searchStatus?: number;         // 0草稿;1待内审;2待行业专家审查;3待专业委员会审议;4已定稿;5修订中
  searchStatusTitle?: string;
  currentAuditStage?: number;    // 0未提交;1待内审;2待行业专家审核;3待专业委员会审议;4重新修订待内审
  nextAuditStage?: number;       // 1内审;2行业专家审核;3专业委员会审核
  auditStatus?: number;          // 0草稿;1审核中;2审核通过;3审核未通过
  auditReason?: string;
  auditLog?: string;
  auditDate?: string;
  auditUserId?: number;
  auditUserName?: string;

  // 修订信息
  reviseStatus?: number;         // 0未修订;1修订中
  reviseId?: number;
  reviseRemark?: string;
  reviseSource?: string;

  // 备案发布信息
  filingCode?: string;           // 备案编号
  filingDate?: string;           // 备案日期
  publishDate?: string;          // 发布日期
  isCurrent?: number;            // 是否是当前最新版本

  // 基础字段
  createUser?: number;
  createUserName?: string;
  createDept?: number;
  createTime?: string;
  updateUser?: number;
  updateTime?: string;
  status?: number;
  isDeleted?: number;
  tenantId?: string;
  remark?: string;
}

// 术语表
export interface CareerStandardTermVO {
  id?: number;
  careerStandardId?: number;
  termName?: string;             // 术语名称
  termDefinition?: string;       // 术语定义
  status?: number;
  isDeleted?: number;
  tenantId?: string;
  createUser?: number;
  createDept?: number;
  createTime?: string;
  updateUser?: number;
  updateTime?: string;
}

// 审核流水详情
export interface CareerStandardAuditDetailVO {
  id?: number;
  careerStandardId?: number;
  careerStandardFileName?: string;
  careerStandardFileNo?: string;
  standardVersion?: string;
  careerId?: number;
  careerName?: string;
  careerCode?: string;

  auditStage?: number;           // 1内审;2行业专家审核;3专业委员会审核
  auditStatus?: number;          // 1通过;2未通过
  auditUserId?: number;
  auditUserName?: string;
  auditUserTitle?: string;
  auditUserInstitution?: string;
  auditDate?: string;
  auditScope?: string;           // 审核打分 JSON字符串
  auditReason?: string;          // 审核意见
  suggestion?: string;           // 修改建议 JSON字符串

  status?: number;
  isDeleted?: number;
  tenantId?: string;
  createUser?: number;
  createDept?: number;
  createTime?: string;
  updateUser?: number;
  updateTime?: string;
}

// 修订流水
export interface CareerStandardReviseVO {
  id?: number;
  careerStandardId?: number;
  careerStandardAuditDetailId?: number;
  careerStandardFileName?: string;
  careerStandardFileNo?: string;
  standardVersion?: string;
  careerId?: number;
  careerName?: string;
  careerCode?: string;

  auditStage?: number;
  reviseUserId?: number;
  reviseUserName?: string;
  reviseRemark?: string;         // 修订说明
  oldContent?: string;           // 修订前数据
  newContent?: string;           // 修订后数据
  content?: Record<string, any>; // 修订内容
  statusTitle?: string;

  status?: number;
  isDeleted?: number;
  tenantId?: string;
  createUser?: number;
  createDept?: number;
  createTime?: string;
  updateUser?: number;
  updateTime?: string;
}

// 标准文档（保留以兼容现有代码）
export interface StandardDocument {
  id: string;
  standard_name: string;
  version: string;
  domain_id: string;
  mapping_document_id: string;
  introduction: string;
  basic_info: {
    purpose?: string;
    scope?: string;
  };
  terms_definitions: Array<{
    term: string;
    definition: string;
  }>;
  standard_content: {
    description?: string;
    ability_requirements?: Array<{
      level?: string;
      ivrl?: string;
      primary_ability?: string;
      secondary_ability?: string;
      tertiary_ability?: string;
      description?: string;
    }>;
  };
  appendix_files: Array<{
    title?: string;
    content?: string;
  }>;
  status: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpertReview {
  id: string;
  standard_document_id: string;
  expert_name: string;
  expert_title: string;
  expert_organization: string;
  review_date: string;
  review_comments: string;
  status: string;
  scientific_score?: number;
  forward_looking_score?: number;
  completeness_score?: number;
  operability_score?: number;
  comprehensive_score?: number;
  suggestions: Array<{
    section: string;
    issue: string;
    suggestion: string;
  }>;
  created_at: string;
}

export interface InternalReview {
  id: string;
  standard_document_id: string;
  reviewer_name: string;
  review_date: string;
  scientific_score: number;
  forward_looking_score: number;
  completeness_score: number;
  operability_score: number;
  overall_score: number;
  review_comments: string;
  status: string;
  created_at: string;
}

export interface MappingDocument {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface MappingRow {
  id: string;
  document_id: string;
  first_dimension: string;
  first_dimension_code?: string;
  second_dimension: string;
  second_dimension_code?: string;
  third_dimension: string;
  third_dimension_code?: string;
  concept_definition: string;
  ivrl1_description: string;
  ivrl2_description: string;
  ivrl3_description: string;
  ivrl4_description: string;
  sort_order: number;
}

export interface ProfessionalDeliberation {
  id: string;
  standard_document_id: string;
  committee_member: string;
  deliberation_comments: string;
  suggestions?: string;
  status: 'approved' | 'rejected';
  deliberation_date: string;
  created_at: string;
}

export interface IndustryCategory {
  id: string;
  name: string;
  code?: string;
  level: number;
  parent_id?: string;
  created_at: string;
}
