export type ChapterDef = {
  id: string;
  jp: string;
  vi: string;
  subs?: string[];
};

export const CHAPTERS: ChapterDef[] = [
  { id: "ch1", jp: "運転の基礎知識", vi: "Kiến thức cơ bản về lái xe" },
  { id: "ch2", jp: "標識・標示・信号", vi: "Biển báo · Kẻ đường · Đèn tín hiệu" },
  { id: "ch3", jp: "道路の走行方法", vi: "Cách chạy xe trên đường" },
  { id: "ch4", jp: "追い越し・駐停車", vi: "Vượt xe · Dừng đỗ" },
  { id: "ch5", jp: "危険な状況での運転", vi: "Lái xe trong tình huống nguy hiểm" },
  { id: "ch6", jp: "総合演習1", vi: "Ôn tập tổng hợp 1" },
  { id: "ch7", jp: "総合演習2", vi: "Ôn tập tổng hợp 2" },
  { id: "ch8", jp: "総合演習3", vi: "Ôn tập tổng hợp 3" },
  { id: "ch9", jp: "総合演習4", vi: "Ôn tập tổng hợp 4" },
  { id: "ch10", jp: "総合演習5", vi: "Ôn tập tổng hợp 5" },
  { id: "ch13", jp: "総合演習6", vi: "Ôn tập tổng hợp 6" },
  { id: "ch11", jp: "危険予測", vi: "Dự đoán nguy hiểm" },
  { id: "ch12", jp: "危険予測問題", vi: "Tình huống minh hoạ" },
];

export const CHAPTER_VI: Record<string, string> = Object.fromEntries([
  ...CHAPTERS.map((c) => [c.jp, c.vi]),
  ["総合演習", "Ôn tập tổng hợp"],
  ["総合演習1", "Ôn tập tổng hợp 1"],
  ["総合演習2", "Ôn tập tổng hợp 2"],
  ["総合演習3", "Ôn tập tổng hợp 3"],
  ["総合演習4", "Ôn tập tổng hợp 4"],
  ["総合演習5", "Ôn tập tổng hợp 5"],
  ["総合演習6", "Ôn tập tổng hợp 6"],
]);

export const CHAPTER_JP: Record<string, string> = Object.fromEntries(
  CHAPTERS.map((c) => [c.jp, c.jp])
);

export const CHAPTER_MAP: Record<string, string> = Object.fromEntries(
  CHAPTERS.map((c) => [c.jp, c.jp])
);

export function chapterSubs(id: string): string[] {
  const c = CHAPTERS.find((x) => x.jp === id);
  return c?.subs ?? [c?.jp ?? id];
}
