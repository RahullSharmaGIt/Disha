import { NextRequest } from 'next/server';
import { handleCorsPreflight, jsonResponse } from '@/lib/cors';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-middleware';

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreflight(req.headers.get('origin'));
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin');
  const auth = requireAuth(req);
  if ('error' in auth) {
    return jsonResponse({ success: false, error: auth.error }, { status: auth.status, origin });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      include: {
        recommendations: {
          include: {
            career: {
              include: {
                cluster: true,
                resources: true,
              },
            },
          },
          orderBy: { matchScore: 'desc' },
        },
        quizResponses: {
          orderBy: { completedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return jsonResponse({ success: false, error: 'User not found' }, { status: 404, origin });
    }

    const latestQuiz = user.quizResponses[0];
    const riasecProfile = latestQuiz?.riasecScore as Record<string, number> | null;

    return jsonResponse({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          currentClass: user.currentClass,
          stream: user.stream,
          parentConsentVerified: user.parentConsentVerified,
        },
        riasecProfile,
        recommendations: user.recommendations.map((rec) => ({
          id: rec.id,
          matchScore: rec.matchScore,
          reasoning: rec.reasoning,
          career: {
            id: rec.career.id,
            title: rec.career.title,
            slug: rec.career.slug,
            description: rec.career.description,
            cluster: rec.career.cluster,
            resources: rec.career.resources,
          },
        })),
      },
    }, { origin });
  } catch (error: any) {
    console.error('Error fetching dashboard:', error);
    return jsonResponse({ success: false, error: 'Failed to fetch dashboard data' }, { status: 500, origin });
  }
}
