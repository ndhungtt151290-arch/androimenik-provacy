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

interface SubChapter {
  id: string;
  name: string;
  viName: string;
}

interface SubChapterModalProps {
  visible: boolean;
  title: string;
  subChapters: SubChapter[];
  lang: Lang;
  onSelect: (chapterId: string) => void;
  onClose: () => void;
}

export function SubChapterModal({
  visible,
  title,
  subChapters,
  lang,
  onSelect,
  onClose,
}: SubChapterModalProps) {
  const closeLabel = lang === "vi" ? "Đóng" : "閉じる";

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={overlayStyle.overlay} onPress={onClose}>
        <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.grid}>
            {subChapters.map((sub) => (
              <TouchableOpacity
                key={sub.id}
                style={styles.chapterBtn}
                onPress={() => onSelect(sub.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.chapterBtnName}>
                  {lang === "vi" ? sub.viName : sub.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeBtnText}>{closeLabel}</Text>
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
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderRadius: 20,
    padding: 20,
    maxWidth: 340,
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
    fontSize: 17,
    fontWeight: "bold",
    color: "#1c1917",
    textAlign: "center",
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  chapterBtn: {
    width: "47%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: "rgba(214, 218, 213, 0.25)",
    alignItems: "center",
  },
  chapterBtnName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1c1917",
  },
  closeBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(204, 204, 204, 0.41)",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  closeBtnText: {
    fontWeight: "bold",
    color: "#404040",
    fontSize: 14,
  },
});
