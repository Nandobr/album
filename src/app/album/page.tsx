"use client";

import { useState } from 'react';
import { useAlbumStore } from '@/lib/useAlbumStore';
import { useLanguageStore } from '@/lib/useLanguageStore';
import { useMounted } from '@/lib/useMounted';
import { TEAMS, GROUPS } from '@/lib/albumData';
import { StickerBadge } from '@/components/StickerBadge';
import { X, Minus, Plus } from 'lucide-react';

export default function AlbumGrid() {
  const { stickers, isInitialized, updateStickers } = useAlbumStore();
  const { t } = useLanguageStore();
  const isLoaded = useMounted();
  const [selectedGroup, setSelectedGroup] = useState<string>('Especiais');
  const [selectedTeam, setSelectedTeam] = useState<string>('FWC');
  const [selectedStickerCode, setSelectedStickerCode] = useState<string | null>(null);

  const currentGroup = GROUPS.find(g => g.name === selectedGroup);
  const visibleTeams = TEAMS.filter(t => currentGroup?.codes.includes(t.code));

  const handleUpdateQuantity = (code: string, change: number) => {
    updateStickers([{ code, quantityToAdd: change }]);
  };

  if (!isLoaded || !isInitialized) return null;

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-gray-800">{t('albumTitle')}</h2>
      </div>

      {/* Group Selector */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide flex space-x-2">
        {GROUPS.map((g) => {
          const isSelected = selectedGroup === g.name;
          return (
            <button
              key={g.name}
              onClick={() => {
                setSelectedGroup(g.name);
                setSelectedTeam(g.codes[0]);
              }}
              className={`whitespace-nowrap px-2.5 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-colors border
                ${isSelected 
                  ? 'bg-gray-800 text-white border-gray-800' 
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'
                }
              `}
            >
              {g.name}
            </button>
          );
        })}
      </div>

      {/* Team Selector */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide flex space-x-2 mt-2">
        {visibleTeams.map((team) => {
          const isSelected = selectedTeam === team.code;
          return (
            <button
              key={team.code}
              onClick={() => setSelectedTeam(team.code)}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm transition-colors border
                ${isSelected 
                  ? 'bg-wc-blue text-white border-wc-blue' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              {team.code}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="mb-4">
          <h3 className="font-bold text-lg text-gray-700">{TEAMS.find(t => t.code === selectedTeam)?.name}</h3>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {Array.from({ length: TEAMS.find(t => t.code === selectedTeam)?.count || 0 }).map((_, i) => {
            const num = i + 1;
            const code = `${selectedTeam} ${num}`;
            const sticker = stickers[code];
            return (
              <StickerBadge 
                key={code} 
                sticker={sticker} 
                code={code} 
                onClick={() => setSelectedStickerCode(code)}
              />
            );
          })}
        </div>
      </div>

      {/* Correction Modal */}
      {selectedStickerCode && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-lg">Atualizar Figurinha</h3>
              <button 
                onClick={() => setSelectedStickerCode(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col items-center space-y-6">
              <div className="text-3xl font-black text-wc-blue">
                {selectedStickerCode}
              </div>
              
              <div className="flex items-center space-x-6">
                <button 
                  onClick={() => handleUpdateQuantity(selectedStickerCode, -1)}
                  disabled={(stickers[selectedStickerCode]?.quantity || 0) === 0}
                  className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 active:scale-95 transition disabled:opacity-30 disabled:active:scale-100"
                >
                  <Minus size={28} />
                </button>
                
                <div className="flex flex-col items-center w-16">
                  <span className="text-4xl font-bold text-gray-800">
                    {stickers[selectedStickerCode]?.quantity || 0}
                  </span>
                  <span className="text-xs text-gray-500 uppercase font-semibold mt-1">
                    {(stickers[selectedStickerCode]?.quantity || 0) === 0 ? 'Falta' : 'Tenho'}
                  </span>
                </div>
                
                <button 
                  onClick={() => handleUpdateQuantity(selectedStickerCode, 1)}
                  className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 active:scale-95 transition"
                >
                  <Plus size={28} />
                </button>
              </div>
            </div>
            
            <div className="px-4 py-3 bg-gray-50 border-t">
              <button 
                onClick={() => setSelectedStickerCode(null)}
                className="w-full py-3 bg-wc-blue text-white font-bold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
