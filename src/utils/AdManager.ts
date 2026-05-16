import AsyncStorage from "@react-native-async-storage/async-storage";
import { adEmitter } from "./AdEventEmitter";

const CHAPTER_BACK_KEY = "chapter_back_count";
const EXAM_BACK_KEY = "exam_back_count";
const RETRY_KEY = "retry_count";

async function checkAndShow(key: string, callback: () => void): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(key);
    const count = raw ? parseInt(raw, 10) : 0;
    const next = count + 1;
    await AsyncStorage.setItem(key, String(next));

    if (next % 5 === 0) {
      setTimeout(() => {
        adEmitter.emit("show", callback);
      }, 300);
    } else {
      callback();
    }
  } catch {
    callback();
  }
}

export function showInterstitialChapter(callback: () => void): void {
  checkAndShow(CHAPTER_BACK_KEY, callback);
}

export function showInterstitialExam(callback: () => void): void {
  checkAndShow(EXAM_BACK_KEY, callback);
}

export function showInterstitialRetry(callback: () => void): void {
  checkAndShow(RETRY_KEY, callback);
}

export function closeInterstitial(): void {
  adEmitter.emit("close");
}
