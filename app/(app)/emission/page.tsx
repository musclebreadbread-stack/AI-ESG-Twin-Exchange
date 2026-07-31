import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/card';
import { Badge } from '@/ui/components/badge';
import { Button } from '@/ui/components/button';

export default function EmissionPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">배출량 산정</h1>
          <p className="text-sm text-gray-500 mt-1">활동량 데이터를 기반으로 온실가스 배출량을 산정합니다</p>
        </div>
        <Button size="sm">재산정 실행</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 text-center"><div className="text-2xl font-bold">1,247.3</div><div className="text-xs text-gray-500">총 tCO₂e</div></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><div className="text-2xl font-bold text-orange-600">312.8</div><div className="text-xs text-gray-500">Scope 1</div></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><div className="text-2xl font-bold text-blue-600">834.5</div><div className="text-xs text-gray-500">Scope 2 (위치)</div></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><div className="text-2xl font-bold text-sky-500">798.2</div><div className="text-xs text-gray-500">Scope 2 (시장)</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">산정 이력</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: '1', date: '2024-06-30', method: '자동', status: '완료', count: 47 },
              { id: '2', date: '2024-05-31', method: '자동', status: '완료', count: 43 },
              { id: '3', date: '2024-04-30', method: '수동', status: '완료', count: 41 },
            ].map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <Badge variant="default">완료</Badge>
                  <span className="text-sm font-medium">{r.date}</span>
                  <span className="text-xs text-gray-500">{r.count}건 산정</span>
                </div>
                <span className="text-xs text-gray-400">{r.method} 트리거</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
