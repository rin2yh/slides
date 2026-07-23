# slides

[Slidev](https://sli.dev/) で作成したスライド集です。

## セットアップ

```bash
mise install
npm install
```

## コマンド

| コマンド | 説明 |
|---|---|
| `npm run dev` | プレビュー起動（`slides/template.md`） |
| `npm run build` | 静的サイトを `dist/` に出力 |
| `npm run export` | PDF を出力（`playwright-chromium` が必要） |

別ファイルをプレビューする場合:

```bash
npx slidev slides/<file>.md --open
```

## ディレクトリ構成

```
slides/
├── slides/
│   ├── template.md      # Slidev テンプレート
│   └── public/images/   # 画像置き場（/images/... で参照）
├── package.json
└── mise.toml
```

## 新しいスライドを作る

`slides/template.md` を複製して編集。`package.json` の scripts か `npx slidev <path>` で起動。

## カスタムレイアウト・コンポーネント

- `slides/layouts/*.vue` は自動で layout として使える
- `slides/components/*.vue` は Markdown 内でそのまま呼べる
- `slides/style.css` / `slides/uno.config.ts` でグローバルスタイルを拡張
