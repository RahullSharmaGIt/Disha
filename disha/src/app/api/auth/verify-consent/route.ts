import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Consent token is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { parentConsentToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired consent token' },
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        parentConsentVerified: true,
        parentConsentToken: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Parental consent verified for ${user.name || 'student'}. Account activated!`,
      studentName: user.name,
    });
  } catch (error: any) {
    console.error('Consent verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
