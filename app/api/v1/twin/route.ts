import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    twin: {
      id: 'mock-twin',
      activeVersion: 3,
      status: 'active',
      overallCompleteness: 55,
      domainStats: [
        { domain: 'energy', pct: 92, state: '충족' },
        { domain: 'emission', pct: 88, state: '충족' },
        { domain: 'water', pct: 45, state: '부분' },
        { domain: 'waste', pct: 30, state: '부분' },
        { domain: 'supply_chain', pct: 15, state: '부분' },
        { domain: 'safety', pct: 60, state: '부분' },
        { domain: 'human_rights', pct: 20, state: '부분' },
        { domain: 'labor', pct: 35, state: '부분' },
        { domain: 'ethics', pct: 40, state: '부분' },
        { domain: 'governance', pct: 70, state: '부분' },
        { domain: 'community', pct: 10, state: '부분' },
        { domain: 'product', pct: 25, state: '부분' },
      ],
    },
  });
}

export async function POST() {
  return NextResponse.json(
    { message: '트윈 빌드 시작 (mock)', jobId: 'mock-twin-build-job' },
    { status: 202 }
  );
}
