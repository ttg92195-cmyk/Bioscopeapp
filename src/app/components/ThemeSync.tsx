'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/lib/store';

export default function ThemeSync() {
  const primaryColor = useSettingsStore((s) => s.primaryColor);

  useEffect(() => {
    document.documentElement.style.setProperty('--dynamic-primary', primaryColor);
  }, [primaryColor]);

  return null;
}
