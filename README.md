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

サイトのトップ（`https://<owner>.github.io/<repo>/`）はデッキ一覧ページ。実体は `site/index.html` で、CI はこれを `dist/` にコピーするだけ。

**スライドを足したら `<ul>` に `<li>` を 1 行足す。** 日付の新しい順に並べる。

```html
<li><a href="./go-coverage/">なぜGoのカバレッジはstmtとfnなのか</a><time datetime="2026-07-03">2026-07-03</time></li>
```

リンク先は `dist/<name>/` を指すので、手元でリンク先まで見るならデッキ側のビルドも必要。

## 画像・アセットを追加する

**デッキごとにディレクトリを切る。** `slides/<name>.md` が使う画像は `slides/public/<name>/` に置き、Markdown からは `./public/<name>/foo.svg` の相対パスで参照する。

```
slides/
  pumlv-go.md                    ← デッキ
  public/
    shared/                      ← 全デッキ共通（favicon、プロフィール画像）
    pumlv-go/                    ← pumlv-go.md 専用の画像
  diagrams/
    pumlv-go/                    ← その SVG のソース（.puml / .mmd）
```

`shared/` に置くのは **2 つ以上のデッキが実際に使うもの**だけ。1 つのデッキしか使わないなら、汎用的に見えてもそのデッキのディレクトリに置く（使うデッキが増えたときに移せばいい）。

CI は各デッキに `shared/` と `<name>/` だけをコピーするので、デッキが増えても他のデッキの画像を巻き込まない。

CD はデプロイの手前で `dist/` を [lychee](https://github.com/lycheeverse/lychee) にかける。参照した画像が同梱されていなければそこで落ちて、公開までいかない（一覧ページのリンク切れも同時に見る）。手元では `mise run check` で同じ検査ができる。

## PDF出力

```bash
mise run export -- slides/<name>.md --output dist/<name>.pdf
```

## OGP画像を作り直す

指定したデッキの先頭スライドからOGP画像を生成し、公開時と同じ `dist/<name>/og-image.png` に配置する。

```bash
mise run ogp <name>
```

例: `mise run ogp pumlv-go`。

GitHub Actions で実行する場合は、Actions の「Regenerate OGP」から「Run workflow」を選び、デッキ名を入力する。生成画像は実行結果の artifact `ogp-<name>` からダウンロードできる。このワークフローは画像の生成と artifact の保存までを行い、GitHub Pages への反映は行わない。

`dc` と `3shake` のテーマは Noto Sans JP を Google Fonts から読み込む。OGP生成時にフォントを取得できるよう、生成環境ではネットワーク接続が必要である。
