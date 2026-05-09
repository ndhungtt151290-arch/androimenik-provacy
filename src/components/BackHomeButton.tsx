import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import type { Lang } from "../types";

interface BackHomeButtonProps {
  onPress: () => void;
  lang: Lang;
}

export function BackHomeButton({ onPress, lang }: BackHomeButtonProps) {
  const label = lang === "vi" ? "‹ Quay lại" : "‹ HOME";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.button}
      activeOpacity={0.7}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#059669",
    borderWidth: 1,
    borderColor: "#34d399",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
});
