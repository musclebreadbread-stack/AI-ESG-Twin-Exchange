import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/card';
import { Button } from '@/ui/components/button';

export default function OrgPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">조직 관리</h1>
          <p className="text-sm text-gray-500 mt-1">4단계 조직 계층을 관리합니다</p>
        </div>
        <Button size="sm">조직 추가</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="font-medium text-gray-900">🏢 ㈜ 테스트회사</div>
            <div className="ml-6 space-y-1">
              <div className="text-sm text-gray-700">├ 📁 경영지원본부</div>
              <div className="text-sm text-gray-700">├ 📁 제조본부</div>
              <div className="ml-6 space-y-1">
                <div className="text-sm text-gray-600">├ 📍 안산공장</div>
                <div className="ml-6 space-y-1">
                  <div className="text-sm text-gray-500">├ 🏭 A동</div>
                  <div className="text-sm text-gray-500">└ 🏭 B동</div>
                </div>
                <div className="text-sm text-gray-600">└ 📍 인천물류센터</div>
              </div>
              <div className="text-sm text-gray-700">└ 📁 영업본부</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
