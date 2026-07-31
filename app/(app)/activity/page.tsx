import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/card';
import { Button } from '@/ui/components/button';
import { Badge } from '@/ui/components/badge';

export default function ActivityPage() {
  const activities = [
    { id: '1', item: '전력 사용량', value: '15,000 kWh', period: '2024-06', org: '본사', provenance: '수동 입력' },
    { id: '2', item: '천연가스', value: '500 m³', period: '2024-06', org: '안산공장', provenance: 'CSV 임포트' },
    { id: '3', item: '경유', value: '200 L', period: '2024-06', org: '물류팀', provenance: '수동 입력' },
    { id: '4', item: '전력 사용량', value: '8,200 kWh', period: '2024-06', org: '안산공장 A동', provenance: 'IoT' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">활동량 관리</h1>
          <p className="text-sm text-gray-500 mt-1">배출 산정의 기초가 되는 활동 데이터를 관리합니다</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">CSV 임포트</Button>
          <Button size="sm">활동량 입력</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">항목</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">값</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">기간</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">사업장</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">출처</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {activities.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{a.item}</td>
                  <td className="px-4 py-3 text-gray-700">{a.value}</td>
                  <td className="px-4 py-3 text-gray-600">{a.period}</td>
                  <td className="px-4 py-3 text-gray-600">{a.org}</td>
                  <td className="px-4 py-3"><Badge variant="secondary">{a.provenance}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
