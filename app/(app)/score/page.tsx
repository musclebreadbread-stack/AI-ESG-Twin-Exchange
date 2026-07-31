import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/card';
import { Progress } from '@/ui/components/progress';

export default function ScorePage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">ESG 점수</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card><CardContent className="pt-6"><div className="text-center"><div className="text-4xl font-bold text-emerald-600">78</div><div className="text-sm text-gray-500 mt-1">환경(E)</div></div><Progress value={78} className="mt-4" /></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-center"><div className="text-4xl font-bold text-blue-600">65</div><div className="text-sm text-gray-500 mt-1">사회(S)</div></div><Progress value={65} className="mt-4" /></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-center"><div className="text-4xl font-bold text-purple-600">73</div><div className="text-sm text-gray-500 mt-1">지배구조(G)</div></div><Progress value={73} className="mt-4" /></CardContent></Card>
      </div>
    </div>
  );
}
