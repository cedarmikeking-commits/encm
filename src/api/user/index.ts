import { http } from '../http';

import type { ModuleType } from '../application/type';
import type { PageParams, ResPage } from '../type';
import type { LoginParams, UserRecord, UserSearchParams } from './type';

/**
 * 密码登录
 * @param params
 * @returns
 */
export const loginByPassword = (
  params: LoginParams
): Promise<{ access_token: string; refresh_token: string; real_name: string }> => {
  const query = `grant_type=password&tenant_id=000000&username=${params.username}&password=${params.password}`;
  return http.post(`/blade-auth/oauth/token?${query}`);
};

/**
 * 用户分页查询
 * @param params
 * @returns
 *
 */
export const queryUserPage = (
  params: UserSearchParams & PageParams
): Promise<ResPage<UserRecord>> => http.get('/blade-system/user/szxy/userPage', params);

/**
 * 重置用户密码
 * @param params
 * @returns
 */
export const resetUserPassword = (params: {
  id: string;
  newPassword: string;
  newpassword1: string;
}): Promise<void> => http.post('/blade-system/user/reset-password', params);

/**
 * 启停用用户
 * @param id
 * @param status
 * @returns
 */
export const toggleUserStatus = (id: string, status: number): Promise<void> =>
  http.post('/blade-system/user/szxy/userDisableAndEnable', { id, status });

/**
 * 用户统计
 * @returns
 */
export const getUserStatistics = (): Promise<{
  totalName: number;
  orgName: number;
  learnerName: number;
  otherName: number;
}> => http.get('/blade-system/user/szxy/userStatistics');

/**
 * 获取用户信息和权限菜单
 * @returns
 */
export const getUserInfoAndMenu = (params: {
  clientId: string;
}): Promise<{ user: UserRecord; moduleList: ModuleType[] }> =>
 http.get('/blade-system/client/szxy/enter', params)
