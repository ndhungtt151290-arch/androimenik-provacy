import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface NavigationButtonsProps {
  disabledPrev: boolean;
  disabledNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  prevLabel: string;
  nextLabel: string;
}

export function NavigationButtons({
  disabledPrev,
  disabledNext,
  onPrev,
  onNext,
  prevLabel,
  nextLabel,
}: NavigationButtonsProps) {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        disabled={disabledPrev}
        onPress={onPrev}
        style={[styles.btn, disabledPrev && styles.btnDisabled]}
        activeOpacity={0.7}
      >
        <Text style={styles.arrow}>‹</Text>
        <Text style={styles.label}>{prevLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        disabled={disabledNext}
        onPress={onNext}
        style={[styles.btn, disabledNext && styles.btnDisabled]}
        activeOpacity={0.7}
      >
        <Text style={styles.label}>{nextLabel}</Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, width: 98 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "rgba(120,53,15,0.4)",
    borderWidth: 1,
    borderColor: "rgba(120,53,15,0.6)",
  },
  btnDisabled: { opacity: 0.8 },
  label: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#fef3c7",
  },
  arrow: {
    fontSize: 18,
    color: "#fef3c7",
  },
});
