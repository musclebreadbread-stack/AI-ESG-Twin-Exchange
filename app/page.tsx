import Link from 'next/link';
import { Button } from '@/ui/components/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4">
        <span className="text-xl font-bold text-emerald-700">ESG Twin</span>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">로그인</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">무료 시작</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-col items-center justify-center px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-xs text-emerald-700 mb-6">
          🇰🇷 한국 시장 전용 · 8개 프레임워크 지원
        </div>
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-gray-900">
          AI 기반 ESG 디지털 트윈으로<br />
          <span className="text-emerald-600">탄소 배출을 관리</span>하세요
        </h1>
        <p className="mt-6 max-w-xl text-lg text-gray-600">
          활동량 입력부터 배출량 산정, ESG 점수 평가, 프레임워크 보고서 생성까지.<br />
          AI가 데이터를 분석하고 감축 경로를 제안합니다.
        </p>
        <div className="mt-10 flex gap-4">
          <Link href="/signup">
            <Button size="lg">무료로 시작하기</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">데모 대시보드 보기</Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid max-w-4xl grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <FeatureItem icon="🏭" title="자동 배출량 산정" desc="KR-NIR·IPCC·DEFRA 등 6개 Provider에서 배출계수를 자동 매칭하여 tCO₂e를 산정합니다." />
          <FeatureItem icon="🌐" title="ESG 디지털 트윈" desc="12개 도메인의 데이터를 콘텐츠 주소화 스냅샷으로 관리하여 변경 이력을 추적합니다." />
          <FeatureItem icon="📄" title="다중 프레임워크 보고서" desc="KSSB·GRI·ISSB·TCFD·CDP·ESRS·SASB 보고서를 PDF/DOCX/XLSX/PPTX로 생성합니다." />
          <FeatureItem icon="🤖" title="AI 에이전트" desc="데이터 품질 경고, 감축 기회 발굴, 프레임워크 커버리지 분석을 AI가 수행합니다." />
          <FeatureItem icon="📈" title="ESG 점수 엔진" desc="버전화된 RuleSet으로 E·S·G 점수를 산출하고 지표별 기여도를 설명합니다." />
          <FeatureItem icon="🔮" title="시나리오 시뮬레이터" desc="감축 시나리오를 시뮬레이션하고 불변 실행 계획으로 채택하여 진행을 추적합니다." />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        © 2024 AI ESG Twin Exchange. All rights reserved.
      </footer>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <span className="text-2xl">{icon}</span>
      <h3 className="mt-3 font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{desc}</p>
    </div>
  );
}
