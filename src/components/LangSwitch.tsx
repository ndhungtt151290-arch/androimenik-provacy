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
    minWidth: 44,
    minHeight: 44,
    backgroundColor: "rgba(255,255,255,0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
