import { NextRequest, NextResponse } from 'next/server';
import { createActivitySchema } from '@/features/activity/schema/activity';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createActivitySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'VALIDATION', details: parsed.error.issues },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { message: '활동량 등록 완료 (mock)', id: 'mock-activity-id', data: parsed.data },
    { status: 201 }
  );
}

export async function GET() {
  // Mock activity list
  return NextResponse.json({
    items: [
      { id: '1', itemCode: 'electricity_grid', originalValue: '15000', originalUnit: 'kWh', periodStart: '2024-06-01', periodEnd: '2024-06-30', provenance: 'manual_entry' },
      { id: '2', itemCode: 'natural_gas', originalValue: '500', originalUnit: 'm3', periodStart: '2024-06-01', periodEnd: '2024-06-30', provenance: 'csv_import' },
      { id: '3', itemCode: 'diesel', originalValue: '200', originalUnit: 'L', periodStart: '2024-06-01', periodEnd: '2024-06-30', provenance: 'manual_entry' },
    ],
    total: 3,
  });
}
