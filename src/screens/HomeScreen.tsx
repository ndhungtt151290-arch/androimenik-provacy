import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CHAPTER_VI, CHAPTER_MAP } from "../lib/chapters";
import type { QuestionBank, Lang, PersonalStats } from "../types";

const bank: QuestionBank = require("../data/questions").default;

const imgS1 = require("../assets/home/s1.png");
const imgS2 = require("../assets/home/s2.png");
const imgS3 = require("../assets/home/s3.png");
const homeBg = require("../assets/bgs/bgh.jpg");

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

  const L = {
    history: lang === "vi" ? "Lịch sử thi" : "試験履歴",
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Image source={homeBg} style={styles.bgImage} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerImages}>
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

        <View style={styles.chapterGrid}>
          {bank.chapterOrder.map((chapterName) => {
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
                  styles.chapterTile,
                  { backgroundColor: isIllust ? "#dcfce7" : "#f5f5f5" },
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.chapterLabel} numberOfLines={2}>
                  {label}
                </Text>
                <View style={styles.chapterRight}>
                  <View
                    style={[
                      styles.countBadge,
                      { backgroundColor: isIllust ? "#d1fae5" : "#fef3c7" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.countText,
                        { color: isIllust ? "#166534" : "#92400e" },
                      ]}
                    >
                      {count}
                      {lang === "vi" ? " câu" : "問"}
                    </Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottomRow}>
          <TouchableOpacity onPress={onShowHistory} activeOpacity={0.7}>
            <Text style={styles.historyLink}>{L.history}</Text>
          </TouchableOpacity>
          <Text style={styles.credit}>CREATED BY DUYHUNG</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: "relative" },
  bgImage: { position: "absolute", width: "100%", height: "100%" },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 12 },
  headerImages: { alignItems: "center", marginTop: 8 },
  headerLogo: { width: 180, height: 80 },
  headerHero: { height: 60, width: 200 },
  ctaBtn: { marginTop: 8, borderRadius: 12, overflow: "hidden", position: "relative" },
  ctaImage: { width: "100%", height: 60 },
  ctaOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  ctaText: { color: "#fff", fontWeight: "900", fontSize: 18, textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  chapterGrid: { marginTop: 12, gap: 8 },
  chapterTile: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chapterLabel: { flex: 1, fontSize: 12, fontWeight: "bold", color: "#111" },
  chapterRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  countText: { fontSize: 11, fontWeight: "bold" },
  chevron: { fontSize: 16, color: "#a3a3a3" },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 8 },
  historyLink: { fontSize: 12, color: "#92400e", textDecorationLine: "underline" },
  credit: { fontSize: 9, color: "rgba(0,0,0,0.5)", fontWeight: "600", letterSpacing: 1 },
});
