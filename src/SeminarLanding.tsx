import React, { useEffect, useMemo, useRef, useState } from 'react';

/************************************
 * Ai×建築セミナー HP — Slide-like Onepage v5 (Pro)
 * 目的: この1枚HPで180分の本番進行を“スライド同等”に実現。
 * 変更点（v5）
 *  - Revealステップ: 箇条書きを段階表示（. / Enter で次、, / Backspace で戻る）
 *  - Dotナビ: 左端ドットで任意章にジャンプ、現在位置を可視化
 *  - タイムキープ: HUDに経過時間、章目安、オーバー/アンダー表示（簡易）
 *  - Print: P キーでブラウザ印刷（PDF配布用）
 *  - 依存ゼロ維持、既存のテスト/ID/モード（Slide/Notes/HUD）互換
 ************************************/

// ===== Brand Tokens: PRO-FRIENDLY =====
const brand = {
  colors: {
    primary: '#111827',
    accent: '#06B6D4',
    accentWarn: '#F59E0B',
    neutral: '#6B7280',
    bg: '#FFFFFF',
    card: 'rgba(17,24,39,0.04)',
  },
  radius: 10,
  shadow: '0 6px 24px rgba(0,0,0,0.06)',
} as const;

// ========= Primitives =========

type SectionProps = React.HTMLAttributes<HTMLElement> & { id: string };

const Section: React.FC<SectionProps> = ({ id, children, className, ...rest }) => (
  <section
    id={id}
    {...rest}
    className={`w-screen px-6 md:px-12 py-16 md:py-24 min-h-[100svh] snap-start flex items-center ${className || ''}`}
  >
    {children}
  </section>
);

const Card: React.FC<React.HTMLAttributes<HTMLDivElement> & { style?: React.CSSProperties }> = ({
  children,
  className,
  style,
  ...rest
}) => (
  <div
    {...rest}
    className={`rounded-xl backdrop-blur bg-white/70 border border-black/5 shadow-sm ${className || ''}`}
    style={{ boxShadow: brand.shadow, borderRadius: brand.radius, ...style }}
  >
    {children}
  </div>
);

const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color }) => (
  <span
    className="inline-flex items-center gap-2 text-xs md:text-sm px-3 py-1 rounded-full"
    style={{
      background: color || '#E0F2FE',
      color: '#075985',
      border: '1px solid rgba(7,89,133,0.15)',
    }}
  >
    {children}
  </span>
);

const Pill: React.FC<{ text: string }> = ({ text }) => (
  <span className="inline-flex items-center gap-2 text-xs md:text-sm px-3 py-1 rounded-full bg-black/5 border border-black/10">
    <span>{text}</span>
  </span>
);

// ========= Data =========

const CHAPTERS = [
  { no: 1, id: 'ch-01', title: 'オープニング／本日のロードマップ' },
  { no: 2, id: 'ch-02', title: 'AIの基礎' },
  { no: 3, id: 'ch-03', title: 'ChatGPTで何ができる？' },
  { no: 4, id: 'ch-04', title: 'senaが実務で使っているAIと使い分け' },
  { no: 5, id: 'ch-05', title: 'Deep Research 実演' },
  { no: 6, id: 'ch-06', title: 'AIプレゼン資料ツール比較' },
  { no: 7, id: 'ch-07', title: 'ChatGPTエージェント実演' },
  { no: 8, id: 'ch-08', title: 'HP 1ページ“みんなで簡易作成”' },
  { no: 9, id: 'ch-09', title: '1ページ提案テンプレ実戦' },
  { no: 10, id: 'ch-10', title: '現地調査ワークフロー' },
  { no: 11, id: 'ch-11', title: '議事録自動化ミニ実演' },
  { no: 12, id: 'ch-12', title: '画像生成：GPT vs Gemini 使い分け' },
  { no: 13, id: 'ch-13', title: 'SpotPDF 実務デモ' },
  { no: 14, id: 'ch-14', title: 'GASミニデモ' },
  { no: 15, id: 'ch-15', title: '楽々省エネ 実演' },
  { no: 16, id: 'ch-16', title: '配布物の解放' },
  { no: 17, id: 'ch-17', title: 'クロージング' },
  { no: 18, id: 'ch-18', title: '無期限Q&A' },
] as const;

// 章ごとの表示内容＋講師メモ
const CHAPTER_SECTIONS: Array<{
  id: string;
  kicker?: string;
  title: string;
  bullets: string[];
  notes: string;
}> = [
  {
    id: 'ch-01',
    kicker: 'START',
    title: '今日のゴールと進め方',
    bullets: [
      '当日配布なし → 終了後に非公開HPで一括配布',
      '1画面=1章。スクロールで段送り',
      'デモは別アプリ切替→戻るの最小導線',
    ],
    notes:
      '自己紹介→MVV要約→期待値調整。価値は“運用に落ちる型”。見る→真似→転用→共有の順で定着。復習はアーカイブ。コミュニティ案内は学習継続の場として。',
  },
  {
    id: 'ch-02',
    kicker: 'BASICS',
    title: 'AI/LLM の基礎',
    bullets: [
      'LLM=次トークン予測。強み=要約・変換・構造化',
      '弱み=幻覚/最新性→運用で補正',
      '鍵=入力の明確化×評価×再現性',
    ],
    notes:
      '統計の道具。ハルシネーションは構造化プロンプト＋根拠併記で管理。匿名化と承認ゲート。トークン費用は時給との比較でROI説明。',
  },
  {
    id: 'ch-03',
    kicker: 'WHAT GPT CAN DO',
    title: 'ChatGPT で実務が進むこと',
    bullets: ['雛形: 議事録/提案要旨/RFI/メール', '要件→WBS→見積ブレイクダウン', '口述→図解/整形（テンプレ差し込み）'],
    notes:
      '最初の80%をAIで、最後の20%を専門家で。議事録は議題→決定→ToDo→期限。変更指示はトーン統一。QAは出典を残す。',
  },
  {
    id: 'ch-04',
    kicker: 'STACK',
    title: '使い分け（GPT/Gemini/Deep/GAS）',
    bullets: ['文書=GPT／リサーチ=Deep', '画像=GPT or Gemini（目的次第）', '自動化=GAS+API 最小構成'],
    notes:
      'GPT=骨子/整形/台本。Deep=根拠収集と対立整理。画像: 構図=GPT 写実=Gemini。GASでメール→タスク→日程。基準は品質/速度/ライセンス/露出。',
  },
  {
    id: 'ch-05',
    kicker: 'DEMO',
    title: 'Deep Research 実演（根拠表）',
    bullets: ['問い→仮説→収集→要約→反証→結論', '主張/数値/日付/URL を分離', '意思決定1枚に着地'],
    notes:
      '例: 差分チェックの時短。仮説と評価指標(時間/誤検出/費用)を先に定義。出典は主張/根拠/日付/信頼度で表に。結論は採用条件付きで明示。',
  },
  {
    id: 'ch-06',
    kicker: 'COMPARE',
    title: '資料ツール比較の軸',
    bullets: ['骨子自動生成/共同編集/差し替え', 'ブランド固定/図解テンプレ/書き出し', '料金と席数/外部共有'],
    notes:
      '流行名ではなく評価軸。CSV差し替え更新、権限/履歴/コメント解決、ブランド保守、PPTX/PDF/長文の出力品質を確認。',
  },
  {
    id: 'ch-07',
    kicker: 'DEMO',
    title: 'エージェント実演（議題→配布）',
    bullets: ['議題→議事録→決定→タスク→日程', '承認ゲートで人が判断', '配布テンプレで即送信'],
    notes:
      '事務局の自動連鎖。会議名/目的/アジェンダ→ライブ要約→決定/ToDo分離→Sheets起票→候補日→配布メール。承認ポイント必須。',
  },
  {
    id: 'ch-08',
    kicker: 'WORK',
    title: 'HP 1ページを全員で',
    bullets: ['ヒーロー→課題→解決→証拠→CTA', '1行コピー×主役画像×1ボタン', '配布ページの雛形も同時作成'],
    notes:
      'ターゲット1行/ベネフィット1行/実証2行/CTAでLP化。過剰演出より“分かる導線”。',
  },
  {
    id: 'ch-09',
    kicker: 'WORK',
    title: '1ページ提案テンプレ',
    bullets: ['現状KPI→課題→解決→成果→条件', '体制/スケジュール/費用/次アクション', '1枚で意思決定'],
    notes: '冒頭に現状KPI。成果見込みは算式。最後に日付入りの次アクション。',
  },
  {
    id: 'ch-10',
    kicker: 'FLOW',
    title: '現地調査ワークフロー',
    bullets: ['準備→取得→整理→レポート→共有', '写真構図の標準化', '命名規則で資産化'],
    notes:
      '事前: 図面/用途/面積/許認可/チェック。現地: 外観四隅/導線/設備/盤/天井裏/床下/屋上/避難/光風/騒音。後処理: Exif/命名/ショートレポ。',
  },
  {
    id: 'ch-11',
    kicker: 'DEMO',
    title: '議事録自動化ミニ実演',
    bullets: ['議題→決定→アクション→期限', 'テンプレ差し込み3クリック', '件名/ファイル名を規格化'],
    notes: 'プロンプト: 議題/決定(番号)/アクション(担当/期限/依存)/リスク/次回。YYYY-MM-DD。',
  },
  {
    id: 'ch-12',
    kicker: 'IMAGE',
    title: '画像生成：役割で使い分け',
    bullets: ['構図整合=GPT、写実=Gemini', '下描き→指示→反復→部分リタッチ', 'PSで垂直補正/色調/ノイズ'],
    notes:
      '時間/季節/色温度/材質/比率を指定。生成後に窓割/光量/道路幅員など建築的整合を点検。',
  },
  {
    id: 'ch-13',
    kicker: 'DEMO',
    title: 'SpotPDF 実務デモ',
    bullets: ['A/B差分→自動ハイライト', '誤検出率/未検出率をKPI化', 'Webhookで承認フロー連携'],
    notes: 'レビュー時間/誤検出/未検出を案件別に記録。学習しきい値の根拠に。',
  },
  {
    id: 'ch-14',
    kicker: 'DEMO',
    title: 'GASミニデモ',
    bullets: ['メール→タスク起票→期限/担当', 'Sheets→Calendar→通知', '“最小実装”から回す'],
    notes: '正規表現で抽出。不足情報は人が補完。まず動かす→磨く。',
  },
  {
    id: 'ch-15',
    kicker: 'DEMO',
    title: '楽々省エネ 実演（モデル建物法）',
    bullets: ['入力最小化→自動計算→一括出力', '変更差分のみ再計算・履歴化', '提出ひな形まで直結'],
    notes: '定義→仕様→ダッシュボード→差分レポ。審査書式優先、再入力ゼロに。',
  },
  {
    id: 'ch-16',
    kicker: 'ASSETS',
    title: '配布物の解放',
    bullets: ['テンプレ/チェック/プロンプト集', 'GAS雛形/差分KPIシート', '非公開ページで一括DL'],
    notes:
      'URL/DL期限/再配布ポリシーを明記。プロンプトは構造化/表/YAML/検証の型で配る。',
  },
  {
    id: 'ch-17',
    kicker: 'CLOSE',
    title: 'クロージング',
    bullets: ['“心が動く×数字で分かる”を現場へ', '1案件1改善（2週間スプリント）', 'デモ日程/次アクション確定'],
    notes: 'KPIは差分時間/配布までの時間/提案返答率。無料PDFで合意形成を加速。',
  },
  {
    id: 'ch-18',
    kicker: 'Q&A',
    title: '無期限質問タイム',
    bullets: ['Discord常設', '月1相談会/限定交流会', 'ツール早期アクセス'],
    notes: '匿名OK。winsへ成功事例、bug-reportへ課題。アーカイブで復習可。',
  },
];

const NOTES_MAP: Record<string, string> = CHAPTER_SECTIONS.reduce<Record<string, string>>(
  (acc, s) => {
    acc[s.id] = s.notes;
    return acc;
  },
  {
    top: '冒頭: 当日配布なし→終了後に非公開HPで配布。集中して視聴を。',
    highlights: '“基礎/ハンズオン/直結/配布”の4点を速く。ここで価値を確信させる。',
    program: '押したら demo4=デモのみ、demo5=素材配布に切替。',
    chapters: 'クリックで各章へ。SキーでSlide Mode、Nでメモ呼び出し。',
    resources: '配布URL・Invite・DL期限・再配布ルールを示す。',
  }
);

// ===== Reveal / Timing =====
const REVEAL_ENABLED = false as const;

const SECTION_MINUTES: Record<string, number> = {
  top: 5,
  highlights: 5,
  program: 5,
  chapters: 5,
  resources: 5,
  'ch-01': 8,
  'ch-02': 10,
  'ch-03': 8,
  'ch-04': 8,
  'ch-05': 12,
  'ch-06': 8,
  'ch-07': 12,
  'ch-08': 10,
  'ch-09': 10,
  'ch-10': 8,
  'ch-11': 10,
  'ch-12': 12,
  'ch-13': 10,
  'ch-14': 10,
  'ch-15': 12,
  'ch-16': 6,
  'ch-17': 6,
  'ch-18': 10,
};

const totalPlanned = Object.values(SECTION_MINUTES).reduce((a, b) => a + b, 0);

// ========= Tiles =========
const DemoTile: React.FC<{ emoji: string; title: string; caption: string }> = ({ emoji, title, caption }) => (
  <Card className="p-5 transition-colors hover:bg-white">
    <div className="flex items-center gap-3">
      <div
        className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: '#E0F2FE', color: '#075985', fontSize: 18 }}
      >
        <span aria-hidden>{emoji}</span>
      </div>
      <div>
        <div className="text-sm md:text-base font-medium">{title}</div>
        <div className="text-xs md:text-sm text-slate-500">{caption}</div>
      </div>
    </div>
  </Card>
);

// ===== Dot Nav =====
const DotNav: React.FC<{ ids: string[]; activeId: string; onClick: (id: string) => void }> = ({ ids, activeId, onClick }) => (
  <div className="fixed left-3 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-2">
    {ids.map((id) => (
      <button
        key={id}
        aria-label={`Go to ${id}`}
        onClick={() => onClick(id)}
        className={`w-2.5 h-2.5 rounded-full border ${
          id === activeId ? 'bg-cyan-400 border-cyan-400' : 'bg-white/70 border-black/20 hover:bg-white'
        }`}
      />
    ))}
  </div>
);

// ===== Presenter HUD =====
const PresenterHUD: React.FC<{
  presenter: boolean;
  idx: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  elapsedSec: number;
  currentId: string;
}> = ({ presenter, idx, total, onPrev, onNext, elapsedSec, currentId }) => {
  if (!presenter) return null;
  const m = Math.floor(elapsedSec / 60);
  const s = (`0${elapsedSec % 60}`).slice(-2);
  const goal = SECTION_MINUTES[currentId] ?? 0;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-black/70 text-white text-xs shadow-lg">
        <button onClick={onPrev} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20">
          Prev
        </button>
        <div className="opacity-80">
          {idx + 1} / {total}
        </div>
        <button onClick={onNext} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20">
          Next
        </button>
        <div className="mx-2 h-4 w-px bg-white/20" />
        <div className="font-mono">
          {m}:{s}
        </div>
        {goal > 0 && <div className="text-white/80">/ 章目安 {goal}m</div>}
        <div className="ml-2 opacity-70 hidden md:inline">Shift+P HUD / S スライド / N ノート / P 印刷</div>
      </div>
    </div>
  );
};

// ===== Slide Mode =====
type Slide = { id: string; title?: string; subtitle?: string; lines?: string[]; img?: string; bg?: string };

const SLIDES: Slide[] = [
  {
    id: 's-hero',
    title: '実務で使える AI×建築セミナー',
    subtitle: '知る→できる→使える — 明日から“自分の武器”に',
    lines: ['2025-09-28 JST', '本編170分＋Q&A', 'アーカイブ配布あり'],
    bg: 'linear-gradient(120deg,#0ea5e9,#06b6d4)',
  },
  {
    id: 's-goals',
    title: '本日のゴール',
    lines: ['AI基礎→安全運用を自分ごと化', 'ワークフローにAIを“線で”つなぐ', "ハンズオンで『できた』を持ち帰る"],
    bg: '#0f172a',
  },
];

const SlideOverlay: React.FC<{
  visible: boolean;
  index: number;
  setIndex: (n: number) => void;
  onExit: () => void;
}> = ({ visible, index, setIndex, onExit }) => {
  const [fitContain, setFitContain] = useState(true);
  const [blank, setBlank] = useState<null | 'black' | 'white'>(null);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      const k = (e.key || '').toLowerCase();
      if (k === 'escape') {
        onExit();
        e.preventDefault();
        return;
      }
      if (k === 'f') {
        setFitContain((v) => !v);
        e.preventDefault();
        return;
      }
      if (k === 'b') {
        setBlank((v) => (v === 'black' ? null : 'black'));
        e.preventDefault();
        return;
      }
      if (k === 'w') {
        setBlank((v) => (v === 'white' ? null : 'white'));
        e.preventDefault();
        return;
      }
      if (k === 'arrowright' || k === 'arrowdown' || k === ' ') {
        setIndex(Math.min(index + 1, SLIDES.length - 1));
        e.preventDefault();
        return;
      }
      if (k === 'arrowleft' || k === 'arrowup' || k === 'pageup') {
        setIndex(Math.max(index - 1, 0));
        e.preventDefault();
        return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, index, setIndex, onExit]);

  if (!visible) return null;
  const s = SLIDES[index];
  if (blank) {
    return (
      <div
        data-testid="slide-overlay"
        className="fixed inset-0 z-50"
        style={{ background: blank === 'black' ? '#000' : '#fff' }}
      />
    );
  }

  return (
    <div data-testid="slide-overlay" className="fixed inset-0 z-50 text-white" style={{ background: s.bg || '#0f172a' }}>
      <div className={`w-full h-full flex items-center justify-center p-8 ${fitContain ? '' : 'object-cover'}`}>
        <div className="max-w-6xl w-full">
          {s.title ? (
            <h2 className="font-semibold" style={{ fontSize: 'clamp(28px, 6vw, 68px)', lineHeight: 1.1 }}>
              {s.title}
            </h2>
          ) : null}
          {s.subtitle ? (
            <p className="opacity-90 mt-2" style={{ fontSize: 'clamp(16px, 3.2vw, 28px)' }}>
              {s.subtitle}
            </p>
          ) : null}
          {s.lines && s.lines.length ? (
            <ul className="mt-4 space-y-2">
              {s.lines.map((t, i) => (
                <li key={i} className="opacity-90" style={{ fontSize: 'clamp(14px, 2.4vw, 24px)' }}>
                  - {t}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-full bg-black/50 text-white text-xs">
        <span>
          {index + 1} / {SLIDES.length}
        </span>
        <span className="opacity-80 hidden md:inline">←/→ or Space / Esc / F / B / W</span>
      </div>
    </div>
  );
};

// ===== Notes Overlay =====
const NotesOverlay: React.FC<{ open: boolean; text: string; onClose: () => void }> = ({ open, text, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-[42rem] w-[92vw] md:w-[42rem]">
      <div className="rounded-xl border border-black/10 bg-white/95 shadow-xl">
        <div className="px-3 py-2 text-[10px] text-slate-500 border-b">NOTES — Nで閉じる</div>
        <div className="p-4 max-h-[40vh] overflow-auto text-sm leading-relaxed whitespace-pre-wrap">
          {text || '(このセクションのメモは未設定)'}
        </div>
        <div className="px-3 py-2 flex justify-end">
          <button onClick={onClose} className="text-xs px-3 py-1 rounded bg-black/5 hover:bg-black/10">
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

// ========= Smoke Tests =========
function runSmokeTests(allIds: string[]): void {
  if (typeof document === 'undefined') return;

  const requiredIds = ['top', 'highlights', 'program', 'chapters', 'resources'];
  const missing = requiredIds.filter((id) => !document.getElementById(id));
  if (missing.length) console.error('[SMOKE] Missing sections:', missing);

  const chapterCards = document.querySelectorAll('#chapters [data-testid="chapter-card"]');
  if (chapterCards.length !== CHAPTERS.length)
    console.warn(`* Expected ${CHAPTERS.length} chapter cards but found ${chapterCards.length}.`);

  const chapSections = document.querySelectorAll('[data-chapter-section="true"]');
  if (chapSections.length !== CHAPTER_SECTIONS.length)
    console.warn(`* Expected ${CHAPTER_SECTIONS.length} chapter sections but found ${chapSections.length}.`);

  const missingNotes = CHAPTER_SECTIONS.filter((s) => !NOTES_MAP[s.id]);
  if (missingNotes.length) console.warn('[SMOKE] Missing notes:', missingNotes.map((s) => s.id));

  const scrollRoot = document.querySelector('[data-scroll-root="true"]');
  if (!scrollRoot) console.warn('[SMOKE] Scroll root not found.');

  console.log(`[SMOKE] All sections: ${allIds.length}, chapters: ${CHAPTERS.length}`);
}

export default function SeminarLanding(): React.ReactElement {
  const baseOrder = useMemo(() => ['top', 'highlights', 'program', 'chapters'], []);
  const allIds = useMemo(() => [...baseOrder, ...CHAPTERS.map((c) => c.id), 'resources'], [baseOrder]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [presenter, setPresenter] = useState(false);
  const [idx, setIdx] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const [slideMode, setSlideMode] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);

  const [notesOpen, setNotesOpen] = useState(false);
  const [visibleId, setVisibleId] = useState<string>('top');

  const [revealCount, setRevealCount] = useState(0);

  const startRef = useRef<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  useEffect(() => {
    if (startRef.current === null) startRef.current = Date.now();
    const t = setInterval(() =>
      setElapsedSec(Math.floor((Date.now() - (startRef.current || Date.now())) / 1000)),
    1000);
    return () => clearInterval(t);
  }, []);

  const scrollToId = (id: string) => {
    const el = id ? document.getElementById(id) : null;
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const goByDelta = (d: number) => {
    const n = Math.min(Math.max(idx + d, 0), allIds.length - 1);
    setIdx(n);
    setRevealCount(0);
    scrollToId(allIds[n]);
  };

  useEffect(() => {
    const initIdx = () => {
      const distances = allIds.map((id) => {
        const el = document.getElementById(id);
        return el ? Math.abs(el.getBoundingClientRect().top) : Number.MAX_SAFE_INTEGER;
      });
      const min = Math.min(...distances);
      const i = Math.max(0, distances.indexOf(min));
      setIdx(i);
      setVisibleId(allIds[i]);
    };
    initIdx();

    const onKey = (e: KeyboardEvent) => {
      const k = (e.key || '').toLowerCase();
      if (e.shiftKey && k === 'p') {
        setPresenter((v) => !v);
        e.preventDefault();
        return;
      }
      if (k === 'n') {
        setNotesOpen((v) => !v);
        e.preventDefault();
        return;
      }
      if (k === 's') {
        setSlideMode((v) => !v);
        if (!presenter) setPresenter(true);
        e.preventDefault();
        return;
      }
      if (k === 'p' && presenter && !slideMode) {
        window.print();
        e.preventDefault();
        return;
      }
      if (!presenter || slideMode) return;
      if (REVEAL_ENABLED && (k === '.' || k === 'enter')) {
        setRevealCount((c) => c + 1);
        e.preventDefault();
        return;
      }
      if (REVEAL_ENABLED && (k === ',' || k === 'backspace')) {
        setRevealCount((c) => Math.max(0, c - 1));
        e.preventDefault();
        return;
      }
      if (k === 'arrowdown' || k === 'pagedown' || k === ' ') {
        goByDelta(1);
        e.preventDefault();
      }
      if (k === 'arrowup' || k === 'pageup') {
        goByDelta(-1);
        e.preventDefault();
      }
      if (k === 'g') {
        scrollToId('program');
        e.preventDefault();
      }
      if (k === 'c') {
        scrollToId('chapters');
        e.preventDefault();
      }
      if (k === 'r') {
        scrollToId('resources');
        e.preventDefault();
      }
      if (k === 't' || k === 'home') {
        scrollToId('top');
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    runSmokeTests(allIds);
    return () => window.removeEventListener('keydown', onKey);
  }, [presenter, slideMode, allIds, idx]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const dists = allIds.map((id) => {
        const sec = document.getElementById(id);
        return sec ? Math.abs(sec.getBoundingClientRect().top) : Number.MAX_SAFE_INTEGER;
      });
      const min = Math.min(...dists);
      const i = Math.max(0, dists.indexOf(min));
      if (allIds[i] !== visibleId) setRevealCount(0);
      setIdx(i);
      setVisibleId(allIds[i]);
      const p = el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight);
      setScrollProgress(Math.min(1, Math.max(0, p)));
    };
    el.addEventListener('scroll', onScroll, { passive: true } as AddEventListenerOptions);
    onScroll();
    return () => el.removeEventListener('scroll', onScroll as EventListener);
  }, [allIds, visibleId]);

  const notesText = NOTES_MAP[visibleId] || '';

  const renderBullets = (bullets: string[], sectionId: string) => {
    const count = REVEAL_ENABLED && visibleId === sectionId ? revealCount : bullets.length;
    return bullets.map((b, i) => (
      <li
        key={i}
        className={`transition-all duration-300 ${i < count ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
      >
        - {b}
      </li>
    ));
  };

  return (
    <div
      data-testid="root-bg"
      data-scroll-root="true"
      ref={containerRef}
      className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth text-slate-900"
      style={{
        backgroundImage:
          'radial-gradient(1200px 500px at 10% -10%, #E0F2FE 0%, transparent 50%), radial-gradient(900px 400px at 100% 10%, #FDE68A 0%, transparent 45%)',
        backgroundColor: brand.colors.bg,
      }}
    >
      <style id="slide-theme">{`
:root{--slide-h1:clamp(44px,9vw,120px);--slide-h2:clamp(28px,5.5vw,64px);--slide-body:clamp(16px,2.2vw,22px)}
section h1{font-size:var(--slide-h1);line-height:1.05;font-weight:800;letter-spacing:-.01em}
section h2{font-size:var(--slide-h2);line-height:1.1;font-weight:800;letter-spacing:-.01em}
section p,section li,section .text-slate-600{font-size:var(--slide-body)}
`}</style>

      {/* TOP */}
      <Section id="top" className="pt-16 md:pt-24" data-testid="sec-top">
        <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center">
          <div>
            <Badge>
              <span aria-hidden>✨</span> 実務で使える AI×建築セミナー
            </Badge>
            <h1 className="mt-4 font-semibold leading-tight">
              知る→できる→使える
              <br className="hidden md:block" /> 明日から“自分の武器”に
            </h1>
            <div className="mt-4 flex flex-wrap gap-3">
              <Pill text="📅 2025-09-28 JST" />
              <Pill text="⏱ 本編170分＋Q&A" />
              <Pill text="🎞 アーカイブ配布あり" />
            </div>
            <Card className="mt-6 p-5 border border-cyan-100 bg-white/90">
              <div className="text-sm font-medium text-slate-900">このページで把握できること</div>
              <ul className="mt-3 space-y-2 text-xs md:text-sm text-slate-600 list-disc list-inside">
                <li>180分の進行とゴールを俯瞰できる「一枚スライド」形式</li>
                <li>ハンズオンの内容・使うAIスタック・成果物を全章で提示</li>
                <li>非公開配布物と招待コード運用（AP-2025-SEMINAR）の説明</li>
                <li>講師メモ（Nキー）／スライドモード（Sキー）で現場運営</li>
              </ul>
            </Card>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600">
              建築実務にAIを定着させるための180分。ワークフローを線でつなぎ、講師が現場で使っているAIスタックを全て公開します。
              本番ではこのページをそのままスライド代わりに使い、進行・メモ・配布を一元管理します。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#program"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-white"
                style={{ background: brand.colors.accent }}
              >
                プログラムを見る <span>›</span>
              </a>
              <a
                href="#resources"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border"
                style={{ borderColor: '#CBD5E1' }}
              >
                資料と配布物 <span>›</span>
              </a>
            </div>
            <div className="mt-3 text-xs md:text-sm text-slate-500">非公開運用のため検索結果に出ない設定。URLは受講者専用です。</div>
          </div>
          <Card className="p-4 md:p-6">
            <div className="aspect-[16/10] rounded-lg bg-gradient-to-br from-white to-slate-50 border border-black/5 flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm md:text-base font-medium">サイト全体が進行台本</div>
                <div className="mt-1 text-xs md:text-sm text-slate-500">段階表示・ノート・スライドモードを搭載</div>
                <div className="mt-4 inline-flex items-center gap-2 text-xs md:text-sm px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                  <span aria-hidden>🛡</span> robots noindex ／ 招待コード運用
                </div>
                <div className="mt-4 text-xs text-slate-500">
                  Shift+P で HUD、S でスライド表示、N で講師メモ。
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      {/* HIGHLIGHTS */}
      <Section id="highlights" className="mt-12 md:mt-20" data-testid="sec-highlights">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-semibold text-2xl text-slate-900">ハイライト</h2>
          <p className="mt-3 text-sm md:text-base text-slate-600">
            AI導入を検討する建築チームが「何が」「どこまで」できるのかを短時間で掴める構成です。基礎→実務→配布物まで一直線で把握できます。
          </p>
          <div className="mt-6 grid md:grid-cols-4 gap-4 md:gap-6">
            <DemoTile emoji="🧠" title="AI基礎→安全運用" caption="共通言語と社内ルール" />
            <DemoTile emoji="⌨️" title="ハンズオン5本" caption="真似→転用まで体験" />
            <DemoTile emoji="🏗️" title="SpotPDF×省エネ" caption="実務に直結する導線" />
            <DemoTile emoji="⬇️" title="配布物一括" caption="非公開ページで受領" />
          </div>
        </div>
      </Section>

      {/* PROGRAM */}
      <Section id="program" className="mt-16 md:mt-24" data-testid="sec-program">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="font-semibold text-2xl text-slate-900">プログラム</h2>
            <Badge>
              <span aria-hidden>🗺️</span> ライブはスライド最小、HPで全体俯瞰
            </Badge>
          </div>
          <div className="mt-6 grid lg:grid-cols-3 gap-6">
            <Card className="p-5">
              <div className="text-sm font-medium text-slate-900">第1部 0–70分</div>
              <div className="mt-3 text-slate-600 text-sm md:text-base">AI基礎、役割シフト、セキュリティ、ミニ実演、NotebookLM</div>
            </Card>
            <Card className="p-5">
              <div className="text-sm font-medium text-slate-900">第2部 70–160分</div>
              <div className="mt-3 text-slate-600 text-sm md:text-base">ワークフロー導線、現調→提案、SpotPDF、省エネ、LP生成、GAS</div>
            </Card>
            <Card className="p-5">
              <div className="text-sm font-medium text-slate-900">第3部 160–170分</div>
              <div className="mt-3 text-slate-600 text-sm md:text-base">まとめ、KPI、運用ルール、ベストプラクティス</div>
            </Card>
          </div>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <DemoTile emoji="📄" title="1ページ提案" caption="KPIと合意形成" />
            <DemoTile emoji="🖼️" title="画像生成の使い分け" caption="GPTとGeminiの役割" />
            <DemoTile emoji="🚀" title="ベストプラクティス10" caption="明日からの実装" />
          </div>
        </div>
      </Section>

      {/* CHAPTERS */}
      <Section id="chapters" className="mt-16 md:mt-24" data-testid="sec-chapters">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-semibold text-2xl text-slate-900">チャプター索引（クリックで移動）</h2>
          <div className="mt-4 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {CHAPTERS.map((c) => (
              <Card
                key={c.id}
                className="px-4 py-3 cursor-pointer"
                data-testid="chapter-card"
                onClick={() => {
                  setRevealCount(0);
                  scrollToId(c.id);
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{String(c.no).padStart(2, '0')}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5">LIVE</span>
                </div>
                <div
                  className="mt-2 text-sm font-medium"
                  style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                >
                  {c.title}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* CHAPTER SECTIONS */}
      {CHAPTER_SECTIONS.map((s) => (
        <Section
          id={s.id}
          key={s.id}
          data-chapter-section="true"
          onClick={() => presenter && REVEAL_ENABLED && setRevealCount((c) => c + 1)}
        >
          <div className="max-w-6xl mx-auto">
            {s.kicker ? <div className="text-xs tracking-widest text-slate-500">{s.kicker}</div> : null}
            <h2 className="font-extrabold text-slate-900">{s.title}</h2>
            <ul className="mt-4 space-y-2 text-slate-700">
              {renderBullets(s.bullets, s.id)}
            </ul>
          </div>
        </Section>
      ))}

      {/* RESOURCES */}
      <Section id="resources" className="mt-16 md:mt-24" data-testid="sec-resources">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="font-semibold text-2xl text-slate-900">配布とアーカイブ</h2>
            <Badge color="#FEF3C7">
              <span aria-hidden>🔒</span> 受講者限定
            </Badge>
          </div>
          <Card className="mt-4 p-6">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <div className="text-sm md:text-base font-medium text-slate-900">非公開ページで一括配布</div>
                <ul className="mt-3 text-slate-600 space-y-2 list-disc list-inside">
                  <li>アーカイブ動画</li>
                  <li>スライドPDF（要点のみ）</li>
                  <li>テンプレ、チェックリスト、プロンプト集</li>
                  <li>SpotPDF差分サンプル、GAS雛形、エネルギー計算レシピ</li>
                </ul>
                <div className="mt-4 text-xs text-slate-500">配布は終了後にURLを送付。検索避け設定済み。</div>
              </div>
              <div className="p-4 rounded-lg border border-dashed border-slate-300 bg-white/80">
                <div className="text-xs text-slate-500">Invite Code</div>
                <div className="mt-2 flex gap-2">
                  <input
                    aria-label="招待コード"
                    placeholder="招待コードを入力"
                    data-testid="invite-code-input"
                    className="flex-1 px-3 py-2 rounded-md border outline-none focus:ring-2 focus:ring-cyan-300"
                  />
                  <button className="px-4 py-2 rounded-md text-white" style={{ background: brand.colors.accent }}>
                    開く
                  </button>
                </div>
                <div className="mt-2 text-xs text-slate-500">参加者のみアクセス可。第三者共有は不可。</div>
              </div>
            </div>
          </Card>
          <div className="mt-6 text-xs text-slate-500">
            招待コード: <span className="font-semibold text-slate-900">AP-2025-SEMINAR</span> ／ 所要時間: {totalPlanned}分（予定）
          </div>
        </div>
      </Section>

      {/* FOOTER */}
      <footer className="mt-20 md:mt-28 py-10 border-t border-slate-200 bg-white/80 backdrop-blur">
        <Section id="meta">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-slate-500">
            <div>
              © 2025 Archi‑Prisma Design works<span className="mx-2">|</span> 非公開運用 robots noindex, nofollow
              <span className="mx-2">|</span> v1.0
            </div>
            <div className="flex flex-wrap gap-3">
              <Pill text="🛡 受講者限定" />
              <Pill text="⬇️ 配布は終了後" />
              <Pill text="🚀 Circle初月無料案内あり" />
            </div>
          </div>
          <div className="max-w-6xl mx-auto mt-4 flex flex-wrap gap-6 text-xs text-slate-500">
            <a href="https://archi-prisma.co.jp" target="_blank" rel="noreferrer" className="hover:text-cyan-600">
              コーポレートサイト
            </a>
            <a href="mailto:contact@archi-prisma.co.jp" className="hover:text-cyan-600">
              お問い合わせ
            </a>
            <a href="./terms.pdf" className="hover:text-cyan-600">
              受講規約
            </a>
          </div>
        </Section>
      </footer>

      {/* HUD + DOT NAV */}
      <PresenterHUD
        presenter={presenter}
        idx={idx}
        total={allIds.length}
        onPrev={() => goByDelta(-1)}
        onNext={() => goByDelta(1)}
        elapsedSec={elapsedSec}
        currentId={visibleId}
      />

      <DotNav
        ids={allIds}
        activeId={visibleId}
        onClick={(id) => {
          setRevealCount(0);
          scrollToId(id);
        }}
      />
      <div className="fixed right-3 top-1/2 -translate-y-1/2 z-30 hidden md:block">
        <div className="w-1.5 h-40 bg-black/10 rounded-full overflow-hidden">
          <div className="w-full bg-cyan-400" style={{ height: `${Math.round(scrollProgress * 100)}%` }} />
        </div>
      </div>

      {/* Overlays */}
      <NotesOverlay open={notesOpen} text={notesText} onClose={() => setNotesOpen(false)} />
      <SlideOverlay visible={slideMode} index={slideIdx} setIndex={setSlideIdx} onExit={() => setSlideMode(false)} />
    </div>
  );
}
