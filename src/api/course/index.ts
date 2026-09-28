import { http } from "../http"
/**
 * keyword
string 
可选
键字查询：课程名称，课程代码

courseType
string 
可选
课程类型：1标准课程；2领域课程

courseStatus
integer 
可选
发布状态：1发布;0未发布

abilityId
integer <int64>
可选
领域课程查询: 能力维度Id

levelId
integer <int64>
可选
领域课程查询: 等级Id

careerId
integer <int64>
可选
领域课程查询: 领域Id

contentStatus
integer 
可选
课程内容状态：0未开发；1草稿；2已发布

current
integer 
当前页
可选
size
integer 
每页的数量

 * @returns 课程学习资源-标准课程列表
 */
export const getStandardCourseList = (params?: any): Promise<any> => {
    return http.get('/blade-course/resource/getStandardCourseList', params);
}

/**
 * 
 * @param params 行动能力课程列表
 * @returns 
 */
export const getOneAbilityCareerCourseList = (params?: any): Promise<any> => {
    return http.get('/blade-course/resource/getOneAbilityCareerCourseList', params);
}

/**
 * 专业能力课程列表
 * @param params 
 * @returns 
 */
export const getTwoAbilityCareerCourseList = (params?: any): Promise<any> => {
    return http.get('/blade-course/resource/getTwoAbilityCareerCourseList', params);
}
/**
 * 
 * @returns 课程学习资源-课程内按资源类型统计
 */
export const getResourceTypeStatistics = (params?: { courseId: string }): Promise<any> => {
    return http.get('/blade-course/resource/getResourceTypeStatistics', params);
}

/**
 *  courseId
    integer <int64>
    课程ID
    可选
    keyword
    string 
    可选
    键字查询：资源名称或者描述

    resourceType
    string 
    资源类型：字典
    可选
    status
    integer 
    可选
    发布状态：0草稿；1已发布

    isStorage
    integer 
    可选
    是否入库：0否;1是

    current
    integer 
    当前页
    可选
    size
    integer 
    每页的数量

 * @returns 课程学习资源-查询资源分页
 */
export const getCourseResourcePage = (params?: any): Promise<any> => {
    return http.get('/blade-course/resource/getCourseResourcePage', params);
}

/**
 * 
 * @returns 课程学习资源-保存或修改资源
 */
export const saveOrUpdateResource = (params: any): Promise<any> => {
    return http.post('/blade-course/resource/saveOrUpdateResource', params);
}

/**
 * 课程学习资源-更新下载次数
 * @param params
 * @returns
 * 
 */
export const updateDownloadNum = (params: { id: any }): Promise<void> => {
    return http.postParams('/blade-course/resource/updateDownloadNum', params)
}

/**
 * 课程学习资源-删除资源
 * @param params
 * @returns
 * 
 */
export const removeResource = (params: { id: any }): Promise<void> => {
    return http.postParams('/blade-course/resource/removeResource', params)
}
