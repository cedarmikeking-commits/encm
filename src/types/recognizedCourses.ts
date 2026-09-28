export interface RecognizedCourse {
  id: string;
  name: string;
  code: string;
  category: 'basic_ability' | 'development_ability';
  type: 'career_guidance' | 'lifelong_learning' | 'self_management' | 'communication' | 'teamwork' | 'innovation';
  version: string;
  status: 'available' | 'adopted' | 'customizing' | 'completed' | 'deprecated';
  developedBy: 'shenzhen_protocol_committee';
  publishDate: string;
  lastUpdated: string;
  description: string;
  
  // 课程基本信息
  basicInfo: {
    courseName: string;
    courseCode: string;
    credits: number;
    hours: number;
    theoreticalHours: number;
    practicalHours: number;
    ivrlLevel: '1级' | '2级' | '3级' | '4级';
    targetAudience: string[];
    prerequisites: string[];
    learningObjectives: string[];
  };
  
  // 标准内容
  standardContent: {
    syllabus: string;
    teachingPlan: string;
    assessmentPlan: string;
    resources: StandardResource[];
    activities: StandardActivity[];
  };
  
  // 采用情况
  adoptionInfo: {
    totalAdoptions: number;
    directAdoptions: number;
    customizedAdoptions: number;
    adoptingDomains: string[];
    adoptionRate: number;
  };
  
  // 质量评估
  qualityAssessment: {
    contentQuality: number;
    teachingEffectiveness: number;
    practicalRelevance: number;
    overallRating: number;
    reviewCount: number;
    lastReview: string;
  };
}

export interface CourseAdoption {
  id: string;
  courseId: string;
  courseName: string;
  domainName: string;
  adoptionType: 'direct' | 'optimized';
  status: 'planning' | 'customizing' | 'testing' | 'approved' | 'implemented';
  submittedAt: string;
  submittedBy: string;
  approvedAt?: string;
  implementedAt?: string;
  
  // 采用方案
  adoptionPlan: {
    adoptionReason: string;
    targetStudents: number;
    implementationTimeline: string;
    requiredResources: string[];
    expectedOutcomes: string[];
  };
  
  // 优化改进（如果是优化采用）
  optimization?: {
    optimizationType: 'content_adaptation' | 'method_improvement' | 'resource_enhancement' | 'assessment_modification';
    modifications: CourseModification[];
    justification: string;
    impactAssessment: string;
    approvalRequired: boolean;
  };
  
  // 实施情况
  implementation?: {
    startDate: string;
    endDate?: string;
    instructor: string;
    studentCount: number;
    feedback: ImplementationFeedback[];
    effectiveness: EffectivenessMetrics;
  };
}

export interface CourseModification {
  id: string;
  aspect: 'content' | 'method' | 'assessment' | 'resource' | 'schedule';
  originalContent: string;
  modifiedContent: string;
  reason: string;
  impact: 'low' | 'medium' | 'high';
  approvalStatus: 'pending' | 'approved' | 'rejected';
}

export interface StandardResource {
  id: string;
  type: 'textbook' | 'video' | 'presentation' | 'exercise' | 'case_study' | 'software';
  title: string;
  description: string;
  url?: string;
  format: string;
  size?: string;
  language: string;
  accessibility: boolean;
}

export interface StandardActivity {
  id: string;
  type: 'lecture' | 'discussion' | 'practice' | 'project' | 'assessment';
  title: string;
  description: string;
  duration: number;
  objectives: string[];
  materials: string[];
  instructions: string;
}

export interface ImplementationFeedback {
  id: string;
  source: 'student' | 'instructor' | 'peer' | 'supervisor';
  rating: number;
  comments: string;
  suggestions: string[];
  date: string;
}

export interface EffectivenessMetrics {
  studentSatisfaction: number;
  learningOutcomes: number;
  engagementLevel: number;
  completionRate: number;
  assessmentResults: number;
}

export interface DomainAdaptation {
  domainName: string;
  adaptationNeeds: string[];
  culturalConsiderations: string[];
  industryRequirements: string[];
  localRegulations: string[];
  recommendedModifications: string[];
}

export interface AdoptionReview {
  id: string;
  adoptionId: string;
  reviewType: 'initial' | 'progress' | 'final';
  reviewer: string;
  reviewDate: string;
  rating: number;
  findings: string[];
  recommendations: string[];
  approvalDecision: 'approved' | 'conditional' | 'rejected';
  conditions?: string[];
}

export interface QualityStandard {
  id: string;
  name: string;
  category: 'content' | 'delivery' | 'assessment' | 'resources';
  criteria: QualityCriterion[];
  minimumScore: number;
  weight: number;
}

export interface QualityCriterion {
  id: string;
  name: string;
  description: string;
  measurementMethod: string;
  scoreRange: string;
  examples: string[];
}

export interface AdoptionStatistics {
  totalCourses: number;
  totalAdoptions: number;
  directAdoptions: number;
  optimizedAdoptions: number;
  adoptionRate: number;
  averageCustomizationTime: number;
  successRate: number;
  domainDistribution: { [domain: string]: number };
  typeDistribution: { [type: string]: number };
  monthlyTrends: MonthlyTrend[];
}

export interface MonthlyTrend {
  month: string;
  adoptions: number;
  completions: number;
  successRate: number;
}


