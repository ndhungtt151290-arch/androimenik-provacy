import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IllustrationImage } from "../components/IllustrationImage";
import { AdBanner } from "../components/AdBanner";
import { loadWrongAnswers } from "../lib/storage";
import type { Lang, QuestionBank, SimpleQuestion, WrongAnswerStats } from "../types";

const backIcon = require("../assets/home/back-icon.png");

const bank: QuestionBank = require("../data/questions").default;

interface WrongAnswersScreenProps {
  lang: Lang;
  onBack: () => void;
}

function tx<T extends string | null | undefined>(jp: T, vi: T, lang: Lang): string {
  if (lang === "vi" && vi) return vi;
  if (jp) return jp;
  return "";
}

function findSimpleQuestion(questionId: string): SimpleQuestion | undefined {
  return bank.simple.find((q) => q.id === questionId);
}

export function WrongAnswersScreen({ lang, onBack }: WrongAnswersScreenProps) {
  const insets = useSafeAreaInsets();
  const [wrongList, setWrongList] = useState<WrongAnswerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWrongAnswers().then((data) => {
      setWrongList(data);
      setLoading(false);
    });
  }, []);

  const sortedList = useMemo(() => {
    return [...wrongList].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [wrongList]);

  const questionMap = useMemo(() => {
    const map = new Map<string, SimpleQuestion>();
    for (const item of wrongList) {
      const q = findSimpleQuestion(item.questionId);
      if (q) map.set(item.questionId, q);
    }
    return map;
  }, [wrongList]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#78350f" />
      </View>
    );
  }

  if (sortedList.length === 0) {
    return (
      <View style={styles.screenContainer}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>
            {lang === "vi"
              ? "Tuyệt vời! Bạn chưa có câu hỏi sai nào. Hãy tiếp tục ôn tập nhé!"
              : "間違えた問題がありません！"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {lang === "vi" ? "" : "練習を続けて覚えましょう。"}
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <Text style={styles.emptyBtnText}>
              {lang === "vi" ? "Đi học thôi!" : "勉強しましょう！"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const getBadgeColor = (count: number) => {
    if (count >= 4) return "#dc2626";
    if (count >= 3) return "#ea580c";
    return "#d97706";
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(100, insets.bottom + 16) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
            <Image source={backIcon} style={styles.backBtnIcon} />
          </TouchableOpacity>
          <View style={styles.titleGroup}>
            <Text style={styles.title}>
              {lang === "vi" ? "Câu hỏi hay sai" : "○×問題"}
            </Text>
            <Text style={styles.subtitle}>
              {lang === "vi"
                ? `${sortedList.length} câu cần ôn tập`
                : `${sortedList.length}問の復習`}
            </Text>
          </View>
        </View>

        {sortedList
          .filter((item) => questionMap.has(item.questionId))
          .map((item) => {
            const question = questionMap.get(item.questionId)!;
            return (
              <View key={item.questionId} style={styles.card}>
                <View style={styles.cardHeader}>
                <View
                  style={[styles.wrongBadge, { backgroundColor: getBadgeColor(item.wrongCount) }]}
                >
                  <Text style={styles.wrongBadgeText}>
                    {lang === "vi" ? "Sai" : "不正解"}
                  </Text>
                  <Text style={styles.wrongCountText}>{item.wrongCount}x</Text>
                </View>
              </View>

              {question.image && (
                <IllustrationImage
                  file={question.image}
                  style={styles.questionImage}
                  imageStyle={styles.questionImageInner}
                />
              )}

              <Text style={styles.questionText}>
                {tx(question.text, question.textVi, lang)}
              </Text>

              <View style={styles.answerSection}>
                <View style={styles.answerRow}>
                  <Text style={styles.answerLabel}>
                    {lang === "vi" ? "Đáp án đúng:" : "正解："}
                  </Text>
                  <Text style={[styles.answerValue, question.answer === "○" ? styles.answerO : styles.answerX]}>
                    {question.answer === "○" ? "O" : "X"}
                  </Text>
                </View>

                <View style={styles.explanationBox}>
                  <Text style={styles.explanationLabel}>
                    {lang === "vi" ? "Giải thích:" : "解説："}
                  </Text>
                  <Text style={styles.explanationText}>
                    {tx(question.explanation, question.explanationVi, lang)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, position: "relative" },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 12 },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1c1917",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#525252",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyBtn: {
    backgroundColor: "#78350f",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    position: "relative",
    marginVertical: 16,
    paddingTop: 8,
    justifyContent: "center",
  },
  backBtn: {
    position: "absolute",
    left: 0,
    top: 8,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  backBtnIcon: {
    width: 48,
    height: 48,
  },
  titleGroup: {
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1c1917",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#525252",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  wrongBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  wrongBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  wrongCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  questionImage: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
  },
  questionImageInner: { width: "100%", height: 100, borderRadius: 8 },
  questionText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500",
    color: "#111",
    marginBottom: 12,
    textAlign: "center",
  },
  answerSection: {
    backgroundColor: "rgba(120,53,15,0.05)",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(120,53,15,0.15)",
  },
  answerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1c1917",
  },
  answerValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  answerO: {
    color: "#16a34a",
  },
  answerX: {
    color: "#dc2626",
  },
  explanationBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(120,53,15,0.15)",
  },
  explanationLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#78350f",
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#404040",
  },
});
