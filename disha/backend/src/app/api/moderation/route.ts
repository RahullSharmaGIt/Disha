import { NextRequest } from 'next/server';
import { handleCorsPreflight, jsonResponse } from '@/lib/cors';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-middleware';
import {
  SubmissionStatus,
  UserRole,
  ContentStatus,
  ResourceType,
  ResourceCost,
  SubmissionAction,
} from '@prisma/client';

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreflight(req.headers.get('origin'));
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin');
  const auth = requireAuth(req, [UserRole.ADMIN, UserRole.MODERATOR]);
  if ('error' in auth) {
    return jsonResponse({ success: false, error: auth.error }, { status: auth.status, origin });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as SubmissionStatus | null;

    const where: any = {};
    if (status && Object.values(SubmissionStatus).includes(status)) {
      where.status = status;
    }

    const submissions = await prisma.contentSubmission.findMany({
      where,
      include: {
        submitter: {
          select: { id: true, name: true, email: true, role: true },
        },
        reviewer: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    // Enrich RESOURCE submissions with target career info if not present in submittedData
    const resourceCareerIds = Array.from(
      new Set(
        submissions
          .filter(
            (s) =>
              s.entityType === 'RESOURCE' &&
              s.submittedData &&
              typeof s.submittedData === 'object' &&
              (s.submittedData as any).careerId &&
              !(s.submittedData as any).careerTitle
          )
          .map((s) => (s.submittedData as any).careerId as string)
      )
    );

    let careerMap = new Map<string, { title: string; slug: string }>();
    if (resourceCareerIds.length > 0) {
      const careers = await prisma.career.findMany({
        where: { id: { in: resourceCareerIds } },
        select: { id: true, title: true, slug: true },
      });
      careerMap = new Map(careers.map((c) => [c.id, { title: c.title, slug: c.slug }]));
    }

    const enrichedSubmissions = submissions.map((sub) => {
      if (sub.entityType === 'RESOURCE' && sub.submittedData && typeof sub.submittedData === 'object') {
        const data = sub.submittedData as Record<string, any>;
        if (data.careerId && !data.careerTitle && careerMap.has(data.careerId)) {
          const c = careerMap.get(data.careerId)!;
          return {
            ...sub,
            submittedData: {
              ...data,
              careerTitle: c.title,
              careerSlug: c.slug,
            },
          };
        }
      }
      return sub;
    });

    return jsonResponse({
      success: true,
      data: enrichedSubmissions,
    }, { origin });
  } catch (error: any) {
    console.error('Moderation fetch error:', error);
    return jsonResponse({ success: false, error: 'Failed to fetch queue' }, { status: 500, origin });
  }
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  const auth = requireAuth(req, [UserRole.ADMIN, UserRole.MODERATOR]);
  if ('error' in auth) {
    return jsonResponse({ success: false, error: auth.error }, { status: auth.status, origin });
  }

  try {
    const body = await req.json();
    const { submissionId, decision, reviewNotes } = body;

    if (!submissionId || !['APPROVED', 'CHANGES_REQUESTED', 'REJECTED'].includes(decision)) {
      return jsonResponse({ success: false, error: 'Invalid moderation decision' }, { status: 400, origin });
    }

    const submission = await prisma.contentSubmission.findUnique({
      where: { id: submissionId },
      include: { submitter: true },
    });

    if (!submission) {
      return jsonResponse({ success: false, error: 'Submission not found' }, { status: 404, origin });
    }

    const data = (submission.submittedData || {}) as Record<string, any>;

    // Pre-flight validation for resource approval before entering transaction
    if (decision === 'APPROVED' && submission.entityType === 'RESOURCE') {
      if (!data.careerId && !data.careerSlug) {
        return jsonResponse({
          success: false,
          error: 'Resource submission is missing target career information (careerId/careerSlug).',
        }, { status: 400, origin });
      }

      if (!data.title || !data.url) {
        return jsonResponse({
          success: false,
          error: 'Resource submission must have a valid title and URL.',
        }, { status: 400, origin });
      }
    }

    // Execute status change and entity publishing atomically
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update the submission review metadata
      const updatedSubmission = await tx.contentSubmission.update({
        where: { id: submissionId },
        data: {
          status: decision as SubmissionStatus,
          reviewerId: auth.user.id,
          reviewNotes: reviewNotes || null,
          reviewedAt: new Date(),
        },
      });

      let publishedEntity: any = null;

      // 2. Publish entity upon approval
      if (decision === 'APPROVED') {
        if (submission.entityType === 'CAREER') {
          publishedEntity = await tx.career.upsert({
            where: { slug: data.slug },
            update: {
              title: data.title,
              description: data.description,
              prerequisites: data.prerequisites || [],
              eligibleStreams: data.eligibleStreams || [],
              averageDuration: data.averageDuration || null,
              clusterId: data.clusterId,
              status: ContentStatus.PUBLISHED,
              reviewerId: auth.user.id,
              publishedAt: new Date(),
            },
            create: {
              title: data.title,
              slug: data.slug,
              description: data.description,
              prerequisites: data.prerequisites || [],
              eligibleStreams: data.eligibleStreams || [],
              averageDuration: data.averageDuration || null,
              clusterId: data.clusterId,
              status: ContentStatus.PUBLISHED,
              authorId: submission.submitterId,
              reviewerId: auth.user.id,
              publishedAt: new Date(),
            },
          });
        } else if (submission.entityType === 'RESOURCE') {
          // Resolve target career by ID or Slug
          const targetCareer = await tx.career.findFirst({
            where: {
              OR: [
                ...(data.careerId ? [{ id: data.careerId }] : []),
                ...(data.careerSlug ? [{ slug: data.careerSlug }] : []),
              ],
            },
          });

          if (!targetCareer) {
            throw new Error(`Target career (${data.careerId || data.careerSlug}) no longer exists.`);
          }

          // Validate resource enums
          const validTypes = Object.values(ResourceType);
          const validCosts = Object.values(ResourceCost);
          const resourceType = validTypes.includes(data.type) ? (data.type as ResourceType) : ResourceType.COURSE;
          const resourceCost = validCosts.includes(data.cost) ? (data.cost as ResourceCost) : ResourceCost.FREE;

          if (submission.action === SubmissionAction.UPDATE && data.resourceId) {
            // Update existing resource
            publishedEntity = await tx.careerResource.update({
              where: { id: data.resourceId },
              data: {
                title: data.title,
                url: data.url,
                type: resourceType,
                cost: resourceCost,
                platform: data.platform || null,
                status: ContentStatus.PUBLISHED,
              },
            });
          } else {
            // Check if resource with same URL already exists for this career to avoid duplicates
            const existingResource = await tx.careerResource.findFirst({
              where: {
                careerId: targetCareer.id,
                url: data.url,
              },
            });

            if (existingResource) {
              publishedEntity = await tx.careerResource.update({
                where: { id: existingResource.id },
                data: {
                  title: data.title,
                  type: resourceType,
                  cost: resourceCost,
                  platform: data.platform || null,
                  status: ContentStatus.PUBLISHED,
                },
              });
            } else {
              publishedEntity = await tx.careerResource.create({
                data: {
                  careerId: targetCareer.id,
                  title: data.title,
                  url: data.url,
                  type: resourceType,
                  cost: resourceCost,
                  platform: data.platform || null,
                  status: ContentStatus.PUBLISHED,
                  authorId: submission.submitterId,
                },
              });
            }
          }
        }
      }

      return {
        submission: updatedSubmission,
        publishedEntity,
      };
    });

    console.log(
      `[MODERATION] Decision ${decision} recorded for submission ${submissionId} (${submission.entityType}) by ${auth.user.email}`
    );

    return jsonResponse({
      success: true,
      message: `Submission marked as ${decision}${result.publishedEntity ? ' and published to live catalog' : ''}.`,
      data: result.submission,
      publishedEntity: result.publishedEntity,
    }, { origin });
  } catch (error: any) {
    console.error('Moderation decision error:', error);
    return jsonResponse({
      success: false,
      error: error.message || 'Failed to process moderation decision',
    }, { status: 500, origin });
  }
}
