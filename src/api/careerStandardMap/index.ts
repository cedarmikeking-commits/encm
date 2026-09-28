import { http } from "../http"

// 职业领域标准映射-----------------------------------------
/**
 * 
 * @returns 查询映射表列表
 */
export const getStandardMappingList = (params?: { standardId: number }): Promise<any> => {
    return http.get('/blade-system/tybz/mappingStandard/getStandardMappingList', params);
}

// 领域标准-构建映射-----------------------------------------

/**
 * 
 * @returns 查询映射文档列表
 */
export const getCareerStandardMapList = (params?: { status?: number | null, keyword?: string | null, careerId?: string | null }): Promise<any> => {
    return http.get('/blade-career/career/CareerStandardMap/list?keyword', params);
}

/**
 * 
 * @returns 根据职业领域Id查映射文档
 */
export const getCareerStandardMapByCareerId = (params?: { careerId: number }): Promise<any> => {
    return http.get('/blade-career/career/CareerStandardMap/getByCareerId', params);
}

/**
 * 
 * @returns 查询详情
 */
export const getCareerStandardMapDetail = (params?: { mapId: string }): Promise<any> => {
    return http.get('/blade-career/career/CareerStandardMap/detail', params);
}


/**
 * 
 * @returns 提交
 */
export const publishCareerStandardMap = (params?: { mapId: string }): Promise<any> => {
    return http.postParams('/blade-career/career/CareerStandardMap/publish', params);
}


/**
 * 
 * @returns 逻辑删除
 */
export const removeCareerStandardMap = (params?: { ids: string }): Promise<any> => {
    return http.postParams('/blade-career/career/CareerStandardMap/remove', params);
}

/**
 * 
 * @returns 新增或修改
 */
export const saveOrUpdateCareerStandardMap = (params?: any): Promise<any> => {
    return http.post('/blade-career/career/CareerStandardMap/saveOrUpdate', params);
}
