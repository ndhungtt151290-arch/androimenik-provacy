import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ExamHistoryEntry, MaruBatsu, PersonalStats, WrongAnswerStats } from "../types";

const HISTORY_KEY = "gentsuki_exam_history";
const STATS_KEY = "gentsuki_personal_stats";

export async function loadHistory(): Promise<ExamHistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveHistory(entry: ExamHistoryEntry): Promise<void> {
  try {
    const history = await loadHistory();
    history.unshift(entry);
    if (history.length > 20) history.pop();
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn("saveHistory failed:", e);
  }
}

export async function loadStats(): Promise<PersonalStats> {
  try {
    const raw = await AsyncStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : { totalExams: 0, highestScore: 0, lowestScore: 0, chaptersStats: {} };
  } catch {
    return { totalExams: 0, highestScore: 0, lowestScore: 0, chaptersStats: {} };
  }
}

export async function saveStats(stats: PersonalStats): Promise<void> {
  try {
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn("saveStats failed:", e);
  }
}

const PRACTICE_KEY = "gentsuki_practice_progress_v2";

export async function loadPracticeProgress(): Promise<Record<string, Record<string, MaruBatsu>>> {
  try {
    const raw = await AsyncStorage.getItem(PRACTICE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function savePracticeProgress(
  chapterId: string,
  answers: Record<string, MaruBatsu | undefined>
): Promise<void> {
  try {
    const all = await loadPracticeProgress();
    const validAnswers: Record<string, MaruBatsu> = {};
    for (const [key, value] of Object.entries(answers)) {
      if (value !== undefined) {
        validAnswers[key] = value;
      }
    }
    all[chapterId] = validAnswers;
    await AsyncStorage.setItem(PRACTICE_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn("savePracticeProgress failed:", e);
  }
}

const WRONG_ANSWERS_KEY = "gentsuki_wrong_answers";
const MAX_WRONG_ANSWERS = 20;

export async function loadWrongAnswers(): Promise<WrongAnswerStats[]> {
  try {
    const raw = await AsyncStorage.getItem(WRONG_ANSWERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveWrongAnswers(stats: WrongAnswerStats[]): Promise<void> {
  try {
    await AsyncStorage.setItem(WRONG_ANSWERS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn("saveWrongAnswers failed:", e);
  }
}

export async function addWrongAnswer(questionId: string): Promise<void> {
  try {
    const stats = await loadWrongAnswers();
    const now = Date.now();
    const existingIndex = stats.findIndex((s) => s.questionId === questionId);

    if (existingIndex !== -1) {
      stats[existingIndex].wrongCount += 1;
      stats[existingIndex].updatedAt = now;
    } else {
      stats.push({
        questionId,
        wrongCount: 1,
        updatedAt: now,
      });

      if (stats.length > MAX_WRONG_ANSWERS) {
        let minWrongCount = stats[0].wrongCount;
        let oldestIndex = 0;
        for (let i = 1; i < stats.length - 1; i++) {
          if (
            stats[i].wrongCount < minWrongCount ||
            (stats[i].wrongCount === minWrongCount && stats[i].updatedAt < stats[oldestIndex].updatedAt)
          ) {
            minWrongCount = stats[i].wrongCount;
            oldestIndex = i;
          }
        }
        stats.splice(oldestIndex, 1);
      }
    }

    await saveWrongAnswers(stats);
  } catch (e) {
    console.warn("addWrongAnswer failed:", e);
  }
}

export async function addWrongAnswers(questionIds: string[]): Promise<void> {
  try {
    const stats = await loadWrongAnswers();
    const now = Date.now();
    const idsToProcess = new Set(questionIds);

    for (const questionId of questionIds) {
      const existingIndex = stats.findIndex((s) => s.questionId === questionId);
      if (existingIndex !== -1) {
        stats[existingIndex].wrongCount += 1;
        stats[existingIndex].updatedAt = now;
        idsToProcess.delete(questionId);
      }
    }

    for (const questionId of idsToProcess) {
      stats.push({
        questionId,
        wrongCount: 1,
        updatedAt: now,
      });
    }

    while (stats.length > MAX_WRONG_ANSWERS) {
      let minWrongCount = stats[0].wrongCount;
      let oldestIndex = 0;
      for (let i = 1; i < stats.length; i++) {
        if (
          stats[i].wrongCount < minWrongCount ||
          (stats[i].wrongCount === minWrongCount && stats[i].updatedAt < stats[oldestIndex].updatedAt)
        ) {
          minWrongCount = stats[i].wrongCount;
          oldestIndex = i;
        }
      }
      stats.splice(oldestIndex, 1);
    }

    await saveWrongAnswers(stats);
  } catch (e) {
    console.warn("addWrongAnswers failed:", e);
  }
}

export async function addExamWrongAnswer(questionId: string): Promise<void> {
  try {
    const stats = await loadWrongAnswers();
    const now = Date.now();
    const existingIndex = stats.findIndex((s) => s.questionId === questionId);

    if (existingIndex !== -1) {
      stats[existingIndex].wrongCount += 1;
      stats[existingIndex].updatedAt = now;
    } else {
      stats.push({
        questionId,
        wrongCount: 1,
        updatedAt: now,
      });

      if (stats.length > MAX_WRONG_ANSWERS) {
        let minWrongCount = stats[0].wrongCount;
        let oldestIndex = 0;
        for (let i = 1; i < stats.length - 1; i++) {
          if (
            stats[i].wrongCount < minWrongCount ||
            (stats[i].wrongCount === minWrongCount && stats[i].updatedAt < stats[oldestIndex].updatedAt)
          ) {
            minWrongCount = stats[i].wrongCount;
            oldestIndex = i;
          }
        }
        stats.splice(oldestIndex, 1);
      }
    }

    await saveWrongAnswers(stats);
  } catch (e) {
    console.warn("addExamWrongAnswer failed:", e);
  }
}

// --- Chapter position (question index) ---
const CHAPTER_POSITION_KEY = "gentsuki_chapter_position_v1";

export async function saveChapterPosition(chapterId: string, questionIndex: number): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(CHAPTER_POSITION_KEY);
    const positions: Record<string, number> = raw ? JSON.parse(raw) : {};
    positions[chapterId] = questionIndex;
    await AsyncStorage.setItem(CHAPTER_POSITION_KEY, JSON.stringify(positions));
  } catch (e) {
    console.warn("saveChapterPosition failed:", e);
  }
}

export async function loadChapterPosition(chapterId: string): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(CHAPTER_POSITION_KEY);
    if (!raw) return null;
    const positions: Record<string, number> = JSON.parse(raw);
    return positions[chapterId] ?? null;
  } catch {
    return null;
  }
}
