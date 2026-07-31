import { NextRequest, NextResponse } from 'next/server';
import { signupSchema } from '@/features/auth/schema/login';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'VALIDATION', details: parsed.error.issues }, { status: 400 });
  }
  return NextResponse.json({ message: '회원가입 성공 (mock)', userId: 'mock-user-id' }, { status: 201 });
}
