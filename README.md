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

## インタラクションガイド
- ドットナビ: 右側ドットをクリックすると該当セクションへスムーズにスクロールし、HUDとノート内容が同期します。
- 詳しく見るトグル: 各章の`詳しく見る`カードをクリックすると補足説明が展開し、もう一度クリックで閉じます。
- Geminiケースギャラリー: Before/After 画像は拡大表示され、スクロールでフェードインします。マウスオーバー不要で視認できます。
- Presenter HUD: `Shift+P`でHUDを表示し、`G/C/R/T`キーで主要アンカーへジャンプできます。

## デプロイ
`main` ブランチへの push で GitHub Pages（`https://sena-sakuramoto.github.io/ai-architecture-seminar-2025-09-28/aixarch-20250928-8dC2p/`）に自動デプロイされます。`npm run build` の成果物を `dist` に出力し、GitHub Actions で公開用に整形しています。

### Pages 公開確認フロー
1. ローカルで `npm run build` を実行し、ビルドが成功することを確認。
2. `main` へ push 後、GitHub Actions のワークフローが成功しているかを `Actions` タブで確認。
3. 成功後に公開URLへアクセスし、スライドモード・ノート・画像表示を実機ブラウザ（PC/モバイル）でチェック。
4. 必要に応じて `IMPLEMENTATION_PLAN.md` の品質保証項目を更新し、確認結果を反映。

## ディレクトリ構成（抜粋）
- `src/SeminarLanding.tsx`: ワンページ／スライド UI のメイン実装
- `images/`: スライド用の写真・グラフ素材
- `IMPLEMENTATION_PLAN.md`: 今回の改修タスクチェックリスト
