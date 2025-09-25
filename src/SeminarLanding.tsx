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
    className={`w-full px-6 md:px-12 py-16 md:py-24 min-h-[100svh] snap-start flex flex-col justify-center ${className || ''}`}
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

const CHAPTER_SUMMARIES: Record<string, string> = {
  'ch-01': '進行の全体像と期待値をそろえる冒頭パート',
  'ch-02': 'AI/LLMの特性と安全運用を社内で共有する基礎',
  'ch-03': 'ChatGPTで短時間に仕上げる定型ドキュメント群',
  'ch-04': '用途別にAIスタックを切り替える判断軸を解説',
  'ch-05': 'Deep Researchで根拠付き調査レポートを生成',
  'ch-06': '資料ツールを比較しブランド統一と共同編集を設計',
  'ch-07': '議題から配布まで自動化するエージェント運用',
  'ch-08': 'ワークショップでLPを共同制作し導線設計を体感',
  'ch-09': '1ページ提案テンプレで意思決定を加速させる',
  'ch-10': '現場調査からレポート化までを標準化する',
  'ch-11': '議事録の自動整形とタスク化を最小工数で実装',
  'ch-12': 'GPTとGeminiの画像生成を役割ごとに最適化',
  'ch-13': 'SpotPDFで差分チェックと承認フローを自動化',
  'ch-14': 'GAS連携でメール→タスク→カレンダーを連動',
  'ch-15': '省エネ計算を自動化し提出書式まで一気通貫',
  'ch-16': 'テンプレ／雛形を配布し社内展開の初速を上げる',
  'ch-17': 'KPI・ロードマップで導入の次アクションを決定',
  'ch-18': '無期限Q&Aとコミュニティで定着を支援',
};

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
]

const chapterVisuals: Record<string, React.ReactNode> = {
  'ch-01': (
    <div className="rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-600">
      <div className="text-[11px] font-semibold text-slate-900 uppercase tracking-[0.3em]">Agenda Snapshot</div>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
          <span>00-10分</span><span>チェックイン・MVV共有</span>
        </div>
        <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
          <span>10-25分</span><span>期待値調整と進行説明</span>
        </div>
        <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
          <span>25-40分</span><span>デモ導線予告＆QA</span>
        </div>
      </div>
    </div>
  ),
  'ch-02': (
    <div className="rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-600">
      <div className="text-[11px] font-semibold text-slate-900 uppercase tracking-[0.3em]">LLMリスクマトリクス</div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md bg-cyan-50 px-2 py-2">
          <div className="text-[10px] text-cyan-800">幻覚</div>
          <div className="mt-1 text-[11px] text-slate-600">構造化プロンプト＋検証</div>
        </div>
        <div className="rounded-md bg-amber-50 px-2 py-2">
          <div className="text-[10px] text-amber-800">最新性</div>
          <div className="mt-1 text-[11px] text-slate-600">更新頻度とソース管理</div>
        </div>
        <div className="rounded-md bg-rose-50 px-2 py-2">
          <div className="text-[10px] text-rose-800">秘匿性</div>
          <div className="mt-1 text-[11px] text-slate-600">承認フローとマスキング</div>
        </div>
      </div>
    </div>
  ),
  'ch-05': (
    <div className="rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-600">
      <div className="text-[11px] font-semibold text-slate-900 uppercase tracking-[0.3em]">評価指標サンプル</div>
      <table className="mt-3 w-full text-left text-[11px]">
        <thead className="text-slate-500">
          <tr><th className="py-1">項目</th><th className="py-1">指標</th><th className="py-1">目標</th></tr>
        </thead>
        <tbody className="text-slate-600">
          <tr className="border-t"><td className="py-1">誤検出率</td><td className="py-1">False Positive</td><td className="py-1">≦5%</td></tr>
          <tr className="border-t"><td className="py-1">未検出率</td><td className="py-1">False Negative</td><td className="py-1">≦3%</td></tr>
          <tr className="border-t"><td className="py-1">調査時間</td><td className="py-1">1案件あたり</td><td className="py-1">-40%</td></tr>
        </tbody>
      </table>
    </div>
  ),
  'ch-08': (
    <div className="rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-600">
      <div className="text-[11px] font-semibold text-slate-900 uppercase tracking-[0.3em]">LPワイヤーフレーム</div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="col-span-3 rounded-md border border-slate-200 bg-slate-50 py-2 text-center text-[11px]">ヒーロー：キャッチ／ビジュアル／CTA</div>
        <div className="col-span-2 rounded-md border border-slate-200 bg-slate-50 py-2 text-center text-[11px]">課題と解決策</div>
        <div className="rounded-md border border-slate-200 bg-slate-50 py-2 text-center text-[11px]">証拠</div>
        <div className="col-span-3 rounded-md border border-slate-200 bg-slate-50 py-2 text-center text-[11px]">CTA＋配布導線</div>
      </div>
    </div>
  ),
  'ch-12': (
    <div className="rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-600">
      <div className="text-[11px] font-semibold text-slate-900 uppercase tracking-[0.3em]">ツール使い分けマップ</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-md bg-cyan-50 p-3">
          <div className="text-[11px] font-semibold text-cyan-800">GPT</div>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>シーン設定・構図指示</li>
            <li>素材差し替え</li>
            <li>シリーズ生成</li>
          </ul>
        </div>
        <div className="rounded-md bg-amber-50 p-3">
          <div className="text-[11px] font-semibold text-amber-800">Gemini</div>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>写実表現・温度調整</li>
            <li>部分リタッチ</li>
            <li>海外素材の補完</li>
          </ul>
        </div>
      </div>
    </div>
  ),
  'ch-16': (
    <div className="rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-600">
      <div className="text-[11px] font-semibold text-slate-900 uppercase tracking-[0.3em]">配布物リスト</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-md bg-slate-50 p-3">テンプレート 15本</div>
        <div className="rounded-md bg-slate-50 p-3">チェックリスト 8本</div>
        <div className="rounded-md bg-slate-50 p-3">プロンプト集 70種</div>
        <div className="rounded-md bg-slate-50 p-3">GAS雛形 3本</div>
      </div>
    </div>
  ),
};

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
    subtitle: '明日から“自分ごと”に落とし込む3時間',
    lines: [
      '2025-09-28 JST / Live + 14日アーカイブ',
      '対象: 設計・デザイン・ゼネコン・DX推進',
      'Invite: AP-2025-SEMINAR',
    ],
    bg: 'linear-gradient(120deg,#38bdf8,#0f172a)',
  },
  {
    id: 's-opening',
    title: 'オープニング',
    lines: [
      '講師: 櫻本 聖成（Archi-Prisma / archisoft）',
      'この3時間で『知る→できる→使える』を体感',
      '資料・プロンプト・GAS雛形を持ち帰り',
    ],
    bg: 'linear-gradient(135deg,#0f172a,#1e293b)',
  },
  {
    id: 's-mindset',
    title: 'マインドセット',
    lines: [
      '学びは『聞く→やる→話す→教える』で定着',
      'ハンズオンで“ドヤ顔で教えられる”状態へ',
      'Instagramで復習＆最新Tipsを配信',
    ],
    bg: 'linear-gradient(135deg,#1e293b,#334155)',
  },
  {
    id: 's-learning-cycle',
    title: '学習サイクル',
    lines: [
      '1. インプット（聞く・見る）',
      '2. リハーサル（真似る）',
      '3. 転用（自分ごと化）',
      '4. アウトプット（共有・教える）',
    ],
    bg: 'linear-gradient(135deg,#0ea5e9,#1e293b)',
  },
  {
    id: 's-need',
    title: '今なぜAI×建築か',
    lines: [
      '建築DXの要望増 (前年比+42%)',
      '現場ナレッジ共有の分断',
      '審査で求められる透明性・説明責任',
    ],
    bg: 'linear-gradient(135deg,#1e293b,#475569)',
  },
  {
    id: 's-goals',
    title: '今日のゴール',
    lines: [
      '共通言語: AI導入の判断軸を揃える',
      '体験: 現調→提案→自動化ワークを一気通貫',
      '即実装: 配布資料で社内展開を開始',
    ],
    bg: 'linear-gradient(135deg,#38bdf8,#0f172a)',
  },
  {
    id: 's-agenda',
    title: '進行マップ',
    lines: [
      'Phase 1 (0-70分): AI基礎と安全運用',
      'Phase 2 (70-160分): 現調→提案→自動化デモ',
      'Phase 3 (160-170分+): KPI・配布・Q&A',
    ],
    bg: 'linear-gradient(135deg,#0f172a,#1e293b)',
  },
  {
    id: 's-phase1-overview',
    title: 'Phase 1｜基礎・基本・ノウハウ',
    lines: [
      'LLMの特性と安全運用を整理',
      '建築業務における役割シフトを理解',
      'ベースとなる資料とテンプレを準備',
    ],
    bg: 'linear-gradient(135deg,#1e40af,#0f172a)',
  },
  {
    id: 's-ai-basics',
    title: 'AIの基礎',
    lines: [
      '生成AIの歴史と転換点',
      'CAD→BIM→AIの流れ',
      '今学ぶべき理由と業界トレンド',
    ],
    bg: 'linear-gradient(135deg,#1e293b,#334155)',
  },
  {
    id: 's-future-roles',
    title: 'AIと建築家の役割シフト',
    lines: [
      '残る仕事: 企画・物語・統合',
      'AIでオフロードする作業を選定',
      'チームで役割を再設計',
    ],
    bg: 'linear-gradient(135deg,#334155,#0f172a)',
  },
  {
    id: 's-security',
    title: 'セキュリティ・リスク',
    lines: [
      '機密区分と入力ルール（匿名化・置換）',
      'クラウドAIの権限・共有リンク・ログ管理',
      '社内ポリシー雛形（秘匿プロンプト・レビュー・承認）',
    ],
    bg: 'linear-gradient(135deg,#0f172a,#1e293b)',
  },
  {
    id: 's-mini-demo',
    title: '基礎ミニ実演',
    lines: [
      '会議音声→要点抽出→表整形',
      'テンプレ差し込みで議事録骨子生成',
      '出力を共有フォルダへ保存',
    ],
    bg: 'linear-gradient(135deg,#1e293b,#111827)',
  },
  {
    id: 's-prompt-tips',
    title: 'プロンプト活用Tips',
    lines: [
      '構造化して: 会議メモ→要点→決定→ToDo',
      'yamlでまとめて: 指示書を即共有',
      '抽象化→具体化で骨子を強化',
      '検証して: 根拠付き要約と参照列挙',
    ],
    bg: 'linear-gradient(135deg,#111827,#1f2937)',
  },
  {
    id: 's-notebooklm',
    title: 'Google NotebookLM',
    lines: [
      '難しい資料を音声学習に変換',
      '入力ソース準拠で幻覚を抑制',
      '社内教材・研修に転用可能',
    ],
    bg: 'linear-gradient(135deg,#475569,#0f172a)',
  },
  {
    id: 's-notebooklm-use',
    title: 'NotebookLM 活用例',
    lines: [
      '法規・省エネ基準の理解',
      '海外論文の要点把握',
      '専門用語辞書の自動生成',
    ],
    bg: 'linear-gradient(135deg,#0f172a,#1e293b)',
  },
  {
    id: 's-phase1-summary',
    title: 'Phase 1 まとめ',
    lines: [
      'リスクマトリクス／承認フローを配布',
      '成功体験を共有し“教える人”へ',
      'Instagramで復習＆共有を促進',
    ],
    bg: 'linear-gradient(135deg,#1e293b,#475569)',
  },
  {
    id: 's-phase2-intro',
    title: 'Phase 2｜業務ワークフロー',
    lines: [
      '調査→設計→コミュ→見積→省エネ→提出',
      'AI導線マップでROIを可視化',
      'ワークシートで自分の導線を記入',
    ],
    bg: 'linear-gradient(135deg,#38bdf8,#0f172a)',
  },
  {
    id: 's-workflow-hands',
    title: 'ワークフロー手を動かす',
    lines: [
      '現状フローとAI候補を記入',
      'ボトルネックと期待効果を共有',
      'ペアでフィードバック＆改善案',
    ],
    bg: 'linear-gradient(135deg,#0f172a,#1e293b)',
  },
  {
    id: 's-demo1',
    title: '活用① 現調→議事録→即提案',
    lines: [
      '音声→議事録テンプレ→提案資料',
      '構造化プロンプト＋表整形で高速化',
      'Canvas/SpotPDFへの導線',
    ],
    bg: 'linear-gradient(135deg,#1e293b,#111827)',
  },
  {
    id: 's-demo1-hands',
    title: 'Demo① ハンズオン',
    lines: [
      'サンプル音声をNotebookに投入',
      '"構造化して" で要点抽出',
      '"表形式で" で提案骨子整形',
    ],
    bg: 'linear-gradient(135deg,#111827,#1f2937)',
  },
  {
    id: 's-demo1-out',
    title: 'Demo① 成果物',
    lines: [
      '議事録骨子（個人成果物）',
      '提案資料ドラフト',
      '共有用プロンプトセット',
    ],
    bg: 'linear-gradient(135deg,#0f172a,#1e293b)',
  },
  {
    id: 's-demo2',
    title: '活用② SpotPDF 差分 5分決着',
    lines: [
      'A/B図面の差分抽出→自動ハイライト',
      'コメント→PDF化→共有',
      '承認ログとしてDrive保存',
    ],
    bg: 'linear-gradient(135deg,#1e293b,#475569)',
  },
  {
    id: 's-demo2-hands',
    title: 'Demo② ハンズオン',
    lines: [
      'サンプル図面で差分抽出',
      'ハイライト箇所をコメント',
      'PDF出力をDriveへ保存',
    ],
    bg: 'linear-gradient(135deg,#38bdf8,#0f172a)',
  },
  {
    id: 's-demo3',
    title: '活用③ 省エネ（モデル建物法）',
    lines: [
      '入力最小化→再計算→提出ひな形',
      'BEIと条件変更の比較',
      '審査用ドキュメントと連携',
    ],
    bg: 'linear-gradient(135deg,#0f172a,#1e293b)',
  },
  {
    id: 's-demo3-hands',
    title: 'Demo③ ハンズオン',
    lines: [
      'Excelに条件入力→BEI算出',
      '再計算ボタンで差分確認',
      '提出書式を自動生成',
    ],
    bg: 'linear-gradient(135deg,#1e293b,#111827)',
  },
  {
    id: 's-demo4',
    title: '活用④ HP／資料即作成',
    lines: [
      'ChatGPT／Gemini CanvasでミニLP生成',
      '1ブロック編集→保存',
      '配布用ミニLPテンプレも提供',
    ],
    bg: 'linear-gradient(135deg,#111827,#1f2937)',
  },
  {
    id: 's-demo5',
    title: '活用⑤ GASでタスク通知',
    lines: [
      'Spreadsheet→GAS→Gmail通知',
      'トリガ設定と権限の確認',
      'コードをコピペして挙動確認',
    ],
    bg: 'linear-gradient(135deg,#1f2937,#0f172a)',
  },
  {
    id: 's-risk-buffer',
    title: '時間押しリスクへの備え',
    lines: [
      '5分押し→Demo4はデモのみ',
      '10分押し→Demo5は素材配布',
      'ハンズオンは成功体験優先',
    ],
    bg: 'linear-gradient(135deg,#0f172a,#1e293b)',
  },
  {
    id: 's-phase3',
    title: 'Phase 3｜まとめと今後',
    lines: [
      'ケーススタディ＆KPIを共有',
      '小規模チーム運用ルール雛形',
      '実装チェックリストで定着',
    ],
    bg: 'linear-gradient(135deg,#1e293b,#475569)',
  },
  {
    id: 's-kpi',
    title: '導入後のKPI例',
    lines: [
      '工数削減 / 誤検出率 / レスポンス速度',
      'ベンチマークを定期記録',
      '改善結果を見える化',
    ],
    bg: 'linear-gradient(135deg,#38bdf8,#0f172a)',
  },
  {
    id: 's-best1',
    title: 'ベストプラクティス 1/2',
    lines: [
      '小さく始めて早く回す',
      '入力を整備（匿名化・フォーマット）',
      '出力の型を決める（YAML/表/テンプレ）',
      '差分は機械に任せる',
      '再計算は自動化が前提',
    ],
    bg: 'linear-gradient(135deg,#0f172a,#1e293b)',
  },
  {
    id: 's-best2',
    title: 'ベストプラクティス 2/2',
    lines: [
      '運用できる最小ルールから',
      '根拠を併記して信頼を積む',
      '指標で語る（時間・誤差・利益）',
      '教える人になる（共有＝定着）',
      '毎週1改善で仕組みに落とす',
    ],
    bg: 'linear-gradient(135deg,#1e293b,#475569)',
  },
  {
    id: 's-checklist',
    title: '明日からの実装チェック',
    lines: [
      '業務導線マップを更新',
      'テンプレとプロンプト集を配布',
      'GAS通知PoCを1本動かす',
      'KPI測定の初期値を記録',
    ],
    bg: 'linear-gradient(135deg,#38bdf8,#0f172a)',
  },
  {
    id: 's-resources',
    title: '配布物セット',
    lines: [
      'アーカイブ動画・スライド・リンク集',
      'プロンプト集（Markdown+YAML）',
      'GAS雛形・モデル建物法レシピ',
    ],
    bg: 'linear-gradient(135deg,#0f172a,#1e293b)',
  },
  {
    id: 's-materials',
    title: '資料とワークシート',
    lines: [
      'Driveに音声/図面/エネルギー入力を格納',
      'Canvas素材とGASサンプル',
      'ワークフローシートとチェックリスト',
    ],
    bg: 'linear-gradient(135deg,#1e293b,#111827)',
  },
  {
    id: 's-community-intro',
    title: 'ラストシークレット',
    lines: [
      'AI×建築コミュニティ（Circle）を開放',
      '今後のセミナーは追加費用なし',
      '初月無料・72時間限定オファー',
    ],
    bg: 'linear-gradient(135deg,#111827,#1f2937)',
  },
  {
    id: 's-community-benefits',
    title: 'コミュニティ特典',
    lines: [
      '月1 Zoom相談会／限定交流会',
      'SpotPDF・楽々省エネ・天空率の早期アクセス',
      '最新ナレッジを最速公開',
    ],
    bg: 'linear-gradient(135deg,#0f172a,#1e293b)',
  },
  {
    id: 's-community-rules',
    title: 'コミュニティの運用',
    lines: [
      '実名推奨・守秘情報の持込禁止',
      '成果物二次配布はクレジット必須',
      'Circle + Zoom + Driveで運用',
    ],
    bg: 'linear-gradient(135deg,#1e293b,#475569)',
  },
  {
    id: 's-community-join',
    title: '参加方法',
    lines: [
      'クロージングで招待コードを提示',
      '72時間以内に申込→初月無料',
      'オンボーディングで課題とライブ予定を共有',
    ],
    bg: 'linear-gradient(135deg,#38bdf8,#0f172a)',
  },
  {
    id: 's-last-secret',
    title: 'ラストシークレット構成',
    lines: [
      'Slide1: 初月無料の案内',
      'Slide2-4: サロン特典とツール',
      'Slide5: 招待コード＆72時間限定',
    ],
    bg: 'linear-gradient(135deg,#0f172a,#1e293b)',
  },
  {
    id: 's-survey',
    title: 'アンケート＆Q&A',
    lines: [
      '170分時点でアンケートURLを案内',
      '回答後に非公開ページを解放',
      'Q&Aは無制限・退出自由',
    ],
    bg: 'linear-gradient(135deg,#1e293b,#475569)',
  },
  {
    id: 's-instagram',
    title: 'Instagramで復習',
    lines: [
      '最新Tipsは @sena_archisoft で発信',
      '感想投稿＝学びの定着',
      'フォロー＆シェア大歓迎',
    ],
    bg: 'linear-gradient(135deg,#38bdf8,#0f172a)',
  },
  {
    id: 's-ops',
    title: '運営メモ',
    lines: [
      'チャットに素材リンクを固定',
      'ハンズオンは成功体験優先',
      '時間押し時は段階短縮で対応',
    ],
    bg: 'linear-gradient(135deg,#0f172a,#1e293b)',
  },
  {
    id: 's-prep',
    title: '事前準備チェック',
    lines: [
      'GoogleアカウントでDriveアクセス',
      'ChatGPT/Geminiにログイン',
      'PDF閲覧とGmail通知テスト',
    ],
    bg: 'linear-gradient(135deg,#1e293b,#475569)',
  },
  {
    id: 's-thanks',
    title: 'Thank You',
    subtitle: 'ご参加ありがとうございます！',
    lines: [
      'アンケート回答で配布物を解放',
      '追加質問はメールでお気軽に',
      '一緒にAIで建築業界を変えましょう',
    ],
    bg: 'linear-gradient(135deg,#38bdf8,#0f172a)',
  },
]


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
        className={`flex items-start gap-3 text-sm md:text-base transition-all duration-300 ${
          i < count ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-cyan-500/90 text-[11px] font-semibold text-white">
          {i + 1}
        </span>
        <span className="flex-1 leading-7 text-slate-700">{b}</span>
      </li>
    ));
  };

  return (
    <div
      data-testid="root-bg"
      data-scroll-root="true"
      ref={containerRef}
      className="h-screen overflow-y-auto bg-white text-slate-900"
      style={{
        backgroundImage:
          'radial-gradient(1200px 500px at 10% -10%, rgba(14,165,233,0.12) 0%, transparent 55%), radial-gradient(900px 400px at 100% 0%, rgba(56,189,248,0.15) 0%, transparent 50%)',
      }}
    >
      {/* TOP */}
      <Section id="top" className="justify-center" data-testid="sec-top">
        <div className="max-w-6xl w-full mx-auto grid gap-12 lg:grid-cols-[1.05fr,0.95fr] items-start">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge>
                <span aria-hidden>✨</span> 2025.09.28 Live + Archive
              </Badge>
              <h1 className="text-[44px] font-semibold text-slate-900 leading-[1.1]">実務で使える AI×建築セミナー</h1>
              <p className="text-base text-slate-600 leading-7">建築プロジェクトにAIを組み込むワークフローを、理解→実演→適用の3段階で体験。ライブ配信後は14日間のアーカイブで復習できます。</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-5 border border-slate-200 bg-white">
                <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Schedule</div>
                <div className="mt-3 text-2xl font-semibold text-slate-900">2025.09.28（日）<br className="hidden md:block" />13:00-16:30 JST</div>
                <div className="mt-2 text-xs text-slate-500">オンラインライブ／アーカイブ視聴14日</div>
              </Card>
              <Card className="p-5 border border-slate-200 bg-white">
                <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Entry</div>
                <div className="mt-3 text-2xl font-semibold text-slate-900">Invite: AP-2025-SEMINAR</div>
                <div className="mt-2 text-xs text-slate-500">定員120名／法人申込可・1アカウント5名視聴</div>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3 text-sm text-slate-600">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500 uppercase tracking-[0.3em]">対象</div>
                <p className="mt-2 leading-6">設計・デザイン／ゼネコン／デベロッパー／DX推進</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500 uppercase tracking-[0.3em]">進行</div>
                <p className="mt-2 leading-6">このページをスライドとして使用（HUD・ノート対応）</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500 uppercase tracking-[0.3em]">配布</div>
                <p className="mt-2 leading-6">ワークフロー図／提案テンプレ／チェックリスト／GAS雛形</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <a href="#program" className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-cyan-400">プログラムを見る<span aria-hidden>›</span></a>
              <a href="#chapters" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:border-cyan-200 hover:text-cyan-600">チャプター一覧<span aria-hidden>›</span></a>
              <a href="#resources" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:border-cyan-200 hover:text-cyan-600">配布案内<span aria-hidden>›</span></a>
            </div>
          </div>

          <Card className="p-6 border border-slate-200 bg-white">
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="text-xs text-slate-500 uppercase tracking-[0.3em]">180 min map</div>
                <p className="text-sm text-slate-600 leading-6">理解→実演→適用の3フェーズ構成。各フェーズのゴールを事前に共有しておきます。</p>
              </div>
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="text-slate-400">
                  <tr><th className="pb-2">Phase</th><th className="pb-2">時間</th><th className="pb-2">重点</th></tr>
                </thead>
                <tbody>
                  <tr className="border-t"><td className="py-2">基礎</td><td className="py-2">0-70分</td><td className="py-2">LLM特性／安全運用／NotebookLM</td></tr>
                  <tr className="border-t"><td className="py-2">実務ワーク</td><td className="py-2">70-160分</td><td className="py-2">現調→提案→自動化デモとワーク</td></tr>
                  <tr className="border-t"><td className="py-2">定着</td><td className="py-2">160-170分＋α</td><td className="py-2">KPI／配布案内／Q&A</td></tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </Section>

      {/* HIGHLIGHTS */}
      <Section id="highlights" className="mt-12 md:mt-20 justify-start" data-testid="sec-highlights">
        <div className="max-w-6xl w-full mx-auto space-y-8">
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">このセミナーで得られること</h2>
            <p className="text-sm md:text-base text-slate-600 leading-7">基礎から現場導入、社内展開までを一本でつなぐために、以下の4領域を重点的に扱います。</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="flex items-start gap-4 p-5 border border-slate-200 bg-white">
              <div className="mt-1 text-lg">🧭</div>
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-900">AI導入の共通言語</div>
                <p className="text-sm text-slate-600 leading-6">LLMの特性とガイドライン、社内で共有できるテンプレとチェックリストを整備します。</p>
              </div>
            </Card>
            <Card className="flex items-start gap-4 p-5 border border-slate-200 bg-white">
              <div className="mt-1 text-lg">🛠️</div>
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-900">現調→提案→自動化の実演</div>
                <p className="text-sm text-slate-600 leading-6">SpotPDF・省エネ計算・GAS連携など、建築ワークに直結するデモをライブで体験。</p>
              </div>
            </Card>
            <Card className="flex items-start gap-4 p-5 border border-slate-200 bg-white">
              <div className="mt-1 text-lg">📄</div>
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-900">使い回せる資料セット</div>
                <p className="text-sm text-slate-600 leading-6">提案テンプレ・プロンプト集・チェックリスト・GAS雛形などを終了後にまとめて配布。</p>
              </div>
            </Card>
            <Card className="flex items-start gap-4 p-5 border border-slate-200 bg-white">
              <div className="mt-1 text-lg">🤝</div>
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-900">導入後のフォロー</div>
                <p className="text-sm text-slate-600 leading-6">30日間のメール相談、月1のクローズドQ&A、コミュニティでの事例共有を提供します。</p>
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* PROGRAM */}
      <Section id="program" className="mt-16 md:mt-24 justify-start" data-testid="sec-program">
        <div className="max-w-6xl w-full mx-auto space-y-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">180分でたどる実務導入フロー</h2>
              <p className="text-sm md:text-base text-slate-600 leading-7">
                各フェーズは「理解 → 実演 → 適用」の3ステップで構成。配布資料とワークを組み合わせ、社内展開までの導線をその場で描きます。
              </p>
            </div>
            <Badge>
              <span aria-hidden>🗺️</span> タイムラインで全体像を把握
            </Badge>
          </div>

          <Card className="p-6 md:p-7 border border-slate-200 bg-white/95">
            <ol className="relative border-l border-slate-200 pl-6 space-y-6">
              <li>
                <div className="absolute -left-[9px] mt-1 h-3 w-3 rounded-full bg-cyan-500" aria-hidden />
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700">Phase 1</span>
                    <span className="text-xs text-slate-500">0-70分 ｜ 授業＋対話</span>
                  </div>
                  <div className="text-lg font-semibold text-slate-900">基礎と安全運用の型を固める</div>
                  <div className="grid gap-3 md:grid-cols-2 text-sm text-slate-600">
                    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                      <div className="text-xs font-semibold text-slate-900">内容</div>
                      <p className="mt-1 leading-6">AI/LLMの原理と建築での適用範囲、ガイドライン設計、NotebookLMによる情報整理。</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                      <div className="text-xs font-semibold text-slate-900">成果物</div>
                      <p className="mt-1 leading-6">安全運用チェックシート／社内説明用スライド骨子。</p>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="absolute -left-[9px] mt-1 h-3 w-3 rounded-full bg-cyan-500" aria-hidden />
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700">Phase 2</span>
                    <span className="text-xs text-slate-500">70-160分 ｜ ライブデモ＋ワーク</span>
                  </div>
                  <div className="text-lg font-semibold text-slate-900">現調→提案→自動化を通しで学ぶ</div>
                  <div className="grid gap-3 md:grid-cols-3 text-sm text-slate-600">
                    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                      <div className="text-xs font-semibold text-slate-900">現調ワーク</div>
                      <p className="mt-1 leading-6">現地調査の撮影指示・命名規則・まとめ方をAIで自動化。</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                      <div className="text-xs font-semibold text-slate-900">提案生成</div>
                      <p className="mt-1 leading-6">1ページ提案テンプレ／SpotPDF差分／画像生成の使い分け。</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                      <div className="text-xs font-semibold text-slate-900">自動化</div>
                      <p className="mt-1 leading-6">GASで議事録→タスク→日程までを自動連携。</p>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="absolute -left-[9px] mt-1 h-3 w-3 rounded-full bg-cyan-500" aria-hidden />
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700">Phase 3</span>
                    <span className="text-xs text-slate-500">160-170分＋α ｜ クロージング</span>
                  </div>
                  <div className="text-lg font-semibold text-slate-900">KPI設計と社内展開をセットにする</div>
                  <div className="grid gap-3 md:grid-cols-2 text-sm text-slate-600">
                    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                      <div className="text-xs font-semibold text-slate-900">ハンドアウト</div>
                      <p className="mt-1 leading-6">ロードマップ雛形／合意形成資料／リスク対策チェック。</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                      <div className="text-xs font-semibold text-slate-900">サポート</div>
                      <p className="mt-1 leading-6">30日間メール相談、月1 Q&A、Discordコミュニティで継続学習。</p>
                    </div>
                  </div>
                </div>
              </li>
            </ol>
          </Card>

          <Card className="p-6 border border-slate-200 bg-white/95">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-900">ハンズオンで扱う領域</div>
                <p className="text-sm text-slate-600 leading-6">議事録整形／現調ダイジェスト／AIプレゼン資料／SpotPDF差分／省エネ計算／GASオートメーション。</p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-900">持ち帰れる成果物</div>
                <p className="text-sm text-slate-600 leading-6">提案テンプレ／AIスタック比較表／チェックリスト／自動化スクリプト雛形／配布手順書。</p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-900">復習の進め方</div>
                <p className="text-sm text-slate-600 leading-6">アーカイブ視聴→資料で再演→社内展開ドキュメント作成→講師へのQ&Aで調整。</p>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      {/* CHAPTERS */}
      <Section id="chapters" className="mt-16 md:mt-24 justify-start" data-testid="sec-chapters">
        <div className="max-w-6xl w-full mx-auto space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">チャプター索引</h2>
              <p className="text-sm md:text-base text-slate-600 leading-7">
                各チャプターの概要とゴールを一覧化しています。ナンバーまたは「見る」ボタンで該当セクションへジャンプできます。
              </p>
            </div>
            <Badge color="#E2E8F0">
              <span aria-hidden>⌨️</span> ↑↓ / Dot / Enter で移動
            </Badge>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="divide-y divide-slate-200">
              {CHAPTERS.map((c) => {
                const summary = CHAPTER_SUMMARIES[c.id] || '';
                return (
                  <div
                    key={c.id}
                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-sm font-semibold text-cyan-600">
                        {String(c.no).padStart(2, '0')}
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-slate-900">{c.title}</div>
                        <p className="text-xs text-slate-500 leading-5">{summary}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setRevealCount(0); scrollToId(c.id); }}
                      className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-cyan-300 hover:text-cyan-600"
                    >
                      見る <span aria-hidden>›</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* CHAPTER SECTIONS */}
      {CHAPTER_SECTIONS.map((s) => {
        const minutes = SECTION_MINUTES[s.id];
        const chapterNo = CHAPTERS.find((c) => c.id === s.id)?.no;
        const progress = typeof minutes === 'number' ? Math.min(100, Math.round((minutes / 12) * 100)) : 0;
        const visual = chapterVisuals[s.id];
        return (
          <Section
            id={s.id}
            key={s.id}
            className="justify-start"
            data-chapter-section="true"
            onClick={() => presenter && REVEAL_ENABLED && setRevealCount((c) => c + 1)}
          >
            <div className="max-w-6xl w-full mx-auto">
              <Card className="p-6 md:p-8 border border-slate-200 bg-white/95 space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    {s.kicker ? (
                      <div className="text-xs uppercase tracking-[0.3em] text-cyan-700">{s.kicker}</div>
                    ) : null}
                    <h2 className="text-2xl md:text-[30px] font-extrabold text-slate-900 leading-tight">{s.title}</h2>
                  </div>
                  <div className="flex flex-col items-start gap-2 text-xs text-slate-500 md:items-end">
                    {typeof minutes === 'number' ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-cyan-700">
                        <span aria-hidden>⏱</span> 目安 {minutes} 分
                      </span>
                    ) : null}
                    {chapterNo ? <span>CH.{String(chapterNo).padStart(2, '0')}</span> : null}
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-[minmax(0,0.58fr)_minmax(0,0.42fr)]">
                  <ul className="space-y-3">
                    {renderBullets(s.bullets, s.id)}
                  </ul>
                  <div className="space-y-4">
                    {visual ? visual : null}
                    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 text-xs md:text-sm text-slate-600">
                      <div className="font-semibold text-slate-900">講師メモ（Nキーで拡大表示）</div>
                      <p className="mt-2 leading-6 whitespace-pre-line">{s.notes}</p>
                    </div>
                  </div>
                </div>
                {progress > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Estimated duration</span>
                      <span>{minutes}分</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-cyan-400"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </Section>
        );
      })}

      {/* RESOURCES */}
      <Section id="resources" className="mt-16 md:mt-24 justify-start" data-testid="sec-resources">
        <div className="max-w-6xl w-full mx-auto space-y-10">
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">配布物とフォローアップ</h2>
            <p className="text-sm md:text-base text-slate-600 leading-7">セミナー終了後は非公開ページで資料を一括ダウンロード。社内展開や復習を支援する仕組みを整えています。</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 border border-slate-200 bg-white">
              <div className="text-sm font-semibold text-slate-900">受講者専用ダウンロード</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-600 leading-6 list-disc list-inside">
                <li>アーカイブ動画（14日視聴）</li>
                <li>スライドPDF（要点抜粋）</li>
                <li>テンプレート／チェックリスト／プロンプト集</li>
                <li>SpotPDF差分サンプル、GAS雛形、エネルギー計算レシピ</li>
              </ul>
              <div className="mt-4 text-xs text-slate-500 leading-5">終了後24時間以内にURLとパスワードをメール送付。検索避けと招待コードでアクセスを管理します。</div>
            </Card>
            <Card className="p-6 border border-slate-200 bg-white">
              <div className="text-sm font-semibold text-slate-900">フォローアップ</div>
              <table className="mt-3 w-full text-left text-xs text-slate-600">
                <tbody className="divide-y divide-slate-200">
                  <tr><td className="py-3 font-semibold text-slate-900">30日間メール相談</td><td className="py-3">導入計画や社内展開の質疑をサポート。</td></tr>
                  <tr><td className="py-3 font-semibold text-slate-900">月1 Q&A</td><td className="py-3">クローズドセッションで最新事例と課題共有。</td></tr>
                  <tr><td className="py-3 font-semibold text-slate-900">コミュニティ</td><td className="py-3">Discordでケース共有とテンプレ更新を案内。</td></tr>
                </tbody>
              </table>
              <div className="mt-4 text-xs text-slate-500">
                招待コード：<span className="font-semibold text-slate-900">AP-2025-SEMINAR</span>（第三者共有は禁止です）。<br />
                全体所要時間：{totalPlanned}分（予定）。
              </div>
            </Card>
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
