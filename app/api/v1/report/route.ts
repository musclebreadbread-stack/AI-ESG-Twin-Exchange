import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const generateReportSchema = z.object({
  frameworkCode: z.string().min(1),
  period: z.object({ start: z.string().date(), end: z.string().date() }),
  language: z.enum(['ko', 'en']).default('ko'),
  formats: z.array(z.enum(['pdf', 'docx', 'xlsx', 'pptx'])).min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = generateReportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'VALIDATION', details: parsed.error.issues },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { message: '리포트 생성 작업 시작 (mock)', jobId: 'mock-report-job', framework: parsed.data.frameworkCode },
    { status: 202 }
  );
}

export async function GET() {
  return NextResponse.json({
    reports: [
      { id: '1', framework: 'GRI', period: '2024-Q2', status: 'final', formats: ['pdf', 'docx', 'xlsx', 'pptx'], createdAt: '2024-07-01' },
      { id: '2', framework: 'KSSB', period: '2024-Q2', status: 'draft', formats: ['pdf'], createdAt: '2024-07-10' },
    ],
  });
}
