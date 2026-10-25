import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { SubmissionStatus, UserRole, ContentStatus } from '@prisma/client';
import { sendEmail } from '@/lib/email/transporter';
import { submissionStatusEmail } from '@/lib/email/templates';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.MODERATOR)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

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

    return NextResponse.json({
      success: true,
      data: submissions,
    });
  } catch (error: any) {
    console.error('Moderation fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch queue' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.MODERATOR)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { submissionId, decision, reviewNotes } = body;

    if (!submissionId || !['APPROVED', 'CHANGES_REQUESTED', 'REJECTED'].includes(decision)) {
      return NextResponse.json({ success: false, error: 'Invalid moderation decision' }, { status: 400 });
    }

    const submission = await prisma.contentSubmission.findUnique({
      where: { id: submissionId },
      include: { submitter: true },
    });

    if (!submission) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
    }

    // Update submission status
    const updated = await prisma.contentSubmission.update({
      where: { id: submissionId },
      data: {
        status: decision as SubmissionStatus,
        reviewerId: session.user.id,
        reviewNotes: reviewNotes || null,
        reviewedAt: new Date(),
      },
    });

    // If approved and entityType is CAREER or RESOURCE, publish the entity
    const data = submission.submittedData as any;
    if (decision === 'APPROVED') {
      if (submission.entityType === 'CAREER') {
        await prisma.career.upsert({
          where: { slug: data.slug },
          update: {
            title: data.title,
            description: data.description,
            prerequisites: data.prerequisites,
            eligibleStreams: data.eligibleStreams,
            averageDuration: data.averageDuration,
            clusterId: data.clusterId,
            status: ContentStatus.PUBLISHED,
            reviewerId: session.user.id,
            publishedAt: new Date(),
          },
          create: {
            title: data.title,
            slug: data.slug,
            description: data.description,
            prerequisites: data.prerequisites,
            eligibleStreams: data.eligibleStreams,
            averageDuration: data.averageDuration,
            clusterId: data.clusterId,
            status: ContentStatus.PUBLISHED,
            authorId: submission.submitterId,
            reviewerId: session.user.id,
            publishedAt: new Date(),
          },
        });
      } else if (submission.entityType === 'RESOURCE') {
        await prisma.careerResource.create({
          data: {
            careerId: data.careerId,
            title: data.title,
            url: data.url,
            type: data.type,
            cost: data.cost,
            platform: data.platform,
            status: ContentStatus.PUBLISHED,
            authorId: submission.submitterId,
          },
        });
      }
    }

    // Send email notification to submitter
    if (submission.submitter.email) {
      const emailContent = submissionStatusEmail({
        contributorName: submission.submitter.name || 'Contributor',
        careerTitle: data.title || 'Career Submission',
        status: decision as any,
        reviewNotes,
      });

      try {
        await sendEmail({
          to: submission.submitter.email,
          subject: emailContent.subject,
          html: emailContent.html,
        });
      } catch (err) {
        console.error('Failed to notify contributor via email:', err);
      }
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error('Moderation decision error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process decision' }, { status: 500 });
  }
}
