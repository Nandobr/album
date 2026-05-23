"use client";

import { useState } from 'react';
import { useAlbumStore } from '@/lib/useAlbumStore';
import { useLanguageStore } from '@/lib/useLanguageStore';
import { useMounted } from '@/lib/useMounted';
import { TEAMS } from '@/lib/albumData';
import { Copy, Share2 } from 'lucide-react';

export default function Lists() {
  const { getMissingList, getDuplicatesList, isInitialized } = useAlbumStore();
  const { t } = useLanguageStore();
  const isLoaded = useMounted();
  const [activeTab, setActiveTab] = useState<'missing' | 'duplicates'>('missing');

  if (!isLoaded || !isInitialized) return null;

  const missingList = getMissingList();
  const duplicatesList = getDuplicatesList();

  const generateText = () => {
    let text = activeTab === 'missing' ? t('listsMyMissing') : t('listsMyDups');
    
    const list = activeTab === 'missing' ? missingList : duplicatesList;
    
    // Sort teams as they appear in TEAMS array
    const sortedTeams = Object.keys(list).sort((a, b) => {
      return TEAMS.findIndex(t => t.code === a) - TEAMS.findIndex(t => t.code === b);
    });

    sortedTeams.forEach(team => {
      if (activeTab === 'missing') {
        const nums = (list as Record<string, number[]>)[team].sort((a, b) => a - b);
        text += `${team}: ${nums.join(', ')}\n`;
      } else {
        const dups = (list as Record<string, {number: number, count: number}[]>)[team].sort((a, b) => a.number - b.number);
        const nums = dups.map(d => d.count > 1 ? `${d.number} (${d.count}x)` : d.number);
        text += `${team}: ${nums.join(', ')}\n`;
      }
    });

    return text;
  };

  const handleCopy = () => {
    const text = generateText();
    navigator.clipboard.writeText(text);
    alert(t('listsCopied'));
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(generateText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 min-h-full flex flex-col">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-gray-800">{t('listsTitle')}</h2>
      </div>

      <div className="flex p-1 bg-gray-100 rounded-xl">
        <button
          className={`flex-1 py-2 font-bold text-sm rounded-lg transition-all ${
            activeTab === 'missing' ? 'bg-white text-wc-red shadow' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('missing')}
        >
          {t('listsMissing')}
        </button>
        <button
          className={`flex-1 py-2 font-bold text-sm rounded-lg transition-all ${
            activeTab === 'duplicates' ? 'bg-white text-wc-orange shadow' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('duplicates')}
        >
          {t('listsDuplicates')}
        </button>
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-2xl overflow-y-auto p-4 shadow-sm relative">
        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700">
          {generateText()}
        </pre>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={handleCopy}
          className="flex items-center justify-center p-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
        >
          <Copy size={18} className="mr-2" />
          {t('listsCopyBtn')}
        </button>
        <button 
          onClick={handleShareWhatsApp}
          className="flex items-center justify-center p-3 rounded-xl bg-[#25D366] text-white font-bold hover:bg-[#20b858] transition"
        >
          <Share2 size={18} className="mr-2" />
          WhatsApp
        </button>
      </div>
    </div>
  );
}
