import React from 'react';

type AgendaBlock = {
  time: string;
  title: string;
  description: string;
};

type Speaker = {
  name: string;
  title: string;
  bio: string;
  expertise: string[];
};

type Bonus = {
  title: string;
  description: string;
};

const agenda: AgendaBlock[] = [
  {
    time: '13:00',
    title: 'イントロダクション & 未来像',
    description:
      '国内外の最新事例とともに、建築×AIで変わる実務フローを俯瞰。2025年以降を見据えたロードマップを共有します。',
  },
  {
    time: '13:40',
    title: 'AIモデリングワークフロー演習',
    description:
      '敷地条件からコンセプト立案、質感調整までを AIGC ツールの組み合わせでデモ。設計支援AIの限界値と注意点を解説。',
  },
  {
    time: '14:30',
    title: 'BIM/設計DX連携ハンズオン',
    description:
      'BIM・構造・設備チームへの連携方法をライブで紹介。社内ナレッジを埋め込むプロンプト設計と品質管理を学びます。',
  },
  {
    time: '15:20',
    title: 'AI審査対応とリスクマネジメント',
    description:
      '発注者・審査プロセスで求められる説明責任を整理。生成プロセスのログ管理やガイドライン策定のステップを提示。',
  },
  {
    time: '16:00',
    title: 'ケーススタディ & Q&A',
    description:
      '導入半年で成果を出した企業のナレッジを共有。参加者の課題に沿った導入ロードマップをその場で提案します。',
  },
];

const speakers: Speaker[] = [
  {
    name: '高瀬 玲奈',
    title: 'アーキプリズマ株式会社 AIストラテジスト',
    bio: '大手ゼネコンで設計・施工を経験後、AI活用組織を立ち上げ。生成AIとBIMの統合プロジェクトを多数リード。',
    expertise: ['生成AI戦略', 'BIM連携', '社内人材育成'],
  },
  {
    name: '大谷 響',
    title: '建築デザインファーム PRINCIPAL',
    bio: '建築ビジュアライゼーション専門家。海外コンペで受賞歴多数。AIツールによるビジュアル制作フローを最適化。',
    expertise: ['ビジュアライゼーション', 'レンダリングAI', 'クオリティ管理'],
  },
  {
    name: '柚木 悠',
    title: 'DX推進コンサルタント',
    bio: '建設テック企業でプロダクト責任者を務め、建築現場向けAIアシスタントを開発。コンプライアンス支援が専門。',
    expertise: ['規制対応', 'AIガバナンス', '業務設計'],
  },
];

const bonuses: Bonus[] = [
  {
    title: 'AIプロンプトテンプレート集（70種）',
    description: '用途別（企画・設計・法規・積算）に最適化されたテンプレートを提供。社内展開用に修正可能なドキュメント形式。',
  },
  {
    title: 'BIM連携チェックリスト',
    description: 'BIMソフト別に考慮すべきパラメータや、AI生成モデルの差分管理手法を一覧化。プロジェクト初動で活用できます。',
  },
  {
    title: '社内導入ロードマップ雛形',
    description: '社内教育・パイロット・展開までの3ヶ月プランをテンプレート化。ガバナンス面の合意形成資料としても使えます。',
  },
];

const featureCards = [
  {
    title: '実務課題から設計',
    description:
      '現場のボトルネックをヒアリングしながら、生成AIが活きる領域を可視化。現実的なROI算出方法も解説します。',
  },
  {
    title: '1日で流れを体得',
    description:
      'コンセプト作成→モデリング→プレゼン資料化までのワークフローを「操作＋解説」で一気通貫に学習します。',
  },
  {
    title: '社内展開シナリオ付き',
    description:
      '研修後30日間で社内に横展開するためのナレッジ共有フローと KPI 設計例をセットで提供します。',
  },
];

const SeminarLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="bg-gradient-to-br from-cyan-500/30 via-slate-900 to-slate-950">
        <header className="mx-auto max-w-6xl px-6 pt-16 pb-20 lg:flex lg:items-center lg:gap-16">
          <div className="flex-1">
            <p className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-xs tracking-wide text-cyan-200">
              建築リーダー向け実務集中セミナー 2025.09.28
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-white lg:text-5xl">
              実務で使える<br className="hidden sm:block" />AI×建築セミナー 2025
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-200">
              生成AIとBIMを掛け合わせた最新の建築ワークフローを、6時間で体得する集中プログラム。設計・施工・DXのキープレイヤーが、現場導入のリアルな成功例と落とし穴を共有します。
            </p>
            <dl className="mt-8 grid gap-6 text-sm text-slate-200 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-cyan-200">開催日程</dt>
                <dd className="mt-2 text-lg font-semibold text-white">2025年9月28日（日）13:00-16:30</dd>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-cyan-200">会場</dt>
                <dd className="mt-2 text-lg font-semibold text-white">オンライン（ライブ配信）+ アーカイブ視聴（14日間）</dd>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-cyan-200">対象</dt>
                <dd className="mt-2">設計・デザインファーム、ゼネコン・サブコン、デベロッパー、DX推進部門</dd>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-cyan-200">定員</dt>
                <dd className="mt-2">先着 120 名（法人申込可）</dd>
              </div>
            </dl>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#registration"
                className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-400"
              >
                招待コードで申し込む
              </a>
              <span className="text-sm text-slate-300">招待コード: <span className="font-semibold text-white">AP-2025-SEMINAR</span></span>
            </div>
          </div>
          <div className="mt-12 flex-1 lg:mt-0">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-500/20">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">このセミナーで得られること</p>
              <ul className="mt-4 space-y-4 text-sm text-slate-200">
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                  <span>企画設計から実施設計まで AI を組み込んだ最新ワークフローを生解説。</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                  <span>社内ガイドライン策定に使えるテンプレートとチェックリストを提供。</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                  <span>導入後30日で成果を出すためのロードマップと KPI 設計の考え方を共有。</span>
                </li>
              </ul>
              <div className="mt-6 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 p-4 text-sm text-cyan-100">
                <p className="font-semibold text-white">早期申込特典</p>
                <p className="mt-1">9/1 までの申込で 1on1 実装相談（30 分）を追加提供。</p>
              </div>
            </div>
          </div>
        </header>
      </div>

      <main className="mx-auto flex max-w-6xl flex-col gap-20 px-6 py-20">
        <section className="grid gap-8 md:grid-cols-3">
          {featureCards.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Feature</p>
              <h2 className="mt-3 text-xl font-semibold text-white">{feature.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-200">{feature.description}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Agenda</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">6時間で押さえる実務フロー</h2>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-200">
                ワークフローの各ステップを、操作デモと「そのまま使える資料」で習得。AIの活用可否判断や、各部署での合意形成に必要な情報を揃えます。
              </p>
            </div>
            <span className="hidden rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-100 md:inline">
              休憩含む / ライブQAあり
            </span>
          </div>
          <div className="mt-8 grid gap-6">
            {agenda.map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm md:flex-row md:items-start"
              >
                <div className="flex w-full flex-none items-center gap-3 md:w-40">
                  <span className="text-sm uppercase tracking-[0.2em] text-cyan-200">{item.time}</span>
                  <span className="h-px flex-1 bg-cyan-500/40" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-200">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[2fr,3fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">For Team</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">こんな課題を持つチームへ</h2>
            <ul className="mt-6 space-y-4 text-sm text-slate-200">
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                <span>生成AI導入を検討中だが、ROI や社内規程の整理で足踏みしている。</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                <span>複数部署でバラバラにAIツールを試しており、統一したナレッジが作れていない。</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                <span>顧客・審査向けの説明責任に耐える証跡の残し方が分からない。</span>
              </li>
            </ul>
            <div className="mt-6 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 p-5 text-sm text-cyan-100">
              <p className="font-semibold text-white">成果保証サポート</p>
              <p className="mt-2">研修後30日間のメール相談付き。社内稟議資料のレビューも対応します。</p>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Case Study</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">導入企業の声</h2>
            <div className="mt-6 space-y-6 text-sm text-slate-200">
              <div className="rounded-2xl border border-white/5 bg-black/20 p-5 shadow-inner shadow-black/20">
                <p className="text-cyan-100">「社内でバラバラだったAI活用が1ヶ月でガイドライン化。審査への説明資料も整い、プロポーザルでの訴求力が上がりました」</p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">大手デベロッパー DX推進部</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-black/20 p-5 shadow-inner shadow-black/20">
                <p className="text-cyan-100">「生成AIとBIM連携の実演がスムーズで、チーム全体のモチベーションが向上。導入後のサポートも手厚かったです」</p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">準大手ゼネコン 設計部</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-black/20 p-5 shadow-inner shadow-black/20">
                <p className="text-cyan-100">「AI対応の審査書式が整い、発注者とのやり取りが高速化。品質管理と説明責任を両立できました」</p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">建築デザイン事務所 代表</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-10">
          <div className="md:flex md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Speakers</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">現場で成果を出してきた講師陣</h2>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-200 md:mt-0">
              建築実務とAI活用の両方に精通したプロフェッショナルが、現場目線のノウハウと失敗事例を包み隠さず共有します。
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {speakers.map((speaker) => (
              <article key={speaker.name} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 p-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">{speaker.name}</h3>
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">{speaker.title}</p>
                </div>
                <p className="text-sm leading-relaxed text-slate-200">{speaker.bio}</p>
                <div className="flex flex-wrap gap-2 text-xs text-cyan-100">
                  {speaker.expertise.map((item) => (
                    <span key={item} className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1">
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-[3fr,2fr]" id="registration">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Special Bundle</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">受講特典とフォローアップ</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-200">
              即日社内展開できる資料セットとフォローアップで、研修後のアクションまで伴走します。招待コード経由の受講者限定で提供します。
            </p>
            <ul className="mt-6 grid gap-5 text-sm text-slate-200 md:grid-cols-2">
              {bonuses.map((bonus) => (
                <li key={bonus.title} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-sm font-semibold text-white">{bonus.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">{bonus.description}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            <div className="rounded-3xl border border-cyan-500/50 bg-black/30 p-8 text-sm text-slate-200">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Entry</p>
              <h3 className="mt-3 text-xl font-semibold text-white">参加費</h3>
              <p className="mt-3 text-3xl font-semibold text-white">税込 39,600 円 / 名</p>
              <p className="mt-3 text-xs text-slate-300">法人申込は同一アカウントで最大 5 名まで視聴可能。請求書払い / クレジットカード対応。</p>
              <ul className="mt-4 space-y-2 text-xs text-cyan-100">
                <li>・アーカイブ視聴リンクを 24 時間以内に送付</li>
                <li>・社内共有用の抜粋スライドを提供</li>
                <li>・講師への個別相談（1 回 / 30 分）</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-slate-200">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Registration</p>
              <h3 className="mt-3 text-xl font-semibold text-white">申込方法</h3>
              <ol className="mt-4 list-decimal space-y-3 pl-5">
                <li>申込フォームで招待コード <span className="font-semibold text-white">AP-2025-SEMINAR</span> を入力</li>
                <li>担当者より 1 営業日以内に詳細案内を送付</li>
                <li>支払い手続き完了後に視聴リンクを案内</li>
              </ol>
              <a
                href="mailto:seminar@archi-prisma.co.jp?subject=AI×建築セミナー申込"
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400"
              >
                メールで申し込む
              </a>
              <p className="mt-3 text-xs text-slate-400">※ 招待コード未入力の場合は確認のご連絡を差し上げます。</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black/40 py-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2025 Archi Prisma Inc. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <a href="https://archi-prisma.co.jp" target="_blank" rel="noreferrer" className="hover:text-cyan-200">
              コーポレートサイト
            </a>
            <a href="mailto:contact@archi-prisma.co.jp" className="hover:text-cyan-200">
              お問い合わせ
            </a>
            <a href="/public/terms.pdf" className="hover:text-cyan-200">
              受講規約
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SeminarLanding;
