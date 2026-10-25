import { NextRequest } from 'next/server';
import { handleCorsPreflight, jsonResponse } from '@/lib/cors';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-middleware';

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreflight(req.headers.get('origin'));
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin');
  const auth = requireAuth(req);
  if ('error' in auth) {
    return jsonResponse({ success: false, error: auth.error }, { status: auth.status, origin });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        currentClass: true,
        stream: true,
        parentConsentVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return jsonResponse({ success: false, error: 'User not found' }, { status: 404, origin });
    }

    return jsonResponse({
      success: true,
      data: user,
    }, { origin });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return jsonResponse({ success: false, error: 'Failed to fetch user' }, { status: 500, origin });
  }
}
