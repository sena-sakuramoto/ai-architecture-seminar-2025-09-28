# 実務で使える AI×建築セミナー LP

React + TypeScript + Vite で構築したセミナー用ワンページアプリです。スライドモードと講師ノートを兼ね備え、ブラウザ一枚で進行・資料配布・タイムキープが完結します。

## 実装ポイント
- **スライドモード強化**: 矢印キーで滑らかに遷移し、ゴール声明・タイムライン・グラフ・脚注を表示。
- **インタラクティブ説明**: クリックで詳細が開くトグルカードやスクロール時に現れる補足パネル（`RevealPanel`）。
- **ビジュアル資料**: Before/After 画像、KPIバーグラフ、リスク対策表などを章ごとに追加。
- **データ構造拡張**: スライドに `goalStatement`・`timeline`・`quickFacts` などのフィールドを追加し、情報設計を柔軟化。
- **パフォーマンス配慮**: 画像の遅延読み込み (`loading="lazy"`) とアセットの集中管理で Pages 配信時の負荷を削減。

## 開発スクリプト
```bash
npm install
npm run dev    # 開発サーバ
npm run build  # 本番ビルド
```

## キーボードショートカット
- `S`: スライドモード切替（Shift+P で HUD 表示）
- `←/→` or `PageUp/PageDown`: スライド移動
- `N`: ノート表示
- `ESC`: スライドモード終了

## デプロイ
`main` ブランチへの push で GitHub Pages（`https://sena-sakuramoto.github.io/ai-architecture-seminar-2025-09-28/aixarch-20250928-8dC2p/`）に自動デプロイされます。`npm run build` の成果物を `dist` に出力し、GitHub Actions で公開用に整形しています。

## ディレクトリ構成（抜粋）
- `src/SeminarLanding.tsx`: ワンページ／スライド UI のメイン実装
- `images/`: スライド用の写真・グラフ素材
- `IMPLEMENTATION_PLAN.md`: 今回の改修タスクチェックリスト
