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

## ブログに同期する

`rin2yh/blog` にはスライドの実体を置かず、**デッキ一覧のメタデータだけ**を渡す。スライド本体は GitHub Pages に置いたままで、ブログ側はその JSON を読んで一覧を描く。

CD が成功すると `Sync to blog` ワークフローが走り、`slides/*.md` のヘッドマターから次の JSON を作ってブログに PR を出す。

```json
[
  {
    "slug": "pumlv-go",
    "title": "Javaなしで安全に使えるPlantUMLビューア「pumlv」",
    "description": "PlantUMLのビューアを作った話です。",
    "date": "2026-07-29",
    "url": "https://rin2yh.github.io/slides/pumlv-go/",
    "ogImage": "https://rin2yh.github.io/slides/pumlv-go/og-image.png"
  }
]
```

手元で中身を見るなら `mise run manifest`。`title` / `description` / `date` が欠けているデッキがあるとそこで落ちる。

同期先ブランチ `slides-sync` は毎回上書きするので、PR が開いたままでも常に最新の一覧に差し替わる。手で編集しても次の同期で消える。

置き場所（`data/slides.json`）とリポジトリ名は `.github/workflows/sync-blog.yml` 冒頭の `env` にまとめてある。ブログ側の構成を変えたらそこだけ直す。

### 必要なシークレット

`BLOG_SYNC_TOKEN` — `rin2yh/blog` に対して **Contents: write** と **Pull requests: write** を持つトークン（fine-grained PAT か GitHub App のトークン）。このリポジトリの Actions secrets に入れる。

## PDF出力

```bash
mise run export -- slides/<name>.md --output dist/<name>.pdf
```
