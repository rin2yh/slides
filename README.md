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
│   ├── index.html          # 各デッキ共通の <head>（favicon 等を注入）
│   ├── style.css           # 共通スタイル
│   ├── layouts/            # カスタムレイアウト
│   ├── components/         # カスタムコンポーネント
│   ├── public/             # 静的アセット（favicon 一式・/images/... 等）
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

## Favicon

favicon 一式（`favicon.ico` / 各サイズ PNG / `apple-touch-icon.png` / `site.webmanifest` など）は `slides/public/` に置いてある（`rin2yh/blog` と同じアイコン）。

- 各デッキの `<head>` へは `slides/index.html` が `<link rel="icon">` などを注入する。パスは `%BASE_URL%` を使うのでデッキごとの base（`/slides/<name>/`）に追従する
- Slidev デフォルトの favicon（jsdelivr の CDN）はヘッドマターの `favicon: ''` で無効化している（テンプレートに含まれるので新規デッキも同様）
- ランディングページ（`scripts/gen-index.mjs` が生成する `dist/index.html`）にも同じ `<link>` を出力し、`slides/public/` のアイコンを `dist/` 直下へコピーする

## カスタムレイアウト・コンポーネント

- `slides/layouts/*.vue` は自動で layout として使える
- `slides/components/*.vue` は Markdown 内でそのまま呼べる
- `slides/style.css` / `slides/uno.config.ts` でグローバルスタイルを拡張
