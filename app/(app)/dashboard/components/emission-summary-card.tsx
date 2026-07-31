'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/card';
import { Badge } from '@/ui/components/badge';

export function EmissionSummaryCard() {
  const data = {
    totalTco2e: '1,247.3',
    scope1: '312.8',
    scope2Location: '834.5',
    scope2Market: '798.2',
    yoyChange: '-8.2%',
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">탄소 배출량</CardTitle>
          <Badge variant="default">{data.yoyChange} YoY</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-gray-900">{data.totalTco2e}</div>
          <div className="text-xs text-gray-500">tCO₂e (당기 누적)</div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-400" />
              <span className="text-sm text-gray-600">Scope 1 (직접)</span>
            </div>
            <span className="text-sm font-medium">{data.scope1} t</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-400" />
              <span className="text-sm text-gray-600">Scope 2 (위치기반)</span>
            </div>
            <span className="text-sm font-medium">{data.scope2Location} t</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-sky-300" />
              <span className="text-sm text-gray-600">Scope 2 (시장기반)</span>
            </div>
            <span className="text-sm font-medium">{data.scope2Market} t</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
