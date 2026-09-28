import { http } from '../http';
import type {
  CareerStandardVO,
  PageResponse,
  FilingListParams,
  DirectoryListParams,
} from './type';

// 导出类型供组件使用
export type {
  CareerStandardVO,
  PageResponse,
  FilingListParams,
  DirectoryListParams,
  FilingSubmitParams,
  PublishParams,
  AuditDetail,
  ReviseDetail,
  StandardTerm,
} from './type';

/**
 * 获取标准备案列表
 * @param params 查询参数
 */
export function getFilingList(params: FilingListParams) {
  return http.get<PageResponse<CareerStandardVO>>(
    '/blade-career/career/careerstandard/pageByFiling',
    params
  );
}

/**
 * 获取标准目录列表（已发布的标准）
 * @param params 查询参数
 */
export function getDirectoryList(params: DirectoryListParams) {
  return http.get<PageResponse<CareerStandardVO>>(
    '/blade-career/career/careerstandard/pageByPublish',
    params
  );
}

/**
 * 获取标准详情
 * @param id 标准ID
 */
export function getStandardDetail(id: number | string) {
  return http.get<CareerStandardVO>(
    `/blade-career/career/careerstandard/detail/${id}`
  );
}

/**
 * 提交备案
 * @param params 备案参数
 */
export function submitFiling(id: string) {
  return http.patch<void>(
    `/blade-career/career/careerstandard/filing/${id}`,
  );
}
/**
 * 取消备案
 * @param id 标准ID
 */
export function cancelFiling(id: number | string) {
  return http.patch<void>(
    `/blade-career/career/careerstandard/unfiling/${id}`
  );
}

/**
 * 发布标准到目录
 * @param params 发布参数
 */
export function publishStandard(id: string) {
  return http.patch<void>(
    `/blade-career/career/careerstandard/publish/${id}`
  );
}

/**
 * 取消发布标准
 * @param id 标准ID
 */
export function unpublishStandard(id: number | string) {
  return http.patch<void>(
    `/blade-career/career/careerstandard/unpublish/${id}`
  );
}


/**
 * 获取标准备案统计数据
 */
export function getFilingStatistics() {
  return http.get<{
    readyForFilingNum: number;
    filedNum: number;
    publishedNum: number;
    awaitingPublishNum: number;
  }>('/blade-career/career/careerstandard/filingAndPublishStatistics');
}


/**
 * 详情
 */
export function getStandardFullDetail(id: number | string) {
  return http.get<CareerStandardVO>(
    `/blade-career/career/careerstandard/detail/${id}`
  );
}
