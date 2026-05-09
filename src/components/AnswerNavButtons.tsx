import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { MaruBatsu } from "../types";

interface AnswerNavButtonsProps {
  // MaruBatsu state & callbacks
  answerValue?: MaruBatsu;
  onPick: (v: MaruBatsu) => void;
  disabled?: boolean;
  size?: "normal" | "large";
  // Navigation state & callbacks
  disabledPrev: boolean;
  disabledNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  prevLabel: string;
  nextLabel: string;
}

export function AnswerNavButtons({
  answerValue,
  onPick,
  disabled,
  size = "normal",
  disabledPrev,
  disabledNext,
  onPrev,
  onNext,
  prevLabel,
  nextLabel,
}: AnswerNavButtonsProps) {
  const isLarge = size === "large";
  const btnStyle = isLarge ? styles.maruBtnLarge : styles.maruBtn;

  return (
    <View style={styles.wrapper}>
      {/* Đúng / Sai */}
      <View style={styles.maruRow}>
        <TouchableOpacity
          disabled={disabled}
          onPress={() => onPick("○")}
          style={[
            btnStyle,
            answerValue === "○"
              ? styles.maruSelected
              : styles.maruUnselected,
            disabled && styles.maruDisabled,
          ]}
          activeOpacity={0.7}
        >
          <Text style={isLarge ? styles.textLarge : styles.text}>○</Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={disabled}
          onPress={() => onPick("×")}
          style={[
            btnStyle,
            answerValue === "×"
              ? styles.batsuSelected
              : styles.batsuUnselected,
            disabled && styles.maruDisabled,
          ]}
          activeOpacity={0.7}
        >
          <Text style={isLarge ? styles.textLarge : styles.text}>×</Text>
        </TouchableOpacity>
      </View>

      {/* Trước / Sau */}
      <View style={styles.navRow}>
        <TouchableOpacity
          disabled={disabledPrev}
          onPress={onPrev}
          style={[styles.navBtn, disabledPrev && styles.navBtnDisabled]}
          activeOpacity={0.7}
        >
          <Text style={styles.navArrow}>‹</Text>
          <Text style={styles.navLabel}>{prevLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={disabledNext}
          onPress={onNext}
          style={[styles.navBtn, disabledNext && styles.navBtnDisabled]}
          activeOpacity={0.7}
        >
          <Text style={styles.navLabel}>{nextLabel}</Text>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 12 },

  maruRow: { flexDirection: "row", gap: 12 },
  maruBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#78350f",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  maruBtnLarge: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#78350f",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  maruUnselected: { backgroundColor: "#059669" },
  maruSelected: { backgroundColor: "#16a34a", borderColor: "#fde68a", borderWidth: 3 },
  batsuUnselected: { backgroundColor: "#be123c" },
  batsuSelected: { backgroundColor: "#9f1239", borderColor: "#fde68a", borderWidth: 3 },
  maruDisabled: { opacity: 0.4 },
  text: { fontWeight: "bold", fontSize: 20, color: "#fff" },
  textLarge: { fontWeight: "bold", fontSize: 26, color: "#fff" },

  navRow: { flexDirection: "row", gap: 16 },
  navBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "rgba(120,53,15,0.4)",
    borderWidth: 1,
    borderColor: "rgba(120,53,15,0.6)",
  },
  navBtnDisabled: { opacity: 0.3 },
  navLabel: { fontSize: 13, fontWeight: "bold", color: "#fef3c7" },
  navArrow: { fontSize: 18, color: "#fef3c7" },
});
