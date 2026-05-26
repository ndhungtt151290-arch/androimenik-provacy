# Menki 1000+ - Ứng dụng luyện thi bằng lái xe máy 50cc

Ứng dụng luyện thi bằng lái xe máy 50cc (原付) tại Nhật Bản, hỗ trợ song ngữ Nhật-Việt, chạy trực tiếp trên **Expo Go**.

---

## Tính năng

- **Thi thử**: 50 câu (46 lý thuyết + 2 câu tình huống), 30 phút, đạt 45/50 để đỗ
- **Luyện tập theo chương**: 11 chương với giải thích chi tiết từng đáp án
- **Song ngữ**: Tiếng Nhật / Tiếng Việt (chuyển đổi bằng nút cờ)
- **Lịch sử thi**: Lưu tối đa 20 bài thi gần nhất
- **Bookmark câu sai**: Lưu lại các câu sai để ôn tập
- **375+ ảnh biển báo**: Minh họa cho các câu hỏi hình ảnh
- **Âm thanh**: Hiệu ứng đúng/sai, âm thanh nền
- **Quảng cáo**: Tích hợp AdMob (tự động ẩn sau 5 lần hiển thị)

---

## Chạy ứng dụng

### Cách 1: Expo Go trên điện thoại

```bash
npm start
# hoặc
npx expo start --port 8082
```

Sau đó quét QR code bằng ứng dụng **Expo Go** trên điện thoại.

### Cách 2: iOS Simulator

```bash
npx expo start --ios
```

### Cách 3: Android Emulator

```bash
npx expo start --android
```

---

## Cấu trúc thư mục

```
Menki1000App/
├── 📂 CẤU HÌNH
│   ├── App.tsx              # Entry point
│   ├── app.json            # Expo config
│   ├── app.config.ts       # Expo config (TypeScript)
│   ├── eas.json            # EAS Build config
│   └── tsconfig.json       # TypeScript config
│
├── 📂 MÃ NGUỒN (src/)
│   ├── assets/             # Tài nguyên nội bộ
│   │   ├── bgs/            # Background images
│   │   ├── home/           # Icons màn hình chính
│   │   └── images/         # Ảnh biển báo (menkyogentsuki_*.png)
│   ├── components/         # UI components dùng chung
│   │   ├── AdBanner.tsx
│   │   ├── MaruBatsuButtons.tsx  # Nút Đúng/Sai
│   │   └── ...
│   ├── config/             # Cấu hình bên thứ 3
│   │   └── ads.ts          # AdMob config
│   ├── data/               # TẦNG DATA
│   │   ├── questions.json  # Database câu hỏi (~1200 câu)
│   │   ├── examCenters.ts  # Danh sách trung tâm thi
│   │   └── procedure.ts    # Thủ tục thi
│   ├── hooks/              # Custom React hooks
│   │   └── useTimer.ts
│   ├── lib/                # TẦNG LOGIC nghiệp vụ
│   │   ├── chapters.ts     # Định nghĩa 11 chương
│   │   ├── exam.ts         # Logic bốc đề, chấm điểm
│   │   ├── storage.ts      # AsyncStorage wrapper
│   │   └── SoundManager.ts # Quản lý âm thanh
│   ├── screens/            # TẦNG UI
│   │   ├── HomeScreen.tsx
│   │   ├── ChapterScreen.tsx
│   │   ├── ExamScreen.tsx
│   │   ├── ResultsScreen.tsx
│   │   └── ...
│   ├── theme/              # Design tokens
│   ├── types/              # TypeScript interfaces
│   └── utils/              # Tiện ích hệ thống
│
├── 📂 ASSETS (bên ngoài src/)
│   ├── icon.png            # App icon
│   ├── splash-icon.png     # Splash screen
│   ├── adaptive-icon.png   # Android adaptive icon
│   └── 📂 sounds/          # Hiệu ứng âm thanh
│
├── 📂 MENUBAR (Dữ liệu tĩnh)
│   ├── thutuc.txt          # Hướng dẫn thủ tục thi
│   ├── tip.txt             # Mẹo thi
│   └── mapcenter.txt       # Danh sách trung tâm thi
│
└── 📂 SCRIPTS (Dev tools)
    └── check_translations.js
```

---

## Luồng nghiệp vụ

```
HomeScreen
├── [Thi thử] → ExamPrepScreen → ExamScreen (50 câu, 30 phút)
│                                     └── ResultsScreen → ReviewScreen
└── [Luyện tập] → PracticeHomeScreen → ChapterScreen (theo chương)
```

### Cấu trúc đề thi

| Loại | Số câu | Điểm | Nguồn |
|------|--------|------|-------|
| Lý thuyết | 46 | 1 điểm/câu | 11 chương |
| Tình huống | 2 nhóm (6 câu nhỏ) | 2 điểm/câu | 危険予測 + 危険予測問題 |
| **Tổng** | **50** | **50 điểm** | Đỗ: 45/50 |

---

## Tech Stack

| Công nghệ | Phiên bản |
|-----------|-----------|
| Expo | ~55.0.25 |
| React Native | 0.83.6 |
| TypeScript | ~5.9.2 |
| React Navigation | v7 |
| AsyncStorage | 2.2.0 |
| Google Mobile Ads | ^16.3.3 |

---

## Lưu ý

- **Offline 100%**: Không cần backend/server
- **Expo bare workflow**: Không dùng Expo Router
- **EAS Build**: Dùng EAS Update để cập nhật JS bundle mà không cần build lại native

---

## Đóng góp

1. Fork repo
2. Tạo branch mới (`git checkout -b feature/tinh-nang`)
3. Commit thay đổi
4. Push và tạo Pull Request
