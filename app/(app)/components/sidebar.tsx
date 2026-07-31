'use client';
import Link from 'next/link';

const navigation = [
  { name: '대시보드', href: '/dashboard', icon: '📊' },
  { name: '활동량 관리', href: '/activity', icon: '📝' },
  { name: '배출량 산정', href: '/emission', icon: '🏭' },
  { name: '디지털 트윈', href: '/twin', icon: '🌐' },
  { name: 'ESG 점수', href: '/score', icon: '📈' },
  { name: '리포트', href: '/report', icon: '📄' },
  { name: '시나리오', href: '/scenario', icon: '🔮' },
  { name: 'AI 에이전트', href: '/agent', icon: '🤖' },
  { name: '조직 관리', href: '/org', icon: '🏢' },
  { name: '감사 로그', href: '/audit', icon: '🔒' },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-100">
        <span className="text-lg font-bold text-emerald-700">ESG Twin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 px-4 py-3">
        <div className="text-xs text-gray-400">v0.1.0 · 한국 단일 시장</div>
      </div>
    </aside>
  );
}
