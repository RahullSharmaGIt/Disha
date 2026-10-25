import { NextRequest } from 'next/server';
import { handleCorsPreflight, jsonResponse } from '@/lib/cors';
import prisma from '@/lib/prisma';

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreflight(req.headers.get('origin'));
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin');
  try {
    const careerCount = await prisma.career.count();
    return jsonResponse({
      status: 'healthy',
      service: 'disha-backend-api',
      database: 'connected',
      careersAvailable: careerCount,
      timestamp: new Date().toISOString(),
    }, { origin });
  } catch (err: any) {
    return jsonResponse({
      status: 'degraded',
      service: 'disha-backend-api',
      database: 'disconnected',
      error: err.message,
    }, { status: 500, origin });
  }
}
