# slides

[Slidev](https://sli.dev/) で作成したスライド集です。

## セットアップ

```bash
mise install
npm install
```

## コマンド

スライド名を引数で渡す（`slides/` と `.md` は省略可）。

| コマンド | 説明 |
|---|---|
| `npm run new -- <name>` | `slides/templates/template.md` から新規スライドを作成 |
| `npm run dev <name>` | プレビュー起動 |
| `npm run build <name>` | 静的サイトを `dist/` に出力 |
| `npm run export <name>` | PDF を出力（`playwright-chromium` が必要） |

例:

```bash
npm run new -- go-coverage
npm run dev go-coverage
npm run build go-coverage
```

フルパスを渡してもよい: `npm run dev slides/go-coverage.md`

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

```bash
npm run new -- <name>
npm run dev <name>
```

## OGP画像

各スライドのヘッドマターに `seoMeta` を書くと、SNS シェア時のカード（og:image 等）が出る。

```yaml
seoMeta:
  ogTitle: タイトル
  ogDescription: 説明文
  ogImage: auto
```

仕組みの詳細（`ogImage: auto` が何をするか、`ogTitle` / `ogDescription` を省略しない理由）は `.claude/rules/frontmatter.md` を参照。

一覧ページ（`index.html`）にも OGP を付けている。カード画像（1200×630 の `og-image.png`）は
`scripts/gen-og.mjs` が Playwright でレンダリングし、`scripts/gen-index.mjs` が `og:` / `twitter:`
メタタグを埋め込む。どちらも CI（`.github/workflows/ci.yml`）の Pages ビルドで実行される。絶対 URL は
`SITE_URL` 環境変数（デプロイ先のベース URL）から組み立てる。

## カスタムレイアウト・コンポーネント

- `slides/layouts/*.vue` は自動で layout として使える
- `slides/components/*.vue` は Markdown 内でそのまま呼べる
- `slides/style.css` / `slides/uno.config.ts` でグローバルスタイルを拡張
