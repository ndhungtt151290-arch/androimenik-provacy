/**
 * AdMob Configuration - Android Only
 * 
 * Test IDs (for development & staging):
 * - Banner: ca-app-pub-3940256099942544/2934735716
 * - Interstitial: ca-app-pub-3940256099942544/4411468910
 * 
 * Production IDs: Replace via environment variables (eas.json)
 * - EXPO_PUBLIC_AD_BANNER_ID
 * - EXPO_PUBLIC_AD_INTERSTITIAL_ID
 */

export const IMGBB_API_KEY = process.env.EXPO_PUBLIC_IMGBB_API_KEY ?? "";

const IS_TEST = __DEV__ || process.env.EXPO_PUBLIC_ENV === 'staging';

export const AD_IDS = {
  BANNER_ID: IS_TEST
    ? "ca-app-pub-3940256099942544/2934735716"  // Google Test Banner
    : (process.env.EXPO_PUBLIC_AD_BANNER_ID ?? "ca-app-pub-XXXXXXXX/XXXXXX"),

  INTERSTITIAL_ID: IS_TEST
    ? "ca-app-pub-3940256099942544/4411468910"  // Google Test Interstitial
    : (process.env.EXPO_PUBLIC_AD_INTERSTITIAL_ID ?? "ca-app-pub-XXXXXXXX/XXXXXX"),
};
