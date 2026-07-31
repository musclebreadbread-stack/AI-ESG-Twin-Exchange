import { NextRequest, NextResponse } from 'next/server';
import { factorLookupSchema } from '@/features/factor/schema/factor';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const parsed = factorLookupSchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json({ error: 'VALIDATION', details: parsed.error.issues }, { status: 400 });
  }

  return NextResponse.json({
    factor: {
      value: '0.000459',
      unit: 'tCO2/kWh',
      provider: 'KR-NIR',
      publishedYear: 2023,
      validFrom: '2023-01-01',
      sourceTier: 'platform_default',
    },
  });
}
