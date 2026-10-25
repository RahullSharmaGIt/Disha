import { NextRequest } from 'next/server';
import { handleCorsPreflight, jsonResponse } from '@/lib/cors';
import prisma from '@/lib/prisma';
import { AcademicStream, ContentStatus } from '@prisma/client';

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreflight(req.headers.get('origin'));
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin');
  try {
    const { searchParams } = new URL(req.url);
    const cluster = searchParams.get('cluster');
    const stream = searchParams.get('stream') as AcademicStream | null;
    const search = searchParams.get('search') || searchParams.get('q');

    const where: any = {
      status: ContentStatus.PUBLISHED,
    };

    if (cluster) {
      where.cluster = { slug: cluster };
    }

    if (stream && Object.values(AcademicStream).includes(stream)) {
      where.eligibleStreams = { has: stream };
    }

    if (search && search.trim().length > 0) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [careers, clusters] = await Promise.all([
      prisma.career.findMany({
        where,
        include: {
          cluster: {
            select: { id: true, name: true, slug: true },
          },
          resources: {
            where: { status: ContentStatus.PUBLISHED },
            select: { id: true, title: true, url: true, type: true, cost: true, platform: true },
          },
        },
        orderBy: { title: 'asc' },
      }),
      prisma.careerCluster.findMany({
        orderBy: { sortOrder: 'asc' },
      }),
    ]);

    return jsonResponse({
      success: true,
      data: {
        careers,
        clusters,
        total: careers.length,
      },
    }, { origin });
  } catch (error: any) {
    console.error('Error in GET /api/careers:', error);
    return jsonResponse({ success: false, error: 'Failed to fetch careers' }, { status: 500, origin });
  }
}
