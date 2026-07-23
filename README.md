# slides

[Slidev](https://sli.dev/) で作成したスライド集です。

## セットアップ

```bash
mise install
npm install
```

## コマンド

対象のスライドファイルを引数で渡す。

| コマンド | 説明 |
|---|---|
| `npm run dev <file>` | プレビュー起動 |
| `npm run build <file>` | 静的サイトを `dist/` に出力 |
| `npm run export <file>` | PDF を出力（`playwright-chromium` が必要） |

例:

```bash
npm run dev slides/go-coverage.md
```

## ディレクトリ構成

```
slides/
├── slides/
│   ├── go-coverage.md      # 発表資料の例
│   ├── style.css           # 共通スタイル
│   ├── layouts/            # カスタムレイアウト
│   ├── components/         # カスタムコンポーネント
│   ├── public/images/      # 画像置き場（/images/... で参照）
│   └── templates/
│       └── template.md     # Slidev テンプレート（デプロイ対象外）
├── package.json
└── mise.toml
```

`slides/*.md`（直下のみ）が GitHub Pages のビルド対象。`templates/` はサブディレクトリなので対象外。

## 新しいスライドを作る

`slides/templates/template.md` の内容を `slides/<file>.md` にコピーして編集し、`npm run dev slides/<file>.md` で起動。

## カスタムレイアウト・コンポーネント

- `slides/layouts/*.vue` は自動で layout として使える
- `slides/components/*.vue` は Markdown 内でそのまま呼べる
- `slides/style.css` / `slides/uno.config.ts` でグローバルスタイルを拡張
