"use client";

import { useLanguageStore } from '@/lib/useLanguageStore';
import { useAlbumStore } from '@/lib/useAlbumStore';
import { useMounted } from '@/lib/useMounted';
import { Settings, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { lang, toggleLanguage, t } = useLanguageStore();
  const { resetAlbum, isInitialized } = useAlbumStore();
  const isLoaded = useMounted();
  const router = useRouter();

  if (!isLoaded) return (
    <header className="bg-wc-blue text-white p-4 sticky top-0 z-10 shadow-md h-14" />
  );

  return (
    <header className="bg-wc-blue text-white p-3 sticky top-0 z-10 shadow-md flex items-center justify-between">
      <div className="w-16 flex items-center">
        <button 
          onClick={toggleLanguage}
          className="flex items-center text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition"
        >
          <Globe size={14} className="mr-1" />
          {lang === 'pt' ? 'PT' : 'EN'}
        </button>
      </div>

      <h1 className="text-xl font-bold flex-1 text-center whitespace-nowrap overflow-hidden text-ellipsis">
        {t('appTitle')}
      </h1>

      <div className="w-16 flex items-center justify-end">
        {isInitialized && (
          <button 
            onClick={() => router.push('/settings')}
            className="text-white hover:text-gray-200 p-1 transition"
            title="Settings"
          >
            <Settings size={20} />
          </button>
        )}
      </div>
    </header>
  );
}
