# Spoon フォロー可視化ツール (Next.js 版)

Next.js と TypeScript を使用して構築された、Spoon アプリケーションのフォロー/フォロワー関係を可視化する Web アプリケーションです。

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

- **Next.js 14** - React フレームワーク
- **TypeScript** - 型安全性
- **Tailwind CSS** - スタイリング
- **pnpm** - パッケージマネージャー
- **ESLint** - コード品質

## セットアップ

### 前提条件

- Node.js 18+ がインストールされていること
- pnpm がインストールされていること

### インストール

```bash
# 依存関係をインストール
pnpm install
```

### 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションにアクセスしてください。

### ビルドと本番環境での実行

```bash
# ビルド
pnpm build

# 本番環境で実行
pnpm start
```

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
spoon_follow_viewer/
├── src/
│   ├── app/
│   │   ├── globals.css        # グローバルスタイル
│   │   ├── layout.tsx         # ルートレイアウト
│   │   └── page.tsx           # メインページ
│   ├── components/
│   │   ├── ErrorSection.tsx   # エラー表示コンポーネント
│   │   ├── FollowVisualizer.tsx # メイン可視化コンポーネント
│   │   ├── InputSection.tsx   # 入力フォームコンポーネント
│   │   └── StatsSection.tsx   # 統計表示コンポーネント
│   └── types/
│       └── spoon.ts           # 型定義
├── next.config.js             # Next.js設定
├── tailwind.config.ts         # Tailwind CSS設定
├── tsconfig.json              # TypeScript設定
└── package.json               # 依存関係とスクリプト
```

## 注意事項

- ブラウザの CORS ポリシーにより、開発環境では API アクセスに制限がある場合があります
- 本番環境では適切な CORS 設定またはプロキシサーバーが必要です

## 開発

### コードの品質チェック

```bash
# ESLint でコードをチェック
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

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。
