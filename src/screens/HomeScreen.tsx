import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CHAPTER_VI, CHAPTER_MAP } from "../lib/chapters";
import { SubChapterPopup } from "../components/SubChapterPopup";
import type { QuestionBank, Lang, PersonalStats } from "../types";

const bank: QuestionBank = require("../data/questions").default;

const imgS1 = require("../assets/home/s1.png");
const imgS2 = require("../assets/home/s2.png");
const imgS3 = require("../assets/home/s3.png");

interface HomeScreenProps {
  lang: Lang;
  onStartExam: () => void;
  onChapter: (chapterId: string) => void;
  onShowHistory: () => void;
  personalStats: PersonalStats | null;
}

export function HomeScreen({
  lang,
  onStartExam,
  onChapter,
  onShowHistory,
}: HomeScreenProps) {
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

  const subChapterCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const q of bank.simple) {
      if (q.chapter === "総合演習" && q.section) {
        const match = q.section.match(/^(総合演習[1-5])-/);
        if (match) {
          map[match[1]] = (map[match[1]] ?? 0) + 1;
        }
      }
    }
    return map;
  }, []);

  const [showSubChapterPopup, setShowSubChapterPopup] = useState(false);

  const handleChapterPress = (chapterId: string) => {
    if (chapterId === "総合演習") {
      setShowSubChapterPopup(true);
    } else {
      onChapter(chapterId);
    }
  };

  const subChapters = useMemo(() => {
    return ["総合演習1", "総合演習2", "総合演習3", "総合演習4", "総合演習5"].map((id) => ({
      id,
      name: id,
      count: subChapterCountMap[id] ?? 0,
    }));
  }, [subChapterCountMap]);

  const L = {
    history: lang === "vi" ? "Lịch sử thi" : "試験履歴",
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerImages, { paddingTop: insets.top + 8 }]}>
        <Image source={imgS1} style={styles.headerLogo} />
        <Image source={imgS2} style={styles.headerHero} />
      </View>

      <TouchableOpacity onPress={onStartExam} style={styles.ctaBtn} activeOpacity={0.8}>
        <Image source={imgS3} style={styles.ctaImage} />
        <View style={styles.ctaOverlay}>
          <Text style={styles.ctaText}>
            {lang === "vi" ? "Bắt đầu thi thử" : "模擬試験を始める"}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.scrollWrapper}>
        <View
          style={[styles.scrollContent, { paddingBottom: insets.bottom + 16 }]}
        >
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
                        onPress={() => handleChapterPress(chapterId)}
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
                          {lang === "vi" ? " câu" : "問"}
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

      <View style={[styles.bottomRow, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity onPress={onShowHistory} activeOpacity={0.7}>
          <Text style={styles.historyLink}>{L.history}</Text>
        </TouchableOpacity>
        <Text style={styles.credit}>CREATED BY DUYHUNG</Text>
      </View>

      <SubChapterPopup
        visible={showSubChapterPopup}
        chapterName="総合演習"
        subChapters={subChapters}
        onSelect={(subChapterId) => {
          setShowSubChapterPopup(false);
          onChapter(subChapterId);
        }}
        onClose={() => setShowSubChapterPopup(false)}
        lang={lang}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerImages: { alignItems: "center", paddingHorizontal: 12, zIndex: 1, backgroundColor: "transparent" },
  headerLogo: { width: 180, height: 80 },
  headerHero: { height: 60, width: 200 },
  ctaBtn: { alignSelf: "center", width: 280, borderRadius: 12, overflow: "hidden", position: "relative", zIndex: 1, elevation: 5 },
  ctaImage: { width: 280, height: 60 },
  ctaOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  ctaText: { color: "#fff", fontWeight: "900", fontSize: 18, textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  scrollWrapper: { flex: 1, overflow: "hidden" },
  scrollView: { flex: 1, zIndex: 0 },
  scrollContent: { paddingHorizontal: 0 },
  chapterGrid: { paddingHorizontal: 8, paddingBottom: 8, marginTop: 6 },
  gridRow: { flexDirection: "row", marginBottom: 6, gap: 4 },
  gridCell: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
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
  chapterTile: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 6,
  },
  chapterLabel: { fontSize: 14, fontWeight: "bold", color: "#111", textAlign: "center" },
  chapterRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  countText: { fontSize: 12, fontWeight: "bold", marginTop: 4 },
  chevron: { fontSize: 16, color: "#a3a3a3" },
  bottomRow: { paddingHorizontal: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8, zIndex: 1, elevation: 5 },
  historyLink: { fontSize: 12, color: "#92400e", textDecorationLine: "underline" },
  credit: { fontSize: 9, color: "rgba(0,0,0,0.5)", fontWeight: "600", letterSpacing: 1 },
});
