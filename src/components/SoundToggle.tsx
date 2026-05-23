import React, { useState, useCallback } from "react";
import { StyleSheet, TouchableOpacity, Image } from "react-native";
import { SoundManager } from "../lib/SoundManager";

const offsoundImg = require("../assets/home/offsound.png");
const onsoudImg = require("../assets/home/onsoud.png");

export function SoundToggle() {
  const [isMuted, setIsMuted] = useState(() => SoundManager.isMuted);

  const handleToggle = useCallback(() => {
    SoundManager.toggleMute();
    setIsMuted(SoundManager.isMuted);
  }, []);

  return (
    <TouchableOpacity
      onPress={handleToggle}
      style={styles.btn}
      activeOpacity={0.7}
    >
      <Image
        source={isMuted ? offsoundImg : onsoudImg}
        style={styles.icon}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    padding: 8,
    minWidth: 42,
    minHeight: 42,
    backgroundColor: "rgba(134, 133, 133, 0.15)",
  },
  icon: {
    width: 25,
    height: 25,
    resizeMode: "contain",
  },
});
