import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { adEmitter } from "./AdEventEmitter";
import { getBannerId, getInterstitialId } from "../lib/adService";
import { logger } from "./logger";

const CHAPTER_BACK_KEY = "chapter_back_count";
const EXAM_BACK_KEY = "exam_back_count";
const RETRY_KEY = "retry_count";

async function showInterstitialAd(callback: () => void): Promise<void> {
  if (Platform.OS === "web") {
    setTimeout(() => callback(), 300);
    return;
  }

  let hasCompleted = false;
  let cleanupDone = false;
  let unsubLoaded: (() => void) | undefined;
  let unsubClosed: (() => void) | undefined;
  let unsubError: (() => void) | undefined;

  const cleanup = () => {
    if (cleanupDone) return;
    cleanupDone = true;
    unsubLoaded?.();
    unsubClosed?.();
    unsubError?.();
  };

  try {
    const { InterstitialAd, AdEventType } = await import("react-native-google-mobile-ads");
    const unitId = getInterstitialId();

    const ad = InterstitialAd.createForAdRequest(unitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      if (hasCompleted) return;
      hasCompleted = true;
      cleanup();
      ad.show().catch(() => callback());
    });

    unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      if (hasCompleted) return;
      hasCompleted = true;
      cleanup();
      setTimeout(() => callback(), 300);
    });

    unsubError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
      if (hasCompleted) return;
      hasCompleted = true;
      cleanup();
      logger.warn("[InterstitialAd] Error:", error);
      callback();
    });

    ad.load();
  } catch (err) {
    logger.log("[AdManager] Falling back to AdModal (Expo Go environment)");
    setTimeout(() => adEmitter.emit("show", callback), 300);
  }
}

async function checkAndShow(key: string, threshold: number, callback: () => void): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(key);
    const count = raw ? parseInt(raw, 10) : 0;
    const next = count + 1;
    await AsyncStorage.setItem(key, String(next));

    if (next % threshold === 0) {
      await showInterstitialAd(callback);
    } else {
      callback();
    }
  } catch {
    callback();
  }
}

export function showInterstitialChapter(callback: () => void): void {
  checkAndShow(CHAPTER_BACK_KEY, 20, callback);
}

export function showInterstitialExam(callback: () => void): void {
  checkAndShow(EXAM_BACK_KEY, 20, callback);
}

export function showInterstitialRetry(callback: () => void): void {
  checkAndShow(RETRY_KEY, 5, callback);
}

export function closeInterstitial(): void {
  adEmitter.emit("close");
}
