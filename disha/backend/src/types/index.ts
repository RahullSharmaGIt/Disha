import {
  UserRole,
  AcademicStream,
  ContentStatus,
  ResourceType,
  ResourceCost,
  QuestionType,
  SubmissionStatus,
  SubmissionEntityType,
  SubmissionAction,
} from '@prisma/client';

export {
  UserRole,
  AcademicStream,
  ContentStatus,
  ResourceType,
  ResourceCost,
  QuestionType,
  SubmissionStatus,
  SubmissionEntityType,
  SubmissionAction,
};

// RIASEC dimensions
export interface RIASECScore {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
}

// Quiz types
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

// Recommendation types
export interface RecommendationReasoning {
  matchedDimensions: string[];
  streamCompatible: boolean;
  topStrengths: string[];
  summary: string;
}

// Career types for API responses
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

// Session user type
export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  parentConsentVerified: boolean;
}
