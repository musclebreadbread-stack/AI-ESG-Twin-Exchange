import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/features/auth/schema/login';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'VALIDATION', details: parsed.error.issues }, { status: 400 });
  }
  return NextResponse.json({ message: '로그인 성공 (mock)', session: { id: 'mock-session' } });
}
