import React from "react";
import { TouchableOpacity, Image, StyleSheet } from "react-native";

const backIcon = require("../assets/home/back-icon.png");

interface BackHomeButtonProps {
  onPress: () => void;
}

export function BackHomeButton({ onPress }: BackHomeButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.button}
      activeOpacity={0.7}
    >
      <Image source={backIcon} style={styles.icon} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 6,
    left: 0,
    padding: 6,
    alignSelf: "flex-start",
    paddingTop: 4,
    minWidth: 44,
    minHeight: 44,
    zIndex: 100,
  },
  icon: {
    width: 44,
    height: 44,
  },
});
