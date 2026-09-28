export interface DomainStandard {
  id: string;
  name: string;
  code: string;
  category: string;
  level: 'national' | 'industry' | 'enterprise' | 'international';
  status: 'active' | 'draft' | 'deprecated' | 'pending';
  version: string;
  publishDate: string;
  effectiveDate: string;
  description: string;
  organization: string;
  scope: string[];
  requirements: StandardRequirement[];
  competencies: CompetencyArea[];
  mappedCourses: string[];
  documents: StandardDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface StandardRequirement {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  compliance: 'mandatory' | 'recommended' | 'optional';
  criteria: string[];
  evidence: string[];
}

export interface CompetencyArea {
  id: string;
  name: string;
  description: string;
  level: number;
  skills: Skill[];
  assessmentMethods: string[];
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  prerequisites: string[];
}

export interface StandardDocument {
  id: string;
  title: string;
  type: 'specification' | 'guideline' | 'template' | 'checklist' | 'reference';
  url: string;
  size: string;
  uploadDate: string;
}

export interface StandardMapping {
  id: string;
  standardId: string;
  courseId: string;
  mappingType: 'full' | 'partial' | 'reference';
  coverage: number;
  gaps: string[];
  recommendations: string[];
  lastReview: string;
  reviewer: string;
}