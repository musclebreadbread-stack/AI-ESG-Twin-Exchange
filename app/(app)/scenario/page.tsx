import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/card';
import { Button } from '@/ui/components/button';
import { Badge } from '@/ui/components/badge';

export default function ScenarioPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">시나리오 시뮬레이터</h1>
          <p className="text-sm text-gray-500 mt-1">감축 시나리오를 시뮬레이션하고 실행 계획을 수립합니다</p>
        </div>
        <Button size="sm">새 시나리오</Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <div className="font-medium">태양광 발전 전환</div>
              <div className="text-xs text-gray-500 mt-1">예상 감축: -120 tCO₂e/년 · 투자비: ₩2.5억</div>
            </div>
            <Badge variant="default">채택됨</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <div className="font-medium">보일러 고효율 교체</div>
              <div className="text-xs text-gray-500 mt-1">예상 감축: -85 tCO₂e/년 · 투자비: ₩8,000만</div>
            </div>
            <Badge variant="warning">시뮬레이션 완료</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <div className="font-medium">전기차 전환 (사내차량)</div>
              <div className="text-xs text-gray-500 mt-1">예상 감축: -45 tCO₂e/년 · 투자비: ₩1.2억</div>
            </div>
            <Badge variant="secondary">초안</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
