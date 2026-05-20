/**
 * ads.example.ts — Template cho Real Ad Unit IDs
 *
 * Sao chép nội dung dưới đây vào ads.ts khi chuyển sang production.
 * File này chỉ là template, không được import trong code.
 *
 * Hướng dẫn:
 * 1. Copy các dòng `BANNER:` và `INTERSTITIAL:` bên dưới
 * 2. Paste vào REAL_ADS trong src/config/ads.ts
 * 3. Đổi `export default devConfig` → `export default prodConfig`
 * 4. Build production với: eas build --profile production
 */

// ============================================================
// REAL ADS
// ============================================================
export const REAL_ADS = {
  // Banner ID thật
  BANNER: "ca-app-pub-8320439928464026/1571115466",

  // Interstitial ID thật
  INTERSTITIAL: "ca-app-pub-8320439928464026/9906420960",
};
