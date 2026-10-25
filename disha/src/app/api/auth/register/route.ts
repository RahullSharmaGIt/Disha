import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { registerSchema } from '@/lib/validators/auth';
import { sendEmail } from '@/lib/email/transporter';
import { parentConsentEmail } from '@/lib/email/templates';
import { UserRole } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 400 }
      );
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

    // Send parental consent email
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const consentUrl = `${baseUrl}/verify?token=${parentConsentToken}`;

    const emailContent = parentConsentEmail({
      studentName: user.name || 'Student',
      consentUrl,
    });

    try {
      await sendEmail({
        to: validatedData.parentEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    } catch (emailErr) {
      console.error('Failed to send consent email:', emailErr);
      // We don't abort user creation if email simulated or fails in local dev
    }

    return NextResponse.json({
      success: true,
      message: 'Student account created. A parental consent verification email has been sent.',
      userId: user.id,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: error.errors[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
