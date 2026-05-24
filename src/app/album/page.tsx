"use client";

import { useState } from 'react';
import { useAlbumStore } from '@/lib/useAlbumStore';
import { useLanguageStore } from '@/lib/useLanguageStore';
import { useMounted } from '@/lib/useMounted';
import { TEAMS, GROUPS } from '@/lib/albumData';
import { StickerBadge } from '@/components/StickerBadge';
import { X, Minus, Plus, Search } from 'lucide-react';

export default function AlbumGrid() {
  const { stickers, isInitialized, updateStickers } = useAlbumStore();
  const { t, lang } = useLanguageStore();
  const isLoaded = useMounted();
  const [selectedGroup, setSelectedGroup] = useState<string>('Todos');
  const [selectedTeam, setSelectedTeam] = useState<string>('FWC');
  const [selectedStickerCode, setSelectedStickerCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentGroup = GROUPS.find(g => g.name === selectedGroup);
  let visibleTeams = selectedGroup === 'Todos' 
    ? TEAMS 
    : TEAMS.filter(t => currentGroup?.codes.includes(t.code));

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    visibleTeams = TEAMS.filter(t => t.code.toLowerCase().startsWith(query));
  }

  const translateGroup = (name: string) => {
    if (lang === 'en') {
      if (name === 'Especiais') return 'Specials';
      if (name.startsWith('Grupo ')) return name.replace('Grupo ', 'Group ');
    }
    return name;
  };

  const currentTeamData = TEAMS.find(t => t.code === selectedTeam);
  const teamTotal = currentTeamData?.count || 0;
  
  let teamOwned = 0;
  for (let i = 1; i <= teamTotal; i++) {
    if (stickers[`${selectedTeam} ${i}`]?.quantity > 0) {
      teamOwned++;
    }
  }
  const teamPercentage = teamTotal > 0 ? Math.round((teamOwned / teamTotal) * 100) : 0;

  const handleUpdateQuantity = (code: string, change: number) => {
    updateStickers([{ code, quantityToAdd: change }]);
  };

  if (!isLoaded || !isInitialized) return null;

  return (
    <div className="space-y-2 h-full flex flex-col">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-gray-800">{t('albumTitle')}</h2>
      </div>

      {/* Search Bar */}
      <div className="px-1 -mt-2 flex justify-center">
        <div className="relative w-[40%]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input 
            type="text" 
            maxLength={3}
            placeholder={lang === 'en' ? 'Code...' : 'Sigla...'}
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              setSearchQuery(val);
              const query = val.toLowerCase();
              if (query.trim()) {
                const matches = TEAMS.filter(t => t.code.toLowerCase().startsWith(query));
                if (matches.length > 0 && !matches.some(t => t.code === selectedTeam)) {
                  setSelectedTeam(matches[0].code);
                }
              }
            }}
            className="w-full bg-gray-100/80 border border-gray-200 rounded-md pl-7 pr-6 py-1 text-xs uppercase text-black focus:ring-2 focus:ring-wc-blue focus:border-wc-blue outline-none transition-all placeholder-gray-400 placeholder:normal-case font-bold text-center"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Group Selector */}
      <div className={`overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide flex space-x-2 transition-all ${searchQuery ? 'hidden' : 'block'}`}>
        <button
          onClick={() => {
            setSelectedGroup('Todos');
            setSelectedTeam(TEAMS[0].code);
          }}
          className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors border
            ${selectedGroup === 'Todos' 
              ? 'bg-gray-800 text-white border-gray-800' 
              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'
            }
          `}
        >
          {lang === 'en' ? 'ALL' : 'TODOS'}
        </button>
        {GROUPS.map((g) => {
          const isSelected = selectedGroup === g.name;
          return (
            <button
              key={g.name}
              onClick={() => {
                setSelectedGroup(g.name);
                setSelectedTeam(g.codes[0]);
              }}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors border
                ${isSelected 
                  ? 'bg-gray-800 text-white border-gray-800' 
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'
                }
              `}
            >
              {translateGroup(g.name)}
            </button>
          );
        })}
      </div>

      {/* Team Selector */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide flex space-x-2">
        {visibleTeams.map((team) => {
          const isSelected = selectedTeam === team.code;
          
          let isComplete = true;
          for (let i = 1; i <= team.count; i++) {
            if (!stickers[`${team.code} ${i}`] || stickers[`${team.code} ${i}`].quantity === 0) {
              isComplete = false;
              break;
            }
          }

          return (
            <button
              key={team.code}
              onClick={() => setSelectedTeam(team.code)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-bold text-xs transition-all border
                ${isComplete 
                  ? (isSelected ? 'bg-yellow-400 text-yellow-900 border-yellow-500 shadow-sm' : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100')
                  : (isSelected 
                    ? 'bg-wc-blue text-white border-wc-blue shadow-sm' 
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100')
                }
              `}
            >
              {team.code} {isComplete && '⭐'}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto pb-4">
        <div className="mb-2 space-y-2">
          <div className="flex items-end justify-between">
            <h3 className="font-bold text-lg text-gray-800">{currentTeamData?.name}</h3>
            <span className="text-sm font-bold text-gray-500">{teamOwned} / {teamTotal}</span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-wc-blue transition-all duration-500" 
              style={{ width: `${teamPercentage}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
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
