import { Platform } from "react-native";

// ImgBB API key for image uploads
export const IMGUR_CLIENT_ID = "60a501c064f72d1f559def85420d0419";

export const getAdConfig = () => ({
  androidAppId: "ca-app-pub-8320439928464026~xxxxxxxxxx",
  iosAppId: "ca-app-pub-8320439928464026~xxxxxxxxxx",
});

export const FALLBACK_ADS = {
  BANNER_ID: Platform.select({
    android: "ca-app-pub-3940256099942544/6300978111",
    ios: "ca-app-pub-3940256099942544/2934735716",
    default: "ca-app-pub-3940256099942544/6300978111",
  })!,
  INTERSTITIAL_ID: Platform.select({
    android: "ca-app-pub-3940256099942544/1033173712",
    ios: "ca-app-pub-3940256099942544/4411468910",
    default: "ca-app-pub-3940256099942544/1033173712",
  })!,
};
