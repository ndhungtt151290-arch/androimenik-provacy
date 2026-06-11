export const IMGBB_API_KEY = process.env.EXPO_PUBLIC_IMGBB_API_KEY ?? "";

const IS_TEST = __DEV__ || process.env.EXPO_PUBLIC_ENV === 'staging';

export const AD_IDS = {
  BANNER_ID: IS_TEST
    ? "ca-app-pub-3940256099942544/2934735716"
    : (process.env.EXPO_PUBLIC_AD_BANNER_ID ?? "ca-app-pub-XXXXXXXX/XXXXXX"),

  INTERSTITIAL_ID: IS_TEST
    ? "ca-app-pub-3940256099942544/4411468910"
    : (process.env.EXPO_PUBLIC_AD_INTERSTITIAL_ID ?? "ca-app-pub-XXXXXXXX/XXXXXX"),
};
