import React from 'react';
import { UserSticker } from '@/lib/types';

interface StickerBadgeProps {
  sticker: UserSticker | undefined;
  code: string;
  onClick?: () => void;
}

export function StickerBadge({ sticker, code, onClick }: StickerBadgeProps) {
  const isMissing = !sticker || sticker.quantity === 0;
  const isDuplicate = sticker && sticker.quantity > 1;
  const [team, num] = code.split(' ');

  return (
    <div 
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center p-2 rounded shadow-sm border
        aspect-[3/4] font-bold text-center select-none cursor-pointer active:scale-95
        transition-all duration-200
        ${isMissing ? 'bg-gray-100 border-gray-200 text-gray-400 hover:bg-gray-200' : 'bg-gradient-to-br from-wc-blue to-wc-blue/80 border-wc-blue text-white hover:opacity-90'}
      `}
    >
      <div className="text-[10px] uppercase opacity-80">{team}</div>
      <div className="text-lg">{num}</div>
      
      {isDuplicate && (
        <div className="absolute -top-2 -right-2 bg-wc-orange text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black shadow-md border-2 border-white z-10">
          +{sticker.quantity - 1}
        </div>
      )}
    </div>
  );
}
