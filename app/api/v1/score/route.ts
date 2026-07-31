import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    latest: {
      totalScore: 72,
      eScore: 78,
      sScore: 65,
      gScore: 73,
      ruleSetVersion: 'v1.0.0',
      computedAt: '2024-06-30T09:00:00Z',
    },
    history: [
      { period: '2024-Q1', total: 69, e: 75, s: 62, g: 70 },
      { period: '2024-Q2', total: 72, e: 78, s: 65, g: 73 },
    ],
  });
}
