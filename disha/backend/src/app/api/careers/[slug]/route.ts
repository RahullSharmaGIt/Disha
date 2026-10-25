import { NextRequest } from 'next/server';
import { handleCorsPreflight, jsonResponse } from '@/lib/cors';
import prisma from '@/lib/prisma';
import { ContentStatus } from '@prisma/client';

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreflight(req.headers.get('origin'));
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const origin = req.headers.get('origin');
  try {
    const { slug } = await params;

    const career = await prisma.career.findUnique({
      where: { slug },
      include: {
        cluster: true,
        resources: {
          where: { status: ContentStatus.PUBLISHED },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!career || career.status !== ContentStatus.PUBLISHED) {
      return jsonResponse({ success: false, error: 'Career not found' }, { status: 404, origin });
    }

    const relatedCareers = await prisma.career.findMany({
      where: {
        clusterId: career.clusterId,
        id: { not: career.id },
        status: ContentStatus.PUBLISHED,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        averageDuration: true,
      },
      take: 4,
    });

    return jsonResponse({
      success: true,
      data: {
        career,
        relatedCareers,
      },
    }, { origin });
  } catch (error: any) {
    console.error('Error fetching career detail:', error);
    return jsonResponse({ success: false, error: 'Failed to fetch career details' }, { status: 500, origin });
  }
}
