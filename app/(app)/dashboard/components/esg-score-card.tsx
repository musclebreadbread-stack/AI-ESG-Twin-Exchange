'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/card';
import { Badge } from '@/ui/components/badge';

export function EsgScoreCard() {
  // Mock data — will be replaced with actual API call
  const score = { total: 72, e: 78, s: 65, g: 73, trend: '+3' };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">ESG 종합 점수</CardTitle>
          <Badge variant="default">{score.trend}점 ↑</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke="#059669" strokeWidth="10"
                strokeDasharray={`${score.total * 2.51} 251`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">{score.total}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-gray-500">환경(E)</div>
            <div className="text-lg font-semibold" style={{ color: 'var(--color-e)' }}>{score.e}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">사회(S)</div>
            <div className="text-lg font-semibold" style={{ color: 'var(--color-s)' }}>{score.s}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">지배구조(G)</div>
            <div className="text-lg font-semibold" style={{ color: 'var(--color-g)' }}>{score.g}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
