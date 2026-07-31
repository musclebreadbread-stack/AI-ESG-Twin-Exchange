import { NextRequest, NextResponse } from 'next/server';
import { createOrgNodeSchema } from '@/features/org/schema/org';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createOrgNodeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'VALIDATION', details: parsed.error.issues }, { status: 400 });
  }

  return NextResponse.json(
    { message: '조직 노드 생성 (mock)', id: 'mock-org-node' },
    { status: 201 }
  );
}

export async function GET() {
  return NextResponse.json({
    tree: [
      { id: '1', kind: 'company', name: '㈜ 테스트회사', depth: 0, children: [
        { id: '2', kind: 'division', name: '경영지원본부', depth: 1, children: [] },
        { id: '3', kind: 'division', name: '제조본부', depth: 1, children: [
          { id: '4', kind: 'site', name: '안산공장', depth: 2, children: [
            { id: '5', kind: 'facility', name: 'A동', depth: 3, children: [] },
            { id: '6', kind: 'facility', name: 'B동', depth: 3, children: [] },
          ]},
        ]},
      ]},
    ],
  });
}
