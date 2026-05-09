import React, { useMemo, useState } from "react";
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
import { QuestionMark, ArrowLeft } from "../components/Icons";
import { questionsForChapter } from "../lib/exam";
import { CHAPTER_VI } from "../lib/chapters";
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
  const [doubtful, setDoubtful] = useState<Set<string>>(new Set());

  const total = flat.length;
  const cur = flat[idx];

  if (total === 0) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backText}>{lang === "vi" ? "← Trang chủ" : "← ホーム"}</Text>
        </TouchableOpacity>
        <Text style={styles.emptyText}>
          {lang === "vi" ? "Chưa có dữ liệu cho chương này." : "この章のデータはまだありません。"}
        </Text>
      </View>
    );
  }

  const L = {
    prev: lang === "vi" ? "Trước" : "前へ",
    next: lang === "vi" ? "Sau" : "次へ",
    hideAns: lang === "vi" ? "Ẩn đáp án" : "答えを隠す",
    showAns: lang === "vi" ? "Xem đáp án & giải thích" : "答えと解説を見る",
    correct: lang === "vi" ? "Đúng:" : "正解：",
    flag: lang === "vi" ? "Phân vân" : "迷い",
    unflag: lang === "vi" ? "Bỏ phân vân" : "迷いを解除",
  };

  const currentId =
    cur.kind === "s" ? cur.q.id : cur.kind === "g" ? cur.g.groupId : "";

  const toggleDoubt = () => {
    setDoubtful((prev) => {
      const next = new Set(prev);
      if (next.has(currentId)) next.delete(currentId);
      else next.add(currentId);
      return next;
    });
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backText}>{lang === "vi" ? "← Trang chủ" : "← ホーム"}</Text>
        </TouchableOpacity>

        <View style={styles.progressRow}>
          <Text style={styles.progressBadge}>
            {lang === "vi" ? `Câu ${idx + 1}/${total}` : `${idx + 1}/${total}問`}
          </Text>
          <Text style={styles.chapterName}>
            {tx(CHAPTER_VI[chapterId] ?? chapterId, CHAPTER_VI[chapterId] ?? chapterId, lang)}
          </Text>
        </View>

        <View style={styles.questionCard}>
          {cur.kind === "s" && (
          <View style={styles.questionInner}>
            <View style={styles.flagRow}>
              <TouchableOpacity
                onPress={toggleDoubt}
                style={[styles.flagBtn, doubtful.has(currentId) ? styles.flagBtnActive : styles.flagBtnInactive]}
              >
                <QuestionMark size={12} />
                <Text style={[styles.flagBtnText, doubtful.has(currentId) ? styles.flagBtnTextActive : undefined]}>
                  {doubtful.has(currentId) ? L.unflag : L.flag}
                </Text>
              </TouchableOpacity>
            </View>

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
          </View>
        )}

        {cur.kind === "g" && (
          <ScenarioBlock
            lang={lang}
            group={cur.g}
            values={ans}
            show={show}
            onPick={(partId, v) => setAns((a) => ({ ...a, [partId]: v }))}
            onToggleExplain={(key) => setShow((s) => ({ ...s, [key]: !s[key] }))}
            onToggleDoubt={toggleDoubt}
            isDoubtful={doubtful.has(currentId)}
            flagLabel={L.flag}
            unflagLabel={L.unflag}
          />
        )}
      </View>

      {cur.kind === "s" && (
        <>
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
          {ans[cur.q.id] && (
            <View style={styles.ansSection}>
              <TouchableOpacity
                onPress={() => setShow((s) => ({ ...s, [cur.q.id]: !s[cur.q.id] }))}
              >
                <Text style={styles.ansToggle}>
                  {show[cur.q.id] ? L.hideAns : L.showAns}
                </Text>
              </TouchableOpacity>
              {show[cur.q.id] && (
                <View style={styles.ansCard}>
                  <Text style={styles.ansLabel}>{L.correct} {cur.q.answer}</Text>
                  <Text style={styles.ansExplanation}>
                    {tx(cur.q.explanation, cur.q.explanationVi, lang)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </>
      )}

      </ScrollView>
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
  onToggleDoubt?: () => void;
  isDoubtful?: boolean;
  flagLabel?: string;
  unflagLabel?: string;
}

function ScenarioBlock({
  lang,
  group,
  values,
  show,
  onPick,
  onToggleExplain,
  onToggleDoubt,
  isDoubtful,
  flagLabel,
  unflagLabel,
}: ScenarioBlockProps) {
  const L = {
    answer: lang === "vi" ? "Đáp án:" : "答え：",
    hide: lang === "vi" ? "Ẩn" : "隠す",
    show: lang === "vi" ? "Đáp án" : "答え",
  };

  return (
    <View style={styles.scenarioContainer}>
      <View style={styles.flagRow}>
        {onToggleDoubt && (
          <TouchableOpacity
            onPress={onToggleDoubt}
            style={[styles.flagBtn, isDoubtful ? styles.flagBtnActive : styles.flagBtnInactive]}
          >
            <QuestionMark size={12} />
            <Text style={[styles.flagBtnText, isDoubtful ? styles.flagBtnTextActive : undefined]}>
              {isDoubtful ? unflagLabel : flagLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.warningText}>
        ⚠ {lang === "vi" ? "Phải trả lời đúng TẤT CẢ 3 ý nhỏ." : "3題すべて正解で2点獲得。"}
      </Text>
      <Text style={styles.stemText}>{tx(group.stem, group.stemVi, lang)}</Text>

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
                【{sub.subKey}】{tx(sub.text, sub.textVi, lang)}
              </Text>
            </View>
            <MaruBatsuButtons
              value={values[sub.partId]}
              onPick={(v) => onPick(sub.partId, v)}
            />
            {values[sub.partId] && (
              <TouchableOpacity onPress={() => onToggleExplain(sub.partId)}>
                <Text style={styles.ansToggle}>
                  {show[sub.partId] ? L.hide : L.show}
                </Text>
              </TouchableOpacity>
            )}
            {show[sub.partId] && (
              <View style={styles.ansCard}>
                <Text style={styles.ansLabel}>{L.answer} {sub.answer}</Text>
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
  backBtn: {
    backgroundColor: "#059669",
    borderWidth: 1,
    borderColor: "#34d399",
    borderRadius: 888,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 4,
    marginBottom: 12,
    width: 94,
    opacity: 0.6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  backText: { fontSize: 12, fontWeight: "bold", color: "#fff" },
  emptyText: { color: "#fde68a", fontSize: 14 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  progressBadge: { fontSize: 12, backgroundColor: "rgba(120,53,15,0.5)", color: "#fde68a", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  chapterName: { fontSize: 12, color: "#fcd34d" },
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
  questionImage: { width: "100%", height: 120, borderRadius: 8, marginBottom: 8 },
  questionImageInner: { width: "100%", height: 120, borderRadius: 8 },
  questionText: { fontSize: 14, lineHeight: 22, fontWeight: "500", color: "#111", textAlign: "center", marginTop: 8 },
  flagRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 8 },
  flagBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1.5 },
  flagBtnActive: { backgroundColor: "#f59e0b", borderColor: "#d97706" },
  flagBtnInactive: { backgroundColor: "rgba(120,53,15,0.4)", borderColor: "rgba(120,53,15,0.6)" },
  flagBtnText: { fontSize: 12, fontWeight: "600", color: "#fef3c7" },
  flagBtnTextActive: { color: "#1c1917" },
  ansSection: { marginTop: 12 },
  ansToggle: { fontSize: 13, color: "#7f1d1d", textDecorationLine: "underline", textAlign: "center" },
  ansCard: { backgroundColor: "rgba(255,255,255,0.8)", borderRadius: 10, padding: 12, marginTop: 8, borderWidth: 1, borderColor: "rgba(120,53,15,0.3)" },
  ansLabel: { fontSize: 14, fontWeight: "bold", color: "#111" },
  ansExplanation: { fontSize: 13, color: "#404040", marginTop: 6, lineHeight: 20 },
  scenarioContainer: { flex: 1 },
  warningText: { fontSize: 12, color: "#be123c", fontWeight: "500", marginBottom: 6 },
  stemText: { fontSize: 14, fontWeight: "600", color: "#111", marginBottom: 12 },
  subsList: { gap: 12 },
  subItem: { borderTopWidth: 2, borderTopColor: "rgba(120,53,15,0.3)", paddingTop: 10, marginBottom: 12 },
  subRow: { flexDirection: "row", gap: 8, alignItems: "flex-start", marginBottom: 8 },
  subImage: { width: 80, height: 64, borderRadius: 6 },
  subImageInner: { width: 80, height: 64, borderRadius: 6 },
  subText: { flex: 1, fontSize: 12, color: "#111", lineHeight: 18 },
});
