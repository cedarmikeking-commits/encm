import { http } from '../http';

import type { PageParams, ResPage } from '../type';
import type { OrganizationType, OrgUser, UserSearchParams } from './type';

/**
 * 用户分页查询
 * @param params
 * @returns
 *
 */
export const queryUserPage = (params: UserSearchParams & PageParams): Promise<ResPage<OrgUser>> =>
  http.get('/blade-system/user/szxy/institutionUserPage', params);

/**
 * 用户统计
 * @returns
 */
export const getUserStatistics = (): Promise<{
  totalName: number;
  maleName: number;
  enabledName: number;
  femaleName: number;
}> => http.get('/blade-system/user/szxy/institutionUserStatistics');

/**
 * 获取所属组织树
 * @returns
 */
export const getOrganizationTree = (): Promise<OrganizationType[]> =>
  http.get('/blade-system/dept/szxy/organizationTree');

/**
 * 新增组织用户
 * @param params
 * @returns
 */
export const addOrgUser = (params: Partial<OrgUser> & { password: string }): Promise<void> =>
  http.post('/blade-system/user/szxy/institutionUserSubmit', params);

/**
 * 编辑组织用户
 * @param params
 * @returns
 */
export const editOrgUser = (params: Partial<OrgUser>): Promise<void> =>
  http.post('/blade-system/user/szxy/institutionUserUpdate', params);

/**
 * 删除组织用户
 * @param ids
 * @returns
 */
export const deleteOrgUser = (ids: string[]): Promise<void> =>
  http.post('/blade-system/user/szxy/deleteInstitutionUser', { ids });
