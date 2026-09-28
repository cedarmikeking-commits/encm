export interface CourseStandard {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  status: 'draft' | 'developing' | 'review' | 'approved' | 'published';
  version: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  
  // 1. 课程基本信息
  basicInfo: {
    courseName: string;
    courseCode: string;
    abilityModule: string;
    ivrlLevel: '1级' | '2级' | '3级' | '4级';
    credits: number;
    hours: number;
    theoreticalHours: number;
    practicalHours: number;
    department: string;
    instructor: string;
    description: string;
  };
  
  // 2. 课程目标
  objectives: {
    overallObjective: string;
    specificObjectives: CourseObjective[];
    shenzhenProtocolMapping: ShenzhenProtocolMapping[];
  };
  
  // 3. 课程内容与知识点/技能点
  content: {
    mainContent: ContentModule[];
    coreKnowledgePoints: KnowledgePoint[];
    keySkillPoints: SkillPoint[];
    contentObjectiveMapping: ContentObjectiveMapping[];
  };
  
  // 4. 教学方法与学时分配
  teachingMethods: {
    recommendedMethods: TeachingMethod[];
    theoreticalTeachingHours: number;
    practicalTeachingHours: number;
    practicalRatio: number; // 实践学时占比
    hourDistribution: HourDistribution[];
  };
  
  // 5. 考核方式与评价标准
  assessment: {
    assessmentMethods: AssessmentMethod[];
    evaluationCriteria: EvaluationCriteria[];
    gradeComposition: GradeComposition[];
  };
  
  // 6. 课程学分
  credits: {
    totalCredits: number;
    totalHours: number;
    creditHourRatio: number; // 每学分对应学时
    creditBasis: string; // 学分设定依据
  };
  
  // 7. 所需资源与条件
  resources: {
    textbooks: Resource[];
    referenceBooks: Resource[];
    equipment: Equipment[];
    software: Software[];
    facilities: Facility[];
    teacherRequirements: TeacherRequirement[];
  };
}

export interface CourseObjective {
  id: string;
  type: 'knowledge' | 'skill' | 'attitude';
  description: string;
  level: 'basic' | 'intermediate' | 'advanced';
  measurable: boolean;
  assessmentMethod: string;
}

export interface ShenzhenProtocolMapping {
  id: string;
  protocolCategory: string;
  protocolLevel: string;
  mappingRelation: string;
  supportLevel: 'primary' | 'secondary' | 'auxiliary';
}

export interface ContentModule {
  id: string;
  title: string;
  description: string;
  hours: number;
  type: 'theoretical' | 'practical' | 'mixed';
  knowledgePoints: string[];
  skillPoints: string[];
  teachingMethods: string[];
  assessmentMethods: string[];
}

export interface KnowledgePoint {
  id: string;
  name: string;
  description: string;
  importance: 'core' | 'important' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  relatedObjectives: string[];
  prerequisites: string[];
}

export interface SkillPoint {
  id: string;
  name: string;
  description: string;
  type: 'cognitive' | 'operational' | 'comprehensive';
  level: 'basic' | 'intermediate' | 'advanced';
  relatedObjectives: string[];
  practiceRequirements: string[];
}

export interface ContentObjectiveMapping {
  contentId: string;
  objectiveId: string;
  mappingType: 'direct' | 'indirect' | 'supportive';
  supportLevel: number; // 1-5
}

export interface TeachingMethod {
  id: string;
  name: string;
  type: 'case_analysis' | 'project_oriented' | 'simulation_training' | 'enterprise_practice' | 'lecture' | 'discussion' | 'experiment';
  description: string;
  applicableContent: string[];
  hours: number;
  resources: string[];
}

export interface HourDistribution {
  contentModule: string;
  theoreticalHours: number;
  practicalHours: number;
  totalHours: number;
  percentage: number;
}

export interface AssessmentMethod {
  id: string;
  name: string;
  type: 'written_exam' | 'practical_exam' | 'project_report' | 'process_evaluation' | 'comprehensive_evaluation';
  description: string;
  weight: number;
  evaluationCriteria: string[];
  gradingStandards: GradingStandard[];
}

export interface EvaluationCriteria {
  id: string;
  name: string;
  description: string;
  indicators: EvaluationIndicator[];
  weight: number;
}

export interface EvaluationIndicator {
  id: string;
  name: string;
  description: string;
  measurementMethod: string;
  standards: {
    excellent: string;
    good: string;
    average: string;
    poor: string;
  };
}

export interface GradeComposition {
  component: string;
  weight: number;
  assessmentMethod: string;
  description: string;
}

export interface GradingStandard {
  level: 'excellent' | 'good' | 'average' | 'poor';
  scoreRange: string;
  description: string;
  requirements: string[];
}

export interface Resource {
  id: string;
  type: 'textbook' | 'reference' | 'digital' | 'multimedia';
  title: string;
  author: string;
  publisher: string;
  publishYear: string;
  isbn?: string;
  url?: string;
  required: boolean;
  description: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  specifications: string;
  quantity: number;
  purpose: string;
  required: boolean;
}

export interface Software {
  id: string;
  name: string;
  version: string;
  type: 'development' | 'design' | 'simulation' | 'analysis';
  license: 'free' | 'commercial' | 'educational';
  purpose: string;
  systemRequirements: string;
}

export interface Facility {
  id: string;
  name: string;
  type: 'classroom' | 'laboratory' | 'workshop' | 'studio';
  capacity: number;
  equipment: string[];
  specialRequirements: string[];
}

export interface TeacherRequirement {
  id: string;
  role: 'primary' | 'assistant' | 'guest';
  qualifications: string[];
  experience: string[];
  skills: string[];
  certifications: string[];
}