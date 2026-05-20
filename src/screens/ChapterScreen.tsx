import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IllustrationImage } from "../components/IllustrationImage";
import { AdBanner } from "../components/AdBanner";
import { AnswerNavButtons } from "../components/AnswerNavButtons";
import { BackHomeButton } from "../components/BackHomeButton";
import { showInterstitialChapter } from "../utils/AdManager";
import { questionsForChapter } from "../lib/exam";
import { CHAPTER_VI } from "../lib/chapters";
import { savePracticeProgress, loadPracticeProgress, addWrongAnswers } from "../lib/storage";
import type { Lang, MaruBatsu, QuestionBank, ScenarioGroup, ScenarioSub } from "../types";

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

// Types for flattened items
type SimpleItem = { kind: "simple"; q: { id: string; text: string; textVi?: string | null; answer: MaruBatsu; explanation: string; explanationVi?: string | null; image?: string }; idx: number };
type ScenarioSubItem = { kind: "scenario"; sub: ScenarioSub; group: ScenarioGroup; idx: number; subIndex: number };

export function ChapterScreen({ lang, chapterId, onBack }: ChapterScreenProps) {
  const insets = useSafeAreaInsets();
  const { simple, scenarios } = useMemo(
    () => questionsForChapter(bank, [chapterId]),
    [chapterId]
  );

  // Flatten: simple questions + scenario sub-questions
  const flat: (SimpleItem | ScenarioSubItem)[] = [];

  // Add simple questions
  simple.forEach((q, i) => {
    flat.push({ kind: "simple", q, idx: flat.length });
  });

  // Add scenario sub-questions (flattened)
  scenarios.forEach((g) => {
    g.subs.forEach((sub, subIndex) => {
      flat.push({ kind: "scenario", sub, group: g, idx: flat.length, subIndex });
    });
  });

  const [currentIdx, setCurrentIdx] = useState(0);
  const [ans, setAns] = useState<Record<string, MaruBatsu | undefined>>({});
  const [show, setShow] = useState<Record<string, boolean>>({});

  const total = flat.length;
  const currentItem = flat[currentIdx];

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!currentItem) return;
    const key = currentItem.kind === "simple"
      ? currentItem.q.id
      : `${currentItem.group.groupId}_${currentItem.subIndex}`;
    if (ans[key] === undefined) return;
    setShow((s) => ({ ...s, [key]: true }));
  }, [ans, currentIdx]);

  // Save progress whenever ans changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const answeredIds = Object.keys(ans).filter((id) => ans[id] !== undefined);
    savePracticeProgress(chapterId, answeredIds);
  }, [ans, chapterId]);

  if (total === 0) {
    return (
      <View style={styles.container}>
        <BackHomeButton onPress={() => showInterstitialChapter(onBack)} />
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
    scenarioHint: lang === "vi" ? "Câu hỏi tình huống" : "イラスト問題",
  };

  // Get answer for current question
  const getCurrentAnswer = (): MaruBatsu | undefined => {
    if (currentItem.kind === "simple") {
      return ans[currentItem.q.id];
    }
    return ans[`${currentItem.group.groupId}_${currentItem.subIndex}`];
  };

  // Handle answer
  const handleAnswer = async (v: MaruBatsu) => {
    let key: string;
    let isWrong = false;

    if (currentItem.kind === "simple") {
      key = currentItem.q.id;
      isWrong = v !== currentItem.q.answer;
      setAns((a) => ({ ...a, [key]: v }));
    } else {
      key = `${currentItem.group.groupId}_${currentItem.subIndex}`;
      isWrong = v !== currentItem.sub.answer;
      setAns((a) => ({ ...a, [key]: v }));
    }

    // Record wrong answer after state update
    if (isWrong) {
      await new Promise<void>((resolve) => {
        setAns((prev) => {
          const qId = currentItem.kind === "simple"
            ? currentItem.q.id
            : `${currentItem.group.groupId}_${currentItem.subIndex}`;
          addWrongAnswers([qId]).then(resolve).catch(resolve);
          return prev;
        });
      });
    }
  };

  // Navigate to prev/next
  const goPrev = () => setCurrentIdx(Math.max(0, currentIdx - 1));
  const goNext = () => setCurrentIdx(Math.min(total - 1, currentIdx + 1));

  const isScenario = currentItem.kind === "scenario";
  const currentAnswer = getCurrentAnswer();
  const isCorrect = currentAnswer === (currentItem.kind === "simple" ? currentItem.q.answer : currentItem.sub.answer);

  return (
    <View style={styles.screenContainer}>
      <BackHomeButton onPress={() => showInterstitialChapter(onBack)} />
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
              ? `Câu ${currentIdx + 1}/${total}`
              : `${currentIdx + 1}/${total}問`}
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
          {isScenario && (
            <View style={styles.scenarioHintBadge}>
              <Text style={styles.scenarioHintText}>{L.scenarioHint}</Text>
            </View>
          )}

          {/* Stem for scenario questions */}
          {isScenario && (
            <Text style={styles.stemText}>
              {tx(currentItem.group.stem, currentItem.group.stemVi, lang)}
            </Text>
          )}

          {/* Image */}
          {currentItem.kind === "simple" && currentItem.q.image && (
            <IllustrationImage
              file={currentItem.q.image}
              style={styles.questionImage}
              imageStyle={styles.questionImageInner}
            />
          )}
          {isScenario && currentItem.sub.image && (
            <IllustrationImage
              file={currentItem.sub.image}
              style={styles.questionImage}
              imageStyle={styles.questionImageInner}
            />
          )}

          {/* Question text */}
          <Text style={currentItem.kind === "scenario" ? styles.scenarioQuestionText : styles.questionText}>
            {currentItem.kind === "scenario" ? `(${currentItem.subIndex + 1}) ` : ''}
            {currentItem.kind === "simple"
              ? tx(currentItem.q.text, currentItem.q.textVi, lang)
              : tx(currentItem.sub.text, currentItem.sub.textVi, lang)}
          </Text>

          {/* Answer + Explanation */}
          {currentAnswer && (
            <View style={styles.ansCard}>
              <Text style={styles.ansLabel}>
                {isCorrect ? L.right : L.wrong}
                {" — "}{L.correct}{" "}
                {(currentItem.kind === "simple"
                  ? currentItem.q.answer
                  : currentItem.sub.answer) === "○"
                    ? "O"
                    : "X"}
              </Text>
              <Text style={styles.ansExplanation}>
                {currentItem.kind === "simple"
                  ? tx(currentItem.q.explanation, currentItem.q.explanationVi, lang)
                  : tx(currentItem.sub.explanation, currentItem.sub.explanationVi, lang)}
              </Text>
            </View>
          )}
        </View>

        {/* Answer buttons + Navigation */}
        <View style={styles.subBtnsWrap}>
          <AnswerNavButtons
            answerValue={currentAnswer}
            onPick={handleAnswer}
            size="large"
            disabledPrev={currentIdx === 0}
            disabledNext={currentIdx >= total - 1}
            onPrev={goPrev}
            onNext={goNext}
            prevLabel={L.prev}
            nextLabel={L.next}
          />
        </View>
      </ScrollView>

      {/* Ad Banner */}
      <AdBanner />
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
  scenarioHintBadge: {
    backgroundColor: "rgba(129, 124, 124, 0.13)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  scenarioHintText: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(16, 56, 6, 0.9)",
  },
  stemText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111",
    marginBottom: 12,
    textAlign: "center",
    numberOfLines: 3,
    minimumFontScale: 0.8,
    includeFontPadding: false,
  },
  questionImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  questionImageInner: { width: "100%", height: 120, borderRadius: 8 },
  questionText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500",
    color: "#111",
    textAlign: "center",
    marginTop: 8,
  },
  scenarioQuestionText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
    color: "#111",
    textAlign: "center",
    marginTop: 8,
    adjustsFontSizeToFit: true,
    numberOfLines: 4,
    minimumFontScale: 0.75,
    includeFontPadding: false,
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
  subBtnsWrap: { marginTop: 10 },
});
