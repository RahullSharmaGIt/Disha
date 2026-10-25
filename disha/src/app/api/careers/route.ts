import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AcademicStream, ContentStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cluster = searchParams.get('cluster');
    const stream = searchParams.get('stream') as AcademicStream | null;
    const search = searchParams.get('search');

    const where: any = {
      status: ContentStatus.PUBLISHED,
    };

    if (cluster) {
      where.cluster = {
        slug: cluster,
      };
    }

    if (stream && Object.values(AcademicStream).includes(stream)) {
      where.eligibleStreams = {
        has: stream,
      };
    }

    if (search && search.trim().length > 0) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const careers = await prisma.career.findMany({
      where,
      include: {
        cluster: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        resources: {
          where: { status: ContentStatus.PUBLISHED },
          select: {
            id: true,
            title: true,
            url: true,
            type: true,
            cost: true,
            platform: true,
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
    });

    const clusters = await prisma.careerCluster.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        careers,
        clusters,
        total: careers.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching careers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch careers' },
      { status: 500 }
    );
  }
}
