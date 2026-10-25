import { NextRequest } from 'next/server';
import { handleCorsPreflight, jsonResponse } from '@/lib/cors';
import prisma from '@/lib/prisma';

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreflight(req.headers.get('origin'));
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin');
  try {
    const clusters = await prisma.careerCluster.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return jsonResponse({
      success: true,
      data: clusters,
    }, { origin });
  } catch (error: any) {
    console.error('Error fetching clusters:', error);
    return jsonResponse({ success: false, error: 'Failed to fetch clusters' }, { status: 500, origin });
  }
}
