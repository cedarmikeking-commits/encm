import { http } from "../http"
/**
 * 国际职业教育课程框架概览接口
 * */

/** 国际职业教育课程框架概览-列表 */
export const list = (): Promise<any> => {
    return http.get('/blade-course/courseSystemLevel/list');
}
/** 国际职业教育课程框架概览-查能力详情 */
export const getAbilityLevelList = (params: {levelId: number}): Promise<any> => {
    return http.get('/blade-course/courseSystemLevel/getAbilityLevelList',params);
}

/** 国际职业教育课程框架概览-保存 */
export const save = (params: any): Promise<any> => {
    return http.post('/blade-course/courseSystemLevel/save',params);
}

/** 国际职业教育课程框架概览-发布 */
export const publish = (params: {id: number,status: number}): Promise<any> => {
    return http.postParams('/blade-course/courseSystemLevel/publish',params);
}
/** 国际职业教育课程框架概览-已发布列表 */
export const publishedList = (): Promise<any> => {
    return http.get('/blade-course/courseSystemLevel/publishedList');
}

/** 职业领域分级课程框架设计接口 */
/** 职业领域分级课程框架设计-获取用户对应的所有职业领域状态 */
export const getCareerStatus = (params: any): Promise<any> => {
    return http.get('/blade-course/courseCareerSystemLevel/getCareerStatus', params);
}
/** 职业领域分级课程框架设计-职业领域水平等级-列表 */
export const getCareerSystemLevelList = (params: {careerId: number,levelId?: number}): Promise<any> => {
    return http.get('/blade-course/courseCareerSystemLevel/getCareerSystemLevelList', params);
}
/** 职业领域分级课程框架设计-保存 */
export const careerSystemLevelSave = (params: any): Promise<any> => {
    return http.post('/blade-course/courseCareerSystemLevel/save',params);
}
/** 职业领域分级课程框架设计-删除课程 */
export const deleteCourse = (params: {courseId:number}): Promise<any> => {
    return http.postParams('/blade-course/courseCareerSystemLevel/deleteCourse',params);
}
/** 职业领域分级课程框架设计-发布 */
export const careerSystemLevelPublish = (params: any): Promise<any> => {
    return http.post('/blade-course/courseCareerSystemLevel/publish',params);
}
/** 职业领域分级课程框架设计-取消发布 */
export const careerSystemLevelUnPublish = (params: {careerSystemLevelId:number}): Promise<any> => {
    return http.postParams('/blade-course/courseCareerSystemLevel/unPublish',params);
}

