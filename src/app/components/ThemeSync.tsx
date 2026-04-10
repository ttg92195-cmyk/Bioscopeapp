'use client';

import { useEffect, useRef } from 'react';
import { useSettingsStore } from '@/lib/store';

export default function ThemeSync() {
  const primaryColor = useSettingsStore((s) => s.primaryColor);
  const isFirstSync = useRef(true);

  useEffect(() => {
    // Skip first render - inline script already set the color before first paint
    if (isFirstSync.current) {
      isFirstSync.current = false;
      return;
    }
    document.documentElement.style.setProperty('--dynamic-primary', primaryColor);
  }, [primaryColor]);

  // Reset ref on cleanup for React Strict Mode
  useEffect(() => {
    return () => {
      isFirstSync.current = true;
    };
  }, []);

  return null;
}
