export interface StandardCourse {
  id: string;
  name: string;
  code: string;
  standardId: string; // 关联的课程标准ID
  status: 'planning' | 'designing' | 'developing' | 'testing' | 'review' | 'approved' | 'published';
  version: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  
  // 基本信息
  basicInfo: {
    courseName: string;
    courseCode: string;
    category: string;
    level: string;
    credits: number;
    hours: number;
    theoreticalHours: number;
    practicalHours: number;
    ivrlLevel: '1级' | '2级' | '3级' | '4级';
    abilityModule: string;
    department: string;
    instructor: string;
    description: string;
    prerequisites: string[];
    targetAudience: string[];
  };
  
  // 课程标准映射
  standardMapping: {
    standardId: string;
    standardName: string;
    mappingLevel: 'full' | 'partial' | 'extended';
    complianceRate: number;
    deviations: StandardDeviation[];
    approvalStatus: 'pending' | 'approved' | 'rejected';
  };
  
  // 课程设计
  courseDesign: {
    designPrinciples: string[];
    teachingPhilosophy: string;
    learningApproach: string;
    innovativeFeatures: string[];
    designRationale: string;
  };
  
  // 教学大纲
  syllabus: CourseSyllabus;
  
  // 教学计划
  teachingPlan: TeachingPlan;
  
  // 课程内容
  courseContent: CourseContentStructure;
  
  // 教学资源
  teachingResources: TeachingResourcePlan;
  
  // 评估体系
  assessmentSystem: AssessmentSystemPlan;
  
  // 质量保证
  qualityAssurance: QualityAssurancePlan;
  
  // 实施计划
  implementationPlan: ImplementationPlan;
}

export interface StandardDeviation {
  id: string;
  aspect: string;
  standardRequirement: string;
  courseImplementation: string;
  justification: string;
  impact: 'low' | 'medium' | 'high';
  approvalRequired: boolean;
}

export interface CourseSyllabus {
  id: string;
  courseOverview: string;
  learningOutcomes: LearningOutcome[];
  contentOutline: ContentOutline[];
  teachingMethods: TeachingMethodPlan[];
  assessmentMethods: AssessmentMethodPlan[];
  requiredResources: RequiredResource[];
  schedule: CourseSchedule[];
}

export interface LearningOutcome {
  id: string;
  category: 'knowledge' | 'skill' | 'attitude';
  description: string;
  level: 'basic' | 'intermediate' | 'advanced';
  assessmentMethod: string;
  standardAlignment: string[];
  measurableIndicators: string[];
}

export interface ContentOutline {
  id: string;
  week: number;
  topic: string;
  subtopics: string[];
  learningObjectives: string[];
  activities: string[];
  resources: string[];
  assessment: string;
  hours: number;
}

export interface TeachingMethodPlan {
  id: string;
  method: string;
  description: string;
  applicableContent: string[];
  resources: string[];
  duration: number;
  effectiveness: string;
}

export interface AssessmentMethodPlan {
  id: string;
  type: string;
  description: string;
  weight: number;
  criteria: string[];
  rubric: string;
  timeline: string;
}

export interface RequiredResource {
  id: string;
  type: 'textbook' | 'software' | 'equipment' | 'facility' | 'online';
  name: string;
  description: string;
  quantity: number;
  cost: number;
  supplier: string;
  availability: 'available' | 'need_purchase' | 'need_development';
}

export interface CourseSchedule {
  id: string;
  week: number;
  session: number;
  date: string;
  topic: string;
  type: 'lecture' | 'lab' | 'seminar' | 'project' | 'assessment';
  duration: number;
  location: string;
  instructor: string;
  resources: string[];
}

export interface TeachingPlan {
  id: string;
  totalWeeks: number;
  sessionsPerWeek: number;
  weeklyPlans: WeeklyPlan[];
  milestones: CourseMilestone[];
  flexibilityPoints: FlexibilityPoint[];
}

export interface WeeklyPlan {
  id: string;
  week: number;
  theme: string;
  objectives: string[];
  content: WeeklyContent[];
  activities: WeeklyActivity[];
  assessments: WeeklyAssessment[];
  resources: string[];
  notes: string;
}

export interface WeeklyContent {
  id: string;
  title: string;
  type: 'theory' | 'practice' | 'case_study' | 'project';
  duration: number;
  description: string;
  materials: string[];
}

export interface WeeklyActivity {
  id: string;
  name: string;
  type: 'individual' | 'group' | 'class';
  duration: number;
  description: string;
  objectives: string[];
  deliverables: string[];
}

export interface WeeklyAssessment {
  id: string;
  name: string;
  type: 'formative' | 'summative';
  method: string;
  weight: number;
  criteria: string[];
}

export interface CourseMilestone {
  id: string;
  week: number;
  title: string;
  description: string;
  deliverables: string[];
  successCriteria: string[];
}

export interface FlexibilityPoint {
  id: string;
  week: number;
  description: string;
  alternatives: string[];
  conditions: string[];
}

export interface CourseContentStructure {
  id: string;
  modules: ContentModule[];
  knowledgeMap: KnowledgeMap;
  skillProgression: SkillProgression;
  practicalComponents: PracticalComponent[];
}

export interface ContentModule {
  id: string;
  order: number;
  title: string;
  description: string;
  objectives: string[];
  duration: number;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  prerequisites: string[];
  topics: ModuleTopic[];
  activities: ModuleActivity[];
  assessments: ModuleAssessment[];
  resources: ModuleResource[];
}

export interface ModuleTopic {
  id: string;
  title: string;
  description: string;
  type: 'concept' | 'procedure' | 'principle' | 'fact';
  importance: 'core' | 'important' | 'supplementary';
  depth: 'overview' | 'detailed' | 'comprehensive';
  examples: string[];
  applications: string[];
}

export interface ModuleActivity {
  id: string;
  name: string;
  type: 'lecture' | 'discussion' | 'lab' | 'project' | 'field_work';
  duration: number;
  participants: number;
  materials: string[];
  procedures: string[];
  outcomes: string[];
}

export interface ModuleAssessment {
  id: string;
  name: string;
  type: 'quiz' | 'assignment' | 'project' | 'presentation';
  weight: number;
  criteria: string[];
  rubric: AssessmentRubric;
}

export interface ModuleResource {
  id: string;
  type: 'reading' | 'video' | 'software' | 'dataset' | 'tool';
  name: string;
  description: string;
  url?: string;
  required: boolean;
}

export interface KnowledgeMap {
  concepts: KnowledgeConcept[];
  relationships: ConceptRelationship[];
  progressionPaths: ProgressionPath[];
}

export interface KnowledgeConcept {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: number;
  prerequisites: string[];
  applications: string[];
}

export interface ConceptRelationship {
  fromConcept: string;
  toConcept: string;
  type: 'prerequisite' | 'builds_on' | 'applies_to' | 'contrasts_with';
  strength: number;
}

export interface ProgressionPath {
  id: string;
  name: string;
  description: string;
  concepts: string[];
  milestones: string[];
}

export interface SkillProgression {
  skillAreas: SkillArea[];
  progressionLevels: ProgressionLevel[];
  practiceOpportunities: PracticeOpportunity[];
}

export interface SkillArea {
  id: string;
  name: string;
  description: string;
  type: 'cognitive' | 'psychomotor' | 'affective';
  skills: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  level: number;
  prerequisites: string[];
  indicators: string[];
  practiceActivities: string[];
}

export interface ProgressionLevel {
  level: number;
  name: string;
  description: string;
  requirements: string[];
  assessmentCriteria: string[];
}

export interface PracticeOpportunity {
  id: string;
  skillId: string;
  activity: string;
  context: string;
  frequency: string;
  feedback: string;
}

export interface PracticalComponent {
  id: string;
  name: string;
  type: 'lab' | 'project' | 'internship' | 'simulation' | 'case_study';
  description: string;
  objectives: string[];
  duration: number;
  requirements: ComponentRequirement[];
  deliverables: ComponentDeliverable[];
  assessment: ComponentAssessment;
}

export interface ComponentRequirement {
  id: string;
  type: 'equipment' | 'software' | 'facility' | 'material' | 'personnel';
  description: string;
  quantity: number;
  specifications: string[];
}

export interface ComponentDeliverable {
  id: string;
  name: string;
  type: 'report' | 'prototype' | 'presentation' | 'code' | 'design';
  description: string;
  format: string;
  deadline: string;
}

export interface ComponentAssessment {
  criteria: string[];
  rubric: AssessmentRubric;
  weight: number;
  feedback: string;
}

export interface AssessmentRubric {
  id: string;
  name: string;
  criteria: RubricCriterion[];
  levels: RubricLevel[];
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
}

export interface RubricLevel {
  id: string;
  name: string;
  description: string;
  score: number;
}

export interface TeachingResourcePlan {
  id: string;
  resourceCategories: ResourceCategory[];
  developmentPlan: ResourceDevelopmentPlan;
  acquisitionPlan: ResourceAcquisitionPlan;
  maintenancePlan: ResourceMaintenancePlan;
}

export interface ResourceCategory {
  id: string;
  name: string;
  type: string;
  resources: PlannedResource[];
  budget: number;
  priority: 'high' | 'medium' | 'low';
}

export interface PlannedResource {
  id: string;
  name: string;
  description: string;
  type: string;
  status: 'planned' | 'in_development' | 'acquired' | 'ready';
  cost: number;
  timeline: string;
  responsible: string;
}

export interface ResourceDevelopmentPlan {
  id: string;
  phases: DevelopmentPhase[];
  timeline: string;
  budget: number;
  team: TeamMember[];
}

export interface DevelopmentPhase {
  id: string;
  name: string;
  description: string;
  duration: number;
  deliverables: string[];
  resources: string[];
  dependencies: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  responsibilities: string[];
  expertise: string[];
}

export interface ResourceAcquisitionPlan {
  id: string;
  items: AcquisitionItem[];
  budget: number;
  timeline: string;
  suppliers: Supplier[];
}

export interface AcquisitionItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitCost: number;
  supplier: string;
  deliveryDate: string;
  status: 'planned' | 'ordered' | 'delivered' | 'installed';
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  products: string[];
  rating: number;
  terms: string;
}

export interface ResourceMaintenancePlan {
  id: string;
  schedule: MaintenanceSchedule[];
  procedures: MaintenanceProcedure[];
  budget: number;
  personnel: string[];
}

export interface MaintenanceSchedule {
  id: string;
  resourceId: string;
  type: 'routine' | 'preventive' | 'corrective';
  frequency: string;
  nextDate: string;
  responsible: string;
}

export interface MaintenanceProcedure {
  id: string;
  name: string;
  description: string;
  steps: string[];
  tools: string[];
  safety: string[];
}

export interface AssessmentSystemPlan {
  id: string;
  philosophy: string;
  principles: string[];
  methods: AssessmentMethod[];
  rubrics: AssessmentRubric[];
  feedback: FeedbackSystem;
  analytics: AssessmentAnalytics;
}

export interface AssessmentMethod {
  id: string;
  name: string;
  type: 'formative' | 'summative' | 'diagnostic';
  description: string;
  frequency: string;
  weight: number;
  criteria: string[];
  tools: string[];
}

export interface FeedbackSystem {
  id: string;
  types: FeedbackType[];
  delivery: FeedbackDelivery[];
  timing: FeedbackTiming[];
}

export interface FeedbackType {
  id: string;
  name: string;
  description: string;
  format: string;
  audience: string;
}

export interface FeedbackDelivery {
  id: string;
  method: string;
  description: string;
  tools: string[];
  effectiveness: string;
}

export interface FeedbackTiming {
  id: string;
  when: string;
  frequency: string;
  purpose: string;
}

export interface AssessmentAnalytics {
  id: string;
  metrics: AnalyticsMetric[];
  reports: AnalyticsReport[];
  dashboards: AnalyticsDashboard[];
}

export interface AnalyticsMetric {
  id: string;
  name: string;
  description: string;
  calculation: string;
  interpretation: string;
}

export interface AnalyticsReport {
  id: string;
  name: string;
  description: string;
  frequency: string;
  audience: string[];
  format: string;
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  audience: string[];
}

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  data: string;
  visualization: string;
}

export interface QualityAssurancePlan {
  id: string;
  standards: QualityStandard[];
  processes: QualityProcess[];
  metrics: QualityMetric[];
  reviews: QualityReview[];
}

export interface QualityStandard {
  id: string;
  name: string;
  description: string;
  criteria: string[];
  benchmarks: string[];
  compliance: 'mandatory' | 'recommended';
}

export interface QualityProcess {
  id: string;
  name: string;
  description: string;
  steps: ProcessStep[];
  roles: ProcessRole[];
  tools: string[];
}

export interface ProcessStep {
  id: string;
  name: string;
  description: string;
  inputs: string[];
  outputs: string[];
  criteria: string[];
}

export interface ProcessRole {
  id: string;
  name: string;
  responsibilities: string[];
  qualifications: string[];
}

export interface QualityMetric {
  id: string;
  name: string;
  description: string;
  measurement: string;
  target: string;
  frequency: string;
}

export interface QualityReview {
  id: string;
  type: 'peer' | 'expert' | 'student' | 'external';
  frequency: string;
  criteria: string[];
  process: string;
  outcomes: string[];
}

export interface ImplementationPlan {
  id: string;
  phases: ImplementationPhase[];
  timeline: ImplementationTimeline;
  resources: ImplementationResource[];
  risks: ImplementationRisk[];
  success: SuccessCriteria[];
}

export interface ImplementationPhase {
  id: string;
  name: string;
  description: string;
  duration: number;
  objectives: string[];
  activities: PhaseActivity[];
  deliverables: string[];
  dependencies: string[];
}

export interface PhaseActivity {
  id: string;
  name: string;
  description: string;
  duration: number;
  responsible: string;
  resources: string[];
  outcomes: string[];
}

export interface ImplementationTimeline {
  id: string;
  startDate: string;
  endDate: string;
  milestones: TimelineMilestone[];
  dependencies: TimelineDependency[];
}

export interface TimelineMilestone {
  id: string;
  name: string;
  date: string;
  description: string;
  deliverables: string[];
  criteria: string[];
}

export interface TimelineDependency {
  id: string;
  predecessor: string;
  successor: string;
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish';
  lag: number;
}

export interface ImplementationResource {
  id: string;
  type: 'human' | 'financial' | 'material' | 'technological';
  name: string;
  description: string;
  quantity: number;
  cost: number;
  availability: string;
}

export interface ImplementationRisk {
  id: string;
  name: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string[];
  contingency: string[];
}

export interface SuccessCriteria {
  id: string;
  name: string;
  description: string;
  metric: string;
  target: string;
  measurement: string;
}