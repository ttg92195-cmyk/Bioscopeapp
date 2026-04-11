'use client';

import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import MobileNav from '../components/layout/MobileNav';
import { useUserStore } from '@/lib/store';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

export default function DownloadPage() {
  const { downloadEnabled, toggleDownload } = useUserStore();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <Sidebar />
      <Header showSearch={false} />

      <main className="pt-4 pb-20">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            style={{ color: 'var(--dynamic-primary, #E53935)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Downloads</h1>
        </div>

        <div className="px-4">
          {/* All Download Link Toggle */}
          <div className="bg-[#1E1E1E] rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">All Download Link</Label>
                <p className="text-xs text-gray-400 mt-1">
                  Enable to show download links in movie/series posts
                </p>
              </div>
              <Switch
                checked={downloadEnabled}
                onCheckedChange={toggleDownload}
                style={{ '--switch-bg': 'var(--dynamic-primary, #E53935)' } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Status */}
          <div className="bg-[#1E1E1E] rounded-lg p-4">
            <h3 className="font-semibold mb-2">Download Link Status</h3>
            {downloadEnabled ? (
              <div className="flex items-center gap-2 text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm">Download links are visible</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-yellow-400">
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <span className="text-sm">Download links are hidden</span>
              </div>
            )}
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
