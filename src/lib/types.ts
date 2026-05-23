export type AlbumSticker = {
  code: string;        // "BRA 10"
  teamCode: string;    // "BRA"
  number: number;      // 10
};

export type UserSticker = {
  code: string;        // "BRA 10"
  quantity: number;    // 0 = missing, 1 = owned, > 1 = duplicate
  updatedAt: string;
};

export type ParsedSticker = {
  teamCode: string;
  number: number;
  originalText: string;
  isValid: boolean;
};
