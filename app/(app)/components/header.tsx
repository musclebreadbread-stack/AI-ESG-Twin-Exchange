'use client';
import { Button } from '@/ui/components/button';

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium text-gray-500">㈜ 테스트 회사</h2>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm">🔔</Button>
        <Button variant="ghost" size="sm">⚙️</Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-xs font-medium text-emerald-700">김</span>
          </div>
        </div>
      </div>
    </header>
  );
}
