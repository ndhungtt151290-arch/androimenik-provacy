import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IllustrationImage } from "../components/IllustrationImage";
import { Check, X } from "../components/Icons";
import type { ExamItem, Lang } from "../types";

interface ReviewScreenProps {
  lang: Lang;
  score: {
    details: Array<{
      index: number;
      item: ExamItem;
      points: number;
      simple?: { correct: boolean; user?: string };
    }>;
  };
  reviewAll?: boolean;
  onBackResults: () => void;
  onHome: () => void;
}

function tx<T extends string | null | undefined>(jp: T, vi: T, lang: Lang): string {
  if (lang === "vi" && vi) return vi;
  if (jp) return jp;
  return "";
}

function isScenarioSubItem(item: ExamItem): boolean {
  return item.type === "simple" && !!(item as any).scenarioGroupId;
}

function getScenarioGroupId(item: ExamItem): string | undefined {
  if (isScenarioSubItem(item)) {
    return (item as any).scenarioGroupId;
  }
  return undefined;
}

function getStem(item: ExamItem): string | undefined {
  if (isScenarioSubItem(item)) {
    return (item as any).stem;
  }
  return undefined;
}

function getStemVi(item: ExamItem): string | null | undefined {
  if (isScenarioSubItem(item)) {
    return (item as any).stemVi;
  }
  return undefined;
}

export function ReviewScreen({ lang, score, reviewAll, onBackResults, onHome }: ReviewScreenProps) {
  const insets = useSafeAreaInsets();

  // Lọc câu sai theo đơn vị câu (không lặp sub-item)
  const wrongByGroup = score.details.reduce<Array<typeof score.details[0]>>((acc, d) => {
    const item = d.item;
    if (item.type !== "simple") return acc;

    // Simple thường: thêm nếu sai
    if (!isScenarioSubItem(item)) {
      if (d.points === 0) acc.push(d);
      return acc;
    }

    // Scenario sub: chỉ thêm sub đầu tiên của mỗi group sai
    const subIndex = (item as any).subIndex;
    if (subIndex === 0 && d.points === 0) {
      acc.push(d);
    }
    return acc;
  }, []);

  const itemsToShow = reviewAll ? score.details : wrongByGroup;

  const L = {
    back: lang === "vi" ? "← Kết quả" : "← 結果",
    title: lang === "vi" ? "Câu / nhóm sai" : "間違い一覧",
    titleAll: lang === "vi" ? "Tất cả câu hỏi" : "全問題一覧",
    yourChoice: lang === "vi" ? "Bạn chọn:" : "あなたの選択：",
    correctAns: lang === "vi" ? "Đúng:" : "正解：",
    scenarioNote: lang === "vi" ? "Câu hỏi tình huống: cả 3 ý đúng → được 2 điểm." : "イラスト問題：3題すべて正解で2点",
    home: lang === "vi" ? "Trang chủ" : "ホーム",
    answer: lang === "vi" ? "Đáp án:" : "答え：",
    correct: lang === "vi" ? "Đúng" : "正解",
    wrong: lang === "vi" ? "Sai" : "不正解",
    scenarioHint: lang === "vi" ? "Câu hỏi tình huống" : "イラスト問題",
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>{reviewAll ? L.titleAll : L.title}</Text>

        <View style={styles.list}>
          {itemsToShow.map((d) => {
            const item = d.item;
            const isScenarioSub = isScenarioSubItem(item);
            const stem = getStem(item);
            const stemVi = getStemVi(item);
            const scenarioGroupId = getScenarioGroupId(item);

            return (
              <View
                key={d.index}
                style={[
                  styles.itemCard,
                  d.points >= 1 ? styles.itemCorrect : styles.itemWrong,
                ]}
              >
                <View style={styles.itemHeader}>
                  <Text style={styles.questionNum}>
                    {lang === "vi"
                      ? `Câu ${d.index + 1} trong đề`
                      : `問${d.index + 1}`}
                    {isScenarioSub && (
                      <Text style={styles.scenarioHintInline}> ({L.scenarioHint})</Text>
                    )}
                  </Text>
                  <View style={[styles.resultBadge, d.points >= 1 ? styles.badgeGreen : styles.badgeRed]}>
                    {d.points >= 1 ? <Check size={10} /> : <X size={10} />}
                    <Text style={styles.resultText}>{d.points >= 1 ? L.correct : L.wrong}</Text>
                  </View>
                </View>

                {/* Stem for scenario sub questions */}
                {isScenarioSub && stem && (
                  <Text style={styles.stemText}>
                    {tx(stem, stemVi, lang)}
                  </Text>
                )}

                {/* Image */}
                {item.question.image && (
                  <IllustrationImage
                    file={item.question.image}
                    style={styles.reviewImage}
                    imageStyle={styles.reviewImageInner}
                  />
                )}

                {/* Question text */}
                <Text style={isScenarioSub ? styles.scenarioQuestionText : styles.questionText}>
                  {tx(item.question.text, item.question.textVi, lang)}
                </Text>

                {/* Answer info */}
                {d.simple && (
                  <Text style={[styles.answerLine, d.simple.correct ? styles.textGreen : styles.textRed]}>
                    {L.yourChoice} <Text style={styles.bold}>{d.simple.user ?? "—"}</Text>
                    {" · "}{L.correctAns} <Text style={styles.bold}>{item.question.answer}</Text>
                  </Text>
                )}

                {/* Explanation */}
                <View style={styles.explanationBox}>
                  <Text style={styles.explanationText}>
                    {tx(item.question.explanation, item.question.explanationVi, lang)}
                  </Text>
                </View>

                {/* Scenario group note */}
                {isScenarioSub && scenarioGroupId && (
                  <Text style={styles.note}>{L.scenarioNote}</Text>
                )}
              </View>
            );
          })}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, position: "relative" },
  scrollContent: { flexGrow: 1 },
  container: { flex: 1 },
  heading: { fontSize: 16, fontWeight: "bold", color: "#fde68a", marginBottom: 16 },
  list: { gap: 12 },
  itemCard: { borderRadius: 12, padding: 14, borderWidth: 1, borderLeftWidth: 4 },
  itemCorrect: { borderColor: "#d1fae5", borderLeftColor: "#16a34a", backgroundColor: "rgba(255,255,255,0.1)" },
  itemWrong: { borderColor: "#fee2e2", borderLeftColor: "#dc2626", backgroundColor: "rgba(255,255,255,0.1)" },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  questionNum: { fontSize: 12, fontWeight: "bold", color: "#7f1d1d" },
  scenarioHintInline: { fontSize: 10, color: "#9f1239", fontWeight: "normal" },
  resultBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeGreen: { backgroundColor: "#d1fae5" },
  badgeRed: { backgroundColor: "#fee2e2" },
  resultText: { fontSize: 11, fontWeight: "bold", color: "#166534" },
  stemText: { fontSize: 14, fontWeight: "600", color: "#111", marginBottom: 10, adjustsFontSizeToFit: true, numberOfLines: 3, minimumFontScale: 0.8 },
  questionText: { fontSize: 14, color: "#111", marginBottom: 8 },
  scenarioQuestionText: { fontSize: 14, color: "#111", marginBottom: 8, adjustsFontSizeToFit: true, numberOfLines: 4, minimumFontScale: 0.75 },
  answerLine: { fontSize: 13, marginBottom: 6 },
  bold: { fontWeight: "bold" },
  textGreen: { color: "#15803d" },
  textRed: { color: "#dc2626" },
  explanationBox: { borderLeftWidth: 3, borderLeftColor: "#d97706", paddingLeft: 10 },
  explanationText: { fontSize: 13, color: "#525252", lineHeight: 20, adjustsFontSizeToFit: true, numberOfLines: 5, minimumFontScale: 0.7 },
  note: { fontSize: 12, color: "#9f1239", marginTop: 8 },
  reviewImage: { width: "100%", height: 150, borderRadius: 10, marginBottom: 12 },
  reviewImageInner: { width: "100%", height: 150, borderRadius: 10 },
});
