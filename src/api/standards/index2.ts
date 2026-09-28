
// 检索目录----------------------------------------

import { http } from "../http";

/**
 * @param params
 * @returns 检索目录-统计
 */
export const getCareerStandardStatistics = (params: { careerIds?: string, standardId?: string }): Promise<any> => {
    return http.get('/blade-career/career/careerstandard/getCareerStandardStatistics', params);
}


/**
 * 
 * @returns 检索目录-分页
 */
export const getCareerstandardList = (params: any): Promise<any> => {
    return http.get('/blade-career/career/careerstandard/list', params);
}

/**
 * 获取上传的资源文件
 * @param params
 * @returns
 * 
 */
export const postResourceGetBylds = (params: any): Promise<[]> => {
    return http.post('/blade-resource/resource/resourceFile/resourceGetByIds', params)
}


/**
 * 
 * @returns 职业领域标准-审查标准-内部审查-审核分页
 */
export const getPageByInternal = (params: any): Promise<any> => {
    return http.get('/blade-career/career/careerstandard/pageByInternal', params);
}

/**
 * 
 * @returns 职业领域标准-审查标准-行业专家审查-审核分页
 */
export const getPageByIndustry = (params: any): Promise<any> => {
    return http.get('/blade-career/career/careerstandard/pageByIndustry', params);
}

/**
 * 
 * @returns 职业领域标准-标准审议-委员会审查-审核分页
 */
export const getPageByDiscussion = (params: any): Promise<any> => {
    return http.get('/blade-career/career/careerstandard/pageByDiscussion', params);
}


/**
 * 
 * @returns 详情
 */
export const getCareerstandardDetail = (params: any): Promise<any> => {
    return http.get(`/blade-career/career/careerstandard/detail/${params.id}`);
}

/**
 * 
 * @returns 职业领域标准-标准审查-审核
 */
export const getCareerstandardAudit = (params: any): Promise<any> => {
    return http.post(`/blade-career/career/careerstandard/audit/`, params);
}

/**
 * 
 * @returns 标准审查-内部审查-统计
 */
export const getInternalAuditStatistics = (params: any): Promise<any> => {
    return http.get(`/blade-career/career/careerstandard/internalAuditStatistics`, params);
}


/**
 * 
 * @returns 标准审查-行业专家审查-统计
 */
export const getExpertReviewStatistics = (params: any): Promise<any> => {
    return http.get(`/blade-career/career/careerstandard/expertReviewStatistics`, params);
}

/**
 * 
 * @returns 标准审议-专家委员会-统计
 */
export const getExpertCommitteeReviewStatistics = (params: any): Promise<any> => {
    return http.get(`/blade-career/career/careerstandard/expertCommitteeReviewStatistics`, params);
}

/**
 * 
 * @returns 职业领域标准-审查标准-审查记录-内部审查记录
 */
export const getcareerStandardAuditDetailPageByInternal = (params: any): Promise<any> => {
    return http.get(`/blade-career/career/careerStandardAuditDetail/pageByInternal`, params);
}

/**
 * 
 * @returns 职业领域标准-审查标准-审查记录-行业专家审查记录
 */
export const getcareerStandardAuditDetailPageByIndustry = (params: any): Promise<any> => {
    return http.get(`/blade-career/career/careerStandardAuditDetail/pageByIndustry`, params);
}

/**
 * 
 * @returns 职业领域标准-标准审议-标准审议记录
 */
export const getPageByAuditDetailDiscussion = (params: any): Promise<any> => {
    return http.get('/blade-career/career/careerStandardAuditDetail/pageByDiscussion', params);
}



/**
 * 
 * @returns 职业领域标准-修订-分页
 */
export const getCareerStandardReviseList = (params: any): Promise<any> => {
    return http.get('/blade-career/career/careerStandardRevise/list', params);
}

/**
 * 
 * @returns 职业领域标准-修订-详情【列表点修改和编辑都调用这个接口】
 */
export const getCareerStandardReviseDetail = (params: any): Promise<any> => {
    return http.get('/blade-career/career/careerStandardRevise/detail', params);
}

/**
 * 
 * @returns 职业领域标准-修订-保存或修改
 */
export const getCareerStandardReviseSaveOrUpdate = (params: any): Promise<any> => {
    return http.post('/blade-career/career/careerStandardRevise/saveOrUpdate', params);
}

/**
 * 
 * @returns 职业领域标准-修订-提交内审
 */
export const getCareerStandardReviseSubmit = (params: any): Promise<any> => {
    return http.post('/blade-career/career/careerStandardRevise/submit', params);
}

/**
 * 
 * @returns 职业领域标准-修订-修订记录分页查询
 */
export const getCareerStandardReviseReviseList = (params: any): Promise<any> => {
    return http.get('/blade-career/career/careerStandardRevise/reviseList', params);
}

/**
 * 
 * @returns 职业领域标准-修订-统计
 */
export const getCareerStandardReviseRevisegetReviseStatistics = (params: any): Promise<any> => {
    return http.get('/blade-career/career/careerStandardRevise/getReviseStatistics', params);
}