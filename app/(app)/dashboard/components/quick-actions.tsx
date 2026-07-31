'use client';
import { Button } from '@/ui/components/button';

export function QuickActions() {
  return (
    <div className="flex gap-2">
      <Button size="sm">활동량 입력</Button>
      <Button size="sm" variant="outline">리포트 생성</Button>
      <Button size="sm" variant="outline">시나리오 실행</Button>
    </div>
  );
}
