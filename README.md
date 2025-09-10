# Spoon フォロー可視化ツール (GitHub Pages 静的版 / Vite + React)

GitHub Pages 上でホストできる **完全クライアントサイド** の Spoon フォロー関係可視化ツールです。Next.js 版を撤廃し、Vite + React + Tailwind CSS でゼロから再構築しました。

## 機能

- ユーザー ID を入力してフォロー/フォロワー情報を取得
- フォロワー数、フォロー数、相互フォロー数の統計表示
- インタラクティブなグラフ表示
  - 中心に指定したユーザーを配置
  - フォロワーを外側の円に配置（赤色）
  - フォロー中を内側の円に配置（ティール色）
  - 相互フォローは特別な色で表示（青色）
- レスポンシブデザイン対応
- Tailwind CSS による美しい UI

## 技術スタック

- Vite (高速なビルド/開発環境)
- React 18 + TypeScript
- Tailwind CSS 3
- ESLint
- GitHub Actions (gh-pages デプロイ)

## セットアップ

### 前提条件

- Node.js 18+ がインストールされていること
- pnpm がインストールされていること

### インストール

```bash
# 依存関係をインストール
pnpm install
```

### 開発サーバー起動

```bash
pnpm dev
```

ブラウザで http://localhost:5173 を開く。

### ビルド

```bash
pnpm build
```

生成物は `dist/` に出力されます。`pnpm preview` でローカル確認できます。

## 使用方法

1. アプリケーションを開く
2. ユーザー ID を入力（例: 316704114）
3. 「データを読み込み」ボタンをクリック
4. フォロー関係がグラフで表示されます

## API エンドポイント

- フォロワー: `https://jp-api.spooncast.net/users/{userId}/followers/`
- フォロー: `https://jp-api.spooncast.net/users/{userId}/followings/`

## プロジェクト構造

```
spoon-follow-viewer/
├── index.html
├── vite.config.ts
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── lib/
│   │   └── apiClient.ts
│   ├── components/
│   │   ├── ErrorSection.tsx
│   │   ├── FollowVisualizer.tsx
│   │   ├── InputSection.tsx
│   │   └── StatsSection.tsx
│   └── types/
│       └── spoon.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
└── package.json
```

## CORS とプロキシについて

GitHub Pages は静的ホスティングのため、サーバーサイドでの API プロキシは使用できません。Spoon API がブラウザから直接許可されていない場合（CORS エラー）には、以下のいずれかを利用してください:

1. 自前の Cloudflare Workers / Vercel Edge / Render などで CORS ヘッダーを付与する簡易プロキシを用意
2. 一時的に CORS 解除系の公開プロキシサービス（安定性注意）を設定
3. 事前に API レスポンスを JSON として取得し、`/public/data/*.json` に配置しモックとして読み込む（拡張余地）

アプリ画面上部の「プロキシ URL」欄にプロキシのベース URL を入力すると、`GET {proxy}/{エンコード済API URL}` の形式でリクエストします。

## 開発

### コード品質

```bash
pnpm lint
```

### 型チェック

```bash
# TypeScript の型チェック
npx tsc --noEmit
```

## カスタマイズ

- `src/types/spoon.ts` で API レスポンスの型を調整
- `tailwind.config.ts` で色やスタイルをカスタマイズ
- `src/components/` でコンポーネントの見た目や動作を変更

## GitHub Pages デプロイ

`vite.config.ts` の `base` はリポジトリ名 `/spoon-follow-viewer/` に設定済みです。GitHub Pages (Pages Source: GitHub Actions) を使用する想定で、`gh-pages` ブランチへ自動デプロイするワークフローを追加します。

1. GitHub リポジトリの Settings → Pages で Build and deployment を "GitHub Actions" にする
2. main ブランチへ push すると workflow が走り `gh-pages` ブランチが公開される

手動でローカルから検証する場合:

```bash
pnpm build
npx serve dist  # 任意の静的サーバー
```

## ライセンス

MIT
