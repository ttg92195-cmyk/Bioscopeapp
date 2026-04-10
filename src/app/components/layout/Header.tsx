'use client';

import { Search } from 'lucide-react';
import { useSidebarStore, useSettingsStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  onSearch?: (query: string) => void;
  showSearch?: boolean;
  searchPlaceholder?: string;
}

export default function Header({
  onSearch,
  showSearch = true,
  searchPlaceholder = 'Search movies, series...'
}: HeaderProps) {
  const { open } = useSidebarStore();
  const { primaryColor } = useSettingsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery.trim());
      } else {
        router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 glass-header" style={{ paddingTop: "max(0px, env(safe-area-inset-top))" }}>
      <div className="flex items-center gap-4 px-4 py-3">
        {/* Menu Button */}
        <button
          onClick={open}
          className="flex items-center justify-center w-10 h-10 -ml-1 rounded-xl hover:bg-white/10 transition-colors duration-150"
          aria-label="Open menu"
        >
          <div className="flex flex-col gap-[5px] w-[18px] items-center">
            <span
              className="block h-[2px] w-full rounded-full"
              style={{ backgroundColor: 'var(--dynamic-primary, #E53935)' }}
            />
            <span
              className="block h-[2px] w-[65%] rounded-full"
              style={{ backgroundColor: 'var(--dynamic-primary, #E53935)' }}
            />
            <span
              className="block h-[2px] w-full rounded-full"
              style={{ backgroundColor: 'var(--dynamic-primary, #E53935)' }}
            />
          </div>
        </button>

        {/* Search Bar */}
        {showSearch && (
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-white/60" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10 rounded-full bg-white/5 border border-white/8 text-sm text-white placeholder:text-white/25 focus-visible:bg-white/8 focus-visible:border-white/15 focus-visible:ring-0"
              />
            </div>
          </form>
        )}
      </div>
    </header>
  );
}
