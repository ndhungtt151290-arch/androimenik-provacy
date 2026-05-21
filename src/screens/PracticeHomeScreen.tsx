import React, { useMemo, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CHAPTER_VI, CHAPTER_MAP } from "../lib/chapters";
import { loadPracticeProgress } from "../lib/storage";
import { BTN } from "../theme/buttonTokens";
import { AdBanner } from "../components/AdBanner";
import { BackHomeButton } from "../components/BackHomeButton";
import { SoundManager } from "../lib/SoundManager";
import { showInterstitialChapter } from "../utils/AdManager";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { SubChapterModal } from "../components/SubChapterModal";
import type { QuestionBank, Lang } from "../types";

const bank: QuestionBank = require("../data/questions").default;

interface PracticeHomeScreenProps {
  lang: Lang;
  onChapter: (chapterId: string) => void;
  onBack: () => void;
}

export function PracticeHomeScreen({ lang, onChapter, onBack }: PracticeHomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [practiceProgress, setPracticeProgress] = useState<Record<string, string[]>>({});
  const [showReset, setShowReset] = useState(false);
  const [showSubChapter, setShowSubChapter] = useState(false);

  useEffect(() => {
    loadPracticeProgress().then(setPracticeProgress);
  }, []);

  const handleResetProgress = async () => {
    await AsyncStorage.removeItem("gentsuki_practice_progress");
    setPracticeProgress({});
    setShowReset(false);
  };

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
    resetBtn: lang === "vi" ? "Đặt lại tiến trình" : "進捗をリセット",
  };

  return (
    <View style={styles.container}>
      <BackHomeButton onPress={() => { SoundManager.playTapClick(); showInterstitialChapter(onBack); }} />
      <View style={styles.header}>
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
                        onPress={() => {
                          SoundManager.playTapClick();
                          if (chapterName === "総合演習") {
                            setShowSubChapter(true);
                          } else {
                            onChapter(chapterId);
                          }
                        }}
                        style={[
                          styles.gridCell,
                          { backgroundColor: isIllust ? "rgba(206, 221, 203, 0.84)" : "rgba(255, 255, 255, 0.7)" },
                        ]}
                        activeOpacity={0.7}
                      >
                        {(() => {
                          const answered = practiceProgress[chapterId] ?? [];
                          if (answered.length === 0 || count === 0) return null;
                          const pct = Math.min((answered.length / count) * 100, 100);
                          return (
                            <View style={styles.progressTrack}>
                              <View style={[styles.progressFill, { width: `${pct}%` }]} />
                            </View>
                          );
                        })()}
                        <Text style={styles.chapterLabel} numberOfLines={2}>
                          {label}
                        </Text>
                        <Text
                          style={[
                            styles.countText,
                            { color: isIllust ? "rgba(8, 8, 8, 0.8)" : "rgba(24, 73, 5, 0.8)" },
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
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => setShowReset(true)}
          >
            <Text style={styles.resetBtnText}>{L.resetBtn}</Text>
          </TouchableOpacity>
          <ConfirmDialog
            visible={showReset}
            lang={lang}
            onConfirm={handleResetProgress}
            onCancel={() => setShowReset(false)}
            variant="danger"
          />
          <SubChapterModal
            visible={showSubChapter}
            title={lang === "vi" ? "Chọn chương ôn tập" : "練習 章を選択"}
            subChapters={[
              { id: "総合演習1", name: "総合演習 1", viName: "Ôn tập tổng hợp 1" },
              { id: "総合演習2", name: "総合演習 2", viName: "Ôn tập tổng hợp 2" },
              { id: "総合演習3", name: "総合演習 3", viName: "Ôn tập tổng hợp 3" },
              { id: "総合演習4", name: "総合演習 4", viName: "Ôn tập tổng hợp 4" },
              { id: "総合演習5", name: "総合演習 5", viName: "Ôn tập tổng hợp 5" },
            ]}
            lang={lang}
            onSelect={(id) => {
              setShowSubChapter(false);
              onChapter(id);
            }}
            onClose={() => setShowSubChapter(false)}
          />
        </View>
      </View>

      {/* Ad Banner */}
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  header: { alignItems: "center", marginBottom: 8 },
  title: { fontSize: 22, fontWeight: "900", color: "rgba(48, 122, 19, 0.99)" },
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
    borderColor: "rgba(15, 13, 13, 0.1)",
    shadowColor: "rgba(241, 236, 236, 0.53)",
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  chapterLabel: { fontSize: 14, fontWeight: "bold", color: "#111", textAlign: "center" },
  countText: { fontSize: 12, fontWeight: "bold", marginTop: 4 },
  progressTrack: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 2,
    marginBottom: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4ade80",
    borderRadius: 2,
  },
  resetBtn: {
    marginTop: 16,
    marginHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.12)",
    alignItems: "center",
    opacity: 0.55,
  },
  resetBtnText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
});
