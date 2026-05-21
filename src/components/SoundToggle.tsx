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
    padding: 4,
    minWidth: 40,
    minHeight: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    width: 25,
    height: 25,
    resizeMode: "contain",
  },
});
