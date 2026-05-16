import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IllustrationImage } from "../components/IllustrationImage";
import { AdBanner } from "../components/AdBanner";
import { AnswerNavButtons } from "../components/AnswerNavButtons";
import { MaruBatsuButtons } from "../components/MaruBatsuButtons";
import { BackHomeButton } from "../components/BackHomeButton";
import { showInterstitialChapter } from "../utils/AdManager";
import { questionsForChapter } from "../lib/exam";
import { CHAPTER_VI } from "../lib/chapters";
import { savePracticeProgress, loadPracticeProgress } from "../lib/storage";
import type { Lang, MaruBatsu, QuestionBank, ScenarioGroup } from "../types";

const bank: QuestionBank = require("../data/questions").default;

interface ChapterScreenProps {
  lang: Lang;
  chapterId: string;
  onBack: () => void;
}

function tx<T extends string | null | undefined>(jp: T, vi: T, lang: Lang): string {
  if (lang === "vi" && vi) return vi;
  if (jp) return jp;
  return "";
}

export function ChapterScreen({ lang, chapterId, onBack }: ChapterScreenProps) {
  const insets = useSafeAreaInsets();
  const { simple, scenarios } = useMemo(
    () => questionsForChapter(bank, [chapterId]),
    [chapterId]
  );

  type FlatItem =
    | { kind: "s"; q: (typeof simple)[0]; i: number }
    | { kind: "g"; g: ScenarioGroup; i: number };

  const flat: FlatItem[] = [];
  let i = 0;
  for (const q of simple) flat.push({ kind: "s", q, i: i++ });
  for (const g of scenarios) flat.push({ kind: "g", g, i: i++ });

  const [idx, setIdx] = useState(0);
  const [ans, setAns] = useState<Record<string, MaruBatsu | undefined>>({});
  const [show, setShow] = useState<Record<string, boolean>>({});

  const total = flat.length;
  const cur = flat[idx];

  // Load saved practice progress on mount
  useEffect(() => {
    loadPracticeProgress().then((all) => {
      setAns((prev) => ({
        ...prev,
        ...Object.fromEntries(
          (all[chapterId] ?? []).map((id) => [id, prev[id]])
        ),
      }));
    });
  }, [chapterId]);

  // Auto-show answer when user answers
  useEffect(() => {
    if (!cur) return;
    const key = cur.kind === "s" ? cur.q.id : cur.g.groupId;
    if (ans[key] === undefined) return;

    setShow((s) => ({ ...s, [key]: true }));
  }, [ans, cur]);

  // Save progress whenever ans changes
  useEffect(() => {
    const simpleIds = simple
      .filter((q) => ans[q.id] !== undefined)
      .map((q) => q.id);
    const scenarioIds = scenarios
      .filter((g) => ans[g.groupId] !== undefined)
      .map((g) => g.groupId);
    savePracticeProgress(chapterId, [...simpleIds, ...scenarioIds]);
  }, [ans, chapterId]);

  if (total === 0) {
    return (
      <View style={styles.container}>
        <BackHomeButton onPress={() => showInterstitialChapter(onBack)} lang={lang} variant="home" />
        <Text style={styles.emptyText}>
          {lang === "vi"
            ? "Chưa có dữ liệu cho chương này."
            : "この章のデータはまだありません。"}
        </Text>
      </View>
    );
  }

  const L = {
    prev: lang === "vi" ? "Trước" : "前へ",
    next: lang === "vi" ? "Sau" : "次へ",
    correct: lang === "vi" ? "Đáp án:" : "正解：",
    right: lang === "vi" ? "Bạn đã đúng" : "正解",
    wrong: lang === "vi" ? "Bạn đã sai" : "不正解",
  };

  return (
    <View style={styles.screenContainer}>
      <BackHomeButton onPress={() => showInterstitialChapter(onBack)} lang={lang} variant="home" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(100, insets.bottom + 16) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressRow}>
          <Text style={styles.progressBadge}>
            {lang === "vi"
              ? `Câu ${idx + 1}/${total}`
              : `${idx + 1}/${total}問`}
          </Text>
          <Text style={styles.chapterName}>
            {tx(
              CHAPTER_VI[chapterId] ?? chapterId,
              CHAPTER_VI[chapterId] ?? chapterId,
              lang
            )}
          </Text>
        </View>

        <View style={styles.questionCard}>
          {cur.kind === "s" && (
            <View style={styles.questionInner}>
              {cur.q.image && (
                <IllustrationImage
                  file={cur.q.image}
                  style={styles.questionImage}
                  imageStyle={styles.questionImageInner}
                />
              )}
              <Text style={styles.questionText}>
                {tx(cur.q.text, cur.q.textVi, lang)}
              </Text>

              {/* Dap an + giai thich hien tu dong ngay ben duoi cau hoi */}
              {ans[cur.q.id] && (
                <View style={styles.ansCard}>
                  <Text style={styles.ansLabel}>
                    {ans[cur.q.id] === cur.q.answer ? L.right : L.wrong}
                    {" — "}{L.correct} {cur.q.answer === "○" ? "O" : cur.q.answer === "×" ? "X" : cur.q.answer}
                  </Text>
                  <Text style={styles.ansExplanation}>
                    {tx(cur.q.explanation, cur.q.explanationVi, lang)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {cur.kind === "g" && (
            <ScenarioBlock
              lang={lang}
              group={cur.g}
              values={ans}
              show={show}
              onPick={(partId, v) =>
                setAns((a) => ({ ...a, [partId]: v }))
              }
              onToggleExplain={(key) =>
                setShow((s) => ({ ...s, [key]: !s[key] }))
              }
            />
          )}
        </View>

        <View style={styles.subBtnsWrap}>
          {cur.kind === "s" && (
            <AnswerNavButtons
              answerValue={ans[cur.q.id]}
              onPick={(v) => setAns((a) => ({ ...a, [cur.q.id]: v }))}
              size="large"
              disabledPrev={idx === 0}
              disabledNext={idx >= total - 1}
              onPrev={() => setIdx(Math.max(0, idx - 1))}
              onNext={() => setIdx(Math.min(total - 1, idx + 1))}
              prevLabel={L.prev}
              nextLabel={L.next}
            />
          )}
        </View>
      </ScrollView>

      {/* Ad Banner */}
      <AdBanner />
    </View>
  );
}

interface ScenarioBlockProps {
  lang: Lang;
  group: ScenarioGroup;
  values: Record<string, MaruBatsu | undefined>;
  show: Record<string, boolean>;
  onPick: (partId: string, v: MaruBatsu) => void;
  onToggleExplain: (key: string) => void;
}

function ScenarioBlock({
  lang,
  group,
  values,
  show,
  onPick,
  onToggleExplain,
}: ScenarioBlockProps) {
  const L = {
    answer: lang === "vi" ? "Đáp án:" : "答え：",
    hide: lang === "vi" ? "Ẩn" : "隠す",
    show: lang === "vi" ? "Đáp án" : "答え",
    right: lang === "vi" ? "Bạn đã đúng" : "正解",
    wrong: lang === "vi" ? "Bạn đã sai" : "不正解",
  };

  return (
    <View style={styles.scenarioContainer}>
      <Text style={styles.warningText}>
        ⚠{" "}
        {lang === "vi"
          ? "Phải trả lời đúng TẤT CẢ 3 ý nhỏ."
          : "3題すべて正解で2点獲得。"}
      </Text>
      <Text style={styles.stemText}>
        {tx(group.stem, group.stemVi, lang)}
      </Text>

      <View style={styles.subsList}>
        {group.subs.map((sub) => (
          <View key={sub.partId} style={styles.subItem}>
            <View style={styles.subRow}>
              <IllustrationImage
                file={sub.image}
                style={styles.subImage}
                imageStyle={styles.subImageInner}
              />
              <Text style={styles.subText}>
                【{sub.subKey}】
                {tx(sub.text, sub.textVi, lang)}
              </Text>
            </View>
            <MaruBatsuButtons
              value={values[sub.partId]}
              onPick={(v) => onPick(sub.partId, v)}
            />
            {values[sub.partId] && (
              <TouchableOpacity
                onPress={() => onToggleExplain(sub.partId)}
              >
                <Text style={styles.ansToggle}>
                  {show[sub.partId] ? L.hide : L.show}
                </Text>
              </TouchableOpacity>
            )}
            {show[sub.partId] && (
              <View style={styles.ansCard}>
                <Text style={styles.ansLabel}>
                  {values[sub.partId] === sub.answer ? L.right : L.wrong}
                  {" — "}{L.correct} {sub.answer === "○" ? "O" : sub.answer === "×" ? "X" : sub.answer}
                </Text>
                <Text style={styles.ansExplanation}>
                  {tx(sub.explanation, sub.explanationVi, lang)}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, position: "relative" },
  scrollContent: { flexGrow: 1 },
  container: { flex: 1 },
  emptyText: { color: "#fde68a", fontSize: 14 },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  progressBadge: {
    fontSize: 12,
    backgroundColor: "rgba(31, 26, 24, 0.02)",
    color: "rgba(22, 21, 21, 0.99)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chapterName: { fontSize: 15, color: "rgba(26, 109, 6, 0.93)" },
  questionCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    minHeight: 280,
  },
  questionInner: { flex: 1 },
  questionImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  questionImageInner: { width: "100%", height: 120, borderRadius: 8 },
  questionText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
    color: "#111",
    textAlign: "center",
    marginTop: 8,
  },
  ansCard: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(120,53,15,0.3)",
  },
  ansLabel: { fontSize: 14, fontWeight: "bold", color: "#111" },
  ansExplanation: {
    fontSize: 13,
    color: "#404040",
    marginTop: 6,
    lineHeight: 20,
  },
  ansToggle: {
    fontSize: 13,
    color: "#7f1d1d",
    textDecorationLine: "underline",
    textAlign: "center",
  },
  scenarioContainer: { flex: 1 },
  warningText: {
    fontSize: 12,
    color: "#be123c",
    fontWeight: "500",
    marginBottom: 6,
  },
  stemText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    marginBottom: 12,
  },
  subsList: { gap: 12 },
  subItem: {
    borderTopWidth: 2,
    borderTopColor: "rgba(120,53,15,0.3)",
    paddingTop: 10,
    marginBottom: 12,
  },
  subRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    marginBottom: 8,
  },
  subBtnsWrap: { marginTop: 10 },
  subImage: { width: 80, height: 64, borderRadius: 6 },
  subImageInner: { width: 80, height: 64, borderRadius: 6 },
  subText: { flex: 1, fontSize: 12, color: "#111", lineHeight: 18 },
});
