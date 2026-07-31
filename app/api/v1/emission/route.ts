import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    summary: {
      totalTco2e: '1247.300',
      scope1: '312.800',
      scope2Location: '834.500',
      scope2Market: '798.200',
      biogenicCo2T: '12.500',
      period: { start: '2024-01-01', end: '2024-06-30' },
    },
    byMonth: [
      { month: '2024-01', tco2e: '215.4' },
      { month: '2024-02', tco2e: '198.7' },
      { month: '2024-03', tco2e: '210.1' },
      { month: '2024-04', tco2e: '205.3' },
      { month: '2024-05', tco2e: '208.9' },
      { month: '2024-06', tco2e: '208.9' },
    ],
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json(
    { message: '산정 작업 시작 (mock)', jobId: 'mock-calc-job' },
    { status: 202 }
  );
}
