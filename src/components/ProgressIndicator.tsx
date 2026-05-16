import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import type { Lang } from "../types";

const PROG_ICON = require("../assets/home/prog.png");

interface ProgressIndicatorProps {
  total: number;
  current: number;
  onToggleExpand: () => void;
  lang: Lang;
}

export function ProgressIndicator({
  total,
  current,
  onToggleExpand,
  lang: _lang,
}: ProgressIndicatorProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onToggleExpand} style={styles.header}>
        <Image source={PROG_ICON} style={styles.progIcon} />
        <Text style={styles.headerText}>{current + 1}/{total}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  progIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },
  headerText: {
    fontSize: 17,
    color: "rgba(10, 15, 85, 0.73)",
    fontWeight: "700",
  },
});
