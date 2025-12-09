import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from './auth';

export function requireAuth(request: NextRequest): NextResponse | null {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  return null;
}

export function requireRole(request: NextRequest, allowedRoles: string[]): NextResponse | null {
  const authError = requireAuth(request);
  if (authError) return authError;
  
  const user = getAuthUser(request);
  if (user && !allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: 'Forbidden - Insufficient permissions' },
      { status: 403 }
    );
  }
  return null;
}

