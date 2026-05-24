"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAlbumStore } from '@/lib/useAlbumStore';
import { useLanguageStore } from '@/lib/useLanguageStore';
import { useMounted } from '@/lib/useMounted';
import { Book, CopyPlus, Layers } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isInitialized, getStats } = useAlbumStore();
  const { t } = useLanguageStore();
  const isLoaded = useMounted();

  useEffect(() => {
    if (isLoaded && !isInitialized) {
      router.push('/onboarding');
    }
  }, [isLoaded, isInitialized, router]);

  if (!isLoaded) return <div className="p-4 text-center mt-10">Carregando...</div>;
  if (!isInitialized) return null;

  const stats = getStats();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto h-full pb-6">
      
      {/* Hero Banner Image */}
      <div 
        className="relative -mx-4 -mt-4 pt-10 pb-8 bg-cover bg-center rounded-b-[2.5rem] mb-6 shadow-md" 
        style={{ backgroundImage: "url('/bg-pattern.png')" }}
      >
        {/* Gradient Overlay for Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent rounded-b-[2.5rem]"></div>
        
        <div className="relative z-10 text-center space-y-1 mb-8 pt-2">
          <h2 className="text-3xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-tight">
            {t('homeProgress')}
          </h2>
          <p className="text-sm font-bold text-white/95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            {t('homeWorldCup')}
          </p>
        </div>

        {/* Progress Circle - Overlapping the banner */}
        <div className="flex justify-center relative z-20">
          <div className="relative w-44 h-44 rounded-full flex items-center justify-center bg-white shadow-2xl border-[6px] border-white/90">
            <svg viewBox="0 0 192 192" className="absolute inset-0 w-full h-full transform -rotate-90 overflow-visible">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-gray-100"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={553}
                strokeDashoffset={553 - (553 * stats.percentage) / 100}
                className="text-wc-blue transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="text-center bg-white w-full h-full rounded-full flex flex-col items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] border-[8px] border-transparent">
              <div className="text-4xl font-black text-wc-blue">{stats.percentage}%</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">{t('homeCompleted')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-1">

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-wc-green/10 rounded-2xl p-4 border border-wc-green/20 flex flex-col items-center justify-center text-center">
          <div className="flex items-center text-wc-green mb-1">
            <Book size={20} className="mr-2" />
            <span className="font-semibold text-sm">{t('homeOwned')}</span>
          </div>
          <div className="text-3xl font-black text-gray-900">{stats.totalOwned}</div>
        </div>
        
        <div className="bg-wc-red/10 rounded-2xl p-4 border border-wc-red/20 flex flex-col items-center justify-center text-center">
          <div className="flex items-center text-wc-red mb-1">
            <CopyPlus size={20} className="mr-2" />
            <span className="font-semibold text-sm">{t('homeMissing')}</span>
          </div>
          <div className="text-3xl font-black text-gray-900">{stats.totalMissing}</div>
        </div>

        <div className="bg-wc-orange/10 rounded-2xl p-3 border border-wc-orange/20 col-span-2 flex flex-col items-center justify-center text-center">
          <div className="flex items-center text-wc-orange mb-1">
            <Layers size={20} className="mr-2" />
            <span className="font-semibold text-sm">{t('homeDuplicates')}</span>
          </div>
          <div className="text-3xl font-black text-gray-900">{stats.totalDuplicates}</div>
        </div>
      </div>

      <div className="pt-2 pb-4">
        <Link 
          href="/update" 
          className="w-full flex items-center justify-center p-3 rounded-xl bg-wc-blue text-white font-bold text-base shadow-lg hover:bg-wc-blue/90 transition-colors"
        >
          <CopyPlus className="mr-2" />
          {t('homeUpdateBtn')}
        </Link>
      </div>
      </div>
    </div>
  );
}
