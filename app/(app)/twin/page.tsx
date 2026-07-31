import { Card, CardContent } from '@/ui/components/card';
import { Progress } from '@/ui/components/progress';
import { Badge } from '@/ui/components/badge';
import { Button } from '@/ui/components/button';

export default function TwinPage() {
  const domains = [
    { name: '에너지', pct: 92 }, { name: '배출', pct: 88 }, { name: '용수', pct: 45 },
    { name: '폐기물', pct: 30 }, { name: '공급망', pct: 15 }, { name: '안전', pct: 60 },
    { name: '인권', pct: 20 }, { name: '노동', pct: 35 }, { name: '윤리', pct: 40 },
    { name: '지배구조', pct: 70 }, { name: '지역사회', pct: 10 }, { name: '제품', pct: 25 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ESG 디지털 트윈</h1>
          <p className="text-sm text-gray-500 mt-1">12개 도메인의 ESG 데이터 충족 현황</p>
        </div>
        <Button size="sm">트윈 갱신</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {domains.map((d) => (
          <Card key={d.name}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{d.name}</span>
                <Badge variant={d.pct >= 80 ? 'default' : d.pct >= 40 ? 'warning' : 'destructive'}>{d.pct}%</Badge>
              </div>
              <Progress value={d.pct} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
