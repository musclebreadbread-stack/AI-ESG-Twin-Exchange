'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/card';
import { Progress } from '@/ui/components/progress';
import { Badge } from '@/ui/components/badge';

export function TwinStatusCard() {
  const domains = [
    { name: '에너지', pct: 92, state: '충족' as const },
    { name: '배출', pct: 88, state: '충족' as const },
    { name: '용수', pct: 45, state: '부분' as const },
    { name: '폐기물', pct: 30, state: '부분' as const },
    { name: '공급망', pct: 15, state: '부분' as const },
    { name: '안전', pct: 60, state: '부분' as const },
  ];

  const overall = Math.round(domains.reduce((s, d) => s + d.pct, 0) / domains.length);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">디지털 트윈 상태</CardTitle>
          <Badge variant={overall >= 80 ? 'default' : 'warning'}>{overall}%</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {domains.map((d) => (
            <div key={d.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">{d.name}</span>
                <span className="font-medium">{d.pct}%</span>
              </div>
              <Progress value={d.pct} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
