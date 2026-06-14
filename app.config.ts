import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Menki 1000+",
  slug: "GentsukiApp",
  version: "1.0.0",
  assetBundlePatterns: ["assets/sounds/**/*"],
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#FFFFFF",
  },
  android: {
    package: "com.menki1000vn.app",
    permissions: [
      "INTERNET",
      "ACCESS_NETWORK_STATE",
    ],
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF",
    },
    config: {
      googleMobileAdsAppId: "ca-app-pub-8320439928464026~3478148954",
    },
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  extra: {
    eas: {
      projectId: "1108b0e9-ef6f-4e53-aac5-384029a16d24",
    },
  },
  plugins: [
    "expo-image-picker",
    "expo-web-browser",
    [
      "react-native-google-mobile-ads",
      {
        // Android AdMob App ID - required for Android builds
        androidAppId: "ca-app-pub-8320439928464026~3478148954",
      },
    ],
    "expo-audio",
  ],
  owner: "duyhung90",
};

export default config;
