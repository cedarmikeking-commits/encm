//等级水平
export type Level = {
    id: number;
    createUser: string;
    createDept: string;
    createTime: string;
    updateUser: string;
    updateTime: string;
    status: number;
    isDeleted: number;
    tenantId: string;
    levelName: string;
    levelCode: string;
    standardId: string;
    isced: string;
    wrl: string;
    version: string;
    levelColor: string;
    request: string;
    edutype: string;
    remark: string;
    publishDate?: string;

}
export type UpdateLevel = {
    id: number;
    levelName: string;
    levelCode: string;
    standardId: string;
    isced: string;
    wrl: string;
    version: string;
    levelColor: string;
    request: string;
    edutype: string;
    remark: string;
}
export type AddLevel = {
    levelName: string;
    levelCode: string;
    standardId: string;
    isced: string;
    wrl: string;
    version: string;
    levelColor: string;
    request: string;
    edutype: string;
    remark: string;
}

export type LevelStatistics = {
    totalNum: number,
    publishNum: number,
    draftNum: number,
    archiveNum: number
}
export type Standard = {
    id: string;
    standardName: string;
    standardVersion: number;
    isCurrent: number;
    abilityGradeStatus: number;
    abilityLevelStatus: number;
    publishDate: string;
    remark: string;
}

// ----------------------------------------

// 目标分类

export type AbilityStatistics = {
    totalNum: string;
    oneNum: string;
    twoNum: string;
    threeNum: string;
    fourNum: string;
    publishNum: string;
    draftNum: string;
}
export type Ability = {
    id: number;
    abilityCode: string;
    abilityName: string;
    abilityEname: string;
    abilityAbbr: string;
    abilityColor: string;
    parentAbilityid: number;
    standardId: number;
    depth: number;
    orderNo: number;
    remark: string;
    abilityConcept: string;
    status: number;
    children: Ability[];
}

export type UpdateAbility = {
    id: number;
    abilityCode: string;
    abilityName: string;
    abilityEname: string;
    abilityAbbr: string;
    abilityColor: string;
    parentAbilityid: number;
    standardId: number;
    orderNo: number;
    remark: string;
}
export type AddAbility = {
    abilityCode: string;
    abilityName: string;
    abilityEname: string;
    abilityAbbr: string;
    abilityColor: string;
    parentAbilityid: number;
    standardId: number;
    orderNo: number;
    remark: string;
    abilityConcept: string,
}

export type addingParentInfo = {
    abilityCode: string;
    abilityName: string;
    id: number;
}

// ----------------------------------------
//分级标准
/**
 * 分级标准-统计数据结构
 */
export type StandardGradingStatistics = {
    oneNum: number,
    twoNum: number,
    threeNum: number,
    levelNum: number
}

/**
 * 标准版本信息
 */
export type StandardVersion = {
    id: string;
    standardName: string;
    standardVersion: string;
    isCurrent: number;
    abilityGradeStatus: number;
    abilityLevelStatus: number;
    publishDate: string;
    remark: string;
    status: number;
}


// ---------------通用标准-标准库-------------------------
export type StandardDataItems = {
    id: number;
    standardName: string;
    standardVersion: string;
    isCurrent: number;
    abilityGradeStatus: number;
    abilityLevelStatus: number;
    publishDate: string;
    remark: string;
    status: number;
    levelPublishStatus: number,
    abilityPublishStatus: number
}

export type StandardAction = {
    key: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    isSubmitted?: boolean;
    levelPublishStatus?: number,
    abilityPublishStatus?: number
}

// ----------------------------------------
//映射表
export type MappingStandardStatistics = {
    oneNum: number,
    twoNum: number,
    threeNum: number,
    levelNum: number;
}

export type PageView = {
    editMode: string | 'Manage' | 'View' | 'Edit' | 'Create' | 'Delete' | 'Audit' | 'Publish',
    currentDataModel: any
}

export type CareerOption = {
    label: string;
    value: number;
}