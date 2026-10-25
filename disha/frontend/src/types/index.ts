export type UserRole = 'STUDENT' | 'CONTRIBUTOR' | 'MODERATOR' | 'ADMIN';
export type AcademicStream = 'SCIENCE' | 'COMMERCE' | 'ARTS' | 'UNDECIDED';
export type ContentStatus = 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type ResourceType = 'COURSE' | 'BOOK' | 'VIDEO' | 'ARTICLE' | 'TOOL' | 'WEBSITE';
export type ResourceCost = 'FREE' | 'PAID' | 'FREEMIUM';
export type QuestionType = 'SINGLE_SELECT' | 'MULTI_SELECT' | 'SCALE';
export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED';
export type SubmissionEntityType = 'CAREER' | 'RESOURCE';
export type SubmissionAction = 'CREATE' | 'UPDATE';

export interface RIASECScore {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
}

export interface QuizOption {
  label: string;
  value: string;
}

export interface QuizQuestionWithOptions {
  id: string;
  questionText: string;
  questionType: QuestionType;
  options: QuizOption[];
  orderIndex: number;
}

export interface QuizAnswer {
  questionId: string;
  selectedValues: string[];
}

export interface RecommendationReasoning {
  matchedDimensions: string[];
  streamCompatible: boolean;
  topStrengths: string[];
  summary: string;
}

export interface CareerWithCluster {
  id: string;
  title: string;
  slug: string;
  description: string;
  prerequisites: string[];
  eligibleStreams: AcademicStream[];
  averageDuration: string | null;
  cluster: {
    id: string;
    name: string;
    slug: string;
  };
  resources: {
    id: string;
    title: string;
    url: string;
    type: ResourceType;
    cost: ResourceCost;
    platform: string | null;
  }[];
}

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  parentConsentVerified: boolean;
  backendToken?: string;
}
