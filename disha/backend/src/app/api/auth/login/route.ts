import { NextRequest } from 'next/server';
import { handleCorsPreflight, jsonResponse } from '@/lib/cors';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signJwt } from '@/lib/jwt';
import { loginSchema } from '@/lib/validators/auth';

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreflight(req.headers.get('origin'));
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (!user || !user.hashedPassword) {
      return jsonResponse({ success: false, error: 'Invalid email or password' }, { status: 401, origin });
    }

    const isValid = await bcrypt.compare(validated.password, user.hashedPassword);
    if (!isValid) {
      return jsonResponse({ success: false, error: 'Invalid email or password' }, { status: 401, origin });
    }

    const token = signJwt({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      parentConsentVerified: user.parentConsentVerified,
    });

    return jsonResponse({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          currentClass: user.currentClass,
          stream: user.stream,
          parentConsentVerified: user.parentConsentVerified,
        },
      },
    }, { origin });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return jsonResponse({ success: false, error: error.errors[0]?.message || 'Validation error' }, { status: 400, origin });
    }
    console.error('Login error:', error);
    return jsonResponse({ success: false, error: 'Authentication failed' }, { status: 500, origin });
  }
}
