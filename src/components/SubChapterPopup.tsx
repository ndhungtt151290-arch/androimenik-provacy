import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { CHAPTER_VI } from "../lib/chapters";

interface SubChapter {
  id: string;
  name: string;
  count: number;
}

interface SubChapterPopupProps {
  visible: boolean;
  chapterName: string;
  subChapters: SubChapter[];
  onSelect: (subChapterId: string) => void;
  onClose: () => void;
  lang: "vi" | "jp";
}

export function SubChapterPopup({
  visible,
  chapterName,
  subChapters,
  onSelect,
  onClose,
  lang,
}: SubChapterPopupProps) {
  const L = {
    title: lang === "vi" ? "Chọn chương" : "章を選択",
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={overlayStyle.overlay} onPress={onClose}>
        <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{L.title}</Text>
          <Text style={styles.subtitle}>
            {lang === "vi" ? CHAPTER_VI[chapterName] ?? chapterName : chapterName}
          </Text>

          <View style={styles.buttons}>
            {subChapters.map((sub) => {
              const label = lang === "vi" ? CHAPTER_VI[sub.id] ?? sub.id : sub.id;
              return (
                <TouchableOpacity
                  key={sub.id}
                  style={styles.btn}
                  onPress={() => onSelect(sub.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.btnName}>{label}</Text>
                  <Text style={styles.btnCount}>
                    {sub.count}
                    {lang === "vi" ? " câu" : "問"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.btn, styles.closeBtn]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeText}>
              {lang === "vi" ? "Đóng" : "閉じる"}
            </Text>
          </TouchableOpacity>
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
    maxWidth: 340,
    width: "100%",
    borderWidth: 4,
    borderColor: "#78350f",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#78350f",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#92400e",
    textAlign: "center",
    marginBottom: 16,
  },
  buttons: {
    gap: 10,
    marginBottom: 16,
  },
  btn: {
    backgroundColor: "#fef3c7",
    borderWidth: 2,
    borderColor: "#d97706",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  btnName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#78350f",
  },
  btnCount: {
    fontSize: 13,
    color: "#92400e",
    fontWeight: "600",
  },
  closeBtn: {
    backgroundColor: "#f5f5f5",
    borderColor: "#d4d4d4",
    marginTop: 4,
  },
  closeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#737373",
  },
});
