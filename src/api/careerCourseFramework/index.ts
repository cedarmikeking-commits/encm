import {http} from "../http"
import type {CareerCourseFrameworkAuditParams} from "@/types";

export const getCareerCourseFrameworkList = (params: {
  careerId?: string;
  levelId?: string;
  auditStatus?: number;
  current: number;
  size: number;
}): Promise<any> => {
  return http.get('/blade-course/courseCareerSystemLevel/getCourseCareerSystemLevelList', params);
}

export const getCareerCourseFrameworkDetail = (params: { id: number }): Promise<any> => {
  return http.get(`/blade-course/courseCareerSystemLevel/detail/${params.id}`);
}

export const auditCareerCourseFramework = (params: CareerCourseFrameworkAuditParams): Promise<any> => {
  return http.post('/blade-course/courseCareerSystemLevel/review', params);
}


