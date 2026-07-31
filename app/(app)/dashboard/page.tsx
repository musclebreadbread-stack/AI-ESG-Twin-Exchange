import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/components/card';
import { Badge } from '@/ui/components/badge';
import { Progress } from '@/ui/components/progress';
import { EsgScoreCard } from './components/esg-score-card';
import { EmissionSummaryCard } from './components/emission-summary-card';
import { TwinStatusCard } from './components/twin-status-card';
import { RecentActivityCard } from './components/recent-activity-card';
import { AiInsightsCard } from './components/ai-insights-card';
import { QuickActions } from './components/quick-actions';

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ESG 대시보드</h1>
          <p className="text-sm text-gray-500 mt-1">실시간 ESG 성과 모니터링</p>
        </div>
        <QuickActions />
      </div>

      {/* Top Row: Score + Emissions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <EsgScoreCard />
        <EmissionSummaryCard />
        <TwinStatusCard />
      </div>

      {/* Bottom Row: Activity + AI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivityCard />
        <AiInsightsCard />
      </div>
    </div>
  );
}
