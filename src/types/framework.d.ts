import { Course } from './course';
import { careerTree } from '@/hooks/useCareerTree';

/** 国际职业教育课程框架_水平等级 */
export interface CourseSystemLevel {
  id: number;
  careerId: number;
  levelId: number;
  levelName: string;
  courseNum: number;
  totalCourseCredit: number;
  totalCourseHour: number;
  status: number;
  /** 课程能力维度列表 */
  abilityList: CourseSystemAbility[];
  /** 对应领域的审核状态 */
  auditStatus: number;
  /** 职业领域水平等级id，用于取消发布 */
  careerSystemLevelId?:number;
}

export interface CourseSystemAbility {
  //标识一下，不入库，取的时候赋值，方便前端操作
  key:number;
  inKey:number;
  id: number;
  levelId: number;
  /** 是否需要合并，潜规则：合并的肯定是领域课 */
  oneMergeFlag: boolean;
  abilityOneName: string;
  abilityOneCode: string;
  abilityOneId: number;
  abilityTwoName: string;
  abilityTwoCode: string;
  /** 能力维度id */
  abilityId: number;
  twoCareerCourseFlag: boolean;
  courseNum: number;
  courseCredit: number;
  courseHour: number;
  /** 课程列表 */
  courseList: Course[];
  /** 课程类别 行合并数 */
  rowSpan_1:number;
  /** 目标维度 行合并数 */
  rowSpan_2:number;
  /** 数量	参考学分	参考学时 行合并数 */
  rowSpan_3:number;

}
//业务状态;0未配置;1配置中;2已发布
export type IndustryConfigStatus = 0 | 1 | 2;

export interface IndustryCategory extends careerTree {
  configStatus: IndustryConfigStatus;
  parentName: string;
  grandparentName: string;
};

