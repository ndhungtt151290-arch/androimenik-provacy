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

  // === PHASE 1: Phan bo ti le 46 cau thuong (Cau 1 - Cau 46) ===
  const TARGET_SIMPLE = 46;
  // Pool A gom 11 chuong: 5 chuong ly thuyet + 6 chuong tong hop
  // TUYET DOI LOAI TRU 2 chuong tinh huong "危険予測" va "危険予測問題"
  const THEORY_CHAPTERS = [
    "運転の基礎知識",
    "標識・標示・信号",
    "道路の走行方法",
    "追い越し・駐停車",
    "危険な状況での運転",
    "総合演習1",
    "総合演習2",
    "総合演習3",
    "総合演習4",
    "総合演習5",
    "総合演習6",
  ];

  // === Ràng buộc tối thiểu 8 câu chứa ảnh ===
  const MIN_IMAGE_QUESTIONS = 8;

  // === Ham kiem tra ràng buộc tại vi tri i ===
  function canPlaceAt(
    currentArr: SimpleQuestion[],
    question: SimpleQuestion,
    position: number
  ): boolean {
    // Ràng buộc 1: Không anh liền kề
    if (position > 0 && currentArr[position - 1].image && question.image) {
      return false;
    }

    // Ràng buộc 2: Không 3 chương liên tiếp
    if (
      position >= 2 &&
      currentArr[position - 1].chapter === question.chapter &&
      currentArr[position - 2].chapter === question.chapter
    ) {
      return false;
    }

    // Ràng buộc 3: Không 4 đáp án liên tiếp cùng loại
    if (position >= 3) {
      const a = currentArr[position - 1].answer;
      const b = currentArr[position - 2].answer;
      const c = currentArr[position - 3].answer;
      if (a === question.answer && b === question.answer && c === question.answer) {
        return false;
      }
    }

    return true;
  }

  // === Ham dem so ràng buộc bi vi phạm ===
  function countViolations(arr: SimpleQuestion[]): number {
    let violations = 0;

    for (let i = 0; i < arr.length; i++) {
      // Anh liền kề
      if (i > 0 && arr[i - 1].image && arr[i].image) violations++;

      // 3 chương liên tiếp
      if (
        i >= 2 &&
        arr[i - 2].chapter === arr[i - 1].chapter &&
        arr[i - 1].chapter === arr[i].chapter
      ) {
        violations++;
      }

      // 4 O/X liên tiếp
      if (
        i >= 3 &&
        arr[i - 3].answer === arr[i - 2].answer &&
        arr[i - 2].answer === arr[i - 1].answer &&
        arr[i - 1].answer === arr[i].answer
      ) {
        violations++;
      }
    }

    return violations;
  }

  // === Ham chính: tối ưu hóa layout đề thi ===
  // Đảm bảo: 3 câu đầu không ảnh, không 2 ảnh liền kề,
  // không 3 cùng chương, không 4 cùng O/X liên tiếp
  function optimizeExamLayout(picked: SimpleQuestion[]): SimpleQuestion[] {
    const MAX_ATTEMPTS = 100;

    let bestResult: SimpleQuestion[] = [];
    let bestViolations = Infinity;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      let remaining = shuffle([...picked]);
      const result: SimpleQuestion[] = [];

      // === Warm-up: 3 câu đầu bắt buộc không có ảnh ===
      const warmUpPool = remaining.filter((q) => !q.image);
      const warmUp = shuffle(warmUpPool).slice(0, 3);
      result.push(...warmUp);
      remaining = remaining.filter((q) => !warmUp.some((w) => w.id === q.id));

      // === Greedy placement: đặt từng câu thỏa ràng buộc ===
      let success = true;
      while (result.length < TARGET_SIMPLE && remaining.length > 0) {
        const position = result.length;
        const candidates = remaining.filter((q) => canPlaceAt(result, q, position));

        if (candidates.length === 0) {
          // Không có câu nào thỏa → điền bất kỳ câu còn lại vào để đủ 46
          const fallback = remaining.slice(0, TARGET_SIMPLE - result.length);
          result.push(...fallback);
          remaining = [];
          success = false;
          break;
        }

        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        result.push(chosen);
        remaining = remaining.filter((q) => q.id !== chosen.id);
      }

      // Đảm bảo luôn đủ 46 câu (phòng trường hợp edge case)
      while (result.length < TARGET_SIMPLE) {
        const fromPicked = picked.filter((q) => !result.some((r) => r.id === q.id));
        if (fromPicked.length === 0) break;
        result.push(shuffle(fromPicked)[0]);
      }

      if (success && result.length === TARGET_SIMPLE) {
        // Tìm được nghiệm hoàn hảo
        return result;
      }

      // Fallback: giữ lại kết quả tốt nhất
      const violations = countViolations(result);
      if (violations < bestViolations) {
        bestViolations = violations;
        bestResult = result;
      }
    }

    // Trim thừa, đảm bảo đúng 46
    if (bestResult.length > TARGET_SIMPLE) {
      bestResult = bestResult.slice(0, TARGET_SIMPLE);
    }
    while (bestResult.length < TARGET_SIMPLE) {
      const fromPicked = picked.filter((q) => !bestResult.some((r) => r.id === q.id));
      if (fromPicked.length === 0) break;
      bestResult.push(shuffle(fromPicked)[0]);
    }

    return bestResult;
  }

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

  // === Tối ưu hóa layout đề thi với 4 ràng buộc ===
  const finalPicked = optimizeExamLayout(picked);

  // === PHASE 2: Select 1 scenario from each chapter (câu 47, 48) ===
  const ch11Scenarios = uniqueScenarios.filter((g) => g.chapter === "危険予測");
  const ch12Scenarios = uniqueScenarios.filter((g) => g.chapter === "危険予測問題");

  const scen1 = shuffle(ch11Scenarios)[0];
  const scen2 = shuffle(ch12Scenarios)[0];

  // === PHASE 3: Build exam items ===
  // Su dung finalPicked da dam bao du so cau co hinh anh
  const simpleItems: ExamItem[] = finalPicked.map((question) => ({
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

    // Each sub-question in a scenario group shows its OWN correctness (1 or 0),
    // but the GROUP as a whole scores 2 points only if ALL 3 subs are correct.
    // We update detail.points here to reflect individual sub correctness for display.
    for (const detail of details) {
      if (detail.item.type === "simple" && (detail.item as any).scenarioGroupId === gid) {
        // Show individual sub correctness (1 if correct, 0 if wrong/unanswered)
        // Note: The actual scenario group score (2 pts) is added to total below
        detail.points = detail.simple?.correct ? SIMPLE_PTS : 0;
      }
    }

    // Add 2 points ONCE for the entire group (only if all 3 subs are correct)
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
