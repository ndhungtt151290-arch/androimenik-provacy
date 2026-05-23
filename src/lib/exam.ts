import type {
  ExamItem,
  MaruBatsu,
  QuestionBank,
  ScenarioGroup,
  SimpleQuestion,
} from "../types";

function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildMockExam(bank: QuestionBank): ExamItem[] {
  // Deduplicate simple questions by text content before shuffling
  const seenTexts = new Set<string>();
  const uniqueSimple = bank.simple.filter((q) => {
    if (seenTexts.has(q.text)) return false;
    seenTexts.add(q.text);
    return true;
  });

  // Only use scenarioGroups (dangerScenarioGroups is 100% duplicate)
  const uniqueScenarios = bank.scenarioGroups;

  // === PHASE 1: Proportional distribution of theory questions (câu 1-46) ===
  const TARGET_SIMPLE = 46;
  const THEORY_CHAPTERS = [
    "運転の基礎知識",
    "標識・標示・信号",
    "道路の走行方法",
    "追い越し・駐停車",
    "危険な状況での運転",
  ];

  // Count questions per chapter
  const chapterCounts: Record<string, number> = {};
  let totalSimple = 0;
  for (const ch of THEORY_CHAPTERS) {
    chapterCounts[ch] = uniqueSimple.filter((q) => q.chapter === ch).length;
    totalSimple += chapterCounts[ch];
  }

  // Shuffle questions within each chapter
  const shuffledByChapter: Record<string, typeof uniqueSimple> = {};
  for (const ch of THEORY_CHAPTERS) {
    shuffledByChapter[ch] = shuffle(uniqueSimple.filter((q) => q.chapter === ch));
  }

  // Proportional allocation with rounding
  const picked: typeof uniqueSimple = [];
  let remaining = TARGET_SIMPLE;
  for (const ch of THEORY_CHAPTERS) {
    const ratio = chapterCounts[ch] / totalSimple;
    const count = Math.round(ratio * TARGET_SIMPLE);
    const actual = Math.min(count, chapterCounts[ch], remaining);
    picked.push(...shuffledByChapter[ch].slice(0, actual));
    remaining -= actual;
  }

  // === PHASE 2: Select 1 scenario from each chapter (câu 47, 48) ===
  const ch11Scenarios = uniqueScenarios.filter((g) => g.chapter === "危険予測");
  const ch12Scenarios = uniqueScenarios.filter((g) => g.chapter === "危険予測問題");

  const scen1 = shuffle(ch11Scenarios)[0];
  const scen2 = shuffle(ch12Scenarios)[0];

  // === PHASE 3: Build exam items ===
  // Simple questions remain as is
  const simpleItems: ExamItem[] = picked.map((question) => ({
    type: "simple" as const,
    question,
  }));

  // Flatten each scenario into 3 separate exam items
  const scenItems: ExamItem[] = [];
  for (const group of [scen1, scen2]) {
    for (let i = 0; i < group.subs.length; i++) {
      const sub = group.subs[i];
      scenItems.push({
        type: "simple" as const,
        question: {
          kind: "scenario_sub",
          id: `${group.groupId}_${i}`,
          chapter: group.chapter,
          section: group.section,
          text: sub.text,
          answer: sub.answer,
          explanation: sub.explanation,
          image: sub.image,
          textVi: sub.textVi,
          explanationVi: sub.explanationVi,
        },
        scenarioGroupId: group.groupId,
        stem: group.stem,
        stemVi: group.stemVi,
        subIndex: i,
      });
    }
  }

  // Simple questions first, then scenario questions at the end (in order)
  return [...simpleItems, ...scenItems];
}

export type SimpleAttempt = { correct: boolean; user?: MaruBatsu };
export type ScenarioAttempt = {
  correct: boolean;
  subs: Record<string, { user?: MaruBatsu; correct: boolean }>;
};

export function scoreExam(
  paper: ExamItem[],
  simpleAns: Record<string, MaruBatsu | undefined>,
  scenarioAns: Record<string, Record<string, MaruBatsu | undefined>>
): {
  total: number;
  max: number;
  passed: boolean;
  details: Array<{
    index: number;
    item: ExamItem;
    points: number;
    simple?: SimpleAttempt;
  }>;
} {
  const SIMPLE_PTS = 1;
  const SCENARIO_PTS = 2;
  const PASS_PTS = 45;
  let total = 0;
  const details: Array<{
    index: number;
    item: ExamItem;
    points: number;
    simple?: SimpleAttempt;
  }> = [];

  // Group scenario subs by scenarioGroupId for scoring
  const scenarioGroups: Record<string, { items: ExamItem[]; subAnswers: Record<string, MaruBatsu | undefined> }> = {};

  paper.forEach((item, index) => {
    if (item.type === "simple") {
      if (item.scenarioGroupId) {
        // This is a flattened scenario sub-question
        if (!scenarioGroups[item.scenarioGroupId]) {
          scenarioGroups[item.scenarioGroupId] = { items: [], subAnswers: scenarioAns[item.scenarioGroupId] || {} };
        }
        scenarioGroups[item.scenarioGroupId].items.push(item);
      }
    }
  });

  // Score each question
  paper.forEach((item, index) => {
    if (item.type === "simple") {
      const id = item.question.id;
      const user = simpleAns[id];
      const correct = user === item.question.answer;

      if (item.scenarioGroupId) {
        // For scenario sub-questions, points are calculated after all groups are processed
        // We'll set 0 here and update later
        details.push({ index, item, points: 0, simple: { correct, user } });
      } else {
        // Regular simple question
        if (correct) total += SIMPLE_PTS;
        details.push({ index, item, points: correct ? SIMPLE_PTS : 0, simple: { correct, user } });
      }
    }
  });

  // Calculate scenario group scores (all 3 correct = 2 points)
  let scenarioCorrectCount = 0;
  let scenarioGroupCount = 0;
  for (const gid in scenarioGroups) {
    const group = scenarioGroups[gid];
    const subAnswers = group.subAnswers;
    let allCorrect = true;
    let answeredCount = 0;

    for (const item of group.items) {
      const user = simpleAns[item.question.id];
      if (user === undefined) {
        allCorrect = false;
      } else if (user !== item.question.answer) {
        allCorrect = false;
      }
      if (user !== undefined) answeredCount++;
    }

    // Assign 2 points to each sub in the group if all are correct, otherwise 0
    for (const detail of details) {
      if (detail.item.type === "simple" && (detail.item as any).scenarioGroupId === gid) {
        detail.points = allCorrect ? SCENARIO_PTS : 0;
      }
    }

    if (allCorrect) {
      total += SCENARIO_PTS;
      scenarioCorrectCount++;
    }
    scenarioGroupCount++;
  }

  return { total, max: 50, passed: total >= PASS_PTS, details };
}

export function questionsForChapter(
  bank: QuestionBank,
  chapterNames: string[]
): { simple: SimpleQuestion[]; scenarios: ScenarioGroup[] } {
  const simple: SimpleQuestion[] = [];
  const scenarios: ScenarioGroup[] = [];

  for (const name of chapterNames) {
    simple.push(...bank.simple.filter((q) => q.chapter === name));
  }

  scenarios.push(
    ...bank.scenarioGroups.filter((g) => chapterNames.includes(g.chapter)),
  );

  return { simple, scenarios };
}
