import { AcademicStream } from '@prisma/client';
import { RIASEC_DIMENSIONS, RIASECDimension } from '@/constants/riasec';
import type { RIASECScore, RecommendationReasoning } from '@/types';

export interface CareerMatchInput {
  id: string;
  title: string;
  slug: string;
  eligibleStreams: AcademicStream[];
  riasecRealistic: number;
  riasecInvestigative: number;
  riasecArtistic: number;
  riasecSocial: number;
  riasecEnterprising: number;
  riasecConventional: number;
}

export interface CareerMatchResult {
  careerId: string;
  matchScore: number; // 0 - 100
  reasoning: RecommendationReasoning;
}

/**
 * Computes cosine similarity between two 6-dimensional RIASEC vectors
 */
export function calculateVectorSimilarity(
  profileA: RIASECScore,
  profileB: RIASECScore
): number {
  const keys: (keyof RIASECScore)[] = [
    'realistic',
    'investigative',
    'artistic',
    'social',
    'enterprising',
    'conventional',
  ];

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const key of keys) {
    const valA = profileA[key] || 0;
    const valB = profileB[key] || 0;
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  if (normA === 0 || normB === 0) return 0;
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return Math.max(0, Math.min(1, similarity));
}

/**
 * Scores and ranks careers for a student based on their RIASEC profile and academic stream
 */
export function rankCareersForStudent({
  studentProfile,
  studentStream,
  studentClass,
  careers,
}: {
  studentProfile: RIASECScore;
  studentStream?: AcademicStream | null;
  studentClass?: string | null;
  careers: CareerMatchInput[];
}): CareerMatchResult[] {
  // Identify student's top 2 RIASEC dimensions
  const sortedDimensions = (Object.keys(studentProfile) as RIASECDimension[]).sort(
    (a, b) => studentProfile[b] - studentProfile[a]
  );
  const primaryTrait = sortedDimensions[0];
  const secondaryTrait = sortedDimensions[1];

  const results: CareerMatchResult[] = careers.map((career) => {
    const careerProfile: RIASECScore = {
      realistic: career.riasecRealistic,
      investigative: career.riasecInvestigative,
      artistic: career.riasecArtistic,
      social: career.riasecSocial,
      enterprising: career.riasecEnterprising,
      conventional: career.riasecConventional,
    };

    const baseSimilarity = calculateVectorSimilarity(studentProfile, careerProfile);
    let score = Math.round(baseSimilarity * 100);

    // Stream eligibility check
    // For Class 9 and 10 students, stream has not yet locked them out
    const isPreStreamClass = studentClass === '9' || studentClass === '10';
    const isStreamCompatible =
      isPreStreamClass ||
      !studentStream ||
      studentStream === 'UNDECIDED' ||
      career.eligibleStreams.includes(studentStream);

    // If stream is fundamentally incompatible for Class 11/12, apply penalty
    if (!isStreamCompatible) {
      score = Math.max(15, Math.round(score * 0.7));
    }

    // Determine overlapping traits
    const matchedTraits: string[] = [];
    if (careerProfile[primaryTrait] >= 4) {
      matchedTraits.push(RIASEC_DIMENSIONS[primaryTrait].label);
    }
    if (secondaryTrait && careerProfile[secondaryTrait] >= 4) {
      matchedTraits.push(RIASEC_DIMENSIONS[secondaryTrait].label);
    }
    if (matchedTraits.length === 0) {
      matchedTraits.push(RIASEC_DIMENSIONS[primaryTrait].label);
    }

    const reasoning: RecommendationReasoning = {
      matchedDimensions: matchedTraits,
      streamCompatible: isStreamCompatible,
      topStrengths: [
        RIASEC_DIMENSIONS[primaryTrait].label,
        ...(secondaryTrait ? [RIASEC_DIMENSIONS[secondaryTrait].label] : []),
      ],
      summary: isStreamCompatible
        ? `Strong alignment with your ${RIASEC_DIMENSIONS[primaryTrait].label} strengths and preferred work style.`
        : `Matches your interest profile, but requires transition or prerequisites outside your current ${studentStream || 'selected'} stream.`,
    };

    return {
      careerId: career.id,
      matchScore: score,
      reasoning,
    };
  });

  // Sort descending by matchScore
  return results.sort((a, b) => b.matchScore - a.matchScore);
}
