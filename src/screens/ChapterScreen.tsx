import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IllustrationImage } from "../components/IllustrationImage";
import { AdBanner } from "../components/AdBanner";
import { AnswerNavButtons } from "../components/AnswerNavButtons";
import { showInterstitialChapter } from "../utils/AdManager";
import { questionsForChapter } from "../lib/exam";
import { CHAPTER_VI } from "../lib/chapters";
import { savePracticeProgress, loadPracticeProgress } from "../lib/storage";
import { SoundManager } from "../lib/SoundManager";
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
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const mainScrollViewRef = useRef<ScrollView>(null);

  const total = flat.length;
  const currentItem = flat[currentIdx];

  // Helper function để lấy đáp án đúng của một câu
  const getCorrectAnswer = (item: SimpleItem | ScenarioSubItem): MaruBatsu => {
    return item.kind === "simple" ? item.q.answer : item.sub.answer;
  };

  // Helper function để lấy key của một câu
  const getItemKey = (item: SimpleItem | ScenarioSubItem): string => {
    return item.kind === "simple" ? item.q.id : `${item.group.groupId}_${item.subIndex}`;
  };

  // Tính số câu đã trả lời ĐÚNG và phần trăm tiến trình
  const correctCount = flat.filter((item) => {
    const key = getItemKey(item);
    const userAnswer = ans[key];
    if (userAnswer === undefined) return false;
    return userAnswer === getCorrectAnswer(item);
  }).length;
  const progressPercent = total > 0 ? (correctCount / total) * 100 : 0;

  // Load saved practice progress on mount
  useEffect(() => {
    loadPracticeProgress().then((all) => {
      const savedAnswers = all[chapterId];
      if (savedAnswers) {
        setAns(savedAnswers);
      }
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
    savePracticeProgress(chapterId, ans);
  }, [ans, chapterId]);

  if (total === 0) {
    return (
      <View style={styles.container}>
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
    progress: lang === "vi" ? "Tiến trình" : "進捗",
    close: lang === "vi" ? "Đóng" : "閉じる",
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

    if (currentItem.kind === "simple") {
      key = currentItem.q.id;
      setAns((a) => ({ ...a, [key]: v }));
    } else {
      key = `${currentItem.group.groupId}_${currentItem.subIndex}`;
      setAns((a) => ({ ...a, [key]: v }));
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
      <ScrollView
        ref={mainScrollViewRef}
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(100, insets.bottom + 16) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressRow}>
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
            <TouchableOpacity
              onPress={() => setProgressModalVisible(true)}
              style={styles.progressTextBtn}
            >
              <Text style={styles.progressText}>
                {currentIdx + 1}/{total}
              </Text>
            </TouchableOpacity>
          </View>
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
            isExamMode={false}
            correctAnswer={currentItem.kind === "simple" ? currentItem.q.answer : currentItem.sub.answer}
          />
        </View>
      </ScrollView>

      {/* Ad Banner */}
      <AdBanner />

      {/* Progress Modal */}
      <Modal
        visible={progressModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProgressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{L.progress}</Text>
              <TouchableOpacity
                onPress={() => setProgressModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Progress Bar */}
            <View style={styles.modalProgressBarContainer}>
              <View style={styles.modalProgressBarBg}>
                <View style={[styles.modalProgressBarFill, { width: `${progressPercent}%` }]} />
              </View>
              <Text style={styles.modalProgressText}>
                {correctCount}/{total}
              </Text>
            </View>

            {/* Questions Grid */}
            <ScrollView style={styles.modalGridContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.modalGrid}>
                {flat.map((item, i) => {
                  const key = item.kind === "simple"
                    ? item.q.id
                    : `${item.group.groupId}_${item.subIndex}`;
                  const answered = ans[key] !== undefined;
                  const correctAnswer = item.kind === "simple" ? item.q.answer : item.sub.answer;
                  const isCorrect = answered && ans[key] === correctAnswer;
                  const isWrong = answered && ans[key] !== correctAnswer;
                  const isCurrent = i === currentIdx;
                  return (
                    <TouchableOpacity
                      key={key + i}
                      onPress={() => {
                        setCurrentIdx(i);
                        setProgressModalVisible(false);
                        mainScrollViewRef.current?.scrollTo({ y: 0, animated: true });
                      }}
                      style={[
                        styles.modalGridBtn,
                        isCurrent && styles.modalGridBtnCurrent,
                        isCorrect && styles.modalGridBtnCorrect,
                        isWrong && styles.modalGridBtnWrong,
                        !answered && styles.modalGridBtnUnanswered,
                      ]}
                    >
                      <Text style={styles.modalGridBtnText}>{i + 1}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setProgressModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseButtonText}>{L.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, position: "relative" },
  scrollContent: { flexGrow: 1 },
  container: { flex: 1 },
  emptyText: { color: "#fde68a", fontSize: 14 },
  progressRow: {
    marginBottom: 12,
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#059669",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(237, 239, 245, 0.86)",
    minWidth: 40,
    textAlign: "center",
  },
  progressTextBtn: {
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgb(72, 161, 12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(224, 224, 224, 0.14)",
    shadowColor: "rgba(10, 10, 10, 0.86)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.9,
    shadowRadius: 2,
    elevation: 2,
  },
  questionCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(197, 188, 188, 0.1)",
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
  },
  ansCard: {
    padding: 2,
    marginTop: 5,
    backgroundColor: "transparent",
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

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 18,
    color: "#666",
  },
  modalProgressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  modalProgressBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: "#e5e5e5",
    borderRadius: 5,
    overflow: "hidden",
  },
  modalProgressBarFill: {
    height: "100%",
    backgroundColor: "#059669",
    borderRadius: 5,
  },
  modalProgressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    minWidth: 45,
    textAlign: "right",
  },
  modalGridContainer: {
    maxHeight: 300,
    marginBottom: 16,
    paddingHorizontal: 4,
    paddingTop: 6,
  },
  modalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  modalGridBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  modalGridBtnCurrent: {
    borderWidth: 2,
    borderColor: "rgba(92, 92, 92, 0.94)",
    transform: [{ scale: 1.1 }],
  },
  modalGridBtnAnswered: {
    backgroundColor: "rgb(70, 158, 12)",
  },
  modalGridBtnCorrect: {
    backgroundColor: "rgb(31, 160, 19)",
  },
  modalGridBtnWrong: {
    backgroundColor: "rgb(239, 68, 68)",
  },
  modalGridBtnUnanswered: {
    backgroundColor: "rgb(192, 195, 212)",
  },
  modalGridBtnText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
  modalCloseButton: {
    backgroundColor: "rgba(197, 197, 197, 0.25)",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalCloseButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "rgb(9, 40, 107)",
  },
});
