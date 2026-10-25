import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ContentStatus } from '@prisma/client';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
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
      return NextResponse.json(
        { success: false, error: 'Career not found' },
        { status: 404 }
      );
    }

    // Related careers in the same cluster
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

    return NextResponse.json({
      success: true,
      data: {
        career,
        relatedCareers,
      },
    });
  } catch (error: any) {
    console.error('Error fetching career detail:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch career details' },
      { status: 500 }
    );
  }
}
