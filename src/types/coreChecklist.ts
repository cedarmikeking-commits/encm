export interface CoreCourse {
  id: string;
  name: string;
  code: string;
  category: string;
  ivrlLevel: '1级' | '2级' | '3级' | '4级';
  courseType: '基础能力课程' | '行动能力课程' | '发展能力课程';
  credits: number;
  hours: number;
  status: 'planned' | 'developing' | 'completed' | 'approved';
  shenzhenProtocolTarget: string;
  competencyObjectives: string[];
  prerequisites: string[];
  developmentPriority: 'high' | 'medium' | 'low';
  developmentType: 'new' | 'reform' | 'upgrade';
  responsibleDepartment: string;
  targetCompletion: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseChecklist {
  id: string;
  title: string;
  description: string;
  totalCourses: number;
  completedCourses: number;
  ivrlDistribution: {
    level1: number;
    level2: number;
    level3: number;
    level4: number;
  };
  typeDistribution: {
    basic: number;
    action: number;
    development: number;
  };
  courses: CoreCourse[];
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistFilter {
  ivrlLevel?: string;
  courseType?: string;
  status?: string;
  developmentType?: string;
  priority?: string;
}