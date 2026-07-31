import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/card';
import { Badge } from '@/ui/components/badge';

export default function AuditPage() {
  const logs = [
    { id: '1', action: 'activity.create', actor: '김영수', resource: '전력 사용량 2024-06', time: '2시간 전' },
    { id: '2', action: 'report.approve', actor: '박민호', resource: 'GRI 보고서 Q2', time: '5시간 전' },
    { id: '3', action: 'twin.build', actor: '시스템', resource: '트윈 v3', time: '1일 전' },
    { id: '4', action: 'scenario.adopt', actor: '이지은', resource: '태양광 전환', time: '2일 전' },
    { id: '5', action: 'factor.ingest', actor: '시스템', resource: 'KR-NIR 2023', time: '3일 전' },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">감사 로그</h1>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">행위</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">행위자</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">대상</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">시간</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><Badge variant="outline">{l.action}</Badge></td>
                  <td className="px-4 py-3 text-gray-700">{l.actor}</td>
                  <td className="px-4 py-3 text-gray-600">{l.resource}</td>
                  <td className="px-4 py-3 text-gray-400">{l.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
