import { http } from '../http';
import type {
  IndustryCategory,
  AuditDetailRecord,
  PageResponse,
  ExpertCommitteeReviewStatistics,
  CareerStandardVO,
} from './type.d';

// 审议列表查询参数
export interface AuditListParams {
  keyword?: string;  // 标准名称
  careerId?: number;  // 职业领域ID
  auditDateBegin?: string;  // 审核时间 - 开始
  auditDateEnd?: string;  // 审核时间 - 结束
  careerIds?: string;  // 用户所拥有的职业领域ids，逗号分割的字符串
  current?: number;  // 当前页
  size?: number;  // 每页的数量
}

// 获取行业分类
export const getIndustryCategories = (level?: number) => {
  return http.get<IndustryCategory[]>('/industry-categories', { level });
};

// 获取专家委员会审议统计数据
export const getExpertCommitteeReviewStatistics = () => {
  return http.get<ExpertCommitteeReviewStatistics>(
    '/blade-career/career/careerstandard/expertCommitteeReviewStatistics'
  );
};

// 获取待审议标准列表（使用后端实际接口）
export const getPendingStandards = (params?: AuditListParams) => {
  return http.get<PageResponse<AuditDetailRecord>>(
    '/blade-career/career/careerstandard/pageByDiscussion',
    {
      current: 1,
      size: 10,
      ...params,
    }
  );
};

// 获取标准审议记录（使用后端分页接口）
export const getStandardAudits = (params?: AuditListParams) => {
  return http.get<PageResponse<AuditDetailRecord>>(
    '/blade-career/career/careerStandardAuditDetail/pageByDiscussion',
    params
  );
}

// 获取内部审查记录（使用后端分页接口）
export const getInternalReviews = (params?: AuditListParams) => {
  return http.get<PageResponse<AuditDetailRecord>>(
    '/blade-career/career/careerStandardAuditDetail/pageByInternal',
    {
      current: 1,
      size: 10,
      ...params,
    }
  );
};

// 获取职业领域标准详情
export const getCareerStandardDetail = (id: number | string) => {
  return http.get<CareerStandardVO>(`/blade-career/career/careerstandard/detail/${id}`);
};

// 提交审核意见（专业委员会审议）
export interface SubmitAuditRequest {
  careerStandardId: number;              // 职业领域标准ID
  auditStage: number;                    // 审核环节：1内审;2行业专家审核;3专业委员会审议
  auditStatus: number;                   // 审核状态：2审核通过;3审核未通过
  auditUserName: string;                 // 审核人姓名
  auditUserTitle?: string;               // 审核人职称
  auditUserInstitution?: string;         // 审核人所在单位
  auditReason: string;                   // 审核意见
  auditScope: string;                    // 审核打分 JSON字符串
  suggestion?: string;                   // 修改建议 JSON字符串
}

export const submitCareerStandardAudit = (data: SubmitAuditRequest) => {
  return http.post('/blade-career/career/careerstandard/audit', data);
};
