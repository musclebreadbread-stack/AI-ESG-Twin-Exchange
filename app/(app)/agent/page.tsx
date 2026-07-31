import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/card';
import { Badge } from '@/ui/components/badge';
import { Button } from '@/ui/components/button';

export default function AgentPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI 에이전트</h1>
          <p className="text-sm text-gray-500 mt-1">AI가 분석한 인사이트와 권장 조치</p>
        </div>
        <Button size="sm">분석 실행</Button>
      </div>

      <div className="grid gap-4">
        {[
          { priority: '긴급', title: 'Scope 2 감축 기회', desc: '본사 재생에너지 전환으로 120tCO₂e 감축 가능', category: '감축 기회' },
          { priority: '주의', title: '데이터 이상 탐지', desc: '공장B 6월 전력량이 전월 대비 300% 증가', category: '데이터 품질' },
          { priority: '참고', title: 'GRI 302-1 커버리지', desc: '재생에너지 비율 입력 시 100% 달성 가능', category: '프레임워크' },
        ].map((insight, idx) => (
          <Card key={idx}>
            <CardContent className="flex items-center gap-4 p-4">
              <Badge variant={insight.priority === '긴급' ? 'destructive' : insight.priority === '주의' ? 'warning' : 'secondary'}>{insight.priority}</Badge>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{insight.title}</div>
                <div className="text-sm text-gray-500 mt-0.5">{insight.desc}</div>
              </div>
              <Badge variant="outline">{insight.category}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
