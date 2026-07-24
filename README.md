# slides

[Marp](https://marp.app/) で作成したスライド集です。

## セットアップ

```bash
mise install
npm install
```

## コマンド

npm scripts は `package.json` を見る。`dev` はプレビューサーバを `http://localhost:8080` で起動し、`build` / `export` は追加引数でデッキと出力先を渡す：

```bash
npm run build -- slides/go-coverage.md --output dist/go-coverage/index.html
npm run export -- slides/go-coverage.md --output dist/go-coverage.pdf
```

ローカルで完全にデプロイと同じ形にしたいときは、ビルド後に共通アセットも `cp -r slides/public dist/go-coverage/public`。

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
