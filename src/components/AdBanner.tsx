import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function AdBanner() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Text style={styles.label}>Quảng cáo</Text>
      <View style={styles.adBox}>
        <Text style={styles.placeholder}>Ad Banner Placeholder</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingVertical: 8,
    alignItems: "center",
  },
  label: {
    fontSize: 11,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 6,
  },
  adBox: {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 8,
    padding: 12,
    width: "100%",
    alignItems: "center",
  },
  placeholder: {
    color: "#fde68a",
    fontSize: 12,
  },
});
