/**
 * AdMob Service — Khoi tao va export Ad Unit IDs
 *
 * Su dung dynamic import de tranh crash khi chay tren Expo Go
 * (native module khong kha dung tren Expo Go).
 */

import { getAdConfig, FALLBACK_ADS } from "../config/ads";
import { logger } from "../utils/logger";

export const BANNER_ID = FALLBACK_ADS.BANNER_ID;
export const INTERSTITIAL_ID = FALLBACK_ADS.INTERSTITIAL_ID;

let _mobileAds: Awaited<ReturnType<typeof import("react-native-google-mobile-ads").default>> | null = null;
let _initialized = false;
let _configLoaded = false;
let _realBannerId = FALLBACK_ADS.BANNER_ID;
let _realInterstitialId = FALLBACK_ADS.INTERSTITIAL_ID;

async function loadConfig() {
  if (_configLoaded) return;
  _configLoaded = true;
  try {
    const cfg = await getAdConfig();
    _realBannerId = cfg.BANNER_ID;
    _realInterstitialId = cfg.INTERSTITIAL_ID;
  } catch {
    // Use fallback
  }
}

async function getMobileAds() {
  if (_mobileAds) return _mobileAds;
  try {
    const mod = await import("react-native-google-mobile-ads");
    _mobileAds = mod.default();
    return _mobileAds;
  } catch {
    return null;
  }
}

export async function initAds(): Promise<void> {
  if (_initialized) return;
  _initialized = true;

  await loadConfig();

  try {
    const ads = await getMobileAds();
    if (ads) {
      await ads.initialize();
      logger.log("[AdMob] Initialized successfully");
    } else {
      logger.log("[AdMob] Native module not available, skipping init");
    }
  } catch (err) {
    logger.warn("[AdMob] Init failed:", err);
  }
}

export function getBannerId(): string {
  return _realBannerId;
}

export function getInterstitialId(): string {
  return _realInterstitialId;
}
