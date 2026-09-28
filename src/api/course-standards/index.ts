import { http } from "../http"

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
 * @returns 研制课程标准-查询标准课列表
 */
export const getStandardCoursePage = (params?: any): Promise<any> => {
    return http.get('/blade-course/courseStandard/getStandardCoursePage', params);
}
/**
 *
 * @returns 研制课程标准-等级水平列表
 */
export const getLevelList = (): Promise<any> => {
    return http.get('/blade-course/courseStandard/getLevelList');
}
/**
 *
 * @returns 研制课程标准-标准课能力树
 */
export const getAbilityTree = (): Promise<any> => {
    return http.get('/blade-course/courseStandard/getAbilityTree');
}

/**
 *
 * @returns 研制课程标准-查询领域课-行动能力对应列表
 */
export const getOneAbilityCareerCoursePage = (params?: any): Promise<any> => {
    return http.get('/blade-course//courseStandard/getOneAbilityCareerCoursePage', params);
}
/**
 *
 * @returns 研制课程标准-查询领域课-专业能力对应列表
 */
export const getTwoAbilityCareerCoursePage = (params?: any): Promise<any> => {
    return http.get('/blade-course/courseStandard/getTwoAbilityCareerCoursePage', params);
}
/**
 *
 * @returns 研制课程标准-标准课程新增或修改【标准课程】
 */
export const saveOrUpdate = (params: any): Promise<any> => {
    return http.post('/blade-course/courseStandard/saveOrUpdate', params);
}


/**
 * 研制课程标准-发布或者取消发布【标准课程】
 * @param params
 * @returns
 *
 */
export const publishCourse = (params: { id: any, status: number }): Promise<void> => {
    return http.postParams('/blade-course/courseStandard/publishCourse', params)
}

/**
 * 研制课程标准-删除【标准课程】
 * @param params
 * @returns
 *
 */
export const postRemove = (params: { id: string }): Promise<void> => {
    return http.postParams('/blade-course/courseStandard/remove', params)
}

/**
 * 研制课程标准-设置课标【领域课程】
 * @param params
 * @returns
 *
 */
export const setCourseStandardAttach = (params: { id: string, attachId: string }): Promise<void> => {
    return http.postParams('/blade-course/courseStandard/setCourseStandardAttach', params)
}


/**
 * 研制课程标准-删除【标准课程】
 * @param params
 * @returns
 *
 */
export const setCourseAudit = (params: { id: string, auditStatus: string }): Promise<void> => {
    return http.postParams('/blade-course/courseStandard/setCourseAudit', params)
}


/** 查询可设置的课程负责人分页列表 */
export const getCourseManageUserPage = (params?: any): Promise<any> => {
    return http.get('/blade-system/user/szxy/getCourseManageUserPage', params);
}

/** 设置课程负责人 */
export const setCourseManageUser = (params: {id:string,userId:string}): Promise<any> => {
    return http.postParams('/blade-course/courseStandard/setCourseManageUser', params);
}

/** 获取课程负责人 */
export const getCourseManageUser = (params: {id:string}): Promise<any> => {
    return http.get('/blade-course/courseStandard/getCourseManageUser', params);
}
/** 删除课程负责人 */
export const removeCourseUser = (params: {id:string,userId:string}): Promise<any> => {
    return http.postParams('/blade-course/courseStandard/removeCourseUser', params);
}

/** 检测是否已经是别的课程的负责人 */
export const checkCourseManageUser = (params: {id:string,userId:string}): Promise<any> => {
    return http.get('/blade-course/courseStandard/checkCourseManageUser', params);
}
