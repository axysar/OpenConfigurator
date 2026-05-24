import { roundTo } from '@shared/index';
import type { BoxPart, PergolaModel } from './pergolaMath';

/**
 * Group raw boxes into BOM line items by canonical section size.
 * Each row reports the count and the total linear meters needed for cuts.
 */
export interface BomRow {
  category: 'Post' | 'Beam' | 'Slat';
  section: string;
  count: number;
  lengthM: number;
  totalLengthM: number;
}

const longestAxis = (size: [number, number, number]): { length: number; section: [number, number] } => {
  const [a, b, c] = size;
  if (a >= b && a >= c) return { length: a, section: [b, c] };
  if (b >= a && b >= c) return { length: b, section: [a, c] };
  return { length: c, section: [a, b] };
};

const sectionKey = (section: [number, number]): string => {
  const [s0, s1] = [section[0], section[1]].sort((a, b) => a - b);
  return `${Math.round(s0 * 1000)}×${Math.round(s1 * 1000)} mm`;
};

const groupParts = (parts: BoxPart[], category: BomRow['category']): BomRow[] => {
  const buckets = new Map<string, BomRow>();
  for (const part of parts) {
    const { length, section } = longestAxis(part.size);
    const lengthM = roundTo(length, 2);
    const key = `${category}|${sectionKey(section)}|${lengthM}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.count += 1;
      existing.totalLengthM = roundTo(existing.totalLengthM + lengthM, 2);
    } else {
      buckets.set(key, {
        category,
        section: sectionKey(section),
        count: 1,
        lengthM,
        totalLengthM: lengthM,
      });
    }
  }
  return Array.from(buckets.values()).sort((a, b) => b.totalLengthM - a.totalLengthM);
};

export const buildPergolaBom = (model: PergolaModel): BomRow[] => [
  ...groupParts(model.posts, 'Post'),
  ...groupParts(model.beams, 'Beam'),
  ...groupParts(model.slats, 'Slat'),
];

export const bomToCsv = (rows: BomRow[]): string => {
  const header = 'Category,Section,Count,Length (m),Total Length (m)';
  const body = rows
    .map((row) => `${row.category},${row.section},${row.count},${row.lengthM},${row.totalLengthM}`)
    .join('\n');
  return `${header}\n${body}\n`;
};
