"use client";

import { ParsedSticker } from '@/lib/types';
import { useAlbumStore } from '@/lib/useAlbumStore';
import { useLanguageStore } from '@/lib/useLanguageStore';

interface ReviewModalProps {
  parsedResults: ParsedSticker[];
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ReviewModal({ parsedResults, onConfirm, onCancel }: ReviewModalProps) {
  const { stickers } = useAlbumStore();
  const { t } = useLanguageStore();

  const validResults = parsedResults.filter(r => r.isValid);
  const invalidResults = parsedResults.filter(r => !r.isValid);

  const categorized = validResults.map(sticker => {
    const code = `${sticker.teamCode} ${sticker.number}`;
    const userSticker = stickers[code];
    const status = !userSticker || userSticker.quantity === 0 ? 'missing' : 'owned';
    
    return {
      ...sticker,
      status,
      action: status === 'missing' ? t('reviewActionAdd') : t('reviewActionDup')
    };
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md sm:rounded-2xl rounded-t-2xl p-6 shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-8">
        
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900">{t('reviewTitle')}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-2">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {categorized.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              {t('reviewNoValid')}
            </div>
          )}

          {categorized.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-500 uppercase">{t('reviewDetected')}</h3>
              {categorized.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-lg border bg-gray-50">
                  <div className="font-bold w-20">{item.teamCode} {item.number}</div>
                  <div className="flex-1 text-sm text-gray-600">
                    {item.status === 'missing' ? t('reviewNotOwned') : t('reviewOwned')}
                  </div>
                  <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                    item.status === 'missing' ? 'bg-wc-green/20 text-wc-green' : 'bg-wc-orange/20 text-wc-orange'
                  }`}>
                    {item.action}
                  </div>
                </div>
              ))}
            </div>
          )}

          {invalidResults.length > 0 && (
            <div className="space-y-2 mt-6">
              <h3 className="font-semibold text-sm text-red-500 uppercase">{t('reviewInvalid')}</h3>
              <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700 break-words">
                {invalidResults.map(r => r.originalText).join(', ')}
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 mt-4 border-t space-y-3">
          <button 
            onClick={onConfirm}
            disabled={validResults.length === 0}
            className="w-full bg-wc-blue text-white font-bold py-3 rounded-xl hover:bg-wc-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('reviewConfirm')}
          </button>
          <button 
            onClick={onCancel}
            className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            {t('reviewCancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
