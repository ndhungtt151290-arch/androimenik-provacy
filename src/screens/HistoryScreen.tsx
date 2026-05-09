import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "../components/Icons";
import type { ExamHistoryEntry, Lang } from "../types";

interface HistoryScreenProps {
  lang: Lang;
  history: ExamHistoryEntry[];
  onBack: () => void;
}

export function HistoryScreen({ lang, history, onBack }: HistoryScreenProps) {
  const insets = useSafeAreaInsets();

  const L = {
    back: lang === "vi" ? "← Trang chủ" : "← ホーム",
    title: lang === "vi" ? "Lịch sử thi" : "試験履歴",
    empty: lang === "vi" ? "Chưa có lịch sử thi" : "試験履歴がありません",
    passed: lang === "vi" ? "ĐẠT" : "合格",
    failed: lang === "vi" ? "CHƯA ĐẠT" : "不合格",
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === "vi" ? "vi-VN" : "ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.backRow}>
          <Text style={styles.backBtn} onPress={onBack}>← {L.back}</Text>
        </View>
        <Text style={styles.title}>{L.title}</Text>
      </View>

      {history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{L.empty}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          showsVerticalScrollIndicator={false}
        >
          {history.map((entry, i) => (
            <View key={i} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.date}>{formatDate(entry.date)}</Text>
                <View style={[styles.resultBadge, entry.passed ? styles.passBadge : styles.failBadge]}>
                  <Text style={styles.resultText}>{entry.passed ? L.passed : L.failed}</Text>
                </View>
              </View>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreNum}>{entry.score}</Text>
                <Text style={styles.scoreMax}> / {entry.max}</Text>
                <Text style={styles.pct}>{Math.round((entry.score / entry.max) * 100)}%</Text>
              </View>
              {/* Mini chapter breakdown */}
              <View style={styles.chapterRow}>
                {Object.entries(entry.details.chapterBreakdown).slice(0, 6).map(([ch, stats]) => {
                  const pct = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
                  return (
                    <View key={ch} style={styles.miniBar}>
                      <View style={styles.miniBarFill}>
                        <View style={[styles.miniFill, { height: `${pct}%`, backgroundColor: pct >= 70 ? "#4ade80" : pct >= 50 ? "#fbbf24" : "#f87171" }]} />
                      </View>
                      <Text style={styles.miniLabel}>{ch.slice(0, 5)}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { marginBottom: 12 },
  backRow: { marginBottom: 8 },
  backBtn: { fontSize: 14, color: "#fde68a" },
  title: { fontSize: 20, fontWeight: "bold", color: "#fde68a" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 14, color: "rgba(253,230,138,0.5)" },
  list: { flex: 1 },
  card: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "rgba(0,0,0,0.1)" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  date: { fontSize: 12, color: "#737373" },
  resultBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  passBadge: { backgroundColor: "#d1fae5" },
  failBadge: { backgroundColor: "#fee2e2" },
  resultText: { fontSize: 11, fontWeight: "bold", color: "#166534" },
  scoreRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginBottom: 8 },
  scoreNum: { fontSize: 28, fontWeight: "900", color: "#111" },
  scoreMax: { fontSize: 16, color: "#737373" },
  pct: { marginLeft: "auto", fontSize: 16, fontWeight: "600", color: "#92400e" },
  chapterRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  miniBar: { alignItems: "center" },
  miniBarFill: { width: 20, height: 16, backgroundColor: "#d4d4d4", borderRadius: 3, overflow: "hidden", justifyContent: "flex-end" },
  miniFill: { width: "100%", borderRadius: 3 },
  miniLabel: { fontSize: 8, color: "#737373", marginTop: 2 },
});
