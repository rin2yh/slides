# slides

Marp 製スライド集。

## 初回セットアップ

```bash
mise install
npm install
```

## 新しいスライドを書く

`slides/templates/template.md` から `slides/<name>.md` を作り、dev server を起動する。プレビューは `http://localhost:8080/<name>`。

```bash
mise run new <name>
npm run dev
```

## 画像・アセットを足す

`slides/public/` に置き、Markdown からは `./public/foo.svg` の相対パスで参照する。dev / prod 両方でそのまま解決する。絶対パス (`/foo.svg`) は GitHub Pages のサブパス配信で壊れるので使わない。

## PDF に書き出す

```bash
npm run export -- slides/<name>.md --output dist/<name>.pdf
```
