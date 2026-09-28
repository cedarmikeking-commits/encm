import { http } from "../http"

// --------------- 职业领域标准-撰写标准 -------------------
/**
 * 
 * @returns --查询最近的草稿状态的职业领域标准
 */
export const getLastUnSubmitDetail = (params?: { standardId: string | null }): Promise<any> => {
    return http.get('/blade-career/career/careerstandard/getLastUnSubmitDetail', params);
}


/**
 * 
 * @returns 撰写-新增
 */
export const saveCareerstandard = (params: any): Promise<any> => {
    return http.post('/blade-career/career/careerstandard/save', params);
}
/**
 * 
 * @returns 撰写-修改
 */
export const updateCareerstandard = (params: any): Promise<any> => {
    return http.post('/blade-career/career/careerstandard/update', params);
}

/**
 * 
 * @returns 撰写-提交
 */
export const submitCareerstandard = (params: any): Promise<any> => {
    return http.postParams('/blade-career/career/careerstandard/submit', params);
}

/**
 * 
 * @returns 撰写-审核
 */
export const auditCareerstandard = (params: any): Promise<any> => {
    return http.postParams('/blade-career/career/careerstandard/audit', params);
}
/**
 * 
 * @returns 标准修订-详情
 */
export const getCareerStandardRevise = (params: { careerStandardId: string }): Promise<any> => {
    return http.get('/blade-career/career/careerStandardRevise/detail', params);
}
/**
 * 
 * @returns 标准修订-保存或更新
 */
export const saveOrUpdateCareerStandardRevise = (params: any): Promise<any> => {
    return http.post('/blade-career/career/careerStandardRevise/saveOrUpdate', params);
}
/**
 * 
 * @returns 标准修订-提交
 */
export const submitCareerStandardRevise = (params: {reviseId:string}): Promise<any> => {
    return http.postParams('/blade-career/career/careerStandardRevise/submit', params);
}