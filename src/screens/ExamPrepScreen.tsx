import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, BookOpen, Clock, Brain, CircleAlert } from "../components/Icons";
import type { Lang } from "../types";

interface ExamPrepScreenProps {
  lang: Lang;
  onStart: () => void;
  onBack: () => void;
}

export function ExamPrepScreen({ lang, onStart, onBack }: ExamPrepScreenProps) {
  const insets = useSafeAreaInsets();

  const L = {
    title: lang === "vi" ? "Cấu trúc đề thi" : "試験構成",
    start: lang === "vi" ? "Bắt đầu thi →" : "試験を始める →",
    back: lang === "vi" ? "← Trang chủ" : "← ホーム",
    part1Title: lang === "vi" ? "Phần 1 · Câu hỏi ○×" : "第1部 · ○×問題",
    part1Count: "46",
    part1Pts: lang === "vi" ? "46 điểm" : "46点",
    part1Content: lang === "vi"
      ? "Lý thuyết · Biển báo · Quy tắc ưu tiên · Luật giao thông"
      : "交通ルール · 標識 · 優先規則",
    part1Rule: lang === "vi"
      ? "Đúng mỗi câu → nhận 1 điểm. Sai → 0 điểm."
      : "正解で1点。間違うと0点。",
    part2Title: lang === "vi" ? "Phần 2 · Hình ảnh (Kiken Yosoku)" : "第2部 · イラスト問題（危険予測）",
    part2Count: "2",
    part2Pts: lang === "vi" ? "4 điểm" : "4点",
    part2Content: lang === "vi"
      ? "Mỗi câu hình ảnh có 3 ý nhỏ bắt buộc đúng TẤT CẢ."
      : "各イラスト問題は3つの小問で構成。全問正解で2点。",
    part2Rule: lang === "vi"
      ? "Đúng đủ 3 ý → nhận 2 điểm. Sai ≥1 ý → 0 điểm."
      : "3題すべて正解で2点。1問でも間違うと0点。",
    total: lang === "vi" ? "Tổng điểm" : "合計点",
    totalVal: "50",
    pass: lang === "vi" ? "Điểm đỗ" : "合格点",
    passVal: "45 / 50",
    time: lang === "vi" ? "Thời gian" : "試験時間",
    timeVal: lang === "vi" ? "30 phút" : "30分",
    tip1: lang === "vi"
      ? "Dành 5 phút cuối để xem kỹ 2 câu hình ảnh — chúng quyết định kết quả!"
      : "最後の5分はイラスト問題の見直しに充てるべし！",
    tip2: lang === "vi"
      ? "2 câu hình ảnh chiếm 4 điểm, rất dễ bị đánh lừa ở chi tiết nhỏ."
      : "イラスト問題は4点分。小さなディテールで見間違えやすい。",
    tip3: lang === "vi"
      ? "Bình tĩnh, đọc kỹ từng ý nhỏ trong câu hình ảnh."
      : "落ち着いてください。イラスト問題の各小問を慎重に読みましょう。",
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
      >
      <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
        <Text style={styles.backText}>{L.back}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onStart} style={styles.startBtn} activeOpacity={0.8}>
        <Text style={styles.startBtnText}>{L.start}</Text>
      </TouchableOpacity>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{L.total}</Text>
          <Text style={styles.statValue}>{L.totalVal}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{L.pass}</Text>
          <Text style={styles.statValue}>{L.passVal}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{L.time}</Text>
          <Text style={styles.statValue}>{L.timeVal}</Text>
        </View>
      </View>

      {/* Part 1 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{L.part1Title}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{L.part1Count} {lang === "vi" ? "câu" : "問"}</Text>
            </View>
            <View style={[styles.countBadge, { backgroundColor: "#d1fae5" }]}>
              <Text style={[styles.countBadgeText, { color: "#166534" }]}>{L.part1Pts}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.cardContent}>{L.part1Content}</Text>
        <View style={styles.ruleBox}>
          <BookOpen size={12} />
          <Text style={styles.ruleText}>{L.part1Rule}</Text>
        </View>
      </View>

      {/* Part 2 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{L.part2Title}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{L.part2Count} {lang === "vi" ? "câu" : "問"}</Text>
            </View>
            <View style={[styles.countBadge, { backgroundColor: "#d1fae5" }]}>
              <Text style={[styles.countBadgeText, { color: "#166534" }]}>{L.part2Pts}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.cardContent}>{L.part2Content}</Text>
        <View style={[styles.ruleBox, { backgroundColor: "#fff1f2", borderColor: "#fecdd3" }]}>
          <BookOpen size={12} />
          <Text style={[styles.ruleText, { color: "#9f1239" }]}>{L.part2Rule}</Text>
        </View>
      </View>

      {/* Tips */}
      <View style={[styles.card, { backgroundColor: "rgba(254,243,199,0.8)" }]}>
        <View style={styles.tipsHeader}>
          <Brain size={12} />
          <Text style={styles.tipsTitle}>
            {lang === "vi" ? "Mẹo làm bài:" : "試験のコツ："}
          </Text>
        </View>
        {[
          { icon: <Clock size={11} />, text: L.tip1 },
          { icon: <CircleAlert size={11} />, text: L.tip2 },
          { icon: <Brain size={11} />, text: L.tip3 },
        ].map(({ icon, text }, i) => (
          <View key={i} style={styles.tipRow}>
            <Text style={{ fontSize: 11 }}>{icon}</Text>
            <Text style={styles.tipText}>{text}</Text>
          </View>
        ))}
      </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, position: "relative" },
  scrollContent: { flexGrow: 1 },
  container: { flex: 1 },
  backBtn: {
    backgroundColor: "#059669",
    borderWidth: 1,
    borderColor: "#34d399",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
    width: 94,
    opacity: 0.6,
  },
  backText: { fontSize: 12, fontWeight: "bold", color: "#fff" },
  startBtn: {
    backgroundColor: "#fbbf24",
    borderColor: "#78350f",
    borderWidth: 3,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  startBtnText: {
    fontWeight: "900",
    fontSize: 18,
    color: "#78350f",
  },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(120,53,15,0.4)",
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(253,230,138,0.7)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#fef3c7",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#78350f",
  },
  badgeRow: { flexDirection: "row", gap: 6 },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#fef3c7",
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#92400e",
  },
  cardContent: {
    fontSize: 12,
    color: "#404040",
    marginBottom: 8,
    lineHeight: 18,
  },
  ruleBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fef3c7",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  ruleText: {
    fontSize: 12,
    color: "#78350f",
    flex: 1,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#78350f",
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: "#404040",
    flex: 1,
    lineHeight: 18,
  },
});
