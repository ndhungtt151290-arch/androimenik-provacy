import React from "react";
import { StyleSheet, TouchableOpacity, Text, View } from "react-native";
import type { MaruBatsu } from "../types";

interface MaruBatsuButtonsProps {
  disabled?: boolean;
  value?: MaruBatsu;
  onPick: (v: MaruBatsu) => void;
  size?: "normal" | "large";
}

export function MaruBatsuButtons({
  disabled,
  value,
  onPick,
  size = "normal",
}: MaruBatsuButtonsProps) {
  const isLarge = size === "large";
  const btnStyle = isLarge ? styles.btnLarge : styles.btn;

  return (
    <View style={styles.row}>
      <TouchableOpacity
        disabled={disabled}
        onPress={() => onPick("○")}
        style={[
          btnStyle,
          value === "○"
            ? styles.maruSelected
            : styles.maruUnselected,
          disabled && styles.disabled,
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
          value === "×"
            ? styles.batsuSelected
            : styles.batsuUnselected,
          disabled && styles.disabled,
        ]}
        activeOpacity={0.7}
      >
        <Text style={isLarge ? styles.textLarge : styles.text}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  btn: {
    width: 94,
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
    opacity: 0.8,
  },
  btnLarge: {
    width: 94,
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
    opacity: 0.8,
  },
  maruUnselected: {
    backgroundColor: "#059669",
  },
  maruSelected: {
    backgroundColor: "#16a34a",
    borderColor: "#fde68a",
    borderWidth: 3,
  },
  batsuUnselected: {
    backgroundColor: "#be123c",
  },
  batsuSelected: {
    backgroundColor: "#9f1239",
    borderColor: "#fde68a",
    borderWidth: 3,
  },
  disabled: { opacity: 0.4 },
  text: { fontWeight: "bold", fontSize: 20, color: "#fff" },
  textLarge: { fontWeight: "bold", fontSize: 26, color: "#fff" },
});
