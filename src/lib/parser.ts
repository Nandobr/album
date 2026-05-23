import { ParsedSticker } from './types';
import { TEAM_CODES, isValidSticker } from './albumData';

export const parseStickerInput = (input: string): ParsedSticker[] => {
  const results: ParsedSticker[] = [];
  
  // Normalize input: uppercase, standardizing some separators
  const text = input.toUpperCase();

  // Try to match patterns like "BRA 10", "BRA-10", "BRA10", "BRA 010"
  // And list formats like "BRA: 1, 2, 5, 9"

  // First, let's split by lines to handle list formats
  const lines = text.split('\n');

  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;

    // Check for list format: TEAM: n1, n2, n3
    const listMatch = cleanLine.match(/^([A-Z]{2,3})\s*:\s*(.+)$/);
    if (listMatch) {
      const teamCode = listMatch[1];
      const numbersStr = listMatch[2];
      
      const numbers = numbersStr.split(/[,\s]+/).map(n => {
        // Remove any letters (like CC in CC3) before parsing
        const digitsOnly = n.replace(/\D/g, '');
        return parseInt(digitsOnly, 10);
      }).filter(n => !isNaN(n));
      
      for (const num of numbers) {
        results.push({
          teamCode,
          number: num,
          originalText: `${teamCode} ${num}`,
          isValid: isValidSticker(teamCode, num)
        });
      }
      continue;
    }

    // Check for individual formats: BRA 10, BRA-10, BRA10
    // We can extract all occurrences of 3 letters followed by numbers
    const regex = /([A-Z]{2,3})[\s-]*0*(\d{1,2})/g;
    let match;
    let foundInLine = false;
    
    while ((match = regex.exec(cleanLine)) !== null) {
      foundInLine = true;
      const teamCode = match[1];
      const num = parseInt(match[2], 10);
      results.push({
        teamCode,
        number: num,
        originalText: match[0],
        isValid: isValidSticker(teamCode, num)
      });
    }

    if (!foundInLine) {
      // Check for standalone 00
      const zeroMatch = cleanLine.match(/\b00\b/);
      if (zeroMatch) {
        results.push({
          teamCode: 'FWC',
          number: 20,
          originalText: '00',
          isValid: true
        });
        foundInLine = true;
      }
    }
  }

  // Deduplicate results based on teamCode and number
  const uniqueResults: ParsedSticker[] = [];
  const seen = new Set<string>();
  
  for (const item of results) {
    const key = `${item.teamCode} ${item.number}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueResults.push(item);
    }
  }

  return uniqueResults;
};
