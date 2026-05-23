import type { QuestionBank, MaruBatsu } from "../types";

export interface ChapterStats {
  total: number;
  correct: number;
}

export function getChapterStats(
  chapterId: string,
  bank: QuestionBank,
  practiceProgress: Record<string, Record<string, MaruBatsu>>
): ChapterStats {
  let total = 0;
  let correct = 0;
  const answered = practiceProgress[chapterId] ?? {};

  // Simple questions - only check chapter, NOT section
  for (const q of bank.simple) {
    if (q.chapter === chapterId) {
      total++;
      if (answered[q.id] !== undefined && answered[q.id] === q.answer) {
        correct++;
      }
    }
  }

  // Scenario groups - only check chapter, NOT section
  for (const g of bank.scenarioGroups) {
    if (g.chapter === chapterId) {
      for (let i = 0; i < g.subs.length; i++) {
        total++;
        const key = `${g.groupId}_${i}`;
        if (answered[key] !== undefined && answered[key] === g.subs[i].answer) {
          correct++;
        }
      }
    }
  }

  return { total, correct };
}

export function getChapterTotal(
  chapterId: string,
  bank: QuestionBank
): number {
  let total = 0;

  for (const q of bank.simple) {
    if (q.chapter === chapterId) {
      total++;
    }
  }

  for (const g of bank.scenarioGroups) {
    if (g.chapter === chapterId) {
      total += g.subs.length;
    }
  }

  return total;
}
