import { NextRequest } from 'next/server';
import { handleCorsPreflight, jsonResponse } from '@/lib/cors';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-middleware';
import { rankCareersForStudent } from '@/lib/scoring/riasec';
import type { RIASECScore } from '@/types';
import { ContentStatus, AcademicStream } from '@prisma/client';

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreflight(req.headers.get('origin'));
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin');
  try {
    const activeVersion = await prisma.quizVersion.findFirst({
      where: { isActive: true },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            questionText: true,
            questionType: true,
            options: true,
            orderIndex: true,
          },
        },
      },
    });

    if (!activeVersion) {
      return jsonResponse({ success: false, error: 'No active quiz version found' }, { status: 404, origin });
    }

    return jsonResponse({
      success: true,
      data: {
        versionId: activeVersion.id,
        versionNumber: activeVersion.version,
        questions: activeVersion.questions,
      },
    }, { origin });
  } catch (error: any) {
    console.error('Error in GET /api/quiz:', error);
    return jsonResponse({ success: false, error: 'Failed to fetch quiz questions' }, { status: 500, origin });
  }
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  try {
    const authUser = getAuthUser(req);
    const body = await req.json();
    const { versionId, responses, currentClass, stream } = body;

    if (!versionId || !Array.isArray(responses) || responses.length === 0) {
      return jsonResponse({ success: false, error: 'Invalid quiz responses payload' }, { status: 400, origin });
    }

    // Fetch questions to get weights
    const questions = await prisma.quizQuestion.findMany({
      where: { versionId },
    });
    const questionMap = new Map(questions.map((q) => [q.id, q]));

    const rawScore: RIASECScore = {
      realistic: 0,
      investigative: 0,
      artistic: 0,
      social: 0,
      enterprising: 0,
      conventional: 0,
    };

    for (const resp of responses) {
      const q = questionMap.get(resp.questionId);
      if (!q) continue;

      const weights = q.riasecWeights as unknown as Record<string, RIASECScore>;
      if (!weights) continue;

      for (const val of resp.selectedValues) {
        const optionWeights = weights[val];
        if (optionWeights) {
          rawScore.realistic += optionWeights.realistic || 0;
          rawScore.investigative += optionWeights.investigative || 0;
          rawScore.artistic += optionWeights.artistic || 0;
          rawScore.social += optionWeights.social || 0;
          rawScore.enterprising += optionWeights.enterprising || 0;
          rawScore.conventional += optionWeights.conventional || 0;
        }
      }
    }

    const maxVal = Math.max(
      rawScore.realistic,
      rawScore.investigative,
      rawScore.artistic,
      rawScore.social,
      rawScore.enterprising,
      rawScore.conventional,
      1
    );

    const normalizedProfile: RIASECScore = {
      realistic: Math.round((rawScore.realistic / maxVal) * 100),
      investigative: Math.round((rawScore.investigative / maxVal) * 100),
      artistic: Math.round((rawScore.artistic / maxVal) * 100),
      social: Math.round((rawScore.social / maxVal) * 100),
      enterprising: Math.round((rawScore.enterprising / maxVal) * 100),
      conventional: Math.round((rawScore.conventional / maxVal) * 100),
    };

    const careers = await prisma.career.findMany({
      where: { status: ContentStatus.PUBLISHED },
      include: {
        cluster: { select: { id: true, name: true, slug: true } },
        resources: {
          where: { status: ContentStatus.PUBLISHED },
          select: { id: true, title: true, url: true, type: true, cost: true, platform: true },
        },
      },
    });

    const ranked = rankCareersForStudent({
      studentProfile: normalizedProfile,
      studentStream: (stream as AcademicStream) || null,
      studentClass: currentClass || null,
      careers: careers.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        eligibleStreams: c.eligibleStreams,
        riasecRealistic: c.riasecRealistic,
        riasecInvestigative: c.riasecInvestigative,
        riasecArtistic: c.riasecArtistic,
        riasecSocial: c.riasecSocial,
        riasecEnterprising: c.riasecEnterprising,
        riasecConventional: c.riasecConventional,
      })),
    });

    const careerLookup = new Map(careers.map((c) => [c.id, c]));

    const recommendations = ranked.slice(0, 8).map((r) => {
      const c = careerLookup.get(r.careerId)!;
      return {
        careerId: c.id,
        title: c.title,
        slug: c.slug,
        description: c.description,
        cluster: c.cluster,
        eligibleStreams: c.eligibleStreams,
        averageDuration: c.averageDuration,
        resourcesCount: c.resources.length,
        matchScore: r.matchScore,
        reasoning: r.reasoning,
      };
    });

    // If authenticated student, persist QuizResponse & Recommendations
    if (authUser?.id) {
      const quizRecord = await prisma.quizResponse.create({
        data: {
          userId: authUser.id,
          versionId,
          responses,
          riasecScore: normalizedProfile as any,
        },
      });

      for (const rec of recommendations) {
        await prisma.recommendation.upsert({
          where: {
            userId_careerId_quizResponseId: {
              userId: authUser.id,
              careerId: rec.careerId,
              quizResponseId: quizRecord.id,
            },
          },
          update: {
            matchScore: rec.matchScore,
            reasoning: rec.reasoning as any,
          },
          create: {
            userId: authUser.id,
            careerId: rec.careerId,
            quizResponseId: quizRecord.id,
            matchScore: rec.matchScore,
            reasoning: rec.reasoning as any,
          },
        });
      }
    }

    return jsonResponse({
      success: true,
      data: {
        profile: normalizedProfile,
        recommendations,
        isAuthenticated: !!authUser?.id,
      },
    }, { origin });
  } catch (error: any) {
    console.error('Error in POST /api/quiz:', error);
    return jsonResponse({ success: false, error: 'Failed to process quiz submission' }, { status: 500, origin });
  }
}
