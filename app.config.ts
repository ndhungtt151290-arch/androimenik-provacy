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
    bundleIdentifier: "com.gentsuki.app",
    buildNumber: "1",
    infoPlist: {
      CFBundleDisplayName: "Menki 1000+",
      NSCameraUsageDescription:
        "Ứng dụng cần truy cập camera để người dùng có thể chụp ảnh làm đại diện hoặc gửi hình ảnh phản hồi lỗi trong quá trình luyện thi.",
      NSPhotoLibraryAddUsageDescription:
        "Ứng dụng cần lưu ảnh xuống thiết bị để người dùng có thể lưu lại hình ảnh từ ứng dụng.",
      NSPhotoLibraryUsageDescription:
        "Ứng dụng cần truy cập thư viện ảnh để người dùng có thể chọn ảnh đại diện hoặc gửi hình ảnh phản hồi lỗi trong quá trình luyện thi.",
      ITSAppUsesNonExemptEncryption: false,
      NSUserTrackingUsageDescription: {
        vi: "Ứng dụng chỉ sử dụng IDFA (Bộ định danh cho quảng cáo) để hiển thị quảng cáo phù hợp và không xâm phạm quyền riêng tư. Chúng tôi tuân thủ nghiêm ngặt các yêu cầu về quyền riêng tư trên App Store.",
        ja: "当アプリでは、控えめで関連性のある広告を表示するためにのみ IDFA（識別子 for 広告）を使用します。App Store の privacyに関する要件に準拠するため、ユーザー様が適切に同意いただけるようにお願いします。",
      },
      PrivacyURL: "https://ndhungtt151290-arch.github.io/menki1000-privacy/",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF",
    },
    package: "com.gentsuki.app",
    permissions: ["com.google.android.gms.permission.AD_ID"],
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
        android_app_id: "ca-app-pub-8320439928464026",
        ios_app_id: "ca-app-pub-8320439928464026",
      },
    ],
    "expo-audio",
  ],
  owner: "duyhung90",
};

export default config;
