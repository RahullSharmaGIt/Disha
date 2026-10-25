import { NextResponse } from 'next/server';

export function getCorsHeaders(origin?: string | null): Record<string, string> {
  const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  const requestOrigin = origin || allowedOrigin;

  return {
    'Access-Control-Allow-Origin': requestOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export function handleCorsPreflight(origin?: string | null) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

export function jsonResponse(data: any, options: { status?: number; origin?: string | null } = {}) {
  const { status = 200, origin } = options;
  return NextResponse.json(data, {
    status,
    headers: getCorsHeaders(origin),
  });
}
