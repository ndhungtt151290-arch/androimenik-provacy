// Centralized design tokens for button containers across the app.
// Edit values here to update all buttons at once.

export const BTN = {
  // Container shared by both action buttons
  containerAlign: "center" as const,
  containerPaddingH: 16,
  gapBetweenBtns: 30,

  // Action button (Vao phong thi / Luyen tap) base
  width: 280,
  height: 62,
  borderRadius: 12,
  overflow: "hidden" as const,

  // Shadow
  elevation: 20,
  shadowOffsetW: 0,
  shadowOffsetH: 4,
  shadowOpacity: 0.2,
  shadowRadius: 6,

  // Text
  fontSize: 22,
  fontWeight: "900" as const,
  textColor: "rgba(252, 249, 246, 0.91)",
  textShadowColor: "rgba(22, 20, 20, 0.5)",
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 2,

  // Exam button fallback colors (when no image is used)
  examBtnBg: "#bf0d0d",
  examTextColor: "#fff",

  // Practice button fallback colors (when no image is used)
  practiceBtnBg: "#059669",
  practiceTextColor: "#fff",
};

// Back / small pill button tokens (used in ExamPrepScreen, PracticeHomeScreen, etc.)
export const PILL = {
  borderRadius: 999,
  paddingH: 10,
  paddingV: 6,
  opacity: 0.6,
  fontSize: 12,
  fontWeight: "bold" as const,
  textColor: "#fff",
  bgColor: "#059669",
  borderColor: "#34d399",
  borderWidth: 1,
  shadowColor: "#000",
  shadowOffsetW: 0,
  shadowOffsetH: 4,
  shadowOpacity: 0.15,
  shadowRadius: 12,
  gap: 4,
};
