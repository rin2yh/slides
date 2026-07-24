# slides

[Marp](https://marp.app/) で作成したスライド集です。

## セットアップ

```bash
mise install
npm install
```

## コマンド

`.marprc.yml` に共通設定（テーマパス等）が入っているので、`npm run` 経由で叩くだけ。

| コマンド | 説明 |
|---|---|
| `npm run dev` | プレビューサーバ起動（`slides/` を配信、`http://localhost:8080`） |
| `npm run build -- slides/<name>.md --output dist/<name>/index.html` | 静的 HTML を出力 |
| `npm run export -- slides/<name>.md --output dist/<name>.pdf` | PDF を出力 |

例:

```bash
npm run dev
npm run build -- slides/go-coverage.md --output dist/go-coverage/index.html
```

ローカルで完全にデプロイと同じ形にしたいときは、ビルド後に共通アセットもコピー：

```bash
cp -r slides/public dist/go-coverage/public
```

## ディレクトリ構成

```
slides/
├── slides/
│   ├── go-coverage.md      # 発表資料の例
│   ├── theme.css           # Marp テーマ（/* @theme dc */）
│   ├── public/             # 共通アセット（画像・SVG 等）
│   │   ├── favicon.ico
│   │   ├── pipeline.svg
│   │   └── images/
│   └── templates/
│       └── template.md     # 新規スライドの雛形（デプロイ対象外）
├── .marprc.yml             # Marp CLI 共通設定
├── package.json
└── mise.toml
```

`slides/*.md`（直下のみ）が GitHub Pages のビルド対象。`templates/` はサブディレクトリなので対象外。ランディングページは無いので、`https://<user>.github.io/<repo>/<deck>/` で直接開く。

## 新しいスライドを作る

テンプレートから `slides/<name>.md` を作る mise task。

```bash
mise run new <name>
npm run dev
```

## 画像・アセットの参照

`slides/public/` に置き、Markdown からは `./public/foo.svg` の相対パスで参照する。開発時は Marp サーバの root が `slides/` なのでそのまま解決し、ビルド後は CI が `slides/public/` を `dist/<deck>/public/` にコピーするので同じパスが通る。パス指定のルールは `.claude/rules/authoring-anti-patterns.md` を参照。

## OGP画像

CI が各デッキの 1 枚目を PNG に書き出して `dist/<deck>/og-image.png` を生成し、HTML の `<meta property="og:image">` にそのフル URL を自動で埋め込む（`.github/actions/build-deck/action.yml` の `--og-image` フラグ）。`og:image` があると Twitter カードは自動で `summary_large_image` に昇格するので、追加設定は不要。

## デザインシステム

装飾は `slides/theme.css` に集約する。個別スライドで `<style>` タグや inline style を書かない。詳細は `.claude/rules/` を参照。
