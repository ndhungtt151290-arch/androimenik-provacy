import React, { useState, useEffect, useCallback } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "./Icons";
import { adEmitter } from "../utils/AdEventEmitter";

export function AdModal() {
  const insets = useSafeAreaInsets();
  const [isVisible, setIsVisible] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  const handleShow = useCallback((callback: () => void) => {
    setPendingCallback(() => callback);
    setIsVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    const cb = pendingCallback;
    setPendingCallback(null);
    setTimeout(() => {
      cb?.();
    }, 300);
  }, [pendingCallback]);

  useEffect(() => {
    adEmitter.on("show", handleShow);
    adEmitter.on("close", handleClose);

    return () => {
      adEmitter.off("show", handleShow);
      adEmitter.off("close", handleClose);
    };
  }, [handleShow, handleClose]);

  const onClosePress = () => {
    handleClose();
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.overlay}>
        <TouchableOpacity
          style={[styles.closeBtn, { top: Math.max(insets.top + 10, 50) }]}
          onPress={onClosePress}
          activeOpacity={0.7}
        >
          <Text style={styles.closeText}>Đóng</Text>
          <X size={18} />
        </TouchableOpacity>
        <View style={styles.content}>
          <Text style={styles.adLabel}>QUẢNG CÁO</Text>
          <View style={styles.adBox}>
            <Text style={styles.adText}>Quảng cáo</Text>
            <Text style={styles.adSub}>Danh sách quảng cáo</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtn: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.06)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 22,
    minWidth: 64,
    minHeight: 44,
    justifyContent: "center",
    zIndex: 10,
  },
  closeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#525252",
  },
  content: {
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  adLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#a3a3a3",
    letterSpacing: 2,
  },
  adBox: {
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 48,
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.08)",
    borderStyle: "dashed",
  },
  adText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1c1917",
    textAlign: "center",
  },
  adSub: {
    fontSize: 13,
    color: "#737373",
    textAlign: "center",
  },
});
