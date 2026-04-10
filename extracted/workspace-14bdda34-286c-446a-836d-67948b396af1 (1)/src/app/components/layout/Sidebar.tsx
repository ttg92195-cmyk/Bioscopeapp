'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Film,
  Tv,
  Bookmark,
  Grid3X3,
  Clock,
  Download,
  Settings,
  LogOut,
  X,
  Sparkles,
  User
} from 'lucide-react';
import { useSidebarStore, useUserStore, useSettingsStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Film, label: 'Movies', href: '/movies' },
  { icon: Tv, label: 'Series', href: '/series' },
  { icon: Bookmark, label: 'Bookmark', href: '/bookmark' },
  { icon: Grid3X3, label: 'Genres/Tags/Collections', href: '/genres' },
  { icon: Clock, label: 'Recent', href: '/recent' },
  { icon: Download, label: 'Download', href: '/download' },
  { icon: Settings, label: 'Setting', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebarStore();
  const { isAdmin, logout } = useUserStore();
  const { primaryColor } = useSettingsStore();

  // Close sidebar on route change
  useEffect(() => {
    close();
  }, [pathname, close]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [close]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-72 bg-[#1E1E1E] z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">KUMASTREAM</span>
          </div>
          <Button variant="ghost" size="icon" onClick={close} className="lg:hidden">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    )}
                    style={isActive ? { color: primaryColor } : {}}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}

            {/* TMDB Generator - Admin Only */}
            {isAdmin && (
              <li>
                <Link
                  href="/tmdb-generator"
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                    pathname === '/tmdb-generator'
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  )}
                  style={pathname === '/tmdb-generator' ? { color: primaryColor } : {}}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>TMDB Generator</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Admin Status */}
        {isAdmin && (
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-lg">
              <User className="w-4 h-4" />
              <span className="text-sm">Admin Mode</span>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
