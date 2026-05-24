import React from 'react';
import { UserSticker } from '@/lib/types';

interface StickerBadgeProps {
  sticker: UserSticker | undefined;
  code: string;
  onClick?: () => void;
}

export function StickerBadge({ sticker, code, onClick }: StickerBadgeProps) {
  const isOwned = (sticker?.quantity ?? 0) > 0;
  const isDuplicate = (sticker?.quantity ?? 0) > 1;
  const number = code.split(' ')[1];
  const team = code.split(' ')[0];

  return (
    <button 
      onClick={onClick}
      className={`relative aspect-[3/4] rounded-lg flex flex-col items-center justify-center border-2 transition-all active:scale-95
        ${(isOwned || isDuplicate)
          ? 'bg-wc-blue text-white border-blue-600' 
          : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200'
        }
      `}
    >
      <span className="text-xs font-bold opacity-80">{team}</span>
      <span className="text-xl font-black">{number}</span>

      {isDuplicate && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm border border-white">
          {sticker.quantity}
        </div>
      )}
    </button>
  );
}
