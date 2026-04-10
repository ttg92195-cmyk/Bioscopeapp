'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Film, Tv, Search, Bookmark, Clock } from 'lucide-react';
import { useSettingsStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Film, label: 'Movies', href: '/movies' },
  { icon: Tv, label: 'Series', href: '/series' },
  { icon: Bookmark, label: 'Bookmark', href: '/bookmark' },
  { icon: Clock, label: 'Recent', href: '/recent' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { primaryColor } = useSettingsStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1E1E1E] border-t border-white/10 z-30 lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors',
                isActive ? 'text-white' : 'text-gray-400'
              )}
              style={isActive ? { color: primaryColor } : {}}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
