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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-1 mt-4">
        <h2 className="text-2xl font-bold text-gray-800">{t('homeProgress')}</h2>
        <p className="text-sm text-gray-500">{t('homeWorldCup')}</p>
      </div>

      {/* Progress Circle - fixed SVG viewBox */}
      <div className="flex justify-center my-8 overflow-visible">
        <div className="relative w-48 h-48 rounded-full flex items-center justify-center bg-gray-50 shadow-inner border-4 border-gray-100">
          <svg viewBox="0 0 192 192" className="absolute inset-0 w-full h-full transform -rotate-90 overflow-visible">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={553} // 2 * Math.PI * 88 ~= 553
              strokeDashoffset={553 - (553 * stats.percentage) / 100}
              className="text-wc-blue transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="text-center">
            <div className="text-4xl font-extrabold text-wc-blue">{stats.percentage}%</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-1">{t('homeCompleted')}</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-wc-green/10 rounded-2xl p-4 border border-wc-green/20">
          <div className="flex items-center text-wc-green mb-2">
            <Book size={20} className="mr-2" />
            <span className="font-semibold text-sm">{t('homeOwned')}</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalOwned}</div>
        </div>
        
        <div className="bg-wc-red/10 rounded-2xl p-4 border border-wc-red/20">
          <div className="flex items-center text-wc-red mb-2">
            <CopyPlus size={20} className="mr-2" />
            <span className="font-semibold text-sm">{t('homeMissing')}</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalMissing}</div>
        </div>

        <div className="bg-wc-orange/10 rounded-2xl p-4 border border-wc-orange/20 col-span-2 flex justify-between items-center">
          <div>
            <div className="flex items-center text-wc-orange mb-1">
              <Layers size={20} className="mr-2" />
              <span className="font-semibold text-sm">{t('homeDuplicates')}</span>
            </div>
            <div className="text-xs text-gray-500">{t('homeReadyToTrade')}</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalDuplicates}</div>
        </div>
      </div>

      <div className="pt-6 pb-2">
        <Link 
          href="/update" 
          className="w-full flex items-center justify-center p-4 rounded-xl bg-wc-blue text-white font-bold text-lg shadow-lg hover:bg-wc-blue/90 transition-colors"
        >
          <CopyPlus className="mr-2" />
          {t('homeUpdateBtn')}
        </Link>
      </div>
    </div>
  );
}
