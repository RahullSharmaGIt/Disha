import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { UserRole, SubmissionStatus, SubmissionEntityType, SubmissionAction } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    if (userRole !== UserRole.CONTRIBUTOR && userRole !== UserRole.ADMIN && userRole !== UserRole.MODERATOR) {
      return NextResponse.json(
        { success: false, error: 'Only approved contributors, moderators, or admins can submit content.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { entityType, data } = body;

    if (!entityType || !data || !['CAREER', 'RESOURCE'].includes(entityType)) {
      return NextResponse.json({ success: false, error: 'Invalid submission data' }, { status: 400 });
    }

    const submission = await prisma.contentSubmission.create({
      data: {
        submitterId: session.user.id,
        entityType: entityType as SubmissionEntityType,
        action: SubmissionAction.CREATE,
        submittedData: data,
        status: SubmissionStatus.PENDING,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Submission received and placed in the moderation queue.',
      submissionId: submission.id,
    });
  } catch (error: any) {
    console.error('Contributor submission error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit content' }, { status: 500 });
  }
}
