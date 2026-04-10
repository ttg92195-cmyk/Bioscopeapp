'use client';

import { Menu, Search } from 'lucide-react';
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
    <header className="sticky top-0 z-30 bg-[#121212] border-b border-white/10">
      <div className="flex items-center gap-4 px-4 py-3">
        {/* Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={open}
          className="text-white hover:bg-white/10"
        >
          <Menu className="w-6 h-6" style={{ color: primaryColor }} />
        </Button>

        {/* Search Bar */}
        {showSearch && (
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1E1E1E] border-none text-white placeholder:text-gray-500 focus-visible:ring-1"
                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
              />
            </div>
          </form>
        )}
      </div>
    </header>
  );
}
