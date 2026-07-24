# slides

Marp 製スライド集。

## 初回セットアップ

```bash
mise install
```

marp-cli は mise（aqua backend）でスタンドアロンバイナリを取得するため、Node.js は不要。
PDF / 画像出力を使う場合はシステムに Chrome / Chromium などのブラウザが必要。

## 新しいスライドを作る

```bash
mise run new <name>
mise run dev
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
mise run export -- slides/<name>.md --output dist/<name>.pdf
```
