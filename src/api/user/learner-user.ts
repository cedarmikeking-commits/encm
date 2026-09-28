import { http } from '../http';

import type { PageParams, ResPage } from '../type';
import type { LearnerUser, OrganizationType, OrgUser, UserSearchParams } from './type';

/**
 * 用户分页查询
 * @param params
 * @returns
 *
 */
export const queryUserPage = (
  params: UserSearchParams & PageParams
): Promise<ResPage<LearnerUser>> => http.get('/blade-system/user/szxy/learningUserPage', params);

/**
 * 用户统计
 * @returns
 */
export const getUserStatistics = (): Promise<{
  totalApplyNum: number;
  pendingName: number;
  passedName: number;
  unPassedName: number;
}> => http.get('/blade-system/user/szxy/learningUserStatistics');

/**
 * 获取所属组织树
 * @returns
 */
export const getOrganizationTree = (): Promise<OrganizationType[]> =>
  http.get('/blade-system/dept/szxy/organizationTree');

/**
 * 用户详情
 * @param id
 * @returns
 */
export const getLearnerUserDetail = (id: string): Promise<LearnerUser> =>
  http.get(`/blade-system/user/szxy/learningUserDetail`, { id });

/**
 * 新增学习用户
 * @param params
 * @returns
 */
export const addUser = (params: Partial<OrgUser> & { password: string }): Promise<void> =>
  http.post('/blade-system/user/szxy/learningUserSubmit', params);

/**
 * 编辑学习用户
 * @param params
 * @returns
 */
export const editUser = (params: Partial<LearnerUser>): Promise<void> =>
  http.post('/blade-system/user/szxy/learningUserUpdate', params);

/**
 * 审核学习用户
 */
export const auditUser = (params: {
  id: string;
  auditStatus: string;
  reasonRefuse?: string;
}): Promise<void> => http.post('/blade-system/user/szxy/learningUserAudit', params);

/**
 * 撤销用户审核
 */

export const revoke = (params: { id: string }): Promise<void> =>
  http.post('/blade-system/user/szxy/learningUserRevocation', params);
