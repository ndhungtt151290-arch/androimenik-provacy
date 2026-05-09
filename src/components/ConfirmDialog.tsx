import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";

interface ConfirmDialogProps {
  visible: boolean;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "normal";
}

export function ConfirmDialog({
  visible,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  variant = "normal",
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={overlayStyle.overlay} onPress={onCancel}>
        <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.btn, styles.btnCancel]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btn,
                variant === "danger" ? styles.btnDanger : styles.btnConfirm,
              ]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const overlayStyle = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    maxWidth: 320,
    width: "100%",
    borderWidth: 4,
    borderColor: "#78350f",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  message: {
    fontSize: 14,
    color: "#404040",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  buttons: { flexDirection: "row", gap: 12 },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
  },
  btnCancel: {
    borderColor: "#d4d4d4",
    backgroundColor: "#fff",
  },
  btnConfirm: {
    borderColor: "#d97706",
    backgroundColor: "#fbbf24",
  },
  btnDanger: {
    borderColor: "#be123c",
    backgroundColor: "#f43f5e",
  },
  cancelText: { fontWeight: "bold", color: "#404040" },
  confirmText: { fontWeight: "bold", color: "#fff" },
});
