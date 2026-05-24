"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAlbumStore } from '@/lib/useAlbumStore';
import { useLanguageStore } from '@/lib/useLanguageStore';
import { useMounted } from '@/lib/useMounted';
import { parseStickerInput } from '@/lib/parser';
import { ParsedSticker } from '@/lib/types';
import { Camera, FileText, Loader2, ArrowRight } from 'lucide-react';
import { ArrowLeftRight, Check, CheckCircle2, CopyCheck } from 'lucide-react';

export default function TradeAlbum() {
  const router = useRouter();
  const { stickers, isInitialized, updateStickers } = useAlbumStore();
  const { t } = useLanguageStore();
  const isLoaded = useMounted();
  const [inputText, setInputText] = useState('');
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [tradeResults, setTradeResults] = useState<{
    need: ParsedSticker[];
    have: ParsedSticker[];
  } | null>(null);

  if (!isLoaded || !isInitialized) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrLoading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });

      const mimeType = base64Data.split(';')[0].split(':')[1];
      const base64Str = base64Data.split(',')[1];

      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Str,
          mimeType
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process image');
      }
      
      setInputText(prev => (prev ? prev + '\n\n' : '') + data.text);
    } catch (err) {
      console.error(err);
      alert(t('ocrError'));
    } finally {
      setIsOcrLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
          <div className="relative flex-1 flex flex-col">
            <textarea
              className="w-full flex-1 p-3 rounded-xl border-2 border-gray-200 focus:border-wc-blue focus:ring-0 outline-none resize-none text-base text-gray-900 font-mono placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-50"
              placeholder={t('tradePlaceholder')}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isOcrLoading}
            />
            {isOcrLoading && (
              <div className="absolute inset-0 bg-white/80 rounded-xl flex flex-col items-center justify-center space-y-4 z-10">
                <Loader2 className="w-10 h-10 text-wc-blue animate-spin" />
                <div className="font-bold text-gray-700">
                  {t('ocrProcessing')}
                </div>
              </div>
            )}
          </div>

          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handlePhotoUpload}
          />

          <div className="grid grid-cols-2 gap-3 pb-2">
            <button 
              className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              onClick={() => fileInputRef.current?.click()}
              disabled={isOcrLoading}
            >
              <Camera size={20} className="mb-1" />
              <span className="text-xs font-semibold">{t('updatePhoto')}</span>
            </button>
            <button 
              className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-wc-blue bg-wc-blue/5 text-wc-blue hover:bg-wc-blue/10 transition-colors disabled:opacity-50"
              onClick={handleAnalyze}
              disabled={!inputText.trim() || isOcrLoading}
            >
              <FileText size={20} className="mb-1" />
              <span className="text-xs font-semibold">{t('tradeAnalyze')}</span>
            </button>
          </div>
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
