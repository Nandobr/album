"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAlbumStore } from '@/lib/useAlbumStore';
import { useLanguageStore } from '@/lib/useLanguageStore';
import { useMounted } from '@/lib/useMounted';
import { parseStickerInput } from '@/lib/parser';
import { ParsedSticker } from '@/lib/types';
import ReviewModal from '@/components/ReviewModal';
import { Camera, FileText, Loader2 } from 'lucide-react';

export default function UpdateAlbum() {
  const router = useRouter();
  const { isInitialized, updateStickers } = useAlbumStore();
  const { t } = useLanguageStore();
  const isLoaded = useMounted();
  const [inputText, setInputText] = useState('');
  const [parsedResults, setParsedResults] = useState<ParsedSticker[] | null>(null);
  const [ocrProgress, setOcrProgress] = useState<number | null>(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isLoaded || !isInitialized) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrLoading(true);
    setOcrProgress(null);

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
    setParsedResults(results);
  };

  const handleConfirm = () => {
    if (!parsedResults) return;
    
    const validResults = parsedResults.filter(r => r.isValid);
    const updates = validResults.map(r => ({
      code: `${r.teamCode} ${r.number}`,
      quantityToAdd: 1
    }));

    updateStickers(updates);
    setParsedResults(null);
    setInputText('');
    router.push('/');
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-gray-800">{t('updateTitle')}</h2>
        <p className="text-sm text-gray-500">{t('updateSubtitle')}</p>
      </div>

      <div className="flex-1 flex flex-col space-y-4">
        <div className="relative flex-1 flex flex-col">
          <textarea
            className="w-full flex-1 p-3 rounded-xl border-2 border-gray-200 focus:border-wc-blue focus:ring-0 outline-none resize-none text-base text-gray-900 font-mono placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-50"
            placeholder={t('updatePlaceholder')}
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
            <span className="text-xs font-semibold">{t('updateText')}</span>
          </button>
        </div>
      </div>

      {parsedResults && (
        <ReviewModal
          parsedResults={parsedResults}
          onConfirm={handleConfirm}
          onCancel={() => setParsedResults(null)}
        />
      )}
    </div>
  );
}
