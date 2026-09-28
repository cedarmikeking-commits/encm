export interface CourseDirectoryItem {
  id?: string;
  courseName?: string;
  courseCode?: string;
  standardFrameworkName?: string;
  careerId?: number;
  careerName?: string;
  levelId?: string;
  levelName?: string;
  abilityId?: string;
  abilityName?: string;
  courseCredit?: number;
  courseHour?: number;
}

export interface CourseDirectoryQueryParams {
  name?: string;
  levelId?: string;
  abilityId?: string;
  auditStatus? :number;
  keyword?: string;
  careerId?: number;
  page?: number;
  size?: number;
}
