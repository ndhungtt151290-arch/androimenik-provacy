import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, X, RotateCcw, BookOpen, ListOrdered } from "../components/Icons";
import { CHAPTER_VI } from "../lib/chapters";
import type { ExamItem, Lang, PersonalStats } from "../types";

interface ResultsScreenProps {
  lang: Lang;
  score: {
    total: number;
    max: number;
    passed: boolean;
    details: Array<{
      index: number;
      item: ExamItem;
      points: number;
      simple?: { correct: boolean; user?: string };
      scenario?: { correct: boolean; subs: Record<string, { correct: boolean; user?: string }> };
    }>;
  };
  onReview: () => void;
  onReviewAll: () => void;
  onHome: () => void;
  onRetry: () => void;
}

export function ResultsScreen({
  lang,
  score,
  onReview,
  onReviewAll,
  onHome,
  onRetry,
}: ResultsScreenProps) {
  const insets = useSafeAreaInsets();
  const wrong = score.details.filter((d) => d.points < 1);

  const simpleCorrect = score.details.filter((d) => d.item.type === "simple" && d.points >= 1).length;
  const scenarioCorrect = score.details.filter((d) => d.item.type === "scenario" && d.points >= 1).length;
  const totalScenarioGroups = score.details.filter((d) => d.item.type === "scenario").length;

  const chapterStats: Record<string, { correct: number; total: number }> = {};
  for (const d of score.details) {
    const chapterId = d.item.type === "simple" ? d.item.question.chapter : d.item.group.chapter;
    const label = CHAPTER_VI[chapterId] ?? chapterId;
    if (!chapterStats[label]) chapterStats[label] = { correct: 0, total: 0 };
    chapterStats[label].total += 1;
    if (d.points >= 1) chapterStats[label].correct += 1;
  }

  const L = {
    title: lang === "vi" ? "Kết quả bài thi" : "試験結果",
    condition: lang === "vi" ? "Điều kiện đạt: từ 45/50 điểm trở lên (≥ 90%)" : "合格条件：50点中45点以上（90%以上）",
    part1: lang === "vi" ? "Phần 1 · Lý thuyết" : "第1部 · 理論",
    part2: lang === "vi" ? "Phần 2 · Hình ảnh" : "第2部 · イラスト",
    reviewBtn: lang === "vi" ? `Giải thích & xem lại ${wrong.length} phần sai` : `解説を見る · ${wrong.length}問の間違いを復習`,
    reviewAllBtn: lang === "vi" ? "Xem lại tất cả câu" : "全問を復習",
    perfect: lang === "vi" ? "Không có câu sai — xuất sắc!" : "全問正解 — お見事！",
    retry: lang === "vi" ? "Làm đề mới" : "新しい問題に挑戦",
    home: lang === "vi" ? "Về trang chủ" : "ホームに戻る",
    passed: lang === "vi" ? "ĐẠT" : "合格",
    failed: lang === "vi" ? "CHƯA ĐẠT" : "不合格",
    maxLabel: lang === "vi" ? "tối đa" : "満点",
    chapterBreakdown: lang === "vi" ? "Phân bố điểm theo chương" : "章別正解率",
    detail: lang === "vi" ? "Chi tiết từng phần" : "内訳",
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
      >
      {/* Score card */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreTitle}>{L.title}</Text>
        <View style={styles.scoreDisplay}>
          <Text style={styles.scoreNum}>{score.total}</Text>
          <Text style={styles.scoreMax}>/ {score.max}</Text>
        </View>
        <View style={[styles.resultBadge, score.passed ? styles.passBadge : styles.failBadge]}>
          {score.passed ? <Check size={16} /> : <X size={16} />}
          <Text style={styles.resultText}>{score.passed ? L.passed : L.failed}</Text>
        </View>
        <Text style={styles.condition}>{L.condition}</Text>
      </View>

      {/* Chapter breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{L.chapterBreakdown}</Text>
        {Object.entries(chapterStats).map(([chapter, stats]) => {
          const pct = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
          const isGood = pct >= 70;
          const isBad = pct < 50;
          return (
            <View key={chapter} style={styles.chapterRow}>
              <Text style={styles.chapterName} numberOfLines={1}>{chapter}</Text>
              <Text style={[styles.chapterPct, isBad && styles.pctBad, isGood && styles.pctGood, !isBad && !isGood && styles.pctMid]}>
                {stats.correct}/{stats.total} ({Math.round(pct)}%)
              </Text>
              <View style={styles.pctBar}>
                <View style={[styles.pctFill, { width: `${pct}%` }, isBad && styles.pctFillBad, isGood && styles.pctFillGood, !isBad && !isGood && styles.pctFillMid]} />
                {pct < 100 && <View style={[styles.pctFillRest, { width: `${100 - pct}%` }]} />}
              </View>
            </View>
          );
        })}
      </View>

      {/* Part breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{L.detail}</Text>

        <View style={styles.partRow}>
          <View style={styles.partIcon}><Text style={styles.partNum}>1</Text></View>
          <View style={styles.partInfo}>
            <Text style={styles.partLabel}>{L.part1}</Text>
            <Text style={styles.partSub}>{lang === "vi" ? `${simpleCorrect}/46 câu đúng` : `${simpleCorrect}/46問 正解`}</Text>
          </View>
          <View style={styles.partScore}>
            <Text style={styles.partScoreText}>{simpleCorrect}</Text>
            <Text style={styles.partScoreMax}>{L.maxLabel} 46</Text>
          </View>
        </View>

        <View style={styles.partRow}>
          <View style={[styles.partIcon, { backgroundColor: "#fecdd3" }]}><Text style={[styles.partNum, { color: "#9f1239" }]}>2</Text></View>
          <View style={styles.partInfo}>
            <Text style={styles.partLabel}>{L.part2}</Text>
            <Text style={styles.partSub}>{lang === "vi" ? `${totalScenarioGroups} câu hình · ${scenarioCorrect} câu đúng` : `${totalScenarioGroups}イラスト · ${scenarioCorrect}問 正解`}</Text>
          </View>
          <View style={styles.partScore}>
            <Text style={[styles.partScoreText, { color: "#9f1239" }]}>{scenarioCorrect * 2}</Text>
            <Text style={styles.partScoreMax}>{L.maxLabel} 4</Text>
          </View>
        </View>
      </View>

      {/* Review buttons */}
      <View style={styles.reviewBtns}>
        {wrong.length > 0 && (
          <TouchableOpacity onPress={onReview} style={styles.reviewBtn} activeOpacity={0.8}>
            <BookOpen size={14} />
            <Text style={styles.reviewBtnText}>{L.reviewBtn}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onReviewAll}
          style={[styles.reviewBtn, styles.reviewBtnGreen, wrong.length === 0 && styles.reviewBtnFull]}
          activeOpacity={0.8}
        >
          <ListOrdered size={14} />
          <Text style={[styles.reviewBtnText, { color: "#166534" }]}>{L.reviewAllBtn}</Text>
        </TouchableOpacity>
      </View>
      {wrong.length === 0 && (
        <Text style={styles.perfect}>{L.perfect}</Text>
      )}

      {/* Action buttons */}
      <TouchableOpacity onPress={onRetry} style={styles.retryBtn} activeOpacity={0.8}>
        <RotateCcw size={16} />
        <Text style={styles.retryBtnText}>{L.retry}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onHome} style={styles.homeBtn} activeOpacity={0.7}>
        <Text style={styles.homeBtnText}>{L.home}</Text>
      </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, position: "relative" },
  scrollContent: { flexGrow: 1 },
  container: { flex: 1 },
  scoreCard: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, padding: 20, alignItems: "center", marginBottom: 12, borderWidth: 1, borderColor: "rgba(0,0,0,0.1)" },
  scoreTitle: { fontSize: 14, color: "#525252", marginBottom: 8 },
  scoreDisplay: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  scoreNum: { fontSize: 56, fontWeight: "900", color: "#111" },
  scoreMax: { fontSize: 20, fontWeight: "bold", color: "#737373" },
  resultBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 999, marginTop: 8 },
  passBadge: { backgroundColor: "#16a34a" },
  failBadge: { backgroundColor: "#be123c" },
  resultText: { fontSize: 16, fontWeight: "900", color: "#fff" },
  condition: { fontSize: 12, color: "#737373", marginTop: 8 },
  card: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "rgba(0,0,0,0.1)" },
  cardTitle: { fontSize: 12, fontWeight: "bold", color: "#525252", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
  chapterRow: { marginBottom: 8 },
  chapterName: { fontSize: 12, color: "#525252", marginBottom: 2 },
  chapterPct: { fontSize: 12, fontWeight: "bold", marginBottom: 2 },
  pctGood: { color: "#16a34a" },
  pctMid: { color: "#d97706" },
  pctBad: { color: "#dc2626" },
  pctBar: { height: 8, backgroundColor: "#d4d4d4", borderRadius: 4, overflow: "hidden", flexDirection: "row" },
  pctFill: { height: "100%", borderRadius: 4 },
  pctFillGood: { backgroundColor: "#16a34a" },
  pctFillMid: { backgroundColor: "#d97706" },
  pctFillBad: { backgroundColor: "#dc2626" },
  pctFillRest: { height: "100%", backgroundColor: "#a3a3a3" },
  partRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, backgroundColor: "#fff1f2", borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: "#fecdd3" },
  partIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#fecdd3", alignItems: "center", justifyContent: "center" },
  partNum: { fontSize: 14, fontWeight: "900", color: "#7f1d1d" },
  partInfo: { flex: 1 },
  partLabel: { fontSize: 12, fontWeight: "bold", color: "#7f1d1d" },
  partSub: { fontSize: 11, color: "rgba(127,29,29,0.8)" },
  partScore: { alignItems: "flex-end" },
  partScoreText: { fontSize: 14, fontWeight: "900", color: "#7f1d1d" },
  partScoreMax: { fontSize: 10, color: "rgba(127,29,29,0.8)" },
  reviewBtns: { flexDirection: "row", gap: 8, marginBottom: 8 },
  reviewBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: "#fde68a", borderWidth: 2, borderColor: "#78350f" },
  reviewBtnFull: { flex: undefined, width: "100%" },
  reviewBtnGreen: { backgroundColor: "#d1fae5", borderColor: "#166534" },
  reviewBtnText: { fontSize: 12, fontWeight: "bold", color: "#78350f" },
  perfect: { textAlign: "center", color: "#86efac", fontSize: 14, fontWeight: "600", marginBottom: 8 },
  retryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 10, borderRadius: 12, backgroundColor: "#fdba74", borderWidth: 2, borderColor: "#78350f", marginBottom: 8 },
  retryBtnText: { fontSize: 14, fontWeight: "bold", color: "#78350f" },
  homeBtn: { alignItems: "center" },
  homeBtnText: { fontSize: 14, color: "#fde68a", textDecorationLine: "underline" },
});
