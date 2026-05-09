import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IllustrationImage } from "../components/IllustrationImage";
import { AnswerNavButtons } from "../components/AnswerNavButtons";
import { MaruBatsuButtons } from "../components/MaruBatsuButtons";
import { ProgressIndicator } from "../components/ProgressIndicator";
import { TimerDisplay } from "../components/TimerDisplay";
import { ArrowLeft, QuestionMark } from "../components/Icons";
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
  const [expanded, setExpanded] = useState(false);

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
    part2: lang === "vi" ? "Phần 2 · Hình ảnh" : "第2部 · イラスト",
    part2Sub: lang === "vi" ? "Cả 3 ý đúng → 2 điểm" : "3問すべて正解 → 2点",
    part2Warning: lang === "vi"
      ? "Phải trả lời đúng TẤT CẢ 3 ý nhỏ mới được điểm."
      : "3題すべて正解で2点獲得。",
    flag: lang === "vi" ? "Phân vân" : "迷い",
    unflag: lang === "vi" ? "Bỏ phân vân" : "迷いを解除",
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
      >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>{lang === "vi" ? "← Trang chủ" : "← ホーム"}</Text>
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(answeredCount / total) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{examIndex + 1}/{total}</Text>
        </View>

        <TimerDisplay timeLeft={timeLeft} />

        <TouchableOpacity onPress={onSubmit} style={styles.submitBtn} activeOpacity={0.8}>
          <Text style={styles.submitText}>{L.submit}</Text>
        </TouchableOpacity>
      </View>

      {/* Question list */}
      <ProgressIndicator
        total={total}
        current={examIndex}
        simpleAns={simpleAns}
        scenarioAns={scenarioAns}
        paper={paper}
        flags={flags}
        onJump={onJump}
        lang={lang}
        expanded={expanded}
        onToggleExpand={() => setExpanded(!expanded)}
      />

      {/* Question card */}
      <View style={styles.questionCard}>
        {/* Card header */}
        <View style={styles.cardHeader}>
          <View style={styles.partInfo}>
            {currentItem.type !== "simple" && (
              <>
                <Text style={styles.partLabelRose}>{L.part2}</Text>
                <View style={[styles.subBadge, { backgroundColor: "#ffe4e6" }]}>
                  <Text style={[styles.subBadgeText, { color: "#9f1239" }]}>{L.part2Sub}</Text>
                </View>
              </>
            )}
          </View>

          <TouchableOpacity onPress={onToggleFlag} style={[styles.flagBtn, isCurrentFlagged && styles.flagBtnActive]}>
            <QuestionMark size={12} />
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
              <Text style={styles.warningText}>⚠ {L.part2Warning}</Text>
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
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },
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
  backBtnText: { fontSize: 12, fontWeight: "bold", color: "#fff" },
  progressContainer: { flex: 1, minWidth: 80 },
  progressBar: { height: 8, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#059669", borderRadius: 4 },
  progressText: { fontSize: 11, color: "#fde68a", textAlign: "right", marginTop: 2 },
  submitBtn: {
    backgroundColor: "#be123c",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#f43f5e",
  },
  submitText: { fontSize: 12, fontWeight: "bold", color: "#fff" },
  questionCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    minHeight: 280,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  partInfo: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap", flex: 1 },
  partLabel: { fontSize: 12, fontWeight: "bold", color: "#7f1d1d" },
  partLabelRose: { fontSize: 12, fontWeight: "bold", color: "#9f1239" },
  subBadge: { backgroundColor: "#fee2e2", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
  subBadgeText: { fontSize: 10, fontWeight: "bold", color: "#7f1d1d" },
  flagBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: "rgba(120,53,15,0.4)",
    borderColor: "rgba(120,53,15,0.6)",
  },
  flagBtnActive: { backgroundColor: "#f59e0b", borderColor: "#d97706" },
  flagBtnText: { fontSize: 12, fontWeight: "600", color: "#fef3c7" },
  flagBtnTextActive: { color: "#1c1917" },
  questionContent: { maxHeight: 220 },
  questionText: { fontSize: 14, lineHeight: 22, fontWeight: "500", color: "#111", textAlign: "center" },
  warningText: { fontSize: 12, color: "#be123c", fontWeight: "500", marginBottom: 6 },
  stemText: { fontSize: 14, fontWeight: "600", color: "#111", marginBottom: 12 },
  subItem: { borderTopWidth: 2, borderTopColor: "rgba(120,53,15,0.3)", paddingTop: 10, marginBottom: 12 },
  subRow: { flexDirection: "row", gap: 8, alignItems: "flex-start", marginBottom: 8 },
  subText: { flex: 1, fontSize: 12, color: "#111", lineHeight: 18 },
  subBtnsWrap: { marginTop: 8 },
  examImage: { width: "100%", height: 120, borderRadius: 8, marginBottom: 12 },
  examImageInner: { width: "100%", height: 120, borderRadius: 8 },
  subImage: { width: 80, height: 64, borderRadius: 6 },
  subImageInner: { width: 80, height: 64, borderRadius: 6 },
});
