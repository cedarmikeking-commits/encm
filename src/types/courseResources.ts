export interface CourseResource {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  status: 'draft' | 'developing' | 'review' | 'approved' | 'published';
  version: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  
  // 资源基本信息
  basicInfo: {
    courseName: string;
    courseCode: string;
    totalResources: number;
    resourceCategories: number;
    storageUsed: number; // MB
    lastUpdated: string;
    description: string;
  };
  
  // 教学资源分类
  resourceCategories: ResourceCategory[];
  
  // 多媒体资源
  multimediaResources: MultimediaResource[];
  
  // 教学材料
  teachingMaterials: TeachingMaterial[];
  
  // 实验设备与工具
  equipmentTools: EquipmentTool[];
  
  // 数字化资源
  digitalResources: DigitalResource[];
  
  // 资源质量标准
  qualityStandards: ResourceQualityStandard[];
}

export interface ResourceCategory {
  id: string;
  name: string;
  type: 'multimedia' | 'document' | 'software' | 'equipment' | 'digital' | 'assessment';
  description: string;
  icon: string;
  color: string;
  resourceCount: number;
  totalSize: number;
  subcategories: ResourceSubcategory[];
}

export interface ResourceSubcategory {
  id: string;
  name: string;
  description: string;
  resources: Resource[];
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'audio' | 'image' | 'document' | 'presentation' | 'animation' | 'simulation' | 'software' | 'dataset';
  format: string;
  size: number; // bytes
  duration?: number; // seconds for video/audio
  resolution?: string; // for images/videos
  url: string;
  thumbnailUrl?: string;
  downloadUrl?: string;
  tags: string[];
  difficulty: 'basic' | 'intermediate' | 'advanced';
  usage: 'lecture' | 'practice' | 'assessment' | 'reference' | 'supplementary';
  accessibility: AccessibilityFeature[];
  metadata: ResourceMetadata;
  qualityScore: number;
  usageCount: number;
  rating: number;
  reviews: ResourceReview[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface MultimediaResource extends Resource {
  mediaType: 'video' | 'audio' | 'animation' | 'interactive';
  codec?: string;
  bitrate?: number;
  frameRate?: number;
  chapters?: MediaChapter[];
  subtitles?: SubtitleTrack[];
  interactiveElements?: InteractiveElement[];
}

export interface TeachingMaterial extends Resource {
  materialType: 'textbook' | 'handout' | 'worksheet' | 'case_study' | 'reference' | 'manual';
  pageCount?: number;
  language: string;
  isbn?: string;
  publisher?: string;
  edition?: string;
  chapters: MaterialChapter[];
  exercises: Exercise[];
}

export interface EquipmentTool {
  id: string;
  name: string;
  type: 'hardware' | 'software' | 'instrument' | 'tool' | 'kit';
  category: string;
  model: string;
  manufacturer: string;
  specifications: EquipmentSpec[];
  quantity: number;
  condition: 'excellent' | 'good' | 'fair' | 'needs_repair';
  location: string;
  purchaseDate: string;
  warrantyExpiry?: string;
  maintenanceSchedule: MaintenanceRecord[];
  usageInstructions: string;
  safetyGuidelines: string[];
  relatedCourses: string[];
  images: string[];
  manuals: string[];
}

export interface DigitalResource extends Resource {
  platform: 'web' | 'mobile' | 'desktop' | 'vr' | 'ar';
  systemRequirements: SystemRequirement[];
  licenseType: 'free' | 'commercial' | 'educational' | 'open_source';
  apiAccess?: boolean;
  integrations: Integration[];
  userGuides: string[];
  tutorials: string[];
}

export interface ResourceQualityStandard {
  id: string;
  category: 'content_accuracy' | 'technical_quality' | 'pedagogical_effectiveness' | 'accessibility' | 'usability';
  name: string;
  description: string;
  criteria: QualityCriterion[];
  measurementMethods: string[];
  benchmarks: QualityBenchmark[];
  complianceLevel: 'mandatory' | 'recommended' | 'optional';
}

export interface AccessibilityFeature {
  type: 'visual' | 'auditory' | 'motor' | 'cognitive';
  feature: string;
  description: string;
  implemented: boolean;
}

export interface ResourceMetadata {
  keywords: string[];
  subject: string;
  audience: string[];
  educationalLevel: string;
  learningObjectives: string[];
  prerequisites: string[];
  copyright: string;
  license: string;
  attribution: string;
}

export interface ResourceReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  aspects: {
    quality: number;
    relevance: number;
    usability: number;
    accuracy: number;
  };
  createdAt: string;
}

export interface MediaChapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  description: string;
  keyPoints: string[];
}

export interface SubtitleTrack {
  id: string;
  language: string;
  url: string;
  format: 'srt' | 'vtt' | 'ass';
}

export interface InteractiveElement {
  id: string;
  type: 'quiz' | 'hotspot' | 'annotation' | 'link' | 'overlay';
  timestamp: number;
  content: any;
  action: string;
}

export interface MaterialChapter {
  id: string;
  title: string;
  pageStart: number;
  pageEnd: number;
  objectives: string[];
  keyTerms: string[];
  summary: string;
}

export interface Exercise {
  id: string;
  type: 'practice' | 'review' | 'assessment' | 'project';
  title: string;
  description: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  estimatedTime: number;
  instructions: string[];
  resources: string[];
  solution?: string;
}

export interface EquipmentSpec {
  name: string;
  value: string;
  unit?: string;
  description?: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'routine' | 'repair' | 'calibration' | 'upgrade';
  description: string;
  technician: string;
  cost?: number;
  nextScheduled?: string;
}

export interface SystemRequirement {
  component: 'os' | 'cpu' | 'memory' | 'storage' | 'graphics' | 'network';
  minimum: string;
  recommended: string;
}

export interface Integration {
  platform: string;
  type: 'api' | 'plugin' | 'embed' | 'sso';
  status: 'active' | 'inactive' | 'pending';
  configuration: any;
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

export interface ResourceUsageAnalytics {
  resourceId: string;
  totalViews: number;
  uniqueUsers: number;
  averageViewTime: number;
  completionRate: number;
  downloadCount: number;
  shareCount: number;
  bookmarkCount: number;
  feedbackScore: number;
  usageByModule: ModuleUsage[];
  usageByTime: TimeUsage[];
  userEngagement: EngagementMetric[];
}

export interface ModuleUsage {
  moduleId: string;
  moduleName: string;
  usageCount: number;
  averageTime: number;
}

export interface TimeUsage {
  date: string;
  views: number;
  downloads: number;
  duration: number;
}

export interface EngagementMetric {
  metric: 'bounce_rate' | 'session_duration' | 'interaction_rate' | 'return_rate';
  value: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ResourceCollection {
  id: string;
  name: string;
  description: string;
  type: 'course_pack' | 'module_resources' | 'assessment_kit' | 'reference_library';
  resources: string[];
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  structure: any;
  fields: TemplateField[];
  preview: string;
  category: string;
}

export interface TemplateField {
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'file' | 'rich_text';
  required: boolean;
  defaultValue?: any;
  options?: string[];
  validation?: any;
}