import { http } from "../http"
import { Level, LevelStatistics, Standard, UpdateLevel, AddLevel, Ability, AbilityStatistics, UpdateAbility, AddAbility, StandardGradingStatistics, StandardVersion, MappingStandardStatistics, StandardDataItems } from "./type"

// 职业领域接口
export interface Career {
  id: string;
  careerName: string;
  careerCode: string;
  industryName: string;
}

// 映射表----------------------------------------
/**
 *
 * @returns -映射表-统计
 */
export const getMappingStandardStatistics = (): Promise<MappingStandardStatistics> => {
    return http.get('/blade-system/tybz/mappingStandard/getStatistics');
}
/**
 *
 * @returns 查询映射表列表
 */
export const getStandardMappingList = (params?: { standardId: number }): Promise<any> => {
    return http.get('/blade-system/tybz/mappingStandard/getStandardMappingList', params);
}

/**
 *
 * @returns 映射表发布与取消
 */
export const postMappingStandardPublish = (params: { status: number }): Promise<any> => {
    return http.postParams('/blade-system/tybz/mappingStandard/publish', params);
}
/**
 *
 * @returns 映射表保存
 */
export const saveStandardMapping = (params: any): Promise<any> => {
    return http.post('/blade-system/tybz/mappingStandard/saveStandardMapping', params);
}

// 职业教育标准----------------------------------------
/**
 * 等级水平查询列表

 * @returns
 *
 */
export const getLevelList = (): Promise<Level[]> => {
    return http.get('/blade-system/tybz/level/list');
}

/**
 * 统计

 * @returns
 *
 */
export const getLevelStatistics = (): Promise<LevelStatistics> => {
    return http.get('/blade-system/tybz/level/levelStatistics');
}

/**
 * 修改
 * @param params
 * @returns
 *
 */
export const updateLevelInfo = (params: UpdateLevel): Promise<void> => {
    return http.post('/blade-system/tybz/level/update', params)
}

/**
 * 新增
 * @param params
 * @returns
 *
 */
export const addLevelInfo = (params: AddLevel): Promise<void> => {
    return http.post('/blade-system/tybz/level/save', params)
}

/**
 * 职业标准列表

 * @returns
 *
 */
export const getStandardList = (): Promise<Standard[]> => {
    return http.get('/blade-system/tybz/standard/list')
}

/**
 * 发布和取消发布
 * @param params
 * @returns
 *
 */
export const postPublish = (params: { id: number, status: number }): Promise<void> => {
    return http.postParams('/blade-system/tybz/level/publish', params)
}

/**
 * 删除
 * @param params
 * @returns
 *
 */
export const postRemove = (params: { ids: string }): Promise<void> => {
    return http.postParams('/blade-system/tybz/level/remove', params)
}



// ---------------------------------------------------------//

// 目标分类

/**
 * 能力维度树的列表

 * @returns
 *
 */
export const getAbilityList = (): Promise<Ability[]> => {
    return http.get('/blade-system//tybz/ability/list');
}

/**
 * 统计

 * @returns
 *
 */
export const getAbilityStatistics = (): Promise<AbilityStatistics> => {
    return http.get('/blade-system/tybz/ability/abilityStatistics');
}

/**
 * 修改
 * @param params
 * @returns
 *
 */
export const updateAbilityInfo = (params: UpdateAbility): Promise<void> => {
    return http.post('/blade-system/tybz/ability/update', params)
}

/**
 * 新增
 * @param params
 * @returns
 *
 */
export const addAbilityInfo = (params: AddAbility): Promise<void> => {
    return http.post('/blade-system/tybz/ability/save', params)
}

/**
 * 删除
 * @param params
 * @returns
 *
 */
export const postAbilityRemove = (params: { ids: string }): Promise<void> => {
    return http.postParams('/blade-system/tybz/ability/remove', params)
}

/**
 * 发布和取消发布
 * @param params
 * @returns
 *
 */
export const postAbilityPublish = (params: { ids: string, status: number }): Promise<void> => {
    return http.postParams('/blade-system/tybz/ability/publish', params)
}





/**
 * 发布和取消发布

// 分级标准----------------------------------------
/**
 *
 * @returns 分级标准-统计
 */
export const getGradingStandardStatistics = (): Promise<StandardGradingStatistics> => {
    return http.get('/blade-system/tybz/gradingStandard/gradingStandardStatistics');
}
/**
 *
 * @returns 分级标准-标准框架查询
 */
export const getStandardLevelList = (): Promise<any> => {
    return http.get('/blade-system/tybz/gradingStandard/getStandardLevelList');
}

/**
 *
 * @returns 分级标准-能力分级查询
 */
export const getStandardAbilityList = (): Promise<any> => {
    return http.get('/blade-system/tybz/gradingStandard/getStandardAbilityList');
}
/**
 * 分级标准-发布和取消发布
 * @param params
 * @returns
 *
 */
export const postStandardPublish = (params: { id: number | null, status: number }): Promise<void> => {
    return http.postParams('/blade-system/tybz/standard/publish', params)
}

export const postGradingStandardPublish = (params: { status: number }): Promise<void> => {
    return http.postParams('/blade-system/tybz/gradingStandard/publish', params)
}


/**
 * 获取职业教育标准-当前版本详情
 *
 */
export const getStandardCurrentVersion = (): Promise<StandardVersion> => {
    return http.get('/blade-system/tybz/standard/detail');
}

// ---------------通用标准-标准库-------------------------

/**
 * 标准库查询列表

 * @returns
 *
 */
export const getStandardslList = (): Promise<StandardDataItems[]> => {
    return http.get('/blade-system/tybz/standard/list');
}

/**
 * 标准库当前版本详情

 * @returns
 *
 */
export const getStandardsDetail = (): Promise<StandardDataItems> => {
    return http.get('/blade-system/tybz/standard/detail');
}

/**
 * 获取职业领域列表
 * @returns
 */
export const getCareerList = (): Promise<Career[]> => {
    return http.get('/blade-system/hyly/career/page', { size: 100 }).then(response => response.records);
}

