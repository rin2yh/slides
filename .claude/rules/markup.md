---
paths:
  - "slides/**/*.md"
---

# 記法

素の Markdown だけで書く。ここに書くのは `slides/theme.css` を読まないと分からないことだけ。

## 見出し

- `#` → cover / section divider のタイトル専用。**content スライドで使わない**
- `##` → content 見出し。content スライドの見出しはすべてこれ

section divider の番号は自動採番されない。`SECTION 01` のように p で書く。

## 見た目が想像と違うもの

- `1.` の番号付きリストは **44px** で番号が青の mono になる（目次向けのスタイル）。`-` の箇条書きは 32px
- `**bold**` に**色は付かない**（周囲の文字色のまま太くなるだけ）。青は強調ではなく構造が持っていて、出るのは 目次の番号 / リンク / `SECTION 0X` / blockquote の左罫線 だけ
- コードブロックは横が `overflow: auto`。**はみ出した行はスライドに出ない**ので、長い行は貼る範囲を削る

## 書かないもの

- **HTML タグ** — 許容するのは `<br>`（見出しの改行位置を決める用）だけ。`<!-- _class: ... -->` は Marp のディレクティブ、`<https://…>` は Markdown の autolink なので、どちらも対象外
- **`slides/theme.css` への追記**、inline style、`<!-- _color: red -->` 系の装飾ディレクティブ — 既存のクラスで組めないときは中身の方を分割・整理する
- **画像の絶対パス** `/foo.svg` — GitHub Pages ではデッキが `/repo/deck/` に置かれるので壊れる。`./public/<deck>/foo.svg`（全デッキ共通のものだけ `./public/shared/foo.svg`）と書く
- **他のデッキのディレクトリの参照** `./public/other-deck/foo.svg` — CI は各デッキに `shared/` と自分の `<deck>/` しかコピーしないので、本番で 404 になる。共通で使うなら `slides/public/shared/` に移してから参照する
