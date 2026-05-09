import React from "react";
import { View, Text } from "react-native";

interface JapanFlagIconProps {
  size?: number;
}

export function JapanFlagIcon({ size = 22 }: JapanFlagIconProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#fff",
        borderWidth: 0.5,
        borderColor: "rgba(0,0,0,0.1)",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: size * 0.5,
          height: size * 0.5,
          borderRadius: (size * 0.5) / 2,
          backgroundColor: "#cc0000",
        }}
      />
    </View>
  );
}

interface VietnamFlagIconProps {
  size?: number;
}

export function VietnamFlagIcon({ size = 22 }: VietnamFlagIconProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#cc0000",
        borderWidth: 0.5,
        borderColor: "rgba(0,0,0,0.2)",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <Text
        style={{
          color: "#ffdd00",
          fontSize: size * 0.4,
          fontWeight: "bold",
          lineHeight: size * 0.5,
        }}
      >
        ★
      </Text>
    </View>
  );
}
