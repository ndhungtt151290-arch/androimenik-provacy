import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { JapanFlagIcon, VietnamFlagIcon } from "./FlagIcons";
import type { Lang } from "../types";

interface LangSwitchProps {
  lang: Lang;
  onToggle: () => void;
}

export function LangSwitch({ lang, onToggle }: LangSwitchProps) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={styles.btn}
      activeOpacity={0.7}
    >
      {lang === "vi" ? (
        <JapanFlagIcon size={28} />
      ) : (
        <VietnamFlagIcon size={28} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    padding: 8,
    minWidth: 41,
    minHeight: 41,
    backgroundColor: "rgba(134, 133, 133, 0.15)",
  },
});
