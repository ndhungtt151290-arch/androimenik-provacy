import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ExamHistoryEntry, PersonalStats } from "../types";

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
  } catch {}
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
  } catch {}
}
