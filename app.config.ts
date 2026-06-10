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
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.menki1000vn.app",
    buildNumber: "5",
    infoPlist: {
      CFBundleDisplayName: "Menki 1000+",
      NSCameraUsageDescription:
        "Ứng dụng cần truy cập camera để người dùng có thể chụp ảnh làm đại diện hoặc gửi hình ảnh phản hồi lỗi trong quá trình luyện thi.",
      NSPhotoLibraryAddUsageDescription:
        "Ứng dụng cần lưu ảnh xuống thiết bị để người dùng có thể lưu lại hình ảnh từ ứng dụng.",
      NSPhotoLibraryUsageDescription:
        "Ứng dụng cần truy cập thư viện ảnh để người dùng có thể chọn ảnh đại diện hoặc gửi hình ảnh phản hồi lỗi trong quá trình luyện thi.",
      ITSAppUsesNonExemptEncryption: false,
      NSUserTrackingUsageDescription:
        "This app may use device data to support advertising and improve the user experience.",
      PrivacyURL: "https://ndhungtt151290-arch.github.io/menki1000-privacy/",
    },
  },
  android: {
    package: "com.menki1000vn.app",
    permissions: ["INTERNET"],
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
        iosAppId: "ca-app-pub-8320439928464026~1213542725",
        androidAppId: "ca-app-pub-8320439928464026~1213542725",
      },
    ],
    "expo-audio",
  ],
  owner: "duyhung90",
};

export default config;
