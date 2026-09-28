export interface CourseSystemLevel {
  id: string;
  level: '1级' | '2级' | '3级' | '4级';
  totalCourses: number;
  totalCredits: number;
  totalHours: number;
  categories: CourseCategory[];
}

export interface CourseCategory {
  id: string;
  name: string;
  type: '基础能力' | '行动能力' | '发展能力';
  totalCourses: number;
  subcategories: CourseSubcategory[];
}

export interface CourseSubcategory {
  id: string;
  code: string;
  name: string;
  courses: CourseItem[];
}

export interface CourseItem {
  id: string;
  code: string;
  name: string;
  courseName: string;
  quantity: number;
  credits: number;
  hours: number;
}

export interface CourseSystemData {
  overview: {
    level1: CourseSystemLevel;
    level2: CourseSystemLevel;
    level3: CourseSystemLevel;
    level4: CourseSystemLevel;
  };
  details: {
    [key: string]: CourseSystemLevel;
  };
}