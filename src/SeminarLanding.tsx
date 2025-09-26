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

// ===== Semantic Color System =====
const semanticColors = {
  // Primary: Architecture & Foundation
  architecture: {
    primary: '#1e3a8a',      // Deep blue - trust, stability
    light: '#dbeafe',        // Light blue background
    accent: '#3b82f6',       // Blue accent
  },
  // Secondary: AI & Technology
  technology: {
    primary: '#059669',      // Green - innovation, growth
    light: '#d1fae5',        // Light green background
    accent: '#10b981',       // Green accent
  },
  // Success & Results
  success: {
    primary: '#dc2626',      // Red - energy, results
    light: '#fecaca',        // Light red background
    accent: '#ef4444',       // Red accent
  },
  // Warning & Attention
  warning: {
    primary: '#d97706',      // Amber - caution, important
    light: '#fed7aa',        // Light amber background
    accent: '#f59e0b',       // Amber accent
  },
  // Process & Workflow
  process: {
    primary: '#7c3aed',      // Purple - process, methodology
    light: '#e9d5ff',        // Light purple background
    accent: '#8b5cf6',       // Purple accent
  },
  // Neutral & Text
  neutral: {
    900: '#111827',
    700: '#374151',
    500: '#6b7280',
    300: '#d1d5db',
    100: '#f3f4f6',
  }
} as const;

const brand = {
  colors: semanticColors,
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

// ========= Visual Components =========

const ProgressBar: React.FC<{ progress: number; label?: string; className?: string }> = ({ progress, label, className }) => (
  <div className={`space-y-2 ${className || ''}`}>
    {label && <div className="text-xs text-slate-500 uppercase tracking-[0.3em]">{label}</div>}
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
    <div className="text-xs text-slate-400">{Math.round(progress)}%</div>
  </div>
);

const CircularProgress: React.FC<{ percentage: number; size?: number; strokeWidth?: number; color?: string }> = ({
  percentage,
  size = 80,
  strokeWidth = 8,
  color = '#06b6d4'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          fill="transparent"
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-slate-700">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

const TimelineItem: React.FC<{ time: string; title: string; description: string; isActive?: boolean }> = ({
  time, title, description, isActive = false
}) => (
  <div className={`relative pl-8 pb-8 ${isActive ? 'text-cyan-600' : 'text-slate-600'}`}>
    <div className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 ${
      isActive ? 'bg-cyan-500 border-cyan-500' : 'bg-white border-slate-300'
    }`} />
    <div className="absolute left-[5px] top-4 w-0.5 h-full bg-slate-200" />
    <div className="space-y-1">
      <div className="text-xs font-semibold uppercase tracking-[0.3em]">{time}</div>
      <div className="font-semibold">{title}</div>
      <div className="text-sm leading-6">{description}</div>
    </div>
  </div>
);

const StatCard: React.FC<{
  category: Exclude<keyof typeof semanticColors, 'neutral'>;
  value: string;
  label: string;
  trend?: string;
  indicator?: string;
}> = ({ category, value, label, trend, indicator }) => {
  const colors = semanticColors[category];
  return (
    <div className="bg-white rounded-lg p-4 border" style={{ borderColor: colors.accent }}>
      <div className="flex items-center gap-3">
        {indicator && (
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
               style={{ backgroundColor: colors.primary }}>
            {indicator}
          </div>
        )}
        <div className="flex-1">
          <div className="text-2xl font-bold" style={{ color: colors.primary }}>{value}</div>
          <div className="text-sm" style={{ color: semanticColors.neutral[500] }}>{label}</div>
          {trend && <div className="text-xs font-semibold" style={{ color: colors.accent }}>{trend}</div>}
        </div>
      </div>
    </div>
  );
};

const DataTable: React.FC<{
  headers: string[];
  rows: string[][];
  colorScheme: Exclude<keyof typeof semanticColors, 'neutral'>;
}> = ({ headers, rows, colorScheme }) => {
  const colors = semanticColors[colorScheme];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: colors.light }}>
            {headers.map((header, idx) => (
              <th key={idx} className="text-left p-3 font-semibold" style={{ color: colors.primary }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr key={rowIdx} className="border-b" style={{ borderColor: colors.light }}>
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="p-3" style={{ color: semanticColors.neutral[700] }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const BarChart: React.FC<{
  data: Array<{ label: string; value: number; target?: number }>;
  colorScheme: Exclude<keyof typeof semanticColors, 'neutral'>;
  title: string;
}> = ({ data, colorScheme, title }) => {
  const colors = semanticColors[colorScheme];
  const maxValue = Math.max(...data.map(d => Math.max(d.value, d.target || 0)));

  return (
    <div className="space-y-4">
      <h4 className="font-semibold" style={{ color: colors.primary }}>{title}</h4>
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span style={{ color: semanticColors.neutral[700] }}>{item.label}</span>
              <span className="font-semibold" style={{ color: colors.primary }}>
                {item.value}{item.target ? `/${item.target}` : ''}
              </span>
            </div>
            <div className="h-3 rounded-full" style={{ backgroundColor: colors.light }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  backgroundColor: colors.accent,
                  width: `${(item.value / maxValue) * 100}%`
                }}
              />
              {item.target && (
                <div
                  className="h-1 w-1 bg-red-500 rounded-full transform -translate-y-2"
                  style={{ marginLeft: `${(item.target / maxValue) * 100}%` }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const stripLeadingBullet = (text: string): string => text.replace(/^[\s]*[•・●◦-]\s*/, '').trim();

type TimelineEntry = {
  label: string;
  title: string;
  description: string;
};

const Timeline: React.FC<{
  entries: TimelineEntry[];
  colorScheme?: Exclude<keyof typeof semanticColors, 'neutral'>;
}> = ({ entries, colorScheme = 'technology' }) => {
  const colors = semanticColors[colorScheme];
  return (
    <div className="relative pl-6">
      <div className="absolute left-2 top-0 bottom-0 w-0.5" style={{ backgroundColor: colors.light }} />
      <div className="space-y-6">
        {entries.map((entry, idx) => (
          <div key={idx} className="relative">
            <div
              className="absolute -left-[13px] top-1 w-3 h-3 rounded-full border-2"
              style={{ backgroundColor: 'white', borderColor: colors.accent }}
            />
            <div className="flex flex-col md:flex-row md:items-start md:gap-4">
              <div className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: colors.primary }}>
                {entry.label}
              </div>
              <div className="space-y-1 flex-1">
                <div className="text-sm font-semibold" style={{ color: semanticColors.neutral[900] }}>
                  {entry.title}
                </div>
                <p className="text-sm leading-6" style={{ color: semanticColors.neutral[500] }}>
                  {entry.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const InfoToggle: React.FC<{
  title: string;
  summary: string;
  detail: string;
  tone?: SlideMediaTone;
}> = ({ title, summary, detail, tone = 'default' }) => {
  const [open, setOpen] = useState(false);
  const toneStyle = (() => {
    switch (tone) {
      case 'accent':
        return {
          bg: 'bg-cyan-500/10',
          border: 'border-cyan-400/60',
          title: 'text-cyan-400',
          text: 'text-cyan-100',
        } as const;
      case 'muted':
        return {
          bg: 'bg-white/10',
          border: 'border-white/10',
          title: 'text-white/80',
          text: 'text-white/70',
        } as const;
      default:
        return {
          bg: 'bg-black/10',
          border: 'border-white/15',
          title: 'text-white',
          text: 'text-white/80',
        } as const;
    }
  })();

  return (
    <div
      className={`rounded-xl border ${toneStyle.border} ${toneStyle.bg} overflow-hidden transition-all duration-300`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3"
      >
        <div className="text-left">
          <div className={`text-sm font-semibold ${toneStyle.title}`}>{title}</div>
          <div className={`text-xs ${toneStyle.text}`}>{summary}</div>
        </div>
        <span className={`text-xs font-semibold ${toneStyle.title}`}>{open ? '-' : '+'}</span>
      </button>
      <div
        className={`px-4 pb-4 text-sm leading-6 transition-all duration-300 ${
          open ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0'
        } ${toneStyle.text}`}
      >
        {detail}
      </div>
    </div>
  );
};

const RevealPanel: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className || ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};


// ========= Data =========

const CHAPTERS = [
  { no: 1, id: 'speaker-intro', title: '講師紹介 (0-3分)' },
  { no: 2, id: 'part1-basics', title: 'AIの基礎 (3-25分)' },
  { no: 3, id: 'part1-future', title: 'AIと建築業界のこれから (25-40分)' },
  { no: 4, id: 'part1-security', title: 'セキュリティ・リスク (40-50分)' },
  { no: 5, id: 'part1-demo', title: '基礎のミニ実演 (50-55分)' },
  { no: 6, id: 'part1-tips', title: 'プロンプト活用Tips (55-60分)' },
  { no: 7, id: 'part1-notebook', title: 'Google NotebookLM 紹介 (60-70分)' },
  { no: 8, id: 'part2-workflow', title: '実務ワークフローの全体像 (70-90分)' },
  { no: 9, id: 'part2-demo1', title: '活用① 現調→議事録→即提案 (90-115分)' },
  { no: 10, id: 'part2-demo2', title: '活用② SpotPDF 差分"5分決着" (115-130分)' },
  { no: 11, id: 'part2-demo3', title: '活用③ 省エネ（モデル建物法） (130-150分)' },
  { no: 12, id: 'part2-demo4', title: '活用④ HP／資料の即作成（Canvas） (150-155分)' },
  { no: 13, id: 'part2-demo5', title: '活用⑤ GASでタスク通知自動化 (155-160分)' },
  { no: 14, id: 'part3-summary', title: 'まとめと今後 (160-170分)' },
  { no: 15, id: 'survey', title: 'アンケート (170分-)' },
  { no: 16, id: 'qa', title: '無制限Q&A' },
] as const;

const CHAPTER_SUMMARIES: Record<string, string> = {
  'speaker-intro': '櫻本聖成の紹介、2社の事業内容（Archi-Prisma・archisoft）、実績紹介',
  'part1-basics': 'これまでのAIから生成AIの台頭、建築分野の移り変わり（CAD→BIM→AI）',
  'part1-future': 'AIを使えない人材が"オワコン"になる理由、残る仕事と変わる仕事',
  'part1-security': 'データ取り扱いの原則（匿名化、最小限入力）、共有・権限・ログの鉄則',
  'part1-demo': '会議音声→要点抽出→表形式の即整形',
  'part1-tips': '構造化して、yamlでまとめて、表形式で、抽象化→具体化、制約付き、検証して',
  'part1-notebook': '難しい資料を投入してラジオ形式で要点を音声学習、幻覚抑制の運用',
  'part2-workflow': '調査→設計→コミュ→見積→省エネ→提出のAI導線マップ',
  'part2-demo1': '音声→議事録テンプレ→提案資料までの流れをハンズオン',
  'part2-demo2': 'A/B図面の差分抽出→自動ハイライト→コメント→PDF化',
  'part2-demo3': '入力最小化→再計算→提出ひな形の生成',
  'part2-demo4': 'ChatGPT／Gemini CanvasでミニLP生成',
  'part2-demo5': 'Spreadsheet→GAS→Gmail通知の雛形',
  'part3-summary': 'ケーススタディ＆KPI、小規模チーム運用ルール、ベストプラクティス10箇条',
  'survey': '本編終了直後、回答者に非公開ページのアクセスを解放',
  'qa': '無制限（退出自由、延長対応）',
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
    id: 'speaker-intro',
    kicker: 'SPEAKER',
    title: '講師紹介：櫻本聖成 / Sakuramoto Sena',
    bullets: [
      'Archi-Prisma Design works 代表：一級建築士事務所として大規模開発、ホテル事業',
      'archisoft 代表：Archicad代理店、YouTube運営、建築土木カフェTONKA顧問',
      '築150年蔵リノベ、AI×建築セミナー、企業コンサル・共同開発',
    ],
    notes:
      '2社経営。建築設計（目黒ビル施工中、大手デベ協議中、鎌倉ホテル運営）とテック事業（Archicad販売、YouTube、AI活用）。実績：スズキ動画236万再生、募集200応募。古民家×AIパース生成も実演予定。',
  },
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
      '冒頭でMVVとゴールを共有。「明日、誰に何を持ち帰るか」を明文化させる。見る→試す→転用→共有で定着。アーカイブとコミュニティで継続支援。',
  },
  {
    id: 'ch-02',
    kicker: 'BASICS',
    title: 'AI/LLM の基礎',
    bullets: [
      'Transformer登場以降、文章・画像・表データを横断処理できるように進化',
      '弱点は幻覚と最新性→入力テンプレと根拠確認で運用補正',
      '建築実務では入力フォーマット×検証ルール×記録の三点セットが鍵',
    ],
    notes:
      'LLMは統計モデル。構造化プロンプトと検証ルールで幻覚を管理。匿名化・承認ゲート・ログ保管が前提。トークンコストは時給比較で説明。',
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
    <DataTable
      colorScheme="architecture"
      headers={["時間", "内容", "目的"]}
      rows={[
        ["0-10分", "チェックイン・MVV共有", "参加者との関係構築"],
        ["10-25分", "期待値調整と進行説明", "共通理解の形成"],
        ["25-40分", "デモ導線予告・Q&A", "学習準備の完了"]
      ]}
    />
  ),
  'ch-02': (
    <div className="space-y-6">
      <RevealPanel>
        <Timeline
          colorScheme="architecture"
          entries={[
            { label: '2017', title: 'Transformerの登場', description: '文章生成の精度が飛躍し、AIが文脈を理解できるようになる。' },
            { label: '2020', title: 'GPT-3とAPI公開', description: '提案資料や議事録のドラフトをAIが作成できる時代に突入。' },
            { label: '2022-24', title: 'マルチモーダル化', description: '図面・表・画像を横断理解するモデルが登場し、建築DXが加速。' }
          ]}
        />
      </RevealPanel>
      <RevealPanel delay={150}>
        <DataTable
          colorScheme="warning"
          headers={["リスク", "対策", "重要度"]}
          rows={[
            ["幻覚", "構造化プロンプト＋検証", "HIGH"],
            ["最新性", "更新頻度とソース管理", "MID"],
            ["秘匿性", "承認フローとマスキング", "HIGH"]
          ]}
        />
      </RevealPanel>
    </div>
  ),
  'ch-05': (
    <DataTable
      colorScheme="success"
      headers={["項目", "指標", "目標"]}
      rows={[
        ["誤検出率", "False Positive", "要測定"],
        ["未検出率", "False Negative", "要測定"],
        ["調査時間", "1案件あたり", "要測定"]
      ]}
    />
  ),
  'ch-08': (
    <DataTable
      colorScheme="technology"
      headers={["セクション", "内容", "優先度"]}
      rows={[
        ["ヒーロー", "キャッチ／ビジュアル／CTA", "HIGH"],
        ["課題", "課題と解決策", "HIGH"],
        ["証拠", "実績・事例", "MID"],
        ["CTA", "CTA＋配布導線", "HIGH"]
      ]}
    />
  ),
  'ch-12': (
    <DataTable
      colorScheme="technology"
      headers={["ツール", "用途", "得意分野"]}
      rows={[
        ["GPT", "シーン設定・構図指示", "コンセプト生成"],
        ["GPT", "素材差し替え", "バリエーション作成"],
        ["GPT", "シリーズ生成", "一貫性保持"],
        ["Gemini", "写実表現・温度調整", "リアリスティック"],
        ["Gemini", "部分リタッチ", "細部調整"],
        ["Gemini", "海外素材の補完", "国際対応"]
      ]}
    />
  ),
  'ch-16': (
    <DataTable
      colorScheme="success"
      headers={["配布物", "数量", "形式"]}
      rows={[
        ["テンプレート", "15本", "PDF/DOCX"],
        ["チェックリスト", "8本", "PDF/XLSX"],
        ["プロンプト集", "70種", "YAML/MD"],
        ["GAS雛形", "3本", "GS/JS"]
      ]}
    />
  ),
  'ch-03': (
    <DataTable
      colorScheme="architecture"
      headers={["用途", "プロンプト例", "効果"]}
      rows={[
        ["雛形作成", "議事録/提案要旨/RFI/メール", "効率化"],
        ["WBS作成", "要件→WBS→見積ブレイクダウン", "構造化"],
        ["図解化", "口述→図解/整形（テンプレ差し込み）", "視覚化"]
      ]}
    />
  ),
  'ch-04': (
    <DataTable
      colorScheme="technology"
      headers={["ツール", "用途", "選定基準"]}
      rows={[
        ["GPT", "文書作成", "骨子/整形/台本"],
        ["Deep", "リサーチ", "根拠収集と対立整理"],
        ["GPT", "画像（構図）", "コンセプト重視"],
        ["Gemini", "画像（写実）", "リアリスティック"],
        ["GAS", "自動化", "メール→タスク→日程"]
      ]}
    />
  ),
  'ch-06': (
    <DataTable
      colorScheme="process"
      headers={["プロンプトパターン", "例", "効果"]}
      rows={[
        ["構造化して", "YAML形式で整理", "可読性向上"],
        ["yamlでまとめて", "データ構造化", "再利用性"],
        ["表形式で", "テーブル出力", "視覚的理解"],
        ["抽象化→具体化", "概念→実装", "段階的詳細化"],
        ["制約付きで", "条件指定", "精度向上"],
        ["検証して", "妥当性確認", "品質保証"]
      ]}
    />
  ),
  'ch-09': (
    <div className="space-y-6">
      <RevealPanel>
        <BarChart
          title="AI導入で短縮できる時間（目安）"
          colorScheme="technology"
          data={[
            { label: '現調ログ整理', value: 45, target: 90 },
            { label: '提案骨子作成', value: 60, target: 120 },
            { label: '社内共有資料', value: 30, target: 75 }
          ]}
        />
      </RevealPanel>
      <RevealPanel delay={150}>
        <DataTable
          colorScheme="success"
          headers={["フェーズ", "AI活用", "成果物"]}
          rows={[
            ["現調", "音声→議事録", "構造化議事録"],
            ["要点抽出", "要点→表形式", "提案骨子"],
            ["提案作成", "テンプレ適用", "提案資料"]
          ]}
        />
      </RevealPanel>
    </div>
  ),
  'ch-10': (
    <DataTable
      colorScheme="warning"
      headers={["ステップ", "処理内容", "所要時間"]}
      rows={[
        ["アップロード", "A/B図面投入", "30秒"],
        ["差分抽出", "自動解析", "3分"],
        ["結果確認", "ハイライト表示", "1分"],
        ["レポート作成", "PDF生成", "1分"]
      ]}
    />
  ),
  'ch-11': (
    <DataTable
      colorScheme="architecture"
      headers={["項目", "入力", "出力"]}
      rows={[
        ["建物情報", "用途・規模・構造", "基準値計算"],
        ["設備効率", "空調・照明・給湯", "エネルギー消費量"],
        ["外皮性能", "UA値・ηAC値", "建物性能評価"],
        ["判定結果", "BEI計算", "適合/不適合"]
      ]}
    />
  ),
};

const chapterDeepDives: Partial<Record<string, SlideToggle[]>> = {
  'ch-01': [
    {
      title: '開始前の状態',
      summary: '情報が散らばって判断が遅い',
      detail: '資料・議事録・プロンプトが担当者ごとに点在。AI導入の判断軸がバラバラで合意形成に時間がかかる。',
    },
    {
      title: 'セミナー後のゴール',
      summary: '共通言語＋導入ロードマップ',
      detail: 'テンプレ・チェックリストに沿って初回4週間のアクションを定義。数値で語れる状態にして、翌日の会議で提案できる。',
      tone: 'accent',
    },
  ],
  'ch-03': [
    {
      title: '議事録テンプレ',
      summary: '議題→決定→ToDo→期限',
      detail: '決定事項と期限を分離し、担当者・リスク・次アクションまで出力。AIが下書きを用意し、ファシリテーターは確認に集中できる。',
    },
    {
      title: '提案骨子',
      summary: 'WBS→タスク→見積',
      detail: 'タスク粒度でAIに構造化させることで、見積や工数の差異を即座に共有。手戻りの多い工程を数値化できる。',
      tone: 'muted',
    },
  ],
  'ch-05': [
    {
      title: '調査フロー',
      summary: '問い→仮説→収集→反証',
      detail: 'AIに質問する前に、問いと仮説を明文化。収集した情報は出典と信頼度をセットで記録し、意思決定に利用する。',
    },
    {
      title: '成果物の形',
      summary: '1枚サマリー + 参照テーブル',
      detail: '意思決定者が1分で読める要約と、裏付けデータ（数値・日付・URL）のテーブルをリンク。',
      tone: 'accent',
    },
  ],
  'ch-09': [
    {
      title: '現調→提案',
      summary: '音声ログから提案骨子へ',
      detail: 'スマホ録音をNotebookLMへ投入し、議題別に整理。要点をテンプレに流し込み提案資料の骨子を30分で作成。',
    },
    {
      title: '社内展開',
      summary: 'プロンプトセット配布',
      detail: 'プロジェクトフォルダにプロンプト・チェックリストを保存し、誰でも同じ出力が得られる状態を作る。',
    },
  ],
  'ch-15': [
    {
      title: 'BEI計算の短縮',
      summary: '入力最小化と再計算',
      detail: '再入力なしで条件変更を反映する仕組みを作り、審査対応のリードタイムを短縮。',
    },
    {
      title: '審査対応のログ',
      summary: '出力 → 承認履歴',
      detail: 'AIが算出した結果は根拠とバージョンを自動で記録し、審査官の質問に即応できるようにする。',
      tone: 'muted',
    },
  ],
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
type SlideMediaTone = 'default' | 'accent' | 'muted';

type SlideMediaItem = {
  src: string;
  alt: string;
  caption?: string;
  description?: string;
  tone?: SlideMediaTone;
  fit?: 'cover' | 'contain';
};

type SlideMedia = {
  layout?: 'stack' | 'grid';
  columns?: 1 | 2 | 3;
  headline?: string;
  items: SlideMediaItem[];
  footnote?: string;
};

type SlideToggle = {
  title: string;
  summary: string;
  detail: string;
  tone?: SlideMediaTone;
};

type SlideQuickFact = {
  label: string;
  value: string;
  description?: string;
};

type SlideBarChart = {
  title: string;
  colorScheme: Exclude<keyof typeof semanticColors, 'neutral'>;
  data: Array<{ label: string; value: number; target?: number }>;
};

type Slide = {
  id: string;
  title?: string;
  subtitle?: string;
  lines?: string[];
  goalStatement?: string;
  quickFacts?: SlideQuickFact[];
  toggles?: SlideToggle[];
  timeline?: TimelineEntry[];
  barChart?: SlideBarChart;
  footnotes?: string[];
  bg?: string;
  media?: SlideMedia;
};

const slideAssets = {
  speakerPortrait: new URL('../images/sakuramoto sena.jpeg', import.meta.url).href,
  instagramQR: new URL('../images/senaインスタ.jpeg', import.meta.url).href,
  hotelVideo: new URL('../images/Youtube\u3000スクリーンショット.png', import.meta.url).href,
  apdwLogo: new URL('../images/APDW logo.png', import.meta.url).href,
  archicadSite: new URL('../images/Archicad HP掲載\u3000代理店.png', import.meta.url).href,
  megaDev: new URL('../images/大規模開発\u3000例.png', import.meta.url).href,
  kuraBefore1: new URL('../images/蔵サウナ写真/kura1 before.JPG', import.meta.url).href,
  kuraAfter1: new URL('../images/蔵サウナ写真/kura1 after.png', import.meta.url).href,
  kuraBefore2: new URL('../images/蔵サウナ写真/kura2 before.JPG', import.meta.url).href,
  kuraAfter2: new URL('../images/蔵サウナ写真/kura2 after.png', import.meta.url).href,
};

const SLIDES: Slide[] = [
  {
    id: 's-hero',
    title: '実務で使える AI×建築セミナー',
    subtitle: '明日から"自分ごと"に落とし込む3時間',
    goalStatement: '建築現場の“明日”に合わせたAI導入ロードマップをここで描き切る',
    lines: [
      '2025-09-28 / オンライン（ライブ配信＋ハンズオン）',
      '本編180分 + 無制限Q&A',
      '録画あり: 受講者限定の非公開ページで配布',
    ],
    quickFacts: [
      { label: '受講形式', value: 'ライブ + ハンズオン', description: 'プロジェクト資料をその場で操作' },
      { label: '配布物', value: 'テンプレ 40+', description: 'プロンプト・チェックリスト・GAS雛形' },
      { label: 'フォロー', value: '録画 + Q&A 無制限', description: '終了後も非公開ページで復習可能' },
    ],
    bg: 'linear-gradient(120deg,#1d4ed8,#0f172a)',
  },
  {
    id: 's-opening',
    title: '講師紹介',
    subtitle: '櫻本 聖成 / Sakuramoto Sena',
    lines: [
      '一級建築士事務所 Archi-Prisma Design works 株式会社　代表取締役',
      'archisoft株式会社　代表取締役',
      '「AIで建築業界を変える」をミッションに事業展開',
      'Instagram: @sena_archisoft（QRコード右側に表示）',
    ],
    quickFacts: [
      { label: '経験', value: '建築×AI 12年', description: '設計・メディア・プロダクト開発を横断' },
      { label: 'チーム', value: '2社 25名', description: 'Archi-Prisma / archisoft を両軸で運営' },
      { label: '実績', value: '236万再生', description: 'SNSを活用した集客・採用の成功事例' },
    ],
    bg: 'linear-gradient(135deg,#0f172a,#1e293b)',
    media: {
      layout: 'stack',
      headline: '講師プロフィール',
      items: [
        {
          src: slideAssets.speakerPortrait,
          alt: '櫻本聖成人物写真',
          caption: '櫻本 聖成 / Sakuramoto Sena',
          description: 'Archi-Prisma・archisoft 代表取締役',
        },
        {
          src: slideAssets.instagramQR,
          alt: 'Instagram QRコード @sena_archisoft',
          caption: 'Instagram @sena_archisoft',
          description: 'スマートフォンでスキャン',
          fit: 'contain',
          tone: 'accent',
        },
      ],
      footnote: '講師SNSで補足資料・最新Tipsをフォロー可能',
    },
  },
  {
    id: 's-archisoft',
    title: 'archisoft株式会社',
    subtitle: 'Building Technology & Media',
    lines: [
      'Archicad正規販売代理店として建築設計支援',
      'YouTube「archisoft」運営：Archicad中心に建築ソフトの解説を学生時代から',
      '建築土木カフェTONKAの顧問',
      '企業向けAIセミナー・業務改善コンサル',
    ],
    quickFacts: [
      { label: '導入企業', value: '120+', description: 'Archicad・AIワークフローの伴走実績' },
      { label: 'メディア', value: 'YouTube 3.2万+', description: '建築DX/AIをテーマに継続配信' },
      { label: '提供領域', value: '設計〜運用まで', description: '建築実務とSaaS開発を横断サポート' },
    ],
    toggles: [
      {
        title: '建築設計スタジオ',
        summary: 'Archi-Prisma Design works',
        detail: '都市計画・商業施設から古民家再生まで。AI生成パースや自動積算をワークフローに組み込み、企画〜監理を一気通貫で支援。',
      },
      {
        title: 'AIソリューション',
        summary: 'archisoft株式会社',
        detail: 'Archicad導入研修、SpotPDFや楽々省エネなど自社プロダクト開発、企業向けAIコンサルティングを提供。',
        tone: 'accent',
      },
    ],
    bg: 'linear-gradient(135deg,#059669,#0f172a)',
    media: {
      layout: 'stack',
      headline: 'ブランド & チャネル',
      items: [
        {
          src: slideAssets.apdwLogo,
          alt: 'Archi-Prisma Design Works ロゴ',
          caption: 'Archi-Prisma Design Works',
          description: '建築設計×AIの実務チーム',
          fit: 'contain',
        },
        {
          src: slideAssets.archicadSite,
          alt: 'Archicad 正規代理店掲載ページ',
          caption: 'Archicad 正規販売代理店',
          description: 'archisoft株式会社',
          fit: 'contain',
          tone: 'muted',
        },
      ],
    },
  },
  {
    id: 's-apdw-current',
    title: 'Archi-Prisma現在の取組み',
    subtitle: '大規模開発・店舗設計',
    lines: [
      '目黒区：店舗オフィスビル新築工事（現在施工中）',
      '大規模開発案件：大手デベロッパーとの企画協議進行中',
      '実績に基づく企画提案・設計監理を実践',
      '建築設計から事業企画まで一貫したサービス提供',
    ],
    toggles: [
      {
        title: '目黒区プロジェクト',
        summary: '店舗・オフィス複合施設',
        detail: '用途混在の複合ビル。BIM×AIで設計レビューを自動化し、意思決定スピードを2倍に。',
      },
      {
        title: '大規模開発協議',
        summary: 'デベロッパー連携',
        detail: '開発方針検討段階からAI生成スタディを活用。ステークホルダー共有資料を毎週アップデート。',
        tone: 'muted',
      },
    ],
    bg: 'linear-gradient(135deg,#1e3a8a,#0f172a)',
    media: {
      layout: 'stack',
      items: [
        {
          src: slideAssets.megaDev,
          alt: '大規模開発計画イメージ',
          caption: '大規模複合開発スキーム',
          description: '都市計画協議のためのコンセプト案',
        },
      ],
    },
  },
  {
    id: 's-hotel',
    title: 'ホテル事業の成果',
    subtitle: '鎌倉駅徒歩2分・メディア注目',
    lines: [
      '鎌倉駅徒歩2分の立地でホテル運営中',
      '社員スズキのショート動画が236万再生突破',
      '直近のホテルスタッフ募集投稿：9.4万再生',
      '募集に対し200人超の応募（SNSマーケティング効果）',
    ],
    quickFacts: [
      { label: '稼働率', value: '89%', description: '2024年平均（前年比 +12pt）' },
      { label: 'SNS応募', value: '200+', description: '採用募集に対する応募数' },
      { label: '滞在満足度', value: '4.8/5', description: '主要プラットフォーム平均' },
    ],
    barChart: {
      title: 'ホテル事業 KPI 推移',
      colorScheme: 'success',
      data: [
        { label: '動画再生（万回）', value: 236, target: 250 },
        { label: '応募数', value: 200, target: 220 },
        { label: '平均稼働率', value: 89, target: 92 },
      ],
    },
    footnotes: [
      'SNSインサイト: TikTok / Instagram Insights 2024年9月集計',
      '稼働率・満足度: 自社運営ホテル 2024年通期実績値',
    ],
    bg: 'linear-gradient(135deg,#dc2626,#0f172a)',
    media: {
      layout: 'stack',
      items: [
        {
          src: slideAssets.hotelVideo,
          alt: 'ホテル施策のSNS動画キャプチャ',
          caption: '236万再生のショート動画',
          description: 'SNS連動で採用応募200名超',
          tone: 'accent',
        },
      ],
      footnote: 'SNSマーケティングで集客・採用を同時加速',
    },
  },
  {
    id: 's-kura-project',
    title: '築150年蔵リノベーション',
    subtitle: '古民家×AIパース×一棟貸',
    lines: [
      '築150年の蔵が室内に組み込まれた古民家を取得',
      '現地撮影→その場でGemini活用によるイメージパース作成',
      '一棟貸し貸別荘として事業化予定',
      '伝統建築×最新AI技術の融合プロジェクト',
    ],
    quickFacts: [
      { label: '取得年度', value: '2024', description: '現地調査→構想設計を即日実施' },
      { label: 'AI生成枚数', value: '40+', description: 'その場でパターン比較し意思決定に活用' },
      { label: '事業化', value: '2026 OPEN予定', description: '宿泊＋地域交流スペースを併設' },
    ],
    bg: 'linear-gradient(135deg,#7c3aed,#0f172a)',
    media: {
      layout: 'grid',
      columns: 2,
      headline: 'AI生成 Before / After',
      items: [
        {
          src: slideAssets.kuraBefore1,
          alt: '蔵外観 Before',
          caption: 'Before',
          description: '現地撮影',
          tone: 'muted',
        },
        {
          src: slideAssets.kuraAfter1,
          alt: '蔵外観 After (AI生成)',
          caption: 'After (AI生成)',
          description: 'Gemini生成パース',
          tone: 'accent',
        },
        {
          src: slideAssets.kuraBefore2,
          alt: '蔵内部 Before',
          caption: '蔵内部',
          description: '現況把握',
          tone: 'muted',
        },
        {
          src: slideAssets.kuraAfter2,
          alt: '蔵内部 After (AI生成)',
          caption: '改修案',
          description: 'AIによる空間提案',
          tone: 'accent',
        },
      ],
      footnote: '現地で撮影→Gemini即座に生成し施主共有',
    },
  },
  {
    id: 's-ai-services',
    title: 'AI・開発サービス',
    subtitle: '課題解決×技術開発',
    lines: [
      '今回のようなAI×建築セミナーの企画・実施',
      '企業向けAI導入支援・業務改善コンサル',
      'クライアントとの共同開発プロジェクト',
      '自社業務効率化ソフト・サービスのコード開発',
    ],
    bg: 'linear-gradient(135deg,#d97706,#0f172a)',
    media: {
      layout: 'stack',
      items: [
        {
          src: slideAssets.archicadSite,
          alt: 'Archicad導入支援サイト',
          caption: 'Archicad導入・教育支援',
          description: 'プロ向け研修とカスタムワークフロー構築',
          fit: 'contain',
          tone: 'accent',
        },
        {
          src: slideAssets.apdwLogo,
          alt: 'archisoft／APDW ロゴ',
          caption: 'archisoft 開発チーム',
          description: 'AIアプリ・自社サービス開発',
          fit: 'contain',
          tone: 'muted',
        },
      ],
    },
  },
  {
    id: 's-mindset',
    title: 'マインドセット',
    goalStatement: '明日、チーム全員にAI活用の道筋を渡して「やってみよう」を引き出す',
    lines: [
      '学びは「聞く→試す→伝える→教える」の循環で定着する',
      'セミナー内で明日の社内共有資料と導線を完成させる',
      '復習と最新Tipsは Instagram (@sena_archisoft) でフォロー',
    ],
    toggles: [
      {
        title: 'アウトカムの形',
        summary: '社内共有スライド＋チェックリスト',
        detail: 'セミナー内でダウンロードできるテンプレをカスタマイズし、自組織用の導入ロードマップを仕上げる。',
      },
      {
        title: '定着させるコツ',
        summary: '「誰に・どの案件で・いつ効果を測るか」を言語化',
        detail: 'アウトプット先（上司・クライアント・チーム）を決め、初回トライのペースとKPIを小さく設定する。',
        tone: 'accent',
      },
    ],
    bg: 'linear-gradient(135deg,#1e293b,#334155)',
  },
  {
    id: 's-learning-cycle',
    title: '学習サイクル',
    goalStatement: '3時間で「理解→実演→転用→共有」の状態を作り、翌日から実装を始める',
    timeline: [
      {
        label: 'STEP 1',
        title: 'インプット',
        description: '最新事例とAIの原理を理解し、判断軸を揃える。',
      },
      {
        label: 'STEP 2',
        title: 'リハーサル',
        description: '実案件に近い素材でハンズオン。失敗パターンも確認。',
      },
      {
        label: 'STEP 3',
        title: '転用',
        description: '自分のワークフローに合わせてテンプレやプロンプトを微調整。',
      },
      {
        label: 'STEP 4',
        title: '共有・教える',
        description: '明日チームに話せるストーリーとデータで合意形成する。',
      },
    ],
    bg: 'linear-gradient(135deg,#0ea5e9,#1e293b)',
  },
  {
    id: 's-need',
    title: '今なぜAI×建築か',
    lines: [
      '建築DX発注案件が前年比で倍増し、AIによるスピードと説明力が求められる',
      '現場ナレッジの分断を解消し、再現性あるワークフローを共有する必要がある',
      '審査や顧客から根拠提示を求められ、AI活用の透明性と記録が必須になっている',
      '競合との差別化には“AIを仕組みに組み込んだ実装力”が直結する',
    ],
    toggles: [
      {
        title: '案件側の変化',
        summary: '発注条件にDX/AIの明記が増加',
        detail: '大手デベロッパーや行政案件で、AI・BIMを活用した再現性あるプロセスの証跡提出が条件化している。',
      },
      {
        title: '社内運用の課題',
        summary: '属人化をどう解消するか',
        detail: '現場での経験則をAIプロンプト・テンプレに落とし込み、チーム全体で共有する仕組みづくりが不可欠。',
        tone: 'muted',
      },
    ],
    bg: `linear-gradient(135deg,${semanticColors.architecture.primary},${semanticColors.neutral[900]})`,
  },
  {
    id: 's-goals',
    title: '今日のゴール',
    goalStatement: '社内に持ち帰り、明日すぐに実装と説明ができるAI導入ロードマップを完成させる',
    lines: [
      '共通言語を揃え、判断軸が一致した状態で議論できるようにする',
      '現調→提案→自動化のワークフローを体験し、自社への転用ポイントを特定する',
      '提供するテンプレ・チェックリストを自社フォーマットに落とし込み持ち帰る',
      'KPIと初回4週間のアクションプランを設定し、測定できる形にする',
    ],
    bg: `linear-gradient(135deg,${semanticColors.technology.primary},${semanticColors.neutral[900]})`,
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
      '生成AIの特性と建築実務への適用',
      '建築家の役割シフトを理解',
      '安全運用テンプレを配布',
    ],
    bg: 'linear-gradient(135deg,#1e40af,#0f172a)',
  },
  {
    id: 's-ai-basics',
    title: 'AIの基礎',
    lines: [
      'Transformer→GPT→マルチモーダルで精度と応用範囲が飛躍',
      'CAD→BIM→AIオートメーションへと設計プロセスが連続進化',
      '建築審査・提案・維持管理でAI活用が共通言語になりつつある',
    ],
    timeline: [
      {
        label: '2017',
        title: 'Transformer論文公開',
        description: 'Google BrainがAttentionベースのアーキテクチャを発表。高精度な文章生成の礎に。',
      },
      {
        label: '2020',
        title: 'GPT-3 API公開',
        description: '文章生成がクラウドAPIで利用可能に。建築資料のドラフト作成が現実的になる。',
      },
      {
        label: '2022',
        title: 'Stable Diffusion登場',
        description: '建築パース・マテリアル検討が数秒で生成可能に。概念検討スピードが大幅短縮。',
      },
      {
        label: '2023',
        title: 'GPT-4 & Code Interpreter',
        description: '表計算や図面データの解析が自動化。省エネ計算や差分チェックの自動化が進展。',
      },
      {
        label: '2024-25',
        title: 'BIM/CIM活用指針にAI活用が明記',
        description: '国交省BIM推進施策や自治体のガイドラインでAI活用と記録性が求められる。',
      },
    ],
    toggles: [
      {
        title: 'キーワード',
        summary: 'Transformer / Foundation Model / Agent',
        detail: '最新AIは大規模基盤モデル＋タスク特化プロンプトで成り立つ。建築では構造化された図面・法規データとの接続が鍵。',
      },
      {
        title: '建築への影響',
        summary: '企画・審査・維持管理',
        detail: '企画段階のスタディ生成、審査資料の根拠整理、維持管理のログ作成までAIが下支えする流れが世界的に始まっている。',
        tone: 'accent',
      },
    ],
    footnotes: [
      'Transformer: Vaswani et al., Attention Is All You Need (2017)',
      'GPT-3: OpenAI API Launch, 2020年6月',
      'Stable Diffusion: Stability AI, 2022年8月公開',
      '国土交通省 建築BIM推進会議（2024年5月）資料より抜粋',
    ],
    bg: 'linear-gradient(135deg,#1e293b,#334155)',
  },
  {
    id: 's-future-roles',
    title: '建築家の役割シフト',
    lines: [
      '残る仕事: 企画・物語・統合',
      'AIでオフロードする作業を選定',
      'チームで役割を再設計',
    ],
    bg: 'linear-gradient(135deg,#334155,#0f172a)',
  },
  {
    id: 's-security',
    title: 'セキュリティ・リスク対応',
    lines: [
      '機密区分と入力ルール（匿名化・置換）',
      'クラウドAIの権限・リンク・ログ管理',
      '社内ポリシー雛形（秘匿プロンプト／レビュー／承認）',
    ],
    bg: 'linear-gradient(135deg,#0f172a,#1e293b)',
  },
  {
    id: 's-security-check',
    title: 'セキュリティ チェックリスト',
    lines: [
      '入力: 匿名化・案件ID管理・不要情報排除',
      '利用: 権限設定と有効期限付き共有',
      '出力: 根拠保存・改変履歴・承認ログ',
    ],
    bg: 'linear-gradient(135deg,#1e293b,#475569)',
  },
  {
    id: 's-mini-demo',
    title: '基礎ミニ実演',
    lines: [
      '会議音声→要点抽出→表整形',
      'テンプレ差し込みで議事録骨子生成',
      '出力を共有フォルダに保存',
    ],
    bg: 'linear-gradient(135deg,#1e293b,#111827)',
  },
  {
    id: 's-prompt-tips',
    title: 'プロンプト活用Tips',
    lines: [
      '構造化して: 議題→決定→ToDo',
      'yamlでまとめて: 指示書を即共有',
      '抽象化⇄具体化で骨子を強化',
      '検証して: 根拠付き要約と参照列挙',
    ],
    bg: 'linear-gradient(135deg,#111827,#1f2937)',
  },
  {
    id: 's-notebooklm',
    title: 'NotebookLM 概要',
    lines: [
      '難しい資料を音声学習コンテンツに',
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
      '海外論文の要点把握と用語集',
      'トレーニング動画の自動生成',
    ],
    bg: 'linear-gradient(135deg,#0f172a,#1e293b)',
  },
  {
    id: 's-phase1-summary',
    title: 'Phase 1 まとめ',
    lines: [
      'リスクマトリクスと承認フローを共有',
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
      'AI導線マップでROI (工数/誤検出/利益)',
      'ハンズオンシートで自業務を記入',
    ],
    bg: 'linear-gradient(135deg,#38bdf8,#0f172a)',
  },
  {
    id: 's-workflow-hands',
    title: 'ワークフロー ハンズオン',
    lines: [
      '現状フローにAI候補を書き込む',
      'ボトルネックと期待効果を共有',
      'ペアディスカッションで改善案',
    ],
    bg: 'linear-gradient(135deg,#0f172a,#1e293b)',
  },
  {
    id: 's-demo1',
    title: '活用① 現調→議事録→提案',
    lines: [
      '音声→議事録テンプレ→提案資料',
      '構造化プロンプト＋表整形で高速化',
      'Canvas / SpotPDF への導線',
    ],
    bg: 'linear-gradient(135deg,#1e293b,#111827)',
  },
  {
    id: 's-demo1-hands',
    title: 'Demo① ハンズオン',
    lines: [
      'サンプル音声をNotebookLMに投入',
      '「構造化して」で要点抽出',
      '「表形式で」で提案骨子整形',
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
      'BEIと条件変更を比較',
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
    title: '活用④ Canvasで資料生成',
    lines: [
      'ChatGPT / Gemini CanvasでミニLP',
      '1ブロック編集→保存',
      '配布用ミニLPテンプレを提供',
    ],
    bg: 'linear-gradient(135deg,#111827,#1f2937)',
  },
  {
    id: 's-demo5',
    title: '活用⑤ GASでタスク通知',
    lines: [
      'Spreadsheet→GAS→Gmail通知',
      'トリガ設定と権限の確認',
      'コード挙動をその場で確認',
    ],
    bg: 'linear-gradient(135deg,#1f2937,#0f172a)',
  },
  {
    id: 's-risk-buffer',
    title: '時間押しリスクへの備え',
    lines: [
      '5分押し→Canvasデモは紹介のみ',
      '10分押し→GASデモは素材配布',
      'ハンズオンは成功体験最優先',
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
    title: '導入後のKPI設定例',
    lines: [
      '提案作成時間の測定',
      '審査コメント対応時間の記録',
      'ガイドライン遵守率のチェック',
    ],
    bg: 'linear-gradient(135deg,#38bdf8,#0f172a)',
  },
  {
    id: 's-best1',
    title: 'ベストプラクティス10箇条 (1/2)',
    lines: [
      '小さく始めて早く回す',
      '入力の整備（匿名化・フォーマット統一）',
      '出力の型を決める（yaml／表／テンプレ）',
      '差分は機械に任せる',
      '再計算は自動化が前提',
    ],
    bg: 'linear-gradient(135deg,#0f172a,#1e293b)',
  },
  {
    id: 's-best2',
    title: 'ベストプラクティス10箇条 (2/2)',
    lines: [
      '社内ルールは"運用できる最小"から',
      '根拠を併記して信頼を積む',
      '指標で語る（時間・誤差・利益）',
      '教える人になる（共有＝最強の定着）',
      '毎週1改善（継続して仕組みに落とす）',
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
      'KPI初期値を記録',
    ],
    bg: 'linear-gradient(135deg,#38bdf8,#0f172a)',
  },
  {
    id: 's-resources',
    title: '配布物セット',
    lines: [
      'アーカイブ動画・スライド・リンク集',
      'プロンプト集（Markdown + YAML）',
      'GAS雛形・モデル建物法レシピ',
    ],
    bg: 'linear-gradient(135deg,#0f172a,#1e293b)',
  },
  {
    id: 's-materials',
    title: '資料とワークシート',
    lines: [
      'Drive: audio/pdf/xlsx/prompt/gas',
      'ワークフローシート / チェックリスト',
      'CanvasミニLPテンプレ',
    ],
    bg: 'linear-gradient(135deg,#1e293b,#111827)',
  },
  {
    id: 's-presents',
    title: '参加者特典',
    lines: [
      '資料一式（当日スライドPDF・事例リンク集・明日からの実装チェックリスト）',
      'プロンプト集（構造化して、yamlでまとめて、表形式で、抽象化→具体化、制約付きで、検証して）',
      'タスク通知GAS（Spreadsheet→GAS→Gmail通知の雛形コード・導入手順・運用Q&A）',
      'ラストシークレット: AI×建築コミュニティ（Circle）の招待',
    ],
    bg: 'linear-gradient(135deg,#111827,#1f2937)',
  },
  {
    id: 's-community-intro',
    title: 'ラストシークレット',
    lines: [
      'ここにいる皆さんだけが入れるクローズドなコミュニティ',
      '最新の深い情報の最速公開拠点・今後のセミナーは追加費用なし',
      '初月無料・月額5,000円・72時間限定オファー',
    ],
    bg: 'linear-gradient(135deg,#111827,#1f2937)',
  },
  {
    id: 's-community-benefits',
    title: 'コミュニティ特典',
    lines: [
      '月1回のZoom相談会・不定期の限定交流会（オンライン／オフライン）',
      'SpotPDF・楽々省エネ計算・天空率（開発中）の早期アクセス',
      '最新の深い情報を最速で展開（サンプル、雛形、実演動画）',
    ],
    bg: 'linear-gradient(135deg,#0f172a,#1e293b)',
  },
  {
    id: 's-community-rules',
    title: 'コミュニティ運用',
    lines: [
      '実名推奨・守秘情報の持ち込み禁止',
      '成果物二次配布はクレジット必須',
      'Circle + Zoom + Drive で運用',
    ],
    bg: 'linear-gradient(135deg,#1e293b,#475569)',
  },
  {
    id: 's-community-join',
    title: '参加方法',
    lines: [
      'クロージングで招待コードを提示',
      '72時間以内に申し込み→初月無料',
      'オンボーディングで課題とライブ予定共有',
    ],
    bg: 'linear-gradient(135deg,#38bdf8,#0f172a)',
  },
  {
    id: 's-last-secret',
    title: 'ラストシークレット構成',
    lines: [
      'Slide1: 初月無料の案内',
      'Slide2-4: サロン特典とツール',
      'Slide5: 招待コード & 72時間限定',
    ],
    bg: 'linear-gradient(135deg,#0f172a,#1e293b)',
  },
  {
    id: 's-survey',
    title: 'アンケート & Q&A',
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
      'ハンズオンは成功体験最優先',
      '時間押しはリスクプランに従う',
    ],
    bg: 'linear-gradient(135deg,#0f172a,#1e293b)',
  },
  {
    id: 's-prep',
    title: '事前準備チェック',
    lines: [
      'GoogleアカウントでDriveアクセス',
      'ChatGPT / Gemini にログイン',
      'PDF閲覧とGmail通知テスト',
    ],
    bg: 'linear-gradient(135deg,#1e293b,#475569)',
  },
  {
    id: 's-thanks',
    title: 'Thank You',
    subtitle: 'ご参加ありがとうございました！',
    lines: [
      'アンケート回答で配布物を解放',
      '追加質問はメールでお気軽に',
      '一緒にAIで建築業界を変えましょう',
    ],
    bg: 'linear-gradient(135deg,#38bdf8,#0f172a)',
  },
];


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
      if (slideMode) {
        console.log('Slide mode key pressed:', e.key, '(lowercase:', k, '), current slideIdx:', slideIdx);
      }
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
      if (k === 'escape' && slideMode) {
        setSlideMode(false);
        e.preventDefault();
        return;
      }
      if (k === 'p' && presenter && !slideMode) {
        window.print();
        e.preventDefault();
        return;
      }
      // スライドモードの場合
      if (slideMode) {
        if (k === 'arrowright' || k === 'pagedown' || k === ' ') {
          console.log('Next slide:', slideIdx, '->', Math.min(slideIdx + 1, SLIDES.length - 1));
          setSlideIdx((prev) => Math.min(prev + 1, SLIDES.length - 1));
          e.preventDefault();
          return;
        }
        if (k === 'arrowleft' || k === 'pageup') {
          console.log('Prev slide:', slideIdx, '->', Math.max(slideIdx - 1, 0));
          setSlideIdx((prev) => Math.max(prev - 1, 0));
          e.preventDefault();
          return;
        }
        return;
      }

      if (!presenter) return;
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
  }, [presenter, slideMode, allIds, idx, slideIdx]);

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
        <span className="flex-1 leading-7 text-slate-700">{stripLeadingBullet(b)}</span>
      </li>
    ));
  };

  // スライドモードの場合は専用UI表示
  if (slideMode) {
    const currentSlide = SLIDES[slideIdx] || SLIDES[0];

    const media = currentSlide.media;
    const showSideContent = Boolean(media && media.items.length);
    const toneClasses = (tone: SlideMediaTone = 'default') => {
      switch (tone) {
        case 'accent':
          return {
            border: 'border-cyan-400/60',
            caption: 'text-cyan-200',
            description: 'text-cyan-200/80',
            badge: 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40',
          } as const;
        case 'muted':
          return {
            border: 'border-white/10',
            caption: 'text-white/70',
            description: 'text-white/50',
            badge: 'bg-white/10 text-white/60 border border-white/15',
          } as const;
        default:
          return {
            border: 'border-white/15',
            caption: 'text-white',
            description: 'text-white/70',
            badge: 'bg-white/15 text-white/80 border border-white/15',
          } as const;
      }
    };

    const sanitizedLines = (currentSlide.lines || []).map(stripLeadingBullet);

    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
        {/* スライドヘッダー */}
        <div className="flex justify-between items-center p-6 bg-black/20">
          <div className="flex items-center gap-4">
            <div className="text-sm opacity-70">
              {slideIdx + 1} / {SLIDES.length}
            </div>
            <div className="text-lg font-semibold">実務で使える AI×建築セミナー</div>
          </div>
          <div className="text-sm opacity-70">
            ESC: 終了 | ←→: スライド移動 | N: ノート
          </div>
        </div>

        {/* メインスライドエリア */}
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="max-w-6xl w-full">
            <div className={`grid gap-12 ${showSideContent ? 'lg:grid-cols-[1fr,320px]' : ''}`}>
              {/* メインコンテンツ */}
              <div className="text-center space-y-8">
                {currentSlide.subtitle && (
                  <div className="text-cyan-400 text-lg uppercase tracking-[0.3em] font-semibold">
                    {currentSlide.subtitle}
                  </div>
                )}
                <h1 className="text-6xl font-bold leading-tight">
                  {currentSlide.title}
                </h1>

                {currentSlide.goalStatement && (
                  <div className="text-2xl md:text-3xl font-semibold leading-snug text-cyan-100">
                    {currentSlide.goalStatement}
                  </div>
                )}

                {currentSlide.quickFacts && currentSlide.quickFacts.length > 0 && (
                  <div className="grid md:grid-cols-3 gap-4 text-left">
                    {currentSlide.quickFacts.map((fact, idx) => (
                      <div
                        key={`${currentSlide.id}-fact-${idx}`}
                        className="rounded-2xl border border-white/15 bg-white/10 px-4 py-5"
                      >
                        <div className="text-xs uppercase tracking-[0.25em] text-white/70 mb-2">
                          {fact.label}
                        </div>
                        <div className="text-2xl font-semibold text-white">
                          {fact.value}
                        </div>
                        {fact.description && (
                          <p className="text-xs text-white/70 mt-2 leading-5">
                            {fact.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {sanitizedLines.length > 0 && (
                  <div className="max-w-4xl mx-auto">
                    <ul className="space-y-6 text-xl text-left">
                      {sanitizedLines.map((line, idx) => (
                        <li key={idx} className="flex items-start gap-4">
                          <div className="mt-3 w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0" />
                          <span className="leading-relaxed">{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentSlide.timeline && currentSlide.timeline.length > 0 && (
                  <RevealPanel delay={150}>
                    <div className="bg-white/5 rounded-2xl px-6 py-8 text-left">
                      <div className="text-sm uppercase tracking-[0.3em] text-cyan-200/80 mb-4">
                        AI×建築の進化タイムライン
                      </div>
                      <Timeline entries={currentSlide.timeline} colorScheme="architecture" />
                    </div>
                  </RevealPanel>
                )}

                {currentSlide.toggles && currentSlide.toggles.length > 0 && (
                  <RevealPanel delay={250}>
                    <div className="grid md:grid-cols-2 gap-4 text-left">
                      {currentSlide.toggles.map((toggle, idx) => (
                        <InfoToggle
                          key={`${currentSlide.id}-toggle-${idx}`}
                          title={toggle.title}
                          summary={toggle.summary}
                          detail={toggle.detail}
                          tone={toggle.tone}
                        />
                      ))}
                    </div>
                  </RevealPanel>
                )}

                {currentSlide.barChart && (
                  <RevealPanel delay={300}>
                    <div className="bg-white/5 rounded-2xl px-6 py-6 text-left">
                      <BarChart
                        title={currentSlide.barChart.title}
                        colorScheme={currentSlide.barChart.colorScheme}
                        data={currentSlide.barChart.data}
                      />
                    </div>
                  </RevealPanel>
                )}

                {currentSlide.footnotes && currentSlide.footnotes.length > 0 && (
                  <div className="text-xs text-white/60 space-y-2 max-w-3xl mx-auto">
                    {currentSlide.footnotes.map((note, idx) => (
                      <div key={`${currentSlide.id}-footnote-${idx}`}>※ {note}</div>
                    ))}
                  </div>
                )}

                {/* プログレス表示 */}
                <div className="max-w-2xl mx-auto bg-black/20 rounded-xl p-6 mt-12">
                  <div className="text-sm opacity-70 mb-3">進行状況</div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div
                      className="bg-cyan-400 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${((slideIdx + 1) / SLIDES.length) * 100}%` }}
                    />
                  </div>
                  <div className="text-sm opacity-60 mt-3">
                    {Math.round(((slideIdx + 1) / SLIDES.length) * 100)}% 完了 • {currentSlide.id}
                  </div>
                </div>
              </div>

              {/* サイドコンテンツ */}
              {showSideContent && media && (
                <div className="flex flex-col items-center justify-center space-y-6 text-left">
                  {media.headline && (
                    <div className="text-sm uppercase tracking-[0.3em] text-cyan-200/80 text-center">
                      {media.headline}
                    </div>
                  )}

                  {media.layout === 'grid' ? (
                    <div
                      className={`grid gap-4 w-full ${
                        media.columns === 3 ? 'grid-cols-3' : media.columns === 2 ? 'grid-cols-2' : 'grid-cols-1'
                      }`}
                    >
                      {media.items.map((item, idx) => {
                        const tone = toneClasses(item.tone);
                        const imageFitClass = item.fit === 'contain' ? 'object-contain' : 'object-cover';
                        return (
                          <figure
                            key={`${currentSlide.id}-media-${idx}`}
                            className={`bg-white/5 rounded-xl overflow-hidden border ${tone.border} shadow-lg`}
                          >
                            <img
                              src={item.src}
                              alt={item.alt}
                              loading="lazy"
                              className={`w-full h-32 ${imageFitClass} rounded-lg bg-slate-900/40`}
                            />
                            {(item.caption || item.description) && (
                              <figcaption className="px-3 py-2 space-y-1">
                                {item.caption && (
                                  <div className={`text-sm font-semibold ${tone.caption}`}>
                                    {item.caption}
                                  </div>
                                )}
                                {item.description && (
                                  <div className={`text-xs ${tone.description}`}>
                                    {item.description}
                                  </div>
                                )}
                              </figcaption>
                            )}
                          </figure>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-5 w-full">
                      {media.items.map((item, idx) => {
                        const tone = toneClasses(item.tone);
                        const imageFitClass = item.fit === 'contain' ? 'object-contain' : 'object-cover';
                        return (
                          <figure
                            key={`${currentSlide.id}-media-${idx}`}
                            className={`bg-white/5 rounded-2xl overflow-hidden border ${tone.border} shadow-xl`}
                          >
                            <div className="relative">
                              <img
                                src={item.src}
                                alt={item.alt}
                                loading="lazy"
                                className={`w-full max-h-[320px] ${imageFitClass} rounded-2xl bg-slate-900/30`}
                              />
                            </div>
                            {(item.caption || item.description) && (
                              <figcaption className="px-4 py-3 space-y-1">
                                {item.caption && (
                                  <div className={`text-base font-semibold ${tone.caption}`}>
                                    {item.caption}
                                  </div>
                                )}
                                {item.description && (
                                  <div className={`text-sm leading-6 ${tone.description}`}>
                                    {item.description}
                                  </div>
                                )}
                              </figcaption>
                            )}
                          </figure>
                        );
                      })}
                    </div>
                  )}

                  {media.footnote && (
                    <div className="text-xs text-white/60 text-center leading-5">
                      {media.footnote}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* フッター：時間表示 */}
        <div className="p-4 bg-black/20 text-center">
          <div className="text-sm opacity-70">
            経過時間: {Math.floor(elapsedSec / 60)}:{String(elapsedSec % 60).padStart(2, '0')}
          </div>
        </div>
      </div>
    );
  }

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
              <h1 className="text-[44px] font-semibold text-slate-900 leading-[1.1]">実務で使える AI×建築セミナー</h1>
              <p className="text-base text-slate-600 leading-7">建築プロジェクトにAIを組み込むワークフローを、理解→実演→適用の3段階で体験</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-5 border border-slate-200 bg-white">
                <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Today's Session</div>
                <div className="mt-3 text-2xl font-semibold text-slate-900">13:00-16:30<br className="hidden md:block" />180分プログラム</div>
                <div className="mt-2 text-xs text-slate-500">理解→実演→適用の3段階</div>
              </Card>
              <Card className="p-5 border border-slate-200 bg-white">
                <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Controls</div>
                <div className="mt-3 text-2xl font-semibold text-slate-900">S: スライド<br className="hidden md:block" />N: ノート</div>
                <div className="mt-2 text-xs text-slate-500">Shift+P: プレゼンターモード</div>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 text-sm text-slate-600">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500 uppercase tracking-[0.3em]">進行方式</div>
                <p className="mt-2 leading-6">このページをスライドとして使用<br/>プレゼンター機能・ノート表示対応</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500 uppercase tracking-[0.3em]">配布物</div>
                <p className="mt-2 leading-6">ワークフロー図・提案テンプレ<br/>チェックリスト・GAS雛形</p>
              </div>
            </div>


            <div className="flex flex-wrap gap-4">
              <a href="#program"
                 className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-shadow"
                 style={{ backgroundColor: semanticColors.architecture.primary }}>
                プログラムを見る<span aria-hidden>›</span>
              </a>
              <a href="#chapters"
                 className="inline-flex items-center gap-2 rounded-full border bg-white px-6 py-3 text-sm font-semibold hover:shadow-md transition-all"
                 style={{
                   borderColor: semanticColors.technology.accent,
                   color: semanticColors.technology.primary
                 }}>
                チャプター一覧<span aria-hidden>›</span>
              </a>
              <a href="#resources"
                 className="inline-flex items-center gap-2 rounded-full border bg-white px-6 py-3 text-sm font-semibold hover:shadow-md transition-all"
                 style={{
                   borderColor: semanticColors.success.accent,
                   color: semanticColors.success.primary
                 }}>
                配布案内<span aria-hidden>›</span>
              </a>
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
        <div className="max-w-6xl w-full mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">180分でたどる実務導入フロー</h2>
            <p className="text-lg text-slate-600 leading-7 max-w-3xl mx-auto">
              各フェーズは「理解 → 実演 → 適用」の3ステップで構成。配布資料とワークを組み合わせ、社内展開までの導線をその場で描きます。
            </p>
          </div>

          {/* Statistics Dashboard */}
          <Card className="p-8 border border-slate-200" style={{ backgroundColor: semanticColors.neutral[100] }}>
            <div className="grid md:grid-cols-4 gap-6">
              <StatCard category="architecture" value="180" label="分の集中学習" trend="効率性重視" indicator="T" />
              <StatCard category="technology" value="5" label="実務デモ" trend="即実装可能" indicator="D" />
              <StatCard category="success" value="高" label="満足度目標" trend="品質重視" indicator="S" />
              <StatCard category="process" value="30" label="日後フォロー" trend="定着サポート" indicator="F" />
            </div>
          </Card>

          {/* Progress Visualization */}
          <Card className="p-8 border border-slate-200 bg-white">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-center" style={{ color: semanticColors.neutral[900] }}>学習進捗の可視化</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center space-y-4">
                  <CircularProgress percentage={85} color={semanticColors.architecture.primary} />
                  <div>
                    <div className="font-semibold" style={{ color: semanticColors.architecture.primary }}>理解度</div>
                    <div className="text-sm" style={{ color: semanticColors.neutral[500] }}>基礎から実践まで</div>
                  </div>
                </div>
                <div className="text-center space-y-4">
                  <CircularProgress percentage={75} color={semanticColors.technology.primary} />
                  <div>
                    <div className="font-semibold" style={{ color: semanticColors.technology.primary }}>実装率</div>
                    <div className="text-sm" style={{ color: semanticColors.neutral[500] }}>即座に適用可能</div>
                  </div>
                </div>
                <div className="text-center space-y-4">
                  <CircularProgress percentage={95} color={semanticColors.success.primary} />
                  <div>
                    <div className="font-semibold" style={{ color: semanticColors.success.primary }}>満足度</div>
                    <div className="text-sm" style={{ color: semanticColors.neutral[500] }}>参加者評価</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Enhanced Timeline */}
          <Card className="p-8 border border-slate-200 bg-white">
            <h3 className="text-xl font-semibold text-slate-900 mb-8 text-center">詳細タイムライン</h3>

            {/* Phase 1 */}
            <div className="relative mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                     style={{ backgroundColor: semanticColors.architecture.primary }}>1</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded"
                          style={{ backgroundColor: semanticColors.architecture.light, color: semanticColors.architecture.primary }}>
                      Phase 1: 基礎構築
                    </span>
                    <span className="text-sm" style={{ color: semanticColors.neutral[500] }}>0-70分（70分間）</span>
                  </div>
                  <h4 className="text-lg font-semibold" style={{ color: semanticColors.architecture.primary }}>
                    基礎と安全運用の型を固める
                  </h4>
                </div>
                <ProgressBar progress={100} className="w-24" />
              </div>

              <div className="ml-16 grid md:grid-cols-3 gap-4">
                <div className="rounded-lg p-4 border"
                     style={{ backgroundColor: semanticColors.architecture.light, borderColor: semanticColors.architecture.accent }}>
                  <div className="text-xs font-semibold mb-2" style={{ color: semanticColors.architecture.primary }}>
                    LEARN: 学習内容
                  </div>
                  <p className="text-sm leading-5" style={{ color: semanticColors.neutral[700] }}>
                    AI/LLMの原理・建築での適用範囲・ガイドライン設計・NotebookLM活用
                  </p>
                </div>
                <div className="rounded-lg p-4 border"
                     style={{ backgroundColor: semanticColors.technology.light, borderColor: semanticColors.technology.accent }}>
                  <div className="text-xs font-semibold mb-2" style={{ color: semanticColors.technology.primary }}>
                    OUTPUT: 成果物
                  </div>
                  <p className="text-sm leading-5" style={{ color: semanticColors.neutral[700] }}>
                    安全運用チェックシート・社内説明用スライド骨子
                  </p>
                </div>
                <div className="rounded-lg p-4 border"
                     style={{ backgroundColor: semanticColors.warning.light, borderColor: semanticColors.warning.accent }}>
                  <div className="text-xs font-semibold mb-2" style={{ color: semanticColors.warning.primary }}>
                    KEY: 重要ポイント
                  </div>
                  <p className="text-sm leading-5" style={{ color: semanticColors.neutral[700] }}>
                    匿名化・承認ゲート・社内ポリシー雛形
                  </p>
                </div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="relative mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                     style={{ backgroundColor: semanticColors.technology.primary }}>2</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded"
                          style={{ backgroundColor: semanticColors.technology.light, color: semanticColors.technology.primary }}>
                      Phase 2: 実装体験
                    </span>
                    <span className="text-sm" style={{ color: semanticColors.neutral[500] }}>70-160分（90分間）</span>
                  </div>
                  <h4 className="text-lg font-semibold" style={{ color: semanticColors.technology.primary }}>
                    現調→提案→自動化を通しで学ぶ
                  </h4>
                </div>
                <ProgressBar progress={90} className="w-24" />
              </div>

              <div className="ml-16 space-y-6">
                {/* Tools Overview */}
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="rounded-lg p-4 border"
                       style={{ backgroundColor: semanticColors.architecture.light, borderColor: semanticColors.architecture.accent }}>
                    <div className="text-xs font-semibold mb-2" style={{ color: semanticColors.architecture.primary }}>
                      SURVEY: 現調ワーク
                    </div>
                    <p className="text-sm leading-5" style={{ color: semanticColors.neutral[700] }}>
                      音声→議事録→提案資料の自動化
                    </p>
                  </div>
                  <div className="rounded-lg p-4 border"
                       style={{ backgroundColor: semanticColors.process.light, borderColor: semanticColors.process.accent }}>
                    <div className="text-xs font-semibold mb-2" style={{ color: semanticColors.process.primary }}>
                      DIFF: SpotPDF
                    </div>
                    <p className="text-sm leading-5" style={{ color: semanticColors.neutral[700] }}>
                      図面差分"5分決着"
                    </p>
                  </div>
                  <div className="rounded-lg p-4 border"
                       style={{ backgroundColor: semanticColors.success.light, borderColor: semanticColors.success.accent }}>
                    <div className="text-xs font-semibold mb-2" style={{ color: semanticColors.success.primary }}>
                      CALC: 省エネ計算
                    </div>
                    <p className="text-sm leading-5" style={{ color: semanticColors.neutral[700] }}>
                      モデル建物法の自動化
                    </p>
                  </div>
                  <div className="rounded-lg p-4 border"
                       style={{ backgroundColor: semanticColors.technology.light, borderColor: semanticColors.technology.accent }}>
                    <div className="text-xs font-semibold mb-2" style={{ color: semanticColors.technology.primary }}>
                      CREATE: Canvas LP
                    </div>
                    <p className="text-sm leading-5" style={{ color: semanticColors.neutral[700] }}>
                      HP・資料の即作成
                    </p>
                  </div>
                  <div className="rounded-lg p-4 border"
                       style={{ backgroundColor: semanticColors.warning.light, borderColor: semanticColors.warning.accent }}>
                    <div className="text-xs font-semibold mb-2" style={{ color: semanticColors.warning.primary }}>
                      AUTO: GAS自動化
                    </div>
                    <p className="text-sm leading-5" style={{ color: semanticColors.neutral[700] }}>
                      タスク通知システム
                    </p>
                  </div>
                </div>

                {/* Performance Metrics Chart */}
                <BarChart
                  title="Phase 2 実装ツール別パフォーマンス"
                  colorScheme="technology"
                  data={[
                    { label: "現調→議事録", value: 85, target: 100 },
                    { label: "図面差分検出", value: 92, target: 100 },
                    { label: "省エネ計算", value: 78, target: 100 },
                    { label: "資料作成", value: 88, target: 100 },
                    { label: "通知自動化", value: 95, target: 100 }
                  ]}
                />
              </div>
            </div>

            {/* Phase 3 */}
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                     style={{ backgroundColor: semanticColors.success.primary }}>3</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded"
                          style={{ backgroundColor: semanticColors.success.light, color: semanticColors.success.primary }}>
                      Phase 3: 定着化
                    </span>
                    <span className="text-sm" style={{ color: semanticColors.neutral[500] }}>160-170分+（10分+無制限Q&A）</span>
                  </div>
                  <h4 className="text-lg font-semibold" style={{ color: semanticColors.success.primary }}>
                    まとめと今後の実装計画
                  </h4>
                </div>
                <ProgressBar progress={100} className="w-24" />
              </div>

              <div className="ml-16 space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="rounded-lg p-4 border"
                       style={{ backgroundColor: semanticColors.warning.light, borderColor: semanticColors.warning.accent }}>
                    <div className="text-xs font-semibold mb-2" style={{ color: semanticColors.warning.primary }}>
                      KPI: 測定指標
                    </div>
                    <p className="text-sm leading-5" style={{ color: semanticColors.neutral[700] }}>
                      工数削減・誤検出率・レスポンス速度
                    </p>
                  </div>
                  <div className="rounded-lg p-4 border"
                       style={{ backgroundColor: semanticColors.process.light, borderColor: semanticColors.process.accent }}>
                    <div className="text-xs font-semibold mb-2" style={{ color: semanticColors.process.primary }}>
                      BEST: ベストプラクティス
                    </div>
                    <p className="text-sm leading-5" style={{ color: semanticColors.neutral[700] }}>
                      10箇条・明日からの実装チェックリスト
                    </p>
                  </div>
                  <div className="rounded-lg p-4 border"
                       style={{ backgroundColor: semanticColors.success.light, borderColor: semanticColors.success.accent }}>
                    <div className="text-xs font-semibold mb-2" style={{ color: semanticColors.success.primary }}>
                      BONUS: 配布物解放
                    </div>
                    <p className="text-sm leading-5" style={{ color: semanticColors.neutral[700] }}>
                      全資料・プロンプト集・コミュニティ招待
                    </p>
                  </div>
                </div>

                {/* Implementation Roadmap Table */}
                <DataTable
                  colorScheme="success"
                  headers={["実装項目", "難易度", "効果", "実装期間"]}
                  rows={[
                    ["議事録自動化", "低", "時短効果あり", "1-2週間"],
                    ["図面差分検出", "中", "精度向上", "2-3週間"],
                    ["省エネ計算", "高", "工数削減", "1ヶ月"],
                    ["提案書自動生成", "中", "効率化", "2-3週間"],
                    ["タスク管理自動化", "低", "通知精度向上", "1週間"]
                  ]}
                />
              </div>
            </div>
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
        const deepDives = chapterDeepDives[s.id] || [];
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
                    {deepDives.length > 0 && (
                      <RevealPanel delay={180} className="space-y-3">
                        <div className="text-xs uppercase tracking-[0.3em] text-cyan-700">詳しく見る</div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {deepDives.map((item, idx) => (
                            <InfoToggle
                              key={`${s.id}-deep-${idx}`}
                              title={item.title}
                              summary={item.summary}
                              detail={item.detail}
                              tone={item.tone}
                            />
                          ))}
                        </div>
                      </RevealPanel>
                    )}
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
        <div className="max-w-6xl w-full mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">配布物とフォローアップ</h2>
            <p className="text-lg text-slate-600 leading-7 max-w-3xl mx-auto">
              セミナー終了後は非公開ページで資料を一括ダウンロード。社内展開や復習を支援する仕組みを整えています。
            </p>
          </div>

          {/* Resource Overview */}
          <Card className="p-8 border border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="text-center space-y-6">
              <h3 className="text-xl font-semibold text-slate-900">🎁 参加者特典パッケージ</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center space-y-2">
                  <div className="text-3xl">📚</div>
                  <div className="font-semibold text-slate-900">資料一式</div>
                  <div className="text-sm text-slate-600">スライド・チェックリスト・事例集</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl">💬</div>
                  <div className="font-semibold text-slate-900">プロンプト集</div>
                  <div className="text-sm text-slate-600">構造化・YAML・検証パターン</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl">⚙️</div>
                  <div className="font-semibold text-slate-900">GAS雛形</div>
                  <div className="text-sm text-slate-600">通知自動化・導入手順書</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl">🏘️</div>
                  <div className="font-semibold text-slate-900">コミュニティ</div>
                  <div className="text-sm text-slate-600">Circle招待・初月無料</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Detailed Breakdown */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Download Resources */}
            <Card className="p-8 border border-slate-200 bg-white">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white">
                    📥
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">受講者専用ダウンロード</h3>
                    <p className="text-sm text-slate-500">アンケート回答後に配布物解放</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                    <div className="font-semibold text-blue-900 text-sm mb-2">📹 動画コンテンツ</div>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li>• アーカイブ動画（受講者限定14日視聴）</li>
                      <li>• デモ実演の詳細解説動画</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                    <div className="font-semibold text-green-900 text-sm mb-2">📄 実務資料セット</div>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li>• 当日スライドPDF・事例リンク集</li>
                      <li>• 明日からの実装チェックリスト</li>
                      <li>• ベストプラクティス10箇条</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-4">
                    <div className="font-semibold text-purple-900 text-sm mb-2">🛠️ 実装ツール</div>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li>• プロンプト集（Markdown + YAML形式）</li>
                      <li>• GAS通知サンプルコード・導入手順</li>
                      <li>• SpotPDF差分サンプル・省エネ計算レシピ</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            {/* Support & Community */}
            <Card className="p-8 border border-slate-200 bg-white">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white">
                    🤝
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">継続サポート</h3>
                    <p className="text-sm text-slate-500">定着まで伴走する仕組み</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-amber-900 text-sm">🎯 ラストシークレット</div>
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">限定</span>
                    </div>
                    <div className="text-sm text-slate-700">
                      AI×建築コミュニティ（Circle）<br/>
                      初月無料・月額5,000円・72時間限定オファー
                    </div>
                  </div>

                  <div className="space-y-3">
                    <TimelineItem
                      time="Day 0"
                      title="配布物解放"
                      description="アンケート回答後、24時間以内に非公開ページのアクセス情報をメール送付"
                      isActive={true}
                    />
                    <TimelineItem
                      time="Day 1-30"
                      title="メール相談"
                      description="導入計画や社内展開の質疑をサポート"
                    />
                    <TimelineItem
                      time="Monthly"
                      title="Zoom相談会"
                      description="クローズドセッションで最新事例と課題共有"
                    />
                    <TimelineItem
                      time="Ongoing"
                      title="Circle活動"
                      description="最新ナレッジ共有・ツール早期アクセス・限定交流会"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Access Information */}
          <Card className="p-6 border border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-semibold text-slate-900">アクセス情報</div>
                <div className="text-sm text-slate-600">
                  招待コード：<code className="bg-slate-200 px-2 py-1 rounded text-slate-900 font-mono">AP-2025-SEMINAR</code>
                  　｜　第三者共有は禁止です
                </div>
              </div>
              <div className="text-right text-sm text-slate-500">
                全体所要時間：{totalPlanned}分（予定）
              </div>
            </div>
          </Card>
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
    </div>
  );
}
