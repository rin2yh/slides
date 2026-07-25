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

## 一覧ページ

サイトのトップ（`https://<owner>.github.io/<repo>/`）はデッキ一覧ページ。スライドを追加すれば一覧にも自動で載る。

```bash
mise run index   # dist/index.html を生成（CI も同じタスクを叩く）
```

- ページの外枠は `site/index.html`。**見た目を変えたいときはこのファイルを直す**
- `mise run index` が、その中の `@DECKS@` の行をデッキ 1 件 1 行の `<li>` に差し替える。拾うのは各 `slides/*.md` の `title` と `date` の 2 行だけ
- 並びは `date`（`YYYY-MM-DD`）の新しい順。`date` が無いデッキは末尾に落ちる
- 背景色・文字色・フォントはスライド（`slides/theme.css`）と同じ値に揃えてある。レイアウトは合わせていない

一覧から各デッキへのリンクは `dist/<name>/` を指すので、リンク先まで見るならデッキ側のビルドも必要。

## 画像・アセットを追加する

`slides/public/` に置き、Markdown からは `./public/foo.svg` の相対パスで参照する。

## PDF出力

```bash
mise run export -- slides/<name>.md --output dist/<name>.pdf
```
