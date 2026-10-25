import { NextRequest } from 'next/server';
import { handleCorsPreflight, jsonResponse } from '@/lib/cors';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { registerSchema } from '@/lib/validators/auth';
import { UserRole } from '@prisma/client';

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreflight(req.headers.get('origin'));
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existing) {
      return jsonResponse({ success: false, error: 'An account with this email already exists' }, { status: 400, origin });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const parentConsentToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        hashedPassword,
        currentClass: validatedData.currentClass,
        stream: validatedData.stream,
        parentEmail: validatedData.parentEmail,
        parentConsentToken,
        parentConsentSentAt: new Date(),
        parentConsentVerified: false,
        role: UserRole.STUDENT,
      },
    });

    // Verification link for frontend
    const frontendUrl = origin || process.env.CORS_ORIGIN || 'http://localhost:3000';
    const consentUrl = `${frontendUrl}/verify?token=${parentConsentToken}`;
    console.log(`[DPDPA CONSENT] Verification URL for ${user.email} (Parent: ${validatedData.parentEmail}): ${consentUrl}`);

    return jsonResponse({
      success: true,
      message: 'Student account created. Parental consent verification initiated.',
      userId: user.id,
      consentToken: parentConsentToken,
    }, { status: 201, origin });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return jsonResponse({ success: false, error: error.errors[0]?.message || 'Validation error' }, { status: 400, origin });
    }
    console.error('Registration error:', error);
    return jsonResponse({ success: false, error: 'Registration failed. Please try again.' }, { status: 500, origin });
  }
}
