import React from "react";
import { View, Text, ScrollView, StyleSheet, TextStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IllustrationImage } from "../components/IllustrationImage";
import type { ExamItem, ExamSimpleItem, Lang } from "../types";

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

  // Lọc câu sai - hiển thị tất cả sub sai riêng biệt
  const wrongByGroup = score.details.reduce<Array<typeof score.details[0]>>((acc, d) => {
    const item = d.item;
    if (item.type !== "simple") return acc;

    // Simple thường: thêm nếu sai
    if (!isScenarioSubItem(item)) {
      if (d.points === 0) acc.push(d);
      return acc;
    }

    // Scenario sub: thêm TẤT CẢ sub sai (không chỉ sub đầu tiên)
    if (d.points === 0) {
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
    answerLabel: lang === "vi" ? "Đáp án là:" : "答えは：",
    scenarioNote: lang === "vi" ? "Câu hỏi tình huống: cả 3 ý đúng → được 2 điểm." : "イラスト問題：3題すべて正解で2点",
    home: lang === "vi" ? "Trang chủ" : "ホーム",
    correct: lang === "vi" ? "Đúng" : "正解",
    wrong: lang === "vi" ? "Sai" : "不正解",
    scenarioHint: lang === "vi" ? "Câu hỏi tình huống" : "イラスト問題",
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>{reviewAll ? L.titleAll : L.title}</Text>

        <View style={styles.list}>
          {itemsToShow.map((d) => {
            const item = d.item as ExamSimpleItem;
            if (item.type !== "simple") return null;
            const isScenarioSub = isScenarioSubItem(item);
            const stem = getStem(item);
            const stemVi = getStemVi(item);
            const scenarioGroupId = getScenarioGroupId(item);

            // Tính số hiển thị cho scenario sub: 47-1, 47-2, 47-3, 48-1, 48-2, 48-3
            const getDisplayNum = (detail: typeof d): string => {
              const idx = detail.index;
              // Đếm số câu thường trước item này
              let simpleCount = 0;
              for (let j = 0; j < idx; j++) {
                if (!isScenarioSubItem(score.details[j].item)) {
                  simpleCount++;
                }
              }
              // Đếm số nhóm scenario đến item này
              const seenGroups = new Set<string>();
              let scenarioCount = 0;
              for (let j = 0; j <= idx; j++) {
                if (isScenarioSubItem(score.details[j].item)) {
                  const gid = getScenarioGroupId(score.details[j].item);
                  if (gid && !seenGroups.has(gid)) {
                    seenGroups.add(gid);
                    scenarioCount++;
                  }
                }
              }
              const scenarioBaseNum = simpleCount + scenarioCount;
              const subIdx = (item as any).subIndex ?? 0;
              return `${scenarioBaseNum}-${subIdx + 1}`;
            };

            const displayNum = isScenarioSub ? getDisplayNum(d) : `${d.index + 1}`;

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
                      ? `Câu ${displayNum}`
                      : `問${displayNum}`}
                    {isScenarioSub && (
                      <Text style={styles.scenarioHintInline}> ({L.scenarioHint})</Text>
                    )}
                  </Text>
                  <View style={[styles.resultBadge, d.points >= 1 ? styles.badgeGreen : styles.badgeRed]}>
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
                    {" · "}{L.answerLabel} <Text style={styles.bold}>{item.question.answer}</Text>
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
  heading: { fontSize: 16, fontWeight: "bold", color: "rgba(17, 39, 138, 0.85)", marginBottom: 16 },
  list: { gap: 12 },
  itemCard: { borderRadius: 12, padding: 14, overflow: "hidden" },
  itemCorrect: { borderWidth: 1, borderColor: "#d1fae5", borderLeftWidth: 4, borderLeftColor: "#16a34a", backgroundColor: "rgba(255,255,255,0.1)" },
  itemWrong: { borderWidth: 1, borderColor: "#fee2e2", borderLeftWidth: 4, borderLeftColor: "#dc2626", backgroundColor: "rgba(255,255,255,0.1)" },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  questionNum: { fontSize: 12, fontWeight: "bold", color: "rgba(12, 15, 121, 0.85)" },
  scenarioHintInline: { fontSize: 10, color: "#9f1239", fontWeight: "normal" },
  resultBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeGreen: { backgroundColor: "rgba(41, 169, 15, 0.98)" },
  badgeRed: { backgroundColor: "rgba(189, 16, 16, 0.85)" },
  resultText: { fontSize: 11, fontWeight: "bold", color: "rgba(255, 255, 255, 0.85)" },
  stemText: { fontSize: 14, fontWeight: "600", color: "#111", marginBottom: 10, adjustsFontSizeToFit: true, numberOfLines: 3, minimumFontScale: 0.8 } as TextStyle,
  questionText: { fontSize: 14, color: "#111", marginBottom: 8 },
  scenarioQuestionText: { fontSize: 14, color: "#111", marginBottom: 8, adjustsFontSizeToFit: true, numberOfLines: 4, minimumFontScale: 0.75 } as TextStyle,
  answerLine: { fontSize: 13, marginBottom: 6 },
  bold: { fontWeight: "bold" },
  textGreen: { color: "#15803d" },
  textRed: { color: "#dc2626" },
  explanationBox: { borderLeftWidth: 3, borderLeftColor: "#d97706", paddingLeft: 10 },
  explanationText: { fontSize: 13, color: "#525252", lineHeight: 20, adjustsFontSizeToFit: true, numberOfLines: 5, minimumFontScale: 0.7 } as TextStyle,
  note: { fontSize: 12, color: "#9f1239", marginTop: 8 },
  reviewImage: { width: "100%", height: 150, borderRadius: 10, marginBottom: 12 },
  reviewImageInner: { width: "100%", height: 150, borderRadius: 10 },
});
