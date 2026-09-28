export interface CourseContent {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  status: 'draft' | 'developing' | 'review' | 'approved' | 'published';
  version: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  
  // 课程内容基本信息
  basicInfo: {
    courseName: string;
    courseCode: string;
    totalHours: number;
    theoreticalHours: number;
    practicalHours: number;
    credits: number;
    ivrlLevel: '1级' | '2级' | '3级' | '4级';
    abilityModule: string;
    description: string;
  };
  
  // 教学模块
  teachingModules: TeachingModule[];
  
  // 知识点体系
  knowledgeSystem: KnowledgeSystem;
  
  // 技能点体系
  skillSystem: SkillSystem;
  
  // 教学活动设计
  teachingActivities: TeachingActivity[];
  
  // 实践项目
  practicalProjects: PracticalProject[];
  
  // 内容质量标准
  qualityStandards: QualityStandard[];
}

export interface TeachingModule {
  id: string;
  order: number;
  title: string;
  description: string;
  objectives: string[];
  totalHours: number;
  theoreticalHours: number;
  practicalHours: number;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  importance: 'core' | 'important' | 'general';
  prerequisites: string[];
  knowledgePoints: string[];
  skillPoints: string[];
  teachingMethods: string[];
  assessmentMethods: string[];
  resources: ModuleResource[];
  activities: ModuleActivity[];
}

export interface KnowledgeSystem {
  coreKnowledge: KnowledgePoint[];
  importantKnowledge: KnowledgePoint[];
  generalKnowledge: KnowledgePoint[];
  knowledgeMap: KnowledgeRelation[];
}

export interface KnowledgePoint {
  id: string;
  code: string;
  name: string;
  description: string;
  category: 'theoretical' | 'applied' | 'practical';
  level: 'basic' | 'intermediate' | 'advanced';
  importance: 'core' | 'important' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  hours: number;
  prerequisites: string[];
  relatedSkills: string[];
  teachingMethods: string[];
  assessmentMethods: string[];
  resources: string[];
  examples: string[];
}

export interface SkillSystem {
  cognitiveSkills: SkillPoint[];
  operationalSkills: SkillPoint[];
  comprehensiveSkills: SkillPoint[];
  skillProgression: SkillProgression[];
}

export interface SkillPoint {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'cognitive' | 'operational' | 'comprehensive';
  level: 'basic' | 'intermediate' | 'advanced';
  complexity: 'simple' | 'moderate' | 'complex';
  hours: number;
  prerequisites: string[];
  relatedKnowledge: string[];
  practiceRequirements: PracticeRequirement[];
  assessmentCriteria: AssessmentCriterion[];
  tools: string[];
  environment: string[];
}

export interface TeachingActivity {
  id: string;
  moduleId: string;
  type: 'lecture' | 'discussion' | 'case_study' | 'experiment' | 'project' | 'simulation' | 'field_work';
  title: string;
  description: string;
  objectives: string[];
  duration: number;
  participants: number;
  materials: string[];
  equipment: string[];
  procedures: ActivityProcedure[];
  deliverables: string[];
  assessmentMethod: string;
  notes: string[];
}

export interface PracticalProject {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'group' | 'enterprise';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  duration: number;
  objectives: string[];
  requirements: ProjectRequirement[];
  deliverables: ProjectDeliverable[];
  assessmentCriteria: AssessmentCriterion[];
  resources: string[];
  mentorRequirements: string[];
}

export interface QualityStandard {
  id: string;
  category: 'content_accuracy' | 'teaching_effectiveness' | 'practical_relevance' | 'assessment_validity';
  name: string;
  description: string;
  criteria: QualityCriterion[];
  measurementMethods: string[];
  benchmarks: QualityBenchmark[];
}

export interface KnowledgeRelation {
  fromKnowledge: string;
  toKnowledge: string;
  relationType: 'prerequisite' | 'parallel' | 'extension' | 'application';
  strength: 'weak' | 'moderate' | 'strong';
}

export interface SkillProgression {
  skillId: string;
  level: number;
  requirements: string[];
  indicators: string[];
  nextLevel: string[];
}

export interface PracticeRequirement {
  id: string;
  description: string;
  type: 'simulation' | 'real_environment' | 'laboratory';
  duration: number;
  frequency: number;
  equipment: string[];
  supervision: 'independent' | 'guided' | 'supervised';
}

export interface AssessmentCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  indicators: string[];
  rubric: {
    excellent: string;
    good: string;
    satisfactory: string;
    needs_improvement: string;
  };
}

export interface ActivityProcedure {
  step: number;
  description: string;
  duration: number;
  materials: string[];
  notes: string[];
}

export interface ModuleResource {
  id: string;
  type: 'textbook' | 'reference' | 'multimedia' | 'software' | 'equipment';
  name: string;
  description: string;
  required: boolean;
  url?: string;
}

export interface ModuleActivity {
  id: string;
  type: 'lecture' | 'practice' | 'discussion' | 'assessment';
  title: string;
  duration: number;
  description: string;
}

export interface ProjectRequirement {
  id: string;
  category: 'functional' | 'technical' | 'quality' | 'documentation';
  description: string;
  priority: 'must' | 'should' | 'could';
  criteria: string[];
}

export interface ProjectDeliverable {
  id: string;
  name: string;
  type: 'document' | 'prototype' | 'presentation' | 'code' | 'report';
  description: string;
  format: string;
  deadline: string;
  assessmentWeight: number;
}

export interface QualityCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  measurementMethod: string;
  acceptanceThreshold: number;
}

export interface QualityBenchmark {
  level: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement';
  description: string;
  indicators: string[];
  scoreRange: string;
}