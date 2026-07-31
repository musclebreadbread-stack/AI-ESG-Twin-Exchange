'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/card';
import { Badge } from '@/ui/components/badge';

export function RecentActivityCard() {
  const activities = [
    { id: '1', type: '활동량 입력', desc: '본사 전력 사용량 2024-06', user: '김영수', time: '2시간 전', status: '완료' },
    { id: '2', type: 'CSV 임포트', desc: '공장A 연료 데이터 일괄 등록', user: '이지은', time: '5시간 전', status: '완료' },
    { id: '3', type: '리포트 생성', desc: 'GRI 보고서 2024 Q2', user: '박민호', time: '1일 전', status: '검토 중' },
    { id: '4', type: '시나리오 실행', desc: '태양광 전환 시나리오', user: '김영수', time: '2일 전', status: '완료' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">최근 활동</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((a) => (
            <div key={a.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{a.type}</span>
                  <Badge variant={a.status === '완료' ? 'default' : 'warning'} className="text-[10px]">
                    {a.status}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{a.desc}</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">{a.user}</div>
                <div className="text-xs text-gray-400">{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
