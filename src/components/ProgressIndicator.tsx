import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { FlagIcon } from "./Icons";
import type { ExamItem, Lang } from "../types";

interface ProgressIndicatorProps {
  total: number;
  current: number;
  simpleAns: Record<string, string | undefined>;
  scenarioAns: Record<string, Record<string, string | undefined>>;
  paper: ExamItem[];
  flags: Set<string>;
  onJump: (index: number) => void;
  lang: Lang;
  expanded: boolean;
  onToggleExpand: () => void;
}

function getQuestionId(item: ExamItem, index: number): string {
  if (item.type === "simple") return `s-${item.question.id}`;
  return `g-${item.group.groupId}`;
}

function isAnswered(
  item: ExamItem,
  simpleAns: Record<string, string | undefined>,
  scenarioAns: Record<string, Record<string, string | undefined>>
): boolean {
  if (item.type === "simple") {
    return simpleAns[item.question.id] !== undefined;
  }
  const gAns = scenarioAns[item.group.groupId];
  if (!gAns) return false;
  return item.group.subs.every((s) => gAns[s.partId] !== undefined);
}

export function ProgressIndicator({
  total,
  current,
  simpleAns,
  scenarioAns,
  paper,
  flags,
  onJump,
  lang,
  expanded,
  onToggleExpand,
}: ProgressIndicatorProps) {
  const answeredCount = paper.filter((item) =>
    isAnswered(item, simpleAns, scenarioAns)
  ).length;

  const L = {
    title: lang === "vi" ? "Tiến trình" : "進捗",
    answered: lang === "vi" ? "Đã trả lời" : "回答済み",
    flagged: lang === "vi" ? "Đánh dấu" : "ブックマーク",
    jump: lang === "vi" ? "Nhảy đến câu" : "の問題に移動",
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onToggleExpand} style={styles.header}>
        <Text style={styles.headerText}>
          {L.title}: {current + 1}/{total}
        </Text>
        <Text style={styles.arrow}>{expanded ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.panel}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(answeredCount / total) * 100}%` },
              ]}
            />
          </View>

          <View style={styles.grid}>
            {paper.map((item, i) => {
              const id = getQuestionId(item, i);
              const answered = isAnswered(item, simpleAns, scenarioAns);
              const isFlagged = flags.has(id);
              const isCurrent = i === current;

              return (
                <TouchableOpacity
                  key={id}
                  onPress={() => {
                    onJump(i);
                    onToggleExpand();
                  }}
                  style={[
                    styles.gridBtn,
                    isCurrent && styles.gridBtnCurrent,
                    answered && styles.gridBtnAnswered,
                    !answered && styles.gridBtnUnanswered,
                    isFlagged && styles.gridBtnFlagged,
                  ]}
                >
                  <Text style={styles.gridBtnText}>{i + 1}</Text>
                  {isFlagged && (
                    <Text style={styles.flagDot}>●</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(120,53,15,0.3)",
  },
  header: {
    alignSelf: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#78350f",
  },
  arrow: {
    fontSize: 10,
    color: "#78350f",
  },
  panel: {
    alignSelf: "flex-end",
    marginTop: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#d4d4d4",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#059669",
    borderRadius: 3,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  gridBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  gridBtnCurrent: {
    borderWidth: 2,
    borderColor: "#fbbf24",
    transform: [{ scale: 1.1 }],
  },
  gridBtnAnswered: {
    backgroundColor: "#059669",
  },
  gridBtnUnanswered: {
    backgroundColor: "#a3a3a3",
  },
  gridBtnFlagged: {
    borderWidth: 1.5,
    borderColor: "#d97706",
  },
  gridBtnText: {
    fontSize: 10,
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
