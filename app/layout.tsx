import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI ESG Twin Exchange',
  description: 'ESG 디지털 트윈 및 탄소배출량 관리 플랫폼',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
