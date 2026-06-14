import React, { useEffect, useState, useCallback, useRef, Component, ReactNode } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  StatusBar,
  ActivityIndicator,
  Text,
  Platform,
} from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LangSwitch } from "./src/components/LangSwitch";
import { SoundToggle } from "./src/components/SoundToggle";
import { PrivacyScreen } from "./src/screens/PrivacyScreen";
import { BackHomeButton } from "./src/components/BackHomeButton";
import { ConfirmDialog } from "./src/components/ConfirmDialog";
import { AdModal } from "./src/components/AdModal";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ExamPrepScreen } from "./src/screens/ExamPrepScreen";
import { ChapterScreen } from "./src/screens/ChapterScreen";
import { ExamScreen } from "./src/screens/ExamScreen";
import { ResultsScreen } from "./src/screens/ResultsScreen";
import { ReviewScreen } from "./src/screens/ReviewScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { PracticeHomeScreen } from "./src/screens/PracticeHomeScreen";
import { buildMockExam, scoreExam } from "./src/lib/exam";
import { loadHistory, saveHistory, loadStats, saveStats, addExamWrongAnswer } from "./src/lib/storage";
import { showInterstitialExam, showInterstitialChapter } from "./src/utils/AdManager";
import { initAds } from "./src/lib/adService";
import { SoundManager } from "./src/lib/SoundManager";
import type { ExamItem, ExamSimpleItem, Lang, MaruBatsu, PersonalStats, ExamHistoryEntry, AppScreen } from "./src/types";

const SOGOU_ENSHU_ALL = [
  { id: "総合演習1", name: "総合演習 1", viName: "Ôn tập tổng hợp 1" },
  { id: "総合演習2", name: "総合演習 2", viName: "Ôn tập tổng hợp 2" },
  { id: "総合演習3", name: "総合演習 3", viName: "Ôn tập tổng hợp 3" },
  { id: "総合演習4", name: "総合演習 4", viName: "Ôn tập tổng hợp 4" },
  { id: "総合演習5", name: "総合演習 5", viName: "Ôn tập tổng hợp 5" },
  { id: "総合演習6", name: "総合演習 6", viName: "Ôn tập tổng hợp 6" },
];

const EXAM_SECONDS = 30 * 60;
const PASS_SCORE = 45;

const practiceBg = require("./src/assets/bgs/Q9.png");
const homeBg = require("./src/assets/bgs/bgh.jpg");

interface ErrorBoundaryProps { children: ReactNode; fallback?: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; error?: Error; }

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("App ErrorBoundary caught:", error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff", padding: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#dc2626", marginBottom: 8 }}>
            Đã xảy ra lỗi
          </Text>
          <Text style={{ fontSize: 14, color: "#404040", textAlign: "center" }}>
            {this.state.error?.message ?? "Lỗi không xác định"}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const HEADER_BUTTON_TOP =insets.top + 8;;
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
  // isExamMode: true only when actively taking the exam (timer running)
  const isExamMode = view.mode === "exam";
  // Track nguồn vào của 総合演習 để back đúng popup
  const [sogouModalSource, setSogouModalSource] = useState<"main"|"allChapters"|null>(null);

  const examPaperRef = useRef(examPaper);
  examPaperRef.current = examPaper;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load data on mount
  useEffect(() => {
    initAds();
    Promise.all([loadStats(), loadHistory()])
      .then(([stats, history]) => {
        setPersonalStats(stats);
        setExamHistory(history);
      })
      .catch((err) => {
        console.warn("Failed to load initial data:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Init sound manager
  useEffect(() => {
    SoundManager.init();
  }, []);

  const toggleLang = useCallback(() => {
    setLang((l) => (l === "jp" ? "vi" : "jp"));
  }, []);

  const goToExamPrep = useCallback(() => {
    setView({ mode: "examPrep" });
  }, []);

  const goToPracticeHome = useCallback(() => {
    setSogouModalSource(null); // Reset để không tự mở popup cũ
    setView({ mode: "practiceHome" });
  }, []);

  const goToPrivacy = useCallback(() => {
    setView({ mode: "privacy" });
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
        if (d.item.type !== "simple") continue;
        const chapterId = d.item.question.chapter;
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
        if (d.item.type !== "simple") continue;
        const chapterId = d.item.question.chapter;
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
    if (view.mode !== "exam" || submitted) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          const paper = examPaperRef.current;
          setSubmitted(true);
          setView({ mode: "results", paper });
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [view.mode, submitted]);

  const currentItem = view.mode === "exam" ? examPaper[examIndex] : undefined;

  const getItemFlagId = (item: ExamSimpleItem): string => `s-${item.question.id}`;

  const toggleFlag = useCallback(() => {
    if (!currentItem || currentItem.type !== "simple") return;
    const id = getItemFlagId(currentItem);
    setExamFlags((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, [currentItem]);

  const handleBackHome = () => {
    if (view.mode === "exam" && !submitted) {
      // Cleanup timer immediately
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setShowExitConfirm(true); // Show dialog first
      setSubmitted(true); // Then pause timer
    } else {
      showInterstitialExam(() => setView({ mode: "home" }));
    }
  };

  // Check if current chapter is from sogou modal
  const isSogouChapter = view.mode === "chapter" && SOGOU_ENSHU_ALL.some(s => s.id === view.chapterId);

  const handleChapterBack = useCallback(() => {
    if (isSogouChapter && sogouModalSource) {
      // Quay về practiceHome, PracticeHomeScreen sẽ tự mở popup tương ứng
      // sogouModalSource sẽ được reset khi user chọn chapter mới hoặc đóng modal
      setView({ mode: "practiceHome" });
    } else {
      setView({ mode: "practiceHome" });
    }
  }, [isSogouChapter, sogouModalSource]);

  const handleAnswer = useCallback((type: "simple", id: string, v: MaruBatsu) => {
    setSimpleAns((prev) => ({ ...prev, [id]: v }));

    // Ghi ngay vào WrongAnswers nếu trả lời sai (Exam mode only)
    const item = examPaperRef.current.find((i) =>
      i.type === "simple" && i.question.id === id
    );
    if (item && item.type === "simple" && v !== item.question.answer) {
      addExamWrongAnswer(id);
    }
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
      <SafeAreaView style={[styles.container, isHome && styles.containerHome]} edges={["top", "bottom"]}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        {/* Background */}
        {isHome ? (
          <Image
            source={homeBg}
            style={{
              position: "absolute",
              top: -insets.top,
              left: -insets.left,
              right: -insets.right,
              bottom: -insets.bottom,
              width: Dimensions.get("window").width + insets.left + insets.right,
              height: Dimensions.get("window").height + insets.top + insets.bottom,
            }}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={practiceBg}
            style={{
              position: "absolute",
              top: -insets.top,
              left: -insets.left,
              right: -insets.right,
              bottom: -insets.bottom,
              width: Dimensions.get("window").width + insets.left + insets.right,
              height: Dimensions.get("window").height + insets.top + insets.bottom,
            }}
            resizeMode="cover"
          />
        )}


        {/* Lang/Sound - always visible */}
        <View style={[styles.langSoundContainer, { top: HEADER_BUTTON_TOP }]}>
          <LangSwitch lang={lang} onToggle={toggleLang} />
          <SoundToggle />
        </View>

        {/* Back button - show when not at home */}
        {view.mode !== "home" && (
          <View style={[styles.backButtonContainer, { top: HEADER_BUTTON_TOP -8 }]}>
            <BackHomeButton
              onPress={() => {
                SoundManager.playTapClick();
                const backHandlers: Record<string, () => void> = {
                  practiceHome: () => showInterstitialExam(() => setView({ mode: "home" })),
                  examPrep: () => showInterstitialChapter(() => setView({ mode: "home" })),
                  chapter: () => showInterstitialChapter(() => setView({ mode: "practiceHome" })),
                  history: () => showInterstitialChapter(() => setView({ mode: "home" })),
                  exam: () => handleBackHome(), // Cleanup timer before showing dialog
                  results: () => setView({ mode: "home" }),
                  review: () => {
                    if (view.mode === "review" && "paper" in view) {
                      setView({ mode: "results", paper: view.paper });
                    }
                  },
                  privacy: () => setView({ mode: "home" }),
                };
                const handler = backHandlers[view.mode];
                if (handler) handler();
              }}
            />
          </View>
        )}

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
          lang={lang}
          message={L.confirmExit}
          confirmText={L.confirmExitBtn}
          cancelText={L.cancelBtn}
          onConfirm={() => {
            setShowExitConfirm(false);
            // Full cleanup exam state
            setExamPaper([]);
            setSimpleAns({});
            setScenarioAns({});
            setSubmitted(false);
            setExamFlags(new Set());
            showInterstitialExam(() => setView({ mode: "home" }));
          }}
          onCancel={() => {
            setShowExitConfirm(false);
            // Restore: reset submitted to resume exam with remaining time
            setSubmitted(false);
          }}
          variant="danger"
        />

        {/* Main content */}
        <View style={[styles.content, { paddingTop: view.mode === "home" ? insets.top + 20 : HEADER_BUTTON_TOP + 50 }]}>
          {view.mode === "home" && (
            <HomeScreen
              lang={lang}
              onStartExam={goToExamPrep}
              onStartPractice={goToPracticeHome}
              onPrivacy={goToPrivacy}
            />
          )}

          {view.mode === "practiceHome" && (
            <PracticeHomeScreen
              lang={lang}
              onChapter={(chapterId, fromModal) => {
                if (fromModal) {
                  setSogouModalSource(fromModal);
                } else {
                  setSogouModalSource(null);
                }
                setView({ mode: "chapter", chapterId });
              }}
              onBack={() => setView({ mode: "home" })}
              initialSogouModal={sogouModalSource}
            />
          )}

          {view.mode === "examPrep" && (
            <ExamPrepScreen
              lang={lang}
              onStart={startExam}
              onBack={() => setView({ mode: "home" })}
              onHistory={() => setView({ mode: "history" })}
            />
          )}

          {view.mode === "chapter" && (
            <ChapterScreen
              lang={lang}
              chapterId={view.chapterId}
              onBack={handleChapterBack}
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

          {view.mode === "privacy" && (
            <PrivacyScreen lang={lang} onBack={() => setView({ mode: "home" })} />
          )}

        </View>

        <AdModal />
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  containerHome: {
    backgroundColor: "transparent",
  },
  langSoundContainer: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    zIndex: 100,
  },
  backButtonContainer: {
    position: "absolute",
    left: 12,
    zIndex: 100,
  },
  content: {
    flex: 1,
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

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
