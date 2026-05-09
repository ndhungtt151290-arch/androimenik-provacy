import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IllustrationImage } from "../components/IllustrationImage";
import { ArrowLeft, Check, X } from "../components/Icons";
import type { ExamItem, Lang } from "../types";

interface ReviewScreenProps {
  lang: Lang;
  score: {
    details: Array<{
      index: number;
      item: ExamItem;
      points: number;
      simple?: { correct: boolean; user?: string };
      scenario?: { correct: boolean; subs: Record<string, { correct: boolean; user?: string }> };
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

export function ReviewScreen({ lang, score, reviewAll, onBackResults, onHome }: ReviewScreenProps) {
  const insets = useSafeAreaInsets();
  const wrong = score.details.filter((d) => d.points < 1);
  const itemsToShow = reviewAll ? score.details : wrong;

  const L = {
    back: lang === "vi" ? "← Kết quả" : "← 結果",
    title: lang === "vi" ? "Câu / nhóm sai" : "間違い一覧",
    titleAll: lang === "vi" ? "Tất cả câu hỏi" : "全問題一覧",
    yourChoice: lang === "vi" ? "Bạn chọn:" : "あなたの選択：",
    correctAns: lang === "vi" ? "Đúng:" : "正解：",
    scenarioNote: lang === "vi" ? "Nhóm hình ảnh: cả 3 ý đúng → được 2 điểm." : "イラスト問題：3題すべて正解で2点",
    home: lang === "vi" ? "Trang chủ" : "ホーム",
    answer: lang === "vi" ? "Đáp án:" : "答え：",
    correct: lang === "vi" ? "Đúng" : "正解",
    wrong: lang === "vi" ? "Sai" : "不正解",
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
      >
      <TouchableOpacity onPress={onBackResults} style={styles.backBtn} activeOpacity={0.7}>
        <Text style={styles.backText}>{L.back}</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>{reviewAll ? L.titleAll : L.title}</Text>

      <View style={styles.list}>
        {itemsToShow.map((d) => (
          <View
            key={d.index}
            style={[
              styles.itemCard,
              d.points >= 1 ? styles.itemCorrect : styles.itemWrong,
            ]}
          >
            <View style={styles.itemHeader}>
              <Text style={styles.questionNum}>
                {lang === "vi" ? `Câu ${d.index + 1} trong đề` : `問${d.index + 1}`}
              </Text>
              <View style={[styles.resultBadge, d.points >= 1 ? styles.badgeGreen : styles.badgeRed]}>
                {d.points >= 1 ? <Check size={10} /> : <X size={10} />}
                <Text style={styles.resultText}>{d.points >= 1 ? L.correct : L.wrong}</Text>
              </View>
            </View>

            {d.item.type === "simple" && d.simple && (
              <>
                {d.item.question.image && (
                  <IllustrationImage
                    file={d.item.question.image}
                    style={styles.reviewImage}
                    imageStyle={styles.reviewImageInner}
                  />
                )}
                <Text style={styles.questionText}>
                  {tx(d.item.question.text, d.item.question.textVi, lang)}
                </Text>
                <Text style={[styles.answerLine, d.simple.correct ? styles.textGreen : styles.textRed]}>
                  {L.yourChoice} <Text style={styles.bold}>{d.simple.user ?? "—"}</Text> · {L.correctAns} <Text style={styles.bold}>{d.item.question.answer}</Text>
                </Text>
                <View style={styles.explanationBox}>
                  <Text style={styles.explanationText}>
                    {tx(d.item.question.explanation, d.item.question.explanationVi, lang)}
                  </Text>
                </View>
              </>
            )}

            {d.item.type === "scenario" && d.scenario && (
              <>
                <Text style={styles.stemText}>
                  {tx(d.item.group.stem, d.item.group.stemVi, lang)}
                </Text>
                <Text style={styles.note}>{L.scenarioNote}</Text>
                {d.item.group.subs.map((sub) => {
                  const st = d.scenario!.subs[sub.partId];
                  const ok = st?.correct;
                  return (
                    <View key={sub.partId} style={[styles.subCard, ok ? styles.subCorrect : styles.subWrong]}>
                      <View style={styles.subRow}>
                        <IllustrationImage
                          file={sub.image}
                          style={styles.reviewSubImage}
                          imageStyle={styles.reviewSubImageInner}
                        />
                        <Text style={styles.subText}>
                          【{sub.subKey}】{tx(sub.text, sub.textVi, lang)}
                        </Text>
                      </View>
                      <Text style={[styles.subAnswer, ok ? styles.textGreen : styles.textRed]}>
                        {L.yourChoice} <Text style={styles.bold}>{st?.user ?? "—"}</Text> · {L.answer} <Text style={styles.bold}>{sub.answer}</Text>
                      </Text>
                      {!ok && (
                        <Text style={styles.explanationText}>
                          {tx(sub.explanation, sub.explanationVi, lang)}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </>
            )}
          </View>
        ))}
      </View>

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
  heading: { fontSize: 16, fontWeight: "bold", color: "#fde68a", marginBottom: 16 },
  list: { gap: 12 },
  itemCard: { borderRadius: 12, padding: 14, borderWidth: 1, borderLeftWidth: 4 },
  itemCorrect: { borderColor: "#d1fae5", borderLeftColor: "#16a34a", backgroundColor: "rgba(255,255,255,0.1)" },
  itemWrong: { borderColor: "#fee2e2", borderLeftColor: "#dc2626", backgroundColor: "rgba(255,255,255,0.1)" },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  questionNum: { fontSize: 12, fontWeight: "bold", color: "#7f1d1d" },
  resultBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeGreen: { backgroundColor: "#d1fae5" },
  badgeRed: { backgroundColor: "#fee2e2" },
  resultText: { fontSize: 11, fontWeight: "bold", color: "#166534" },
  questionText: { fontSize: 14, color: "#111", marginBottom: 8 },
  answerLine: { fontSize: 13, marginBottom: 6 },
  bold: { fontWeight: "bold" },
  textGreen: { color: "#15803d" },
  textRed: { color: "#dc2626" },
  explanationBox: { borderLeftWidth: 3, borderLeftColor: "#d97706", paddingLeft: 10 },
  explanationText: { fontSize: 13, color: "#525252", lineHeight: 20 },
  stemText: { fontSize: 14, fontWeight: "600", color: "#111", marginBottom: 6 },
  note: { fontSize: 12, color: "#9f1239", marginBottom: 10 },
  subCard: { borderRadius: 10, padding: 10, marginBottom: 8, borderWidth: 1 },
  subCorrect: { borderColor: "#d1fae5", backgroundColor: "rgba(209,250,229,0.3)" },
  subWrong: { borderColor: "#fecdd3", backgroundColor: "rgba(254,226,226,0.3)" },
  subRow: { flexDirection: "row", gap: 8, alignItems: "flex-start", marginBottom: 6 },
  subText: { flex: 1, fontSize: 12, color: "#111", lineHeight: 18 },
  subAnswer: { fontSize: 12, marginBottom: 4 },
  homeBtn: {
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(120,53,15,0.5)",
    borderWidth: 1,
    borderColor: "rgba(120,53,15,0.6)",
    alignItems: "center",
  },
  homeBtnText: { fontSize: 14, fontWeight: "bold", color: "#fde68a" },
  reviewImage: { width: "100%", height: 150, borderRadius: 10, marginBottom: 12 },
  reviewImageInner: { width: "100%", height: 150, borderRadius: 10 },
  reviewSubImage: { width: 80, height: 64, borderRadius: 6 },
  reviewSubImageInner: { width: 80, height: 64, borderRadius: 6 },
});
