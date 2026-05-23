"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAlbumStore, InitializationMode } from '@/lib/useAlbumStore';
import { useLanguageStore } from '@/lib/useLanguageStore';
import { useMounted } from '@/lib/useMounted';
import { parseStickerInput } from '@/lib/parser';

export default function Onboarding() {
  const router = useRouter();
  const { initializeAlbum, isInitialized } = useAlbumStore();
  const { t } = useLanguageStore();
  const isLoaded = useMounted();

  const [mode, setMode] = useState<InitializationMode | null>(null);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (isLoaded && isInitialized) {
      router.push('/');
    }
  }, [isLoaded, isInitialized, router]);

  const handleStart = (selectedMode: InitializationMode) => {
    if (selectedMode === 'empty') {
      initializeAlbum('empty');
      router.push('/');
    } else {
      setMode(selectedMode);
    }
  };

  const handleConfirmInput = () => {
    if (!mode) return;
    
    const results = parseStickerInput(inputText);
    const validCodes = results.filter(r => r.isValid).map(r => `${r.teamCode} ${r.number}`);
    
    initializeAlbum(mode, validCodes);
    router.push('/');
  };

  if (!isLoaded) return <div className="p-4 text-center mt-10">Carregando...</div>;

  if (mode === 'have' || mode === 'missing') {
    return (
      <div className="flex flex-col h-full space-y-6 max-w-sm mx-auto">
        <div className="text-center space-y-2 mt-4">
          <h2 className="text-2xl font-bold text-wc-blue">
            {mode === 'have' ? t('onbHave') : t('onbMissing')}
          </h2>
          <p className="text-gray-600">
            {t('updateSubtitle')}
          </p>
        </div>

        <textarea
          className="w-full flex-1 min-h-[200px] p-4 rounded-xl border-2 border-gray-200 focus:border-wc-blue focus:ring-0 outline-none resize-none text-lg font-mono placeholder-gray-400"
          placeholder={t('updatePlaceholder')}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        <div className="space-y-3 pb-8">
          <button 
            className="w-full bg-wc-blue text-white font-bold py-4 rounded-xl hover:bg-wc-blue/90 transition-colors"
            onClick={handleConfirmInput}
          >
            Começar
          </button>
          <button 
            className="w-full bg-gray-100 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors"
            onClick={() => setMode(null)}
          >
            {t('reviewCancel')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full items-center justify-center space-y-8 max-w-sm mx-auto overflow-y-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-wc-blue">{t('onboardingTitle')}</h2>
        <p className="text-gray-600">{t('onboardingSubtitle')}</p>
      </div>

      <div className="w-full space-y-4">
        <button
          onClick={() => handleStart('have')}
          className="w-full p-4 rounded-xl border-2 border-wc-green bg-wc-green/10 text-left transition hover:bg-wc-green/20"
        >
          <div className="font-bold text-wc-green text-lg">{t('onbHave')}</div>
          <div className="text-sm text-gray-600 mt-1">{t('onbHaveDesc')}</div>
        </button>

        <button
          onClick={() => handleStart('missing')}
          className="w-full p-4 rounded-xl border-2 border-wc-orange bg-wc-orange/10 text-left transition hover:bg-wc-orange/20"
        >
          <div className="font-bold text-wc-orange text-lg">{t('onbMissing')}</div>
          <div className="text-sm text-gray-600 mt-1">{t('onbMissingDesc')}</div>
        </button>

        <button
          onClick={() => handleStart('empty')}
          className="w-full p-4 rounded-xl border-2 border-gray-300 bg-gray-50 text-left transition hover:bg-gray-100"
        >
          <div className="font-bold text-gray-700 text-lg">{t('onbEmpty')}</div>
          <div className="text-sm text-gray-600 mt-1">{t('onbEmptyDesc')}</div>
        </button>
      </div>
    </div>
  );
}
