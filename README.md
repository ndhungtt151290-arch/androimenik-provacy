# GentsukiApp - Ứng dụng luyện thi bằng lái xe máy 50cc (Expo)

Ứng dụng luyện thi bằng lái xe máy 50cc (原付) hỗ trợ song ngữ Nhật-Việt, chạy trực tiếp trên **Expo Go**.

## Chạy ứng dụng

### Cách 1: Chạy trên máy tính (Expo Go trên điện thoại)

```bash
npx expo start
```

Sau đó quét QR code bằng ứng dụng **Expo Go** trên điện thoại.

### Cách 2: Chạy trên simulator/emulator

```bash
npx expo start --ios      # iOS Simulator
npx expo start --android  # Android Emulator
```

## Tính năng

- **12 chương** kiến thức theo đúng cấu trúc đề thi
- **Song ngữ**: Tiếng Nhật / Tiếng Việt (chuyển đổi bằng nút cờ)
- **Thi thử**: 50 câu (46 lý thuyết + 4 câu hình ảnh), 30 phút, đạt 45/50
- **Luyện tập theo chương**: Xem đáp án và giải thích ngay
- **Lịch sử thi**: Lưu tối đa 20 bài thi gần nhất
- **Thống kê cá nhân**: Điểm cao nhất, thấp nhất, phân bố theo chương
- **Bookmark** câu hỏi khó
- **375+ ảnh minh họa** cho các câu hỏi hình ảnh

## Cấu trúc thư mục

```
GentsukiApp/
├── App.tsx                 # Entry point + Navigation
├── src/
│   ├── types/             # TypeScript interfaces
│   ├── data/              # Câu hỏi (JSON)
│   ├── lib/
│   │   ├── chapters.ts    # Định nghĩa 12 chương
│   │   ├── exam.ts        # Logic thi thử
│   │   └── storage.ts     # AsyncStorage
│   ├── hooks/             # Custom hooks (useTimer)
│   ├── components/        # UI components
│   └── screens/           # 7 màn hình
└── src/assets/            # Ảnh minh họa
```

## Lưu ý

- Ứng dụng dùng **Expo bare** (không dùng Expo Router)
- Dữ liệu câu hỏi được đóng gói trong app
- Không cần backend/server
- Chạy được offline 100%

## Tech Stack

- Expo SDK 54
- React Native 0.81
- TypeScript
- AsyncStorage (persistent storage)
- SafeAreaContext
