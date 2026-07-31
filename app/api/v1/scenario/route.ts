import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createScenarioSchema = z.object({
  name: z.string().min(1).max(128),
  actions: z.array(z.object({
    actionType: z.string().min(1),
    description: z.string(),
    assumptions: z.array(z.object({
      key: z.string(),
      label: z.string(),
      baselineValue: z.string(),
      targetValue: z.string(),
      unit: z.string(),
    })),
  })).min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createScenarioSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'VALIDATION', details: parsed.error.issues }, { status: 400 });
  }

  return NextResponse.json(
    { message: '시나리오 시뮬레이션 시작 (mock)', jobId: 'mock-scenario-job' },
    { status: 202 }
  );
}

export async function GET() {
  return NextResponse.json({
    scenarios: [
      { id: '1', name: '태양광 전환', projectedReduction: '-120 tCO₂e', status: 'adopted', createdAt: '2024-06-15' },
      { id: '2', name: '보일러 교체', projectedReduction: '-85 tCO₂e', status: 'simulated', createdAt: '2024-07-01' },
    ],
  });
}
