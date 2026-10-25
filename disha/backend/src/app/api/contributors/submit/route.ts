import { NextRequest } from 'next/server';
import { handleCorsPreflight, jsonResponse } from '@/lib/cors';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-middleware';
import { UserRole, SubmissionStatus, SubmissionEntityType, SubmissionAction } from '@prisma/client';

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreflight(req.headers.get('origin'));
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  const auth = requireAuth(req, [UserRole.CONTRIBUTOR, UserRole.ADMIN, UserRole.MODERATOR]);
  if ('error' in auth) {
    return jsonResponse({ success: false, error: auth.error }, { status: auth.status, origin });
  }

  try {
    const body = await req.json();
    const { entityType, data } = body;

    if (!entityType || !data || !['CAREER', 'RESOURCE'].includes(entityType)) {
      return jsonResponse({ success: false, error: 'Invalid submission data' }, { status: 400, origin });
    }

    if (entityType === 'RESOURCE') {
      if (!data.careerId || !data.title || !data.url) {
        return jsonResponse({
          success: false,
          error: 'Resource submission requires target career, title, and valid URL',
        }, { status: 400, origin });
      }
    }

    const submission = await prisma.contentSubmission.create({
      data: {
        submitterId: auth.user.id,
        entityType: entityType as SubmissionEntityType,
        action: SubmissionAction.CREATE,
        submittedData: data,
        status: SubmissionStatus.PENDING,
      },
    });

    return jsonResponse({
      success: true,
      message: `${entityType === 'RESOURCE' ? 'Learning resource' : 'Career'} received and placed in the moderation queue.`,
      submissionId: submission.id,
    }, { status: 201, origin });
  } catch (error: any) {
    console.error('Contributor submission error:', error);
    return jsonResponse({ success: false, error: 'Failed to submit content' }, { status: 500, origin });
  }
}
