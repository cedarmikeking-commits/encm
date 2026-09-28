import { http } from "../http"
import { Application, ApplicationDetail, ModuleType } from "./type"

export const queryPage = (params: { [key: string]: any }): Promise<Application[]> => {
    return http.get('/blade-system/client/szxy/useList', params)
}

/**
 * 新增
 */
export const save = (data: Application & { clientSecret: string }): Promise<void> => {
    return http.post('/blade-system/client/szxy/useSave', data)
}
/**
 * 编辑
 */
export const update = (data: Application): Promise<void> => {
    return http.post('/blade-system/client/szxy/useUpdate', data)
}

/**
 * 删除应用
 * @param ids 应用ID
 * @returns 
 */
export const deleteApplication = (ids: string): Promise<void> => {
    return http.post(`/blade-system/client/szxy/useRemove`, undefined, { params: { ids } })
}

/**
 * 应用详情
 */
export const getApplicationDetail = (id: string): Promise<ApplicationDetail> => {
    return http.get(`/blade-system/client/szxy/useDetail`, { id })
}

/**
 * 添加或者更新菜单
 * @param data 
 * @returns 
 */
export const saveOrUpdateMenu = (data: ModuleType): Promise<void> => {
    return http.post('/blade-system/menu/szxy/submit', data)
}

/**
 * 删除菜单
 * @param ids 
 * @returns 
 */
export const deleteApplicationMenu = (ids: string): Promise<void> => {
    return http.post('/blade-system/menu/szxy/remove', undefined, { params: { ids } })
}