# slides

[Slidev](https://sli.dev/) で作成したスライド集です。

## セットアップ

```bash
mise install
npm install
```

## コマンド

`slidev` にスライドのパスを渡すだけ（`npm run` 経由でもよい）。

| コマンド | 説明 |
|---|---|
| `npm run dev -- slides/<name>.md` | プレビュー起動（ブラウザを自動で開く） |
| `npm run build -- slides/<name>.md` | 静的サイトを `dist/` に出力 |
| `npm run export -- slides/<name>.md` | PDF を出力（`playwright-chromium` が必要） |

例:

```bash
npm run dev -- slides/go-coverage.md
npm run build -- slides/go-coverage.md
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

テンプレートを `slides/` 直下にコピーして編集する。

```bash
cp slides/templates/template.md slides/<name>.md
npm run dev -- slides/<name>.md
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

## カスタムレイアウト・コンポーネント

- `slides/layouts/*.vue` は自動で layout として使える
- `slides/components/*.vue` は Markdown 内でそのまま呼べる
- `slides/style.css` / `slides/uno.config.ts` でグローバルスタイルを拡張
