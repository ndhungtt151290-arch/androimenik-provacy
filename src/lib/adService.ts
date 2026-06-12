/**
 * AdMob Service — Khoi tao va export Ad Unit IDs
 *
 * Su dung dynamic import de tranh crash khi chay tren Expo Go
 * (native module khong kha dung tren Expo Go).
 */

import { Platform } from "react-native";
import { AD_IDS } from "../config/ads";
import { logger } from "../utils/logger";

export const BANNER_ID = AD_IDS.BANNER_ID;
export const INTERSTITIAL_ID = AD_IDS.INTERSTITIAL_ID;

let _mobileAds: Awaited<ReturnType<typeof import("react-native-google-mobile-ads").default>> | null = null;
let _initialized = false;

async function getMobileAds() {
  if (_mobileAds) return _mobileAds;

  if (Platform.OS === "web") return null;

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

  try {
    const ads = await getMobileAds();
    if (ads) {
      await ads.setRequestConfiguration({
        testDeviceIdentifiers: [
          "SIMULATOR",
          "8CBD2E20-A562-49F4-BF9E-6895C33F04B8",
          "bd62f229-a64f-4626-aae0-5d1850838603",
        ],
      });

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
  return AD_IDS.BANNER_ID;
}

export function getInterstitialId(): string {
  return AD_IDS.INTERSTITIAL_ID;
}
