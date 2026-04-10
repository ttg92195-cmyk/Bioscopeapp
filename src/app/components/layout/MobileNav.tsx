'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Film, Tv } from 'lucide-react';
import { useSettingsStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Film, label: 'Movies', href: '/movies' },
  { icon: Tv, label: 'Series', href: '/series' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { primaryColor } = useSettingsStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-nav z-30 lg:hidden">
      <div className="flex items-center justify-around px-4 pt-2 pb-2" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl min-w-[64px]',
                isActive ? 'text-white' : 'text-white/40'
              )}
              style={isActive ? { color: primaryColor } : {}}
            >
              {isActive && (
                <span
                  className="absolute -top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                  style={{ backgroundColor: primaryColor }}
                />
              )}
              <item.icon className={cn(
                isActive ? "w-5 h-5" : "w-5 h-5"
              )} />
              <span className={cn(
                isActive ? "text-xs font-medium" : "text-[11px]"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
