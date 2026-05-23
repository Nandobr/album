import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserSticker } from './types';
import { TEAMS } from './albumData';

export type InitializationMode = 'have' | 'missing' | 'empty';

interface AlbumState {
  stickers: Record<string, UserSticker>;
  isInitialized: boolean;
  isLoaded: boolean;
  setLoaded: (loaded: boolean) => void;
  initializeAlbum: (mode: InitializationMode, initialStickerCodes?: string[]) => void;
  updateStickers: (updates: { code: string, quantityToAdd: number }[]) => void;
  importStickers: (data: Record<string, UserSticker>) => void;
  getStats: () => { totalOwned: number; totalMissing: number; totalDuplicates: number; totalStickers: number; percentage: number };
  getMissingList: () => Record<string, number[]>;
  getDuplicatesList: () => Record<string, {number: number, count: number}[]>;
  resetAlbum: () => void;
}

const generateEmptyAlbum = (defaultQuantity: number): Record<string, UserSticker> => {
  const newStickers: Record<string, UserSticker> = {};
  // Force Next.js to reload this module to pick up the latest TEAMS array
  TEAMS.forEach(team => {
    for (let i = 1; i <= team.count; i++) {
      const code = `${team.code} ${i}`;
      newStickers[code] = { code, quantity: defaultQuantity, updatedAt: new Date().toISOString() };
    }
  });
  return newStickers;
};

export const useAlbumStore = create<AlbumState>()(
  persist(
    (set, get) => ({
      stickers: {},
      isInitialized: false,
      isLoaded: false,
      setLoaded: (loaded) => set({ isLoaded: loaded }),
      
      initializeAlbum: (mode, initialStickerCodes = []) => {
        let baseStickers: Record<string, UserSticker>;
        if (mode === 'empty' || mode === 'have') {
          baseStickers = generateEmptyAlbum(0);
          initialStickerCodes.forEach(code => {
            if (baseStickers[code]) {
              baseStickers[code].quantity = 1;
              baseStickers[code].updatedAt = new Date().toISOString();
            }
          });
        } else {
          baseStickers = generateEmptyAlbum(1);
          initialStickerCodes.forEach(code => {
            if (baseStickers[code]) {
              baseStickers[code].quantity = 0;
              baseStickers[code].updatedAt = new Date().toISOString();
            }
          });
        }
        set({ stickers: baseStickers, isInitialized: true });
      },

      updateStickers: (updates) => {
        set((state) => {
          const newStickers = { ...state.stickers };
          updates.forEach(update => {
            if (newStickers[update.code]) {
              newStickers[update.code] = {
                ...newStickers[update.code],
                quantity: Math.max(0, newStickers[update.code].quantity + update.quantityToAdd),
                updatedAt: new Date().toISOString()
              };
            }
          });
          return { stickers: newStickers };
        });
      },

      importStickers: (data) => {
        set({ stickers: data, isInitialized: true });
      },

      getStats: () => {
        const { stickers } = get();
        let totalOwned = 0;
        let totalMissing = 0;
        let totalDuplicates = 0;
        const totalStickers = TEAMS.reduce((sum, team) => sum + team.count, 0);

        Object.values(stickers).forEach(sticker => {
          if (sticker.quantity === 0) totalMissing++;
          if (sticker.quantity >= 1) totalOwned++;
          if (sticker.quantity > 1) totalDuplicates += (sticker.quantity - 1);
        });

        return {
          totalOwned,
          totalMissing,
          totalDuplicates,
          totalStickers,
          percentage: Math.round((totalOwned / totalStickers) * 100) || 0
        };
      },

      getMissingList: () => {
        const { stickers } = get();
        const missing: Record<string, number[]> = {};
        Object.values(stickers).forEach(sticker => {
          if (sticker.quantity === 0) {
            const team = sticker.code.split(' ')[0];
            const num = parseInt(sticker.code.split(' ')[1]);
            if (!missing[team]) missing[team] = [];
            missing[team].push(num);
          }
        });
        return missing;
      },

      getDuplicatesList: () => {
        const { stickers } = get();
        const duplicates: Record<string, {number: number, count: number}[]> = {};
        Object.values(stickers).forEach(sticker => {
          if (sticker.quantity > 1) {
            const team = sticker.code.split(' ')[0];
            const num = parseInt(sticker.code.split(' ')[1]);
            if (!duplicates[team]) duplicates[team] = [];
            duplicates[team].push({ number: num, count: sticker.quantity - 1 });
          }
        });
        return duplicates;
      },

      resetAlbum: () => {
        set({ stickers: {}, isInitialized: false });
      }
    }),
    {
      name: 'figurinhas_2026_album',
      onRehydrateStorage: () => (state) => {
        state?.setLoaded(true);
      }
    }
  )
);
