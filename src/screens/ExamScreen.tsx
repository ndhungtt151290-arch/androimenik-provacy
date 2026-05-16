import React, { useState, useCallback, useRef, useEffect } from "react";
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
import { MaruBatsuButtons } from "../components/MaruBatsuButtons";
import { ProgressIndicator } from "../components/ProgressIndicator";
import { TimerDisplay } from "../components/TimerDisplay";
import { BackHomeButton } from "../components/BackHomeButton";
import { ArrowLeft, QuestionMark } from "../components/Icons";
import { PILL } from "../theme/buttonTokens";
import type { ExamItem, Lang, MaruBatsu, QuestionBank } from "../types";

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

  const answeredCount = paper.filter((item) => {
    if (item.type === "simple") return simpleAns[item.question.id] !== undefined;
    const gAns = scenarioAns[item.group.groupId];
    if (!gAns) return false;
    return item.group.subs.every((s) => gAns[s.partId] !== undefined);
  }).length;

  const getItemFlagId = (item: ExamItem): string =>
    item.type === "simple" ? `s-${item.question.id}` : `g-${item.group.groupId}`;

  const currentFlagId = getItemFlagId(currentItem);
  const isCurrentFlagged = flags.has(currentFlagId);

  const L = {
    submit: lang === "vi" ? "Nộp bài" : "答案を提出",
    prev: lang === "vi" ? "Trước" : "前へ",
    next: lang === "vi" ? "Sau" : "次へ",
    flag: lang === "vi" ? "Phân vân" : "迷い",
    unflag: lang === "vi" ? "Bỏ phân vân" : "迷いを解除",
    progress: lang === "vi" ? "Tiến trình" : "進捗",
  };

  return (
    <View style={styles.screenContainer}>
      <BackHomeButton onPress={onBack} lang={lang} variant="home" />
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
          <TouchableOpacity onPress={onSubmit} style={styles.submitBtn} activeOpacity={0.8}>
            <Text style={styles.submitText}>{L.submit}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Question card */}
      <View style={styles.questionCard}>
        {/* Card header */}
        <View style={styles.cardHeader}>
          <View style={styles.partInfo}>
            {currentItem.type !== "simple" && (
              <></>
            )}
          </View>

          <TouchableOpacity onPress={onToggleFlag} style={[styles.flagBtn, isCurrentFlagged && styles.flagBtnActive]}>
            <Text style={[styles.flagBtnText, isCurrentFlagged && styles.flagBtnTextActive]}>{isCurrentFlagged ? L.unflag : L.flag}</Text>
          </TouchableOpacity>
        </View>

        {/* Question content */}
        <ScrollView style={styles.questionContent} nestedScrollEnabled>
          {currentItem.type === "simple" && (
            <View>
              {currentItem.question.image && (
                <IllustrationImage
                  file={currentItem.question.image}
                  style={styles.examImage}
                  imageStyle={styles.examImageInner}
                />
              )}
              <Text style={styles.questionText}>
                {tx(currentItem.question.text, currentItem.question.textVi, lang)}
              </Text>
            </View>
          )}

          {currentItem.type === "scenario" && (
            <View>
              <Text style={styles.stemText}>
                {tx(currentItem.group.stem, currentItem.group.stemVi, lang)}
              </Text>
              {currentItem.group.subs.map((sub) => (
                <View key={sub.partId} style={styles.subItem}>
                  <View style={styles.subRow}>
                    <IllustrationImage
                      file={sub.image}
                      style={styles.subImage}
                      imageStyle={styles.subImageInner}
                    />
                    <Text style={styles.subText}>
                      【{sub.subKey}】{tx(sub.text, sub.textVi, lang)}
                    </Text>
                  </View>
                  <View style={styles.subBtnsWrap}>
                    <MaruBatsuButtons
                      value={scenarioAns[currentItem.group.groupId]?.[sub.partId]}
                      onPick={(v) => onAnswerScenario(currentItem.group.groupId, sub.partId, v)}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Answer + Navigation */}
      {currentItem.type === "simple" && (
        <AnswerNavButtons
          answerValue={simpleAns[currentItem.question.id]}
          onPick={(v) => onAnswer("simple", currentItem.question.id, v)}
          size="large"
          disabledPrev={examIndex === 0}
          disabledNext={examIndex >= total - 1}
          onPrev={() => onJump(Math.max(0, examIndex - 1))}
          onNext={() => onJump(Math.min(total - 1, examIndex + 1))}
          prevLabel={L.prev}
          nextLabel={L.next}
        />
      )}

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
                <Text style={styles.drawerTitle}>{L.progress || "Tiến trình"}</Text>
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
                    const id = item.type === "simple"
                      ? `s-${item.question.id}`
                      : `g-${item.group.groupId}`;
                    const answered = item.type === "simple"
                      ? simpleAns[item.question.id] !== undefined
                      : (scenarioAns[item.group.groupId] != null &&
                         item.group.subs.every(s => scenarioAns[item.group.groupId]?.[s.partId] !== undefined));
                    const isFlagged = flags.has(id);
                    const isCurrent = i === examIndex;
                    return (
                      <TouchableOpacity
                        key={id}
                        onPress={() => { onJump(i); setDrawerOpen(false); }}
                        style={[
                          styles.drawerGridBtn,
                          isCurrent && styles.drawerGridBtnCurrent,
                          answered && styles.drawerGridBtnAnswered,
                          !answered && styles.drawerGridBtnUnanswered,
                          isFlagged && styles.drawerGridBtnFlagged,
                        ]}
                      >
                        <Text style={styles.drawerGridBtnText}>{i + 1}</Text>
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
    // Progress stays on the left
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
    // Pushes submit button to the right
  },
  progressContainer: { flex: 1, minWidth: 80 },
  progressBar: { height: 8, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "rgba(39, 34, 34, 0.9)", borderRadius: 4 },
  progressText: { fontSize: 11, color: "rgba(27, 27, 27, 0.9)", textAlign: "right", marginTop: 2 },
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
  questionText: { fontSize: 14, lineHeight: 22, fontWeight: "500", color: "#111", textAlign: "center" },
  stemText: { fontSize: 14, fontWeight: "600", color: "#111", marginBottom: 12 },
  subItem: { borderTopWidth: 2, borderTopColor: "rgba(120,53,15,0.3)", paddingTop: 10, marginBottom: 12 },
  subRow: { flexDirection: "row", gap: 8, alignItems: "flex-start", marginBottom: 8 },
  subText: { flex: 1, fontSize: 12, color: "#111", lineHeight: 18 },
  subBtnsWrap: { marginTop: 8 },
  examImage: { width: "100%", height: 120, borderRadius: 8, marginBottom: 12 },
  examImageInner: { width: "100%", height: 120, borderRadius: 8 },
  subImage: { width: 80, height: 64, borderRadius: 6 },
  subImageInner: { width: 80, height: 64, borderRadius: 6 },
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
    left: 0,
    height: 480, 
    width: "52%",
    zIndex: 999,
    backgroundColor: "rgb(255, 255, 255)",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 0,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 15,
    paddingHorizontal: 14,
    paddingBottom: 20,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  drawerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  drawerClose: {
    fontSize: 18,
    color: "#666",
    padding: 4,
  },
  drawerProgressBar: {
    height: 8,
    backgroundColor: "#e5e5e5",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 15,
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
    marginBottom: 10 ,
  },
  drawerGridBtn: {
    width: 25,
    height: 25,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  drawerGridBtnCurrent: {
    borderWidth: 2.5,
    borderColor: "#fbbf24",
    transform: [{ scale: 1.12 }],
  },
  drawerGridBtnAnswered: { backgroundColor: "#059669" },
  drawerGridBtnUnanswered: { backgroundColor: "#c4c4c4" },
  drawerGridBtnFlagged: { borderWidth: 2, borderColor: "#d97706" },
  drawerGridBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  flagDot: {
    position: "absolute",
    top: -3,
    right: -3,
    fontSize: 6,
    color: "#000",
  },
});
