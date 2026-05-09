import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  StatusBar,
  ActivityIndicator,
  Text,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LangSwitch } from "./src/components/LangSwitch";
import { ConfirmDialog } from "./src/components/ConfirmDialog";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ExamPrepScreen } from "./src/screens/ExamPrepScreen";
import { ChapterScreen } from "./src/screens/ChapterScreen";
import { ExamScreen } from "./src/screens/ExamScreen";
import { ResultsScreen } from "./src/screens/ResultsScreen";
import { ReviewScreen } from "./src/screens/ReviewScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { buildMockExam, scoreExam } from "./src/lib/exam";
import { loadHistory, saveHistory, loadStats, saveStats } from "./src/lib/storage";
import type { ExamItem, Lang, MaruBatsu, PersonalStats, ExamHistoryEntry, AppScreen } from "./src/types";

const EXAM_SECONDS = 30 * 60;
const PASS_SCORE = 45;

const practiceBg = require("./src/assets/bgs/Q9.png");

export default function App() {
  const [lang, setLang] = useState<Lang>("vi");
  const [view, setView] = useState<AppScreen>({ mode: "home" });
  const [examPaper, setExamPaper] = useState<ExamItem[]>([]);
  const [examIndex, setExamIndex] = useState(0);
  const [simpleAns, setSimpleAns] = useState<Record<string, MaruBatsu | undefined>>({});
  const [scenarioAns, setScenarioAns] = useState<Record<string, Record<string, MaruBatsu | undefined>>>({});
  const [secondsLeft, setSecondsLeft] = useState(EXAM_SECONDS);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examFlags, setExamFlags] = useState<Set<string>>(new Set());
  const [personalStats, setPersonalStats] = useState<PersonalStats | null>(null);
  const [examHistory, setExamHistory] = useState<ExamHistoryEntry[]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [loading, setLoading] = useState(true);

  const examPaperRef = useRef(examPaper);
  examPaperRef.current = examPaper;

  // Load data on mount
  useEffect(() => {
    Promise.all([loadStats(), loadHistory()]).then(([stats, history]) => {
      setPersonalStats(stats);
      setExamHistory(history);
      setLoading(false);
    });
  }, []);

  const toggleLang = useCallback(() => {
    setLang((l) => (l === "jp" ? "vi" : "jp"));
  }, []);

  const goToExamPrep = useCallback(() => {
    setView({ mode: "examPrep" });
  }, []);

  const startExam = useCallback(() => {
    const bank = require("./src/data/questions").default;
    const paper = buildMockExam(bank);
    setExamPaper(paper);
    setExamIndex(0);
    setSimpleAns({});
    setScenarioAns({});
    setSecondsLeft(EXAM_SECONDS);
    setSubmitted(false);
    setExamFlags(new Set());
    setView({ mode: "exam" });
  }, []);

  const submitExam = useCallback(() => {
    if (submitted || isSubmitting) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const paper = examPaperRef.current;
      const result = scoreExam(paper, simpleAns, scenarioAns);

      // Update stats
      const newStats: PersonalStats = personalStats
        ? { ...personalStats }
        : { totalExams: 0, highestScore: 0, lowestScore: 0, chaptersStats: {} };
      newStats.totalExams += 1;
      if (newStats.highestScore === 0 || result.total > newStats.highestScore) {
        newStats.highestScore = result.total;
      }
      if (newStats.lowestScore === 0 || result.total < newStats.lowestScore) {
        newStats.lowestScore = result.total;
      }

      // Update chapter breakdown
      for (const d of result.details) {
        const chapterId = d.item.type === "simple" ? d.item.question.chapter : d.item.group.chapter;
        if (!newStats.chaptersStats[chapterId]) {
          newStats.chaptersStats[chapterId] = { correct: 0, total: 0 };
        }
        newStats.chaptersStats[chapterId].total += 1;
        if (d.points >= 1) newStats.chaptersStats[chapterId].correct += 1;
      }

      saveStats(newStats);
      setPersonalStats(newStats);

      // Save to history
      const chapterBreakdown: Record<string, { correct: number; total: number }> = {};
      for (const d of result.details) {
        const chapterId = d.item.type === "simple" ? d.item.question.chapter : d.item.group.chapter;
        if (!chapterBreakdown[chapterId]) chapterBreakdown[chapterId] = { correct: 0, total: 0 };
        chapterBreakdown[chapterId].total += 1;
        if (d.points >= 1) chapterBreakdown[chapterId].correct += 1;
      }

      const entry: ExamHistoryEntry = {
        date: new Date().toISOString(),
        score: result.total,
        max: result.max,
        passed: result.passed,
        details: { chapterBreakdown },
      };

      saveHistory(entry).then(() => {
        loadHistory().then(setExamHistory);
      });

      setIsSubmitting(false);
      setSubmitted(true);
      setView({ mode: "results", paper });
    }, 800);
  }, [submitted, isSubmitting, simpleAns, scenarioAns, personalStats]);

  // Timer
  useEffect(() => {
    if (view.mode !== "exam" || submitted) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          const paper = examPaperRef.current;
          setSubmitted(true);
          setView({ mode: "results", paper });
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [view.mode, submitted]);

  const currentItem = view.mode === "exam" ? examPaper[examIndex] : undefined;

  const getItemFlagId = (item: ExamItem): string =>
    item.type === "simple" ? `s-${item.question.id}` : `g-${item.group.groupId}`;

  const toggleFlag = useCallback(() => {
    if (!currentItem) return;
    const id = getItemFlagId(currentItem);
    setExamFlags((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, [currentItem]);

  const handleBackHome = useCallback(() => {
    if (view.mode === "exam" && !submitted) {
      setShowExitConfirm(true);
    } else {
      setView({ mode: "home" });
    }
  }, [view.mode, submitted]);

  const handleAnswer = useCallback((type: "simple", id: string, v: MaruBatsu) => {
    setSimpleAns((prev) => ({ ...prev, [id]: v }));
  }, []);

  const handleAnswerScenario = useCallback((gid: string, partId: string, v: MaruBatsu) => {
    setScenarioAns((prev) => ({
      ...prev,
      [gid]: { ...prev[gid], [partId]: v },
    }));
  }, []);

  const handleJump = useCallback((index: number) => {
    setExamIndex(index);
  }, []);

  const score =
    view.mode === "results" || view.mode === "review"
      ? scoreExam(view.paper, simpleAns, scenarioAns)
      : null;

  const isHome = view.mode === "home";
  const isExam = view.mode === "exam";

  if (loading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#78350f" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  const L = {
    confirmExit: lang === "vi"
      ? "Bạn có chắc muốn thoát?\nTiến trình sẽ bị mất."
      : "終了してもよろしいですか？\n進捗が失われます。",
    confirmExitBtn: lang === "vi" ? "Thoát" : "終了",
    cancelBtn: lang === "vi" ? "Hủy" : "キャンセル",
    loadingSubmit: lang === "vi" ? "Đang nộp bài..." : "提出中...",
  };

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isHome ? "dark-content" : "light-content"}
        backgroundColor="transparent"
        translucent
      />
      <View style={[styles.container, isHome && styles.containerHome]}>
        {/* Background */}
        {isExam ? (
          <Image source={practiceBg} style={styles.bgImage} resizeMode="cover" />
        ) : null}

        {/* Gradient overlay */}
        <View style={styles.overlay} />

        {/* Language switch */}
        <View style={styles.langSwitchContainer}>
          <LangSwitch lang={lang} onToggle={toggleLang} />
        </View>

        {/* Submitting overlay */}
        {isSubmitting && (
          <View style={styles.submittingOverlay}>
            <View style={styles.submittingDialog}>
              <ActivityIndicator size="large" color="#78350f" />
              <Text style={styles.submittingText}>{L.loadingSubmit}</Text>
            </View>
          </View>
        )}

        {/* Exit confirm */}
        <ConfirmDialog
          visible={showExitConfirm}
          message={L.confirmExit}
          confirmText={L.confirmExitBtn}
          cancelText={L.cancelBtn}
          onConfirm={() => {
            setShowExitConfirm(false);
            setView({ mode: "home" });
          }}
          onCancel={() => setShowExitConfirm(false)}
          variant="danger"
        />

        {/* Main content */}
        <View style={styles.content}>
          {view.mode === "home" && (
            <HomeScreen
              lang={lang}
              onStartExam={goToExamPrep}
              onChapter={(chapterId) =>
                setView({ mode: "chapter", chapterId })
              }
              onShowHistory={() => setView({ mode: "history" })}
              personalStats={personalStats}
            />
          )}

          {view.mode === "examPrep" && (
            <ExamPrepScreen
              lang={lang}
              onStart={startExam}
              onBack={() => setView({ mode: "home" })}
            />
          )}

          {view.mode === "chapter" && (
            <ChapterScreen
              lang={lang}
              chapterId={view.chapterId}
              onBack={() => setView({ mode: "home" })}
            />
          )}

          {view.mode === "history" && (
            <HistoryScreen
              lang={lang}
              history={examHistory}
              onBack={() => setView({ mode: "home" })}
            />
          )}

          {view.mode === "exam" && currentItem && (
            <ExamScreen
              lang={lang}
              paper={examPaper}
              simpleAns={simpleAns}
              scenarioAns={scenarioAns}
              timeLeft={secondsLeft}
              onAnswer={handleAnswer}
              onAnswerScenario={handleAnswerScenario}
              onJump={handleJump}
              flags={examFlags}
              onToggleFlag={toggleFlag}
              onSubmit={submitExam}
              onBack={handleBackHome}
              examIndex={examIndex}
            />
          )}

          {view.mode === "results" && score && (
            <ResultsScreen
              lang={lang}
              score={score}
              onReview={() =>
                setView({ mode: "review", paper: view.paper, reviewAll: false })
              }
              onReviewAll={() =>
                setView({ mode: "review", paper: view.paper, reviewAll: true })
              }
              onHome={() => setView({ mode: "home" })}
              onRetry={startExam}
            />
          )}

          {view.mode === "review" && score && (
            <ReviewScreen
              lang={lang}
              score={score}
              onBackResults={() =>
                setView({ mode: "results", paper: view.paper })
              }
              onHome={() => setView({ mode: "home" })}
              reviewAll={view.reviewAll}
            />
          )}
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#78350f",
  },
  containerHome: {
    backgroundColor: "#fff",
  },
  bgImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(120,53,15,0.15)",
  },
  langSwitchContainer: {
    position: "absolute",
    top: 50,
    right: 16,
    zIndex: 100,
  },
  content: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#78350f",
  },
  submittingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 300,
  },
  submittingDialog: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  submittingText: {
    fontSize: 14,
    color: "#404040",
    fontWeight: "600",
  },
});
