import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface AdBannerProps {
  style?: object;
}

export function AdBanner({ style }: AdBannerProps) {
  return (
    <View style={[styles.container, style as object]}>
      <Text style={styles.label}>Quảng cáo</Text>
      <View style={styles.box}>
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
    fontSize: 10,
    color: "rgba(251,191,36,0.4)",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 6,
  },
  box: {
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
