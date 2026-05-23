"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAlbumStore } from '@/lib/useAlbumStore';
import { useLanguageStore } from '@/lib/useLanguageStore';
import { useMounted } from '@/lib/useMounted';
import { parseStickerInput } from '@/lib/parser';
import { ParsedSticker } from '@/lib/types';
import { ArrowLeftRight, Check, CheckCircle2, CopyCheck } from 'lucide-react';

export default function TradeAlbum() {
  const router = useRouter();
  const { stickers, isInitialized, updateStickers } = useAlbumStore();
  const { t } = useLanguageStore();
  const isLoaded = useMounted();
  const [inputText, setInputText] = useState('');
  
  const [tradeResults, setTradeResults] = useState<{
    need: ParsedSticker[];
    have: ParsedSticker[];
  } | null>(null);

  if (!isLoaded || !isInitialized) return null;

  const handleAnalyze = () => {
    if (!inputText.trim()) return;
    
    const results = parseStickerInput(inputText);
    
    const need: ParsedSticker[] = [];
    const have: ParsedSticker[] = [];
    
    // Only process valid stickers and deduplicate them
    const seen = new Set<string>();
    
    results.forEach(sticker => {
      if (!sticker.isValid) return;
      
      const code = `${sticker.teamCode} ${sticker.number}`;
      if (seen.has(code)) return;
      seen.add(code);
      
      const myQty = stickers[code]?.quantity || 0;
      if (myQty === 0) {
        need.push(sticker);
      } else {
        have.push(sticker);
      }
    });

    setTradeResults({ need, have });
  };

  const handleConfirm = () => {
    if (!tradeResults || tradeResults.need.length === 0) return;
    
    const updates = tradeResults.need.map(r => ({
      code: `${r.teamCode} ${r.number}`,
      quantityToAdd: 1
    }));

    updateStickers(updates);
    setTradeResults(null);
    setInputText('');
    router.push('/');
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-gray-800">{t('tradeTitle')}</h2>
        <p className="text-sm text-gray-500">{t('tradeSubtitle')}</p>
      </div>

      {!tradeResults ? (
        <div className="flex-1 flex flex-col space-y-4">
          <textarea
            className="w-full flex-1 p-3 rounded-xl border-2 border-gray-200 focus:border-wc-blue focus:ring-0 outline-none resize-none text-base text-gray-900 font-mono placeholder-gray-400"
            placeholder={t('tradePlaceholder')}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <button 
            className="w-full py-3 rounded-xl bg-wc-blue text-white font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center mb-2"
            onClick={handleAnalyze}
            disabled={!inputText.trim()}
          >
            <ArrowLeftRight className="mr-2" size={20} />
            {t('tradeAnalyze')}
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center space-y-1 shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total de figurinhas lidas</span>
            <span className="text-3xl font-black text-gray-700">{tradeResults.need.length + tradeResults.have.length}</span>
            {tradeResults.have.length > 0 && (
              <span className="text-sm font-semibold text-gray-400 mt-1">
                ({tradeResults.have.length} você já possui no álbum)
              </span>
            )}
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <h3 className="font-bold text-green-800 flex items-center mb-3">
              <CheckCircle2 className="mr-2" size={20} />
              {t('tradeNeed')} ({tradeResults.need.length})
            </h3>
            
            {tradeResults.need.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tradeResults.need.map((s, i) => (
                  <span key={i} className="px-2 py-1 bg-white text-green-700 rounded shadow-sm text-sm font-bold border border-green-100">
                    {s.teamCode} {s.number}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-green-600/70 italic">Nenhuma figurinha útil para você.</p>
            )}
          </div>

          <div className="mt-auto space-y-2 pt-2 pb-2">
            <button 
              className="w-full py-3 rounded-xl bg-wc-blue text-white font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
              onClick={handleConfirm}
              disabled={tradeResults.need.length === 0}
            >
              {t('tradeComplete')}
            </button>
            <button 
              className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm hover:bg-gray-200 transition-colors"
              onClick={() => setTradeResults(null)}
            >
              Voltar
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
