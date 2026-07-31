import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/card';
import { Button } from '@/ui/components/button';
import { Badge } from '@/ui/components/badge';

export default function ReportPage() {
  const reports = [
    { id: '1', framework: 'GRI', period: '2024-Q2', status: '확정', formats: ['PDF', 'DOCX', 'XLSX', 'PPTX'] },
    { id: '2', framework: 'KSSB', period: '2024-Q2', status: '초안', formats: ['PDF'] },
    { id: '3', framework: 'TCFD', period: '2024-H1', status: '검토 중', formats: ['PDF', 'DOCX'] },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">리포트 생성</h1>
          <p className="text-sm text-gray-500 mt-1">8개 프레임워크 기반 ESG 보고서를 생성합니다</p>
        </div>
        <Button size="sm">새 리포트 생성</Button>
      </div>

      <div className="grid gap-4">
        {reports.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">{r.framework}</div>
                <div>
                  <div className="font-medium text-gray-900">{r.framework} 보고서</div>
                  <div className="text-xs text-gray-500">{r.period}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {r.formats.map((f) => <Badge key={f} variant="outline" className="text-[10px]">{f}</Badge>)}
                </div>
                <Badge variant={r.status === '확정' ? 'default' : r.status === '초안' ? 'secondary' : 'warning'}>{r.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
