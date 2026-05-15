import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import type { Lang } from "../types";

interface ConfirmDialogProps {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "normal";
  lang?: Lang;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  variant = "normal",
  lang = "jp",
}: ConfirmDialogProps) {
  const defaultLabels = lang === "vi"
    ? { title: "Xác nhận", message: "Tất cả tiến trình luyện tập sẽ bị xóa.", confirm: "Đặt lại", cancel: "Hủy" }
    : { title: "確認", message: "すべての練習の進捗がクリアされます。", confirm: "リセット", cancel: "キャンセル" };

  const displayTitle = title ?? defaultLabels.title;
  const displayMessage = message ?? defaultLabels.message;
  const displayConfirm = confirmText ?? defaultLabels.confirm;
  const displayCancel = cancelText ?? defaultLabels.cancel;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={overlayStyle.overlay} onPress={onCancel}>
        <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
          {displayTitle && <Text style={styles.title}>{displayTitle}</Text>}
          <Text style={styles.message}>{displayMessage}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.btn, styles.btnCancel]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>{displayCancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btn,
                variant === "danger" ? styles.btnDanger : styles.btnConfirm,
              ]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmText}>{displayConfirm}</Text>
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
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 20,
    maxWidth: 320,
    width: "100%",
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1c1917",
    textAlign: "center",
    marginBottom: 12,
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
    borderColor: "rgba(204, 204, 204, 0.41)",
    backgroundColor: "#fff",
  },
  btnConfirm: {
    borderColor: "rgba(204, 204, 204, 0.41)",
    backgroundColor: "#fbbf24",
  },
  btnDanger: {
    borderColor: "rgba(204, 204, 204, 0.41)",
    backgroundColor: "rgba(223, 46, 46, 0.85)",
  },
  cancelText: { fontWeight: "bold", color: "#404040" },
  confirmText: { fontWeight: "bold", color: "#fff" },
});
