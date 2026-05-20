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
    padding: 4,
    alignSelf: "flex-start",
  },
  icon: {
    width: 44,
    height: 44,
  },
});
