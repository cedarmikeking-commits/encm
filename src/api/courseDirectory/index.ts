import {http} from "../http"

export const getCourseDirectoryList = (params: {
  careerId?: number;
  levelId?: string;
  abilityId?: string;
  auditStatus?: number;
  courseType?: string;
  keyword?: string;
  current: number;
  size: number;
  type?: number;
}): Promise<any> => {
  return http.get('/blade-course/course/getCourseStandardList', params);
}
