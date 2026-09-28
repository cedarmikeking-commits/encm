export interface CourseAssessment {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  status: 'draft' | 'developing' | 'review' | 'approved' | 'published';
  version: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  
  // 考核基本信息
  basicInfo: {
    courseName: string;
    courseCode: string;
    totalScore: number;
    passingScore: number;
    duration: number; // 考试时长（分钟）
    attempts: number; // 允许考试次数
    description: string;
  };
  
  // 试卷管理
  examPapers: ExamPaper[];
  
  // 题库管理
  questionBank: QuestionBank;
  
  // 考核方案
  assessmentPlan: AssessmentPlan;
  
  // 成绩管理
  gradeManagement: GradeManagement;
  
  // 统计分析
  statistics: AssessmentStatistics;
}

export interface ExamPaper {
  id: string;
  title: string;
  description: string;
  type: 'midterm' | 'final' | 'quiz' | 'practice' | 'makeup';
  status: 'draft' | 'published' | 'archived';
  totalScore: number;
  passingScore: number;
  duration: number;
  attempts: number;
  randomize: boolean; // 是否随机出题
  showResults: boolean; // 是否显示结果
  allowReview: boolean; // 是否允许查看答案
  startTime?: string;
  endTime?: string;
  instructions: string;
  sections: PaperSection[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface PaperSection {
  id: string;
  title: string;
  description: string;
  order: number;
  totalScore: number;
  questionCount: number;
  timeLimit?: number;
  instructions: string;
  questions: Question[];
}

export interface Question {
  id: string;
  type: 'single_choice' | 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_answer' | 'essay';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  score: number;
  content: string;
  explanation?: string;
  tags: string[];
  options?: QuestionOption[];
  correctAnswer: string | string[];
  keywords?: string[]; // 填空题关键词
  rubric?: GradingRubric; // 主观题评分标准
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  usageCount: number;
  correctRate: number;
}

export interface QuestionOption {
  id: string;
  label: string;
  content: string;
  isCorrect: boolean;
}

export interface QuestionBank {
  id: string;
  name: string;
  description: string;
  categories: QuestionCategory[];
  totalQuestions: number;
  questionsByType: {
    single_choice: number;
    multiple_choice: number;
    true_false: number;
    fill_blank: number;
    short_answer: number;
    essay: number;
  };
  questionsByDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface QuestionCategory {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  questions: Question[];
  subcategories: QuestionCategory[];
}

export interface AssessmentPlan {
  id: string;
  name: string;
  description: string;
  components: AssessmentComponent[];
  totalWeight: number;
  passingCriteria: PassingCriteria;
  gradingScale: GradingScale[];
}

export interface AssessmentComponent {
  id: string;
  name: string;
  type: 'exam' | 'quiz' | 'assignment' | 'project' | 'participation' | 'attendance';
  weight: number;
  description: string;
  dueDate?: string;
  maxScore: number;
  requirements: string[];
}

export interface PassingCriteria {
  minimumScore: number;
  requiredComponents: string[]; // 必须完成的考核组件
  additionalRequirements: string[];
}

export interface GradingScale {
  grade: string;
  minScore: number;
  maxScore: number;
  description: string;
  gpa?: number;
}

export interface GradeManagement {
  students: StudentGrade[];
  statistics: GradeStatistics;
  reports: GradeReport[];
}

export interface StudentGrade {
  studentId: string;
  studentName: string;
  studentNumber: string;
  grades: ComponentGrade[];
  totalScore: number;
  finalGrade: string;
  gpa?: number;
  status: 'passed' | 'failed' | 'incomplete';
  attempts: number;
  lastUpdated: string;
}

export interface ComponentGrade {
  componentId: string;
  componentName: string;
  score: number;
  maxScore: number;
  percentage: number;
  submittedAt?: string;
  gradedAt?: string;
  feedback?: string;
}

export interface GradeStatistics {
  totalStudents: number;
  passedStudents: number;
  failedStudents: number;
  passRate: number;
  averageScore: number;
  medianScore: number;
  standardDeviation: number;
  gradeDistribution: {
    [grade: string]: number;
  };
}

export interface GradeReport {
  id: string;
  title: string;
  type: 'individual' | 'class' | 'comparative';
  generatedAt: string;
  data: any;
  format: 'pdf' | 'excel' | 'csv';
}

export interface AssessmentStatistics {
  overview: {
    totalPapers: number;
    totalQuestions: number;
    totalAttempts: number;
    averageScore: number;
    passRate: number;
  };
  questionAnalysis: QuestionAnalysis[];
  paperAnalysis: PaperAnalysis[];
  difficultyAnalysis: DifficultyAnalysis;
  timeAnalysis: TimeAnalysis;
}

export interface QuestionAnalysis {
  questionId: string;
  questionContent: string;
  type: string;
  difficulty: string;
  totalAttempts: number;
  correctAttempts: number;
  correctRate: number;
  averageTime: number;
  discrimination: number; // 区分度
  reliability: number; // 信度
}

export interface PaperAnalysis {
  paperId: string;
  paperTitle: string;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  averageTime: number;
  reliability: number;
  validity: number;
}

export interface DifficultyAnalysis {
  easy: {
    count: number;
    averageCorrectRate: number;
  };
  medium: {
    count: number;
    averageCorrectRate: number;
  };
  hard: {
    count: number;
    averageCorrectRate: number;
  };
}

export interface TimeAnalysis {
  averageCompletionTime: number;
  timeDistribution: {
    [timeRange: string]: number;
  };
  timeoutRate: number;
}

export interface GradingRubric {
  id: string;
  name: string;
  criteria: RubricCriterion[];
  totalPoints: number;
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  id: string;
  name: string;
  description: string;
  points: number;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'video' | 'document';
  url: string;
  size: number;
}

export interface ExamSession {
  id: string;
  paperId: string;
  studentId: string;
  startTime: string;
  endTime?: string;
  duration: number;
  status: 'in_progress' | 'completed' | 'timeout' | 'interrupted';
  answers: StudentAnswer[];
  score?: number;
  autoGraded: boolean;
  manualReview: boolean;
}

export interface StudentAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect?: boolean;
  score?: number;
  timeSpent: number;
  attempts: number;
}