import { NextRequest } from 'next/server';
import { handleCorsPreflight, jsonResponse } from '@/lib/cors';
import prisma from '@/lib/prisma';

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreflight(req.headers.get('origin'));
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  try {
    const { token } = await req.json();

    if (!token) {
      return jsonResponse({ success: false, error: 'Consent token is required' }, { status: 400, origin });
    }

    const user = await prisma.user.findUnique({
      where: { parentConsentToken: token },
    });

    if (!user) {
      return jsonResponse({ success: false, error: 'Invalid or expired consent token' }, { status: 404, origin });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        parentConsentVerified: true,
        parentConsentToken: null,
      },
    });

    return jsonResponse({
      success: true,
      message: `Parental consent verified for ${user.name || 'student'}. Account activated!`,
      studentName: user.name,
    }, { origin });
  } catch (error: any) {
    console.error('Consent verification error:', error);
    return jsonResponse({ success: false, error: 'Verification failed' }, { status: 500, origin });
  }
}
