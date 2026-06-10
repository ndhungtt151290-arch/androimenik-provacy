import { Platform } from "react-native";

// ImgBB API key for image uploads
export const IMGBB_API_KEY = process.env.IMGBB_API_KEY ?? "";

const IS_TEST = __DEV__ || process.env.EXPO_PUBLIC_ENV === 'staging';

export const getAdConfig = () => ({
  BANNER_ID: IS_TEST
    ? "ca-app-pub-3940256099942544/2934735716"
    : "ca-app-pub-XXXXXXXX/XXXXXX",
  INTERSTITIAL_ID: IS_TEST
    ? "ca-app-pub-3940256099942544/4411468910"
    : "ca-app-pub-XXXXXXXX/XXXXXX",
});

export const FALLBACK_ADS = {
  BANNER_ID: Platform.select({
    ios: IS_TEST ? "ca-app-pub-3940256099942544/2934735716" : "ca-app-pub-XXXXXXXX/XXXXXX",
    default: "",
  })!,
  INTERSTITIAL_ID: Platform.select({
    ios: IS_TEST ? "ca-app-pub-3940256099942544/4411468910" : "ca-app-pub-XXXXXXXX/XXXXXX",
    default: "",
  })!,
};
