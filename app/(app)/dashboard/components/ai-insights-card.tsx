'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/card';
import { Badge } from '@/ui/components/badge';

export function AiInsightsCard() {
  const insights = [
    { id: '1', priority: 'high', title: 'Scope 2 감축 기회', desc: '본사 빌딩 재생에너지 전환으로 연간 120tCO₂e 감축 가능', category: '감축' },
    { id: '2', priority: 'medium', title: '데이터 품질 경고', desc: '공장B의 6월 전력 데이터가 전월 대비 300% 증가 — 확인 필요', category: '품질' },
    { id: '3', priority: 'low', title: 'GRI 302-1 커버리지', desc: '에너지 소비량 항목 90% 충족. 재생에너지 비율 입력 시 100% 달성', category: '프레임워크' },
    { id: '4', priority: 'medium', title: '벤치마크 비교', desc: '동종업계 대비 Scope 1 집약도 15% 높음. 보일러 효율 개선 권장', category: '벤치마크' },
  ];

  const priorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'destructive' as const;
      case 'medium': return 'warning' as const;
      default: return 'secondary' as const;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">AI 인사이트</CardTitle>
          <Badge variant="outline" className="text-[10px]">4건</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((i) => (
            <div key={i.id} className="flex gap-3 border-b border-gray-100 pb-3 last:border-0">
              <Badge variant={priorityColor(i.priority)} className="h-5 text-[10px] shrink-0">
                {i.priority === 'high' ? '긴급' : i.priority === 'medium' ? '주의' : '참고'}
              </Badge>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{i.title}</div>
                <p className="text-xs text-gray-500 mt-0.5">{i.desc}</p>
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0">{i.category}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
