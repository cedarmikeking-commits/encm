import {http} from "../http"
import type {CareerCourseStandardAuditParams} from "@/types";

export const getCareerCourseStandardList = (params: {
  careerId?: number;
  levelId?: string;
  abilityId?: string;
  auditStatus?: number;
  courseType?: string;
  current: number;
  size: number;
  type?: number;
}): Promise<any> => {
  return http.get('/blade-course/course/getCourseStandardList', params);
}

export const getCareerCourseStandardDetail = (params: {
  courseStandardId: number
}): Promise<any> => {
  return http.get(`/blade-course/course/detail/${params.courseStandardId}`, params);
}

export const auditCareerCourseStandard = (params: CareerCourseStandardAuditParams): Promise<any> => {
  return http.post('/blade-course/course/review', params);
}

export const getCareerCourseStandardReviewRecords = (params: {
  courseId: number,
  current?: number,
  size?: number
}): Promise<any> => {
  const { courseId, ...queryParams } = params;
  return http.get(`/blade-course/standardAuditDetail/page/${courseId}`, queryParams);
}

export const getCareerCourseStandardReviewRecordDetail = (id: number): Promise<any> => {
  return http.get(`/blade-course/standardAuditDetail/detail/${id}`);
}
