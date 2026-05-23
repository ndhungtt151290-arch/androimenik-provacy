import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IllustrationImage } from "../components/IllustrationImage";
import { AdBanner } from "../components/AdBanner";
import { AnswerNavButtons } from "../components/AnswerNavButtons";
import { ProgressIndicator } from "../components/ProgressIndicator";
import { TimerDisplay } from "../components/TimerDisplay";
import { SoundManager } from "../lib/SoundManager";
import type { ExamItem, ExamSimpleItem, Lang, MaruBatsu, QuestionBank } from "../types";

const bank: QuestionBank = require("../data/questions").default;

interface ExamScreenProps {
  lang: Lang;
  paper: ExamItem[];
  simpleAns: Record<string, MaruBatsu | undefined>;
  scenarioAns: Record<string, Record<string, MaruBatsu | undefined>>;
  timeLeft: number;
  onAnswer: (type: "simple", id: string, v: MaruBatsu) => void;
  onAnswerScenario: (gid: string, partId: string, v: MaruBatsu) => void;
  onJump: (index: number) => void;
  flags: Set<string>;
  onToggleFlag: () => void;
  onSubmit: () => void;
  onBack: () => void;
  examIndex: number;
}

function tx<T extends string | null | undefined>(jp: T, vi: T, lang: Lang): string {
  if (lang === "vi" && vi) return vi;
  if (jp) return jp;
  return "";
}

function isSimpleItem(item: ExamItem): item is ExamSimpleItem {
  return item.type === "simple";
}

function isScenarioSubItem(item: ExamItem): item is ExamSimpleItem & { scenarioGroupId: string } {
  return item.type === "simple" && !!(item as any).scenarioGroupId;
}

export function ExamScreen({
  lang,
  paper,
  simpleAns,
  scenarioAns,
  timeLeft,
  onAnswer,
  onAnswerScenario,
  onJump,
  flags,
  onToggleFlag,
  onSubmit,
  onBack,
  examIndex,
}: ExamScreenProps) {
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const SCREEN_WIDTH = Dimensions.get("window").width;
  const drawerAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.52)).current;

  useEffect(() => {
    Animated.timing(drawerAnim, {
      toValue: drawerOpen ? 0 : -SCREEN_WIDTH * 0.52,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [drawerOpen]);

  const currentItem = paper[examIndex];
  const total = paper.length;

  // Count answered questions - only count simple items that have .question
  const answeredCount = paper.filter((item) => {
    if (isSimpleItem(item)) {
      return simpleAns[item.question.id] !== undefined;
    }
    return false;
  }).length;

  // Count unique scenario groups in paper
  const scenarioGroupIds = new Set<string>();
  for (const item of paper) {
    if (isScenarioSubItem(item)) {
      scenarioGroupIds.add(item.scenarioGroupId);
    }
  }
  const scenarioGroupCount = scenarioGroupIds.size;
  const simpleQuestionCount = paper.length - scenarioGroupCount * 3;
  const displayTotal = simpleQuestionCount + scenarioGroupCount;

  // Calculate display current number (scenario-based, not item-based)
  const getDisplayCurrent = (item: ExamItem, index: number): number => {
    if (isScenarioSubItem(item)) {
      // Count simple questions before this item
      let simpleCount = 0;
      for (let j = 0; j < index; j++) {
        if (!isScenarioSubItem(paper[j])) {
          simpleCount++;
        }
      }
      // Count scenario groups up to and including this item
      const seenGroups = new Set<string>();
      let scenarioCount = 0;
      for (let j = 0; j <= index; j++) {
        if (isScenarioSubItem(paper[j])) {
          const gid = (paper[j] as any).scenarioGroupId;
          if (!seenGroups.has(gid)) {
            seenGroups.add(gid);
            scenarioCount++;
          }
        }
      }
      return simpleCount + scenarioCount;
    }
    // Regular simple question
    let simpleCount = 0;
    for (let j = 0; j <= index; j++) {
      if (!isScenarioSubItem(paper[j])) {
        simpleCount++;
      }
    }
    return simpleCount;
  };
  const displayCurrent = getDisplayCurrent(currentItem, examIndex);

  // Calculate display numbers for drawer grid
  const getDisplayNumber = (item: ExamItem, index: number): string => {
    if (isScenarioSubItem(item)) {
      // Count simple questions before this item
      let simpleCount = 0;
      for (let j = 0; j < index; j++) {
        if (!isScenarioSubItem(paper[j])) {
          simpleCount++;
        }
      }
      // Count scenario groups up to and including this item
      const seenGroups = new Set<string>();
      let scenarioCount = 0;
      for (let j = 0; j <= index; j++) {
        if (isScenarioSubItem(paper[j])) {
          const gid = (paper[j] as any).scenarioGroupId;
          if (!seenGroups.has(gid)) {
            seenGroups.add(gid);
            scenarioCount++;
          }
        }
      }
      const scenarioBaseNum = simpleCount + scenarioCount;
      const subNum = (item.subIndex ?? 0) + 1;
      return `${scenarioBaseNum}-${subNum}`;
    }
    // Regular item: display as index + 1
    return String(index + 1);
  };

  const getItemFlagId = (item: ExamItem, index: number): string => {
    if (isScenarioSubItem(item)) {
      return `ss-${item.scenarioGroupId}`;
    }
    if (isSimpleItem(item)) {
      return `s-${item.question.id}`;
    }
    return `scenario-${index}`;
  };

  const currentFlagId = getItemFlagId(currentItem, examIndex);
  const isCurrentFlagged = flags.has(currentFlagId);

  const isScenarioSub = isScenarioSubItem(currentItem);
  const scenarioGroupId = isScenarioSub ? currentItem.scenarioGroupId : undefined;

  const L = {
    submit: lang === "vi" ? "Nộp bài" : "答案を提出",
    prev: lang === "vi" ? "Trước" : "前へ",
    next: lang === "vi" ? "Sau" : "次へ",
    flag: lang === "vi" ? "Phân vân" : "迷い",
    unflag: lang === "vi" ? "Bỏ phân vân" : "迷いを解除",
    progress: lang === "vi" ? "Tiến trình" : "進捗",
    scenarioHint: lang === "vi" ? "Câu hỏi tình huống" : "イラスト問題",
  };

  // Get answer value - for scenario sub, check scenarioAns by subIndex
  const getAnswerValue = (): MaruBatsu | undefined => {
    if (!isSimpleItem(currentItem)) return undefined;
    return simpleAns[currentItem.question.id];
  };

  // Handle answer
  const handleAnswer = useCallback((v: MaruBatsu) => {
    if (!isSimpleItem(currentItem)) return;
    if (isScenarioSub && scenarioGroupId) {
      // For scenario sub, also store in scenarioAns format for backward compatibility
      const subIndex = currentItem.subIndex ?? 0;
      onAnswerScenario(scenarioGroupId, `${subIndex}`, v);
    }
    onAnswer("simple", currentItem.question.id, v);
  }, [currentItem, isScenarioSub, scenarioGroupId, onAnswer, onAnswerScenario]);

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
        {/* Header */}
        <View style={styles.header}>
          {/* Left - Progress Indicator */}
          <View style={styles.headerLeft}>
            <ProgressIndicator
              total={total}
              current={examIndex}
              displayTotal={displayTotal}
              displayCurrent={displayCurrent}
              onToggleExpand={() => setDrawerOpen(!drawerOpen)}
              lang={lang}
            />
          </View>

          {/* Center - Timer (absolute positioned) */}
          <View style={styles.headerCenter}>
            <TimerDisplay timeLeft={timeLeft} />
          </View>

          {/* Right - Submit Button */}
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => { SoundManager.playTapClick(); onSubmit(); }} style={styles.submitBtn} activeOpacity={0.8}>
              <Text style={styles.submitText}>{L.submit}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Question card */}
        <View style={styles.questionCard}>
          {/* Card header */}
          <View style={styles.cardHeader}>
            <View style={styles.partInfo}>
              {isScenarioSub && (
                <View style={styles.scenarioHintBadge}>
                  <Text style={styles.scenarioHintText}>{L.scenarioHint}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity onPress={onToggleFlag} style={[styles.flagBtn, isCurrentFlagged && styles.flagBtnActive]}>
              <Text style={[styles.flagBtnText, isCurrentFlagged && styles.flagBtnTextActive]}>{isCurrentFlagged ? L.unflag : L.flag}</Text>
            </TouchableOpacity>
          </View>

          {/* Question content */}
          <ScrollView style={styles.questionContent} nestedScrollEnabled>
            <View>
              {/* Show stem for scenario sub questions (ExamSimpleItem with scenarioGroupId) */}
              {isScenarioSub && isSimpleItem(currentItem) && currentItem.stem && (
                <Text style={styles.stemText}>
                  {tx(currentItem.stem, currentItem.stemVi, lang)}
                </Text>
              )}

              {/* Show image for scenario sub questions (using the question's image) */}
              {isScenarioSub && isSimpleItem(currentItem) && currentItem.question.image && (
                <IllustrationImage
                  file={currentItem.question.image}
                  style={styles.examImage}
                  imageStyle={styles.examImageInner}
                />
              )}

              {/* Show regular question image */}
              {!isScenarioSub && isSimpleItem(currentItem) && currentItem.question.image && (
                <IllustrationImage
                  file={currentItem.question.image}
                  style={styles.examImage}
                  imageStyle={styles.examImageInner}
                />
              )}

              {/* Question text - only for simple items */}
              {isSimpleItem(currentItem) && (
                <Text style={isScenarioSub ? styles.scenarioQuestionText : styles.questionText}>
                  {isScenarioSub ? `(${currentItem.subIndex! + 1}) ` : ''}
                  {tx(currentItem.question.text, currentItem.question.textVi, lang)}
                </Text>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Answer + Navigation - Show for ALL questions */}
        <AnswerNavButtons
          answerValue={getAnswerValue()}
          onPick={handleAnswer}
          size="large"
          disabledPrev={examIndex === 0}
          disabledNext={examIndex >= total - 1}
          onPrev={() => onJump(Math.max(0, examIndex - 1))}
          onNext={() => onJump(Math.min(total - 1, examIndex + 1))}
          prevLabel={L.prev}
          nextLabel={L.next}
          isExamMode={true}
        />

      </ScrollView>

      {/* Ad Banner */}
      <AdBanner />

      {/* Drawer Overlay */}
      {drawerOpen && (
        <>
          <TouchableOpacity
            style={styles.drawerBackdrop}
            activeOpacity={1}
            onPress={() => setDrawerOpen(false)}
          />
          <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: drawerAnim }] }]}>
            <View style={styles.drawerContent}>
              <View style={styles.drawerHeader}>
                <Text style={styles.drawerTitle}>{L.progress}</Text>
                <TouchableOpacity onPress={() => setDrawerOpen(false)}>
                  <Text style={styles.drawerClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.drawerProgressBar}>
                <View style={[styles.drawerProgressFill, { width: `${(answeredCount / total) * 100}%` }]} />
              </View>
              <ScrollView showsVerticalScrollIndicator>
                <View style={styles.drawerGrid}>
                  {paper.map((item, i) => {
                    const id = getItemFlagId(item, i);
                    const isSimple = isSimpleItem(item);
                    const answered = isSimple ? simpleAns[item.question.id] !== undefined : false;
                    const isFlagged = flags.has(id);
                    const isCurrent = i === examIndex;
                    const isSubQuestion = isScenarioSubItem(item);
                    const displayNumber = getDisplayNumber(item, i);
                    return (
                      <TouchableOpacity
                        key={id + "-" + i}
                        onPress={() => { onJump(i); setDrawerOpen(false); }}
                        style={[
                          styles.drawerGridBtn,
                          isCurrent && styles.drawerGridBtnCurrent,
                          answered && styles.drawerGridBtnAnswered,
                          !answered && styles.drawerGridBtnUnanswered,
                          isFlagged && styles.drawerGridBtnFlagged,
                        ]}
                      >
                        <Text style={styles.drawerGridBtnText}>{displayNumber}</Text>
                        {isFlagged && <Text style={styles.flagDot}>●</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, position: "relative" },
  scrollContent: { flexGrow: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    minHeight: 40,
  },
  headerLeft: {
    marginLeft: 9
  },
  headerCenter: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -36 }],
    alignItems: "center",
    zIndex: 1,
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
    marginRight:7,
  },
  progressContainer: { flex: 1, minWidth: 80 },
  submitBtn: {
    backgroundColor: "rgba(10, 41, 128, 0.86)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth:0.6,
    borderColor: "rgba(17, 5, 26, 0.14)",
    shadowOffset: { width:0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
    opacity: 0.8,
  },
  submitText: { fontSize: 14, fontWeight: "bold", color: "#fff" },
  questionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.51)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(226, 228, 231, 0.03)",
    minHeight: 280,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  partInfo: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap", flex: 1 },
  scenarioHintBadge: {
    backgroundColor: "rgba(153, 153, 153, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scenarioHintText: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgb(15, 10, 78)",
  },
  flagBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: "rgb(248, 245, 244)",
    borderColor: "rgba(231, 228, 227, 0.6)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  flagBtnActive: { backgroundColor: "rgb(247, 164, 12)", borderColor: "rgba(201, 196, 192, 0.25)", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2},
  flagBtnText: { fontSize: 10, fontWeight: "600", color: "rgba(15, 15, 15, 0.89)" },
  flagBtnTextActive: { color: "rgba(37, 28, 25, 0.89)" },
  questionContent: { maxHeight: 220 },
  questionText: { fontSize: 16, lineHeight: 18, fontWeight: "500", color: "#111", textAlign: "center" } as any,
  scenarioQuestionText: { fontSize: 14, lineHeight: 18, fontWeight: "500", color: "#111", textAlign: "center", adjustsFontSizeToFit: true, numberOfLines: 4, minimumFontScale: 0.75 } as any,
  stemText: { fontSize: 12, fontWeight: "600", color: "#111", marginBottom: 12, adjustsFontSizeToFit: true, numberOfLines: 3, minimumFontScale: 0.8 ,textAlign: "center"} as any,
  examImage: { width: "100%", height: 120, borderRadius: 8, marginBottom: 12 },
  examImageInner: { width: "100%", height: 120, borderRadius: 8 },
  // Drawer overlay
  drawerBackdrop: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0)",
    zIndex: 998,
  },
  drawerContainer: {
    position: "absolute",
    top: 0,
    left:-15,
    height: 420,
    width: "80%",
    marginTop: 95,
    zIndex: 999,
    backgroundColor: "rgb(255, 255, 255)",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 25,
    paddingLeft: 25,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 35,
  },
  drawerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "rgba(10, 23, 61, 0.86)",
  },
  drawerClose: {
    fontSize: 14,
    color: "#666",
    padding: 4,
  },
  drawerProgressBar: {
    height: 5,
    backgroundColor: "#e5e5e5",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 30,
    marginTop: -25,
  },
  drawerProgressFill: {
    height: "100%",
    backgroundColor: "#059669",
    borderRadius: 3,
  },
  drawerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 26 ,
    justifyContent: "flex-start",
  },
  drawerGridBtn: {
    width: "12%",
    height: 30,
    borderRadius: 8,
    marginLeft : 1.5,
    marginTop : 1.5,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  drawerGridBtnCurrent: {
    borderWidth: 1.9,
    borderColor: "rgba(18, 52, 146, 0.69)",
    transform: [{ scale: 1.12 }],
  },
  drawerGridBtnAnswered: { backgroundColor: "rgb(17, 54, 156)"},
  drawerGridBtnUnanswered: { backgroundColor: "rgb(192, 195, 212)"},
  drawerGridBtnFlagged: { borderWidth: 2, borderColor:"rgb(255, 255, 255)"},
  drawerGridBtnText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
  flagDot: {
    position: "absolute",
    top: -3,
    right: -3,
    fontSize: 10,
    color: "rgb(230, 118, 13)",
  },
});
