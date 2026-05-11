import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CHAPTER_VI, CHAPTER_MAP } from "../lib/chapters";
import { BTN, PILL } from "../theme/buttonTokens";
import type { QuestionBank, Lang } from "../types";

const bank: QuestionBank = require("../data/questions").default;

interface PracticeHomeScreenProps {
  lang: Lang;
  onChapter: (chapterId: string) => void;
  onBack: () => void;
}

export function PracticeHomeScreen({ lang, onChapter, onBack }: PracticeHomeScreenProps) {
  const insets = useSafeAreaInsets();

  const chapterCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const q of bank.simple) {
      map[q.chapter] = (map[q.chapter] ?? 0) + 1;
    }
    for (const g of bank.scenarioGroups) {
      map[g.chapter] = (map[g.chapter] ?? 0) + 1;
    }
    for (const g of bank.dangerScenarioGroups) {
      map[g.chapter] = (map[g.chapter] ?? 0) + 1;
    }
    return map;
  }, []);

  const L = {
    title: lang === "vi" ? "Luyện tập" : "練習",
    back: lang === "vi" ? "← Trang chủ" : "← ホーム",
    questions: lang === "vi" ? "câu" : "問",
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backText}>{L.back}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{L.title}</Text>
      </View>

      <View style={styles.scrollWrapper}>
        <View style={[styles.scrollContent, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.chapterGrid}>
            {(() => {
              const rows: string[][] = [];
              for (let i = 0; i < bank.chapterOrder.length; i += 2) {
                rows.push(bank.chapterOrder.slice(i, i + 2));
              }
              return rows.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.gridRow}>
                  {row.map((chapterName) => {
                    const chapterId = CHAPTER_MAP[chapterName] ?? chapterName;
                    const count = chapterCountMap[chapterName] ?? 0;
                    const label =
                      lang === "vi"
                        ? CHAPTER_VI[chapterId] ?? chapterName
                        : chapterName;
                    const isIllust = chapterName.includes("イラスト問題");

                    return (
                      <TouchableOpacity
                        key={chapterId}
                        onPress={() => onChapter(chapterId)}
                        style={[
                          styles.gridCell,
                          { backgroundColor: isIllust ? "#dcfce7" : "#f5f5f5" },
                        ]}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.chapterLabel} numberOfLines={2}>
                          {label}
                        </Text>
                        <Text
                          style={[
                            styles.countText,
                            { color: isIllust ? "#166534" : "#92400e" },
                          ]}
                        >
                          {count}
                          {L.questions}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ));
            })()}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  header: { alignItems: "center", marginBottom: 8 },
  backBtn: {
    backgroundColor: PILL.bgColor,
    borderWidth: PILL.borderWidth,
    borderColor: PILL.borderColor,
    borderRadius: PILL.borderRadius,
    paddingHorizontal: PILL.paddingH,
    paddingVertical: PILL.paddingV,
    flexDirection: "row",
    alignItems: "center",
    gap: PILL.gap,
    marginBottom: 8,
    opacity: PILL.opacity,
  },
  backText: { fontSize: 12, fontWeight: "bold", color: "#fff" },
  title: { fontSize: 22, fontWeight: "900", color: "#111" },
  scrollWrapper: { flex: 1, overflow: "hidden" },
  scrollContent: { paddingHorizontal: 0 },
  chapterGrid: { paddingHorizontal: 8, paddingBottom: 4, marginTop: 6 },
  gridRow: { flexDirection: "row", marginBottom: 6, gap: 4 },
  gridCell: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: BTN.borderRadius,
    padding: 10,
    minHeight: 80,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chapterLabel: { fontSize: 14, fontWeight: "bold", color: "#111", textAlign: "center" },
  countText: { fontSize: 12, fontWeight: "bold", marginTop: 4 },
});
