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
npm run dev slides/template.md
npm run dev slides/go-coverage.md
```

## ディレクトリ構成

```
slides/
├── slides/
│   ├── template.md      # Slidev テンプレート
│   ├── go-coverage.md   # 発表資料の例
│   ├── style.css        # 共通スタイル
│   ├── layouts/         # カスタムレイアウト
│   ├── components/      # カスタムコンポーネント
│   └── public/images/   # 画像置き場（/images/... で参照）
├── package.json
└── mise.toml
```

## 新しいスライドを作る

`slides/template.md` を複製して編集し、`npm run dev slides/<file>.md` で起動。

## OGP画像

各スライドのヘッドマターに `seoMeta` を書くと、SNS シェア時のカード（og:image 等）が出る。

```yaml
seoMeta:
  ogTitle: タイトル
  ogDescription: 説明文
  ogImage: auto
```

`ogImage: auto` は `npm run build` 実行時に最初のスライドを Playwright でスクリーンショットして自動生成する（`playwright-chromium` が必要。`export` と同じ依存）。

## カスタムレイアウト・コンポーネント

- `slides/layouts/*.vue` は自動で layout として使える
- `slides/components/*.vue` は Markdown 内でそのまま呼べる
- `slides/style.css` / `slides/uno.config.ts` でグローバルスタイルを拡張
