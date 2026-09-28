export interface Course {
  id?: number;
  courseCode?: string;
  courseName?: string;
  courseEname?: string;
  /** 课程类型:1统一课程(标准课程);2领域课程 */
  courseType?: string;
  levelId?: string;
  abilityId?: string;
  careerId?: number;
  courseCredit?: number;
  courseHour?: number;
  /** 开课顺序 */
  orderNo?: number;
  /** 优先级:关联数据字典 */
  coursePriority?: string;
  /** 开发类型;关联数据字典 */
  courseDevelopmentType?: string;
  /** 课程内容 */
  courseContent?: string;
  /** 课程封面id */
  courseCover?: string;
  /** 课程描述 */
  courseDescription?:string;
  /** 课程学习目标 */
  courseTarget?:string;
  /** 课程性质;数据字典 */
  courseNature?:string;
  /** 课程学习方式;数据字典 */
  courseStudyWay?:string;
  /** 评价方式;数据字典 */
  courseEvaluationMethod?:string;
  /** 授课教师 */
  courseTeacher?:string;
  /** 课程发布状态：1发布;0未发布 */
  courseStatus?:number;
  /** 课程内容发布状态：1发布;0草稿 */
  contentStatus?:number;
  /** 审核状态：0草稿;1待审核;2审核通过;3审核未通过; */
  auditStatus?:number;
  /** 最新审核人用户id */
  auditUserId?:string;
  /** 最新审核时间 */
  auditDate?:string;
  /** 审核意见 */
  auditReason?:string;
  /** 审核流水日志 */
  auditLog?:string;
  remark?:string;
}
