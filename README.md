# slides

Marp 製スライド集。

## 初回セットアップ

```bash
mise install
npm install
```

## 新しいスライドを作る

```bash
mise run new <name>
npm run dev
```

## 記法

### これまで通りMarkdown で書けるもの

見出し / リスト / テーブル / コードフェンス / blockquote / リンク / 画像

### Marp 固有のもの

- スライド区切りは `---`
- フロントマターは `marp: true` から始める（`theme` / `paginate` / `size` / `footer` / `title` / `description`）
- 1 枚だけに効かせる指定は `<!-- _class: cover|section|profile -->`（`_` 始まりがそのスライド限定）
- 画像サイズは `![w:340](url)` / `![h:200](url)`

## 画像・アセットを追加する

`slides/public/` に置き、Markdown からは `./public/foo.svg` の相対パスで参照する。

## PDF出力

```bash
npm run export -- slides/<name>.md --output dist/<name>.pdf
```
