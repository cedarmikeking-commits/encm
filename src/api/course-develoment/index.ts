import { http } from "../http"
/**
 * 
 * @returns 课程内容开发-查询章节树
 */
export const getSectionTree = (params?: { courseId: string }): Promise<any> => {
    return http.get('/blade-course/course/getSectionTree', params);
}

/**
 * 课程内容开发-查询资源分页-定位：课程，已发布，已入库
 * @param params 
 * @returns 
 */
export const getCourseResourcePage = (params?: { courseId: string, keyword?: string, resourceType?: number, status?: number, isStorage?: number, current: number, size: number }): Promise<any> => {
    return http.get('/blade-course/course/getCourseResourcePage', params);
}


/**
 * 课程内容开发-新增章节或者知识点
 * @param params
 * @returns
 * 
 */
export const addSection = (params: any): Promise<[]> => {
    return http.post('/blade-course/course/addSection', params)
}

/**
 * 课程内容开发-修改章节或者知识点
 * @param params
 * @returns
 * 
 */
export const updateSection = (params: any): Promise<[]> => {
    return http.post('/blade-course/course/updateSection', params)
}

/**
 * 课程内容开发-章节知识点-删除章节或知识点
 * @param params
 * @returns
 * 
 */
export const contentRemove = (params: { id: string }): Promise<[]> => {
    return http.postParams('/blade-course/course/contentRemove', params)
}


/**
 * 课程内容开发-资源入库
 * @param params
 * @returns
 * 
 */
export const resourceInStorage = (params: { courseId: string, resourceId: string }): Promise<void> => {
    return http.postParams('/blade-course/course/resourceInStorage', params)
}
/**
 * 课程内容开发-移除资源-只删除章节资源关系
 * @param params
 * @returns
 * 
 */
export const removeSectionResource = (params: { courseId: string, sectionId: string, resourceId: any }): Promise<void> => {
    return http.postParams('/blade-course/course/removeSectionResource', params)
}

/**
 * 课程内容开发-设置课程目标
 * @param params
 * @returns
 * 
 */
export const setCourseTarget = (params: any): Promise<[]> => {
    return http.post('/blade-course/course/setCourseTarget', params)
}
/**
 * 课程内容开发-发布课程内容-带章节发布
 * @param params
 * @returns
 * 
 */
export const publishCourseContent = (params: { courseId: string, status: number }): Promise<void> => {
    return http.postParams('/blade-course/course/publishCourseContent', params)
}
/**
 * 课程内容开发-发布课程内容-带章节发布
 * @param params
 * @returns
 * 
 */
export const contentCopy = (params: { id: any }): Promise<void> => {
    return http.postParams('/blade-course/course/contentCopy', params)
}