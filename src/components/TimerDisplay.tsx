import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface TimerDisplayProps {
  timeLeft: number;
  warningThreshold?: number;
}

export function TimerDisplay({
  timeLeft,
  warningThreshold = 300,
}: TimerDisplayProps) {
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const isWarning = timeLeft <= warningThreshold;

  return (
    <View style={[styles.container, isWarning && styles.warning]}>
      <Text style={[styles.text, isWarning && styles.textWarning]}>
        {mm}:{ss}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  warning: {
    backgroundColor: "rgba(220,38,38,0.3)",
  },
  text: {
    fontFamily: "monospace",
    fontSize: 13,
    fontWeight: "bold",
    color: "#fde68a",
  },
  textWarning: {
    color: "#fca5a5",
  },
});
