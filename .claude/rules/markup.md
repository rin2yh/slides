---
paths:
  - "slides/**/*.md"
---

# 記法

素の Markdown だけで書く。ここに書くのは `slides/theme.css` を読まないと分からないことだけ。

## 見出しはロールで選ぶ

- `#` → cover / section divider のタイトル専用。**content スライドで使わない**
- `##` → content 見出し。content スライドの見出しはすべてこれ
- `###` → mono / 青の小ラベル。shell や表の直前に置く

section divider の番号は自動採番されない。`SECTION 01` のように p で書く。

## 見た目が想像と違うもの

- `1.` の番号付きリストは **44px の目次スタイル**になる。目次以外の箇条書きは `-` を使う
- `**bold**` に**色は付かない**（周囲の文字色のまま太くなるだけ）。青は強調ではなく構造が持っていて、出るのは `###` / 目次の番号 / リンク / `SECTION 0X` / blockquote の左罫線 だけ
- コードブロックは横が `overflow: auto`。**はみ出した行はスライドに出ない**ので、長い行は貼る範囲を削る
- 行ハイライトや diff アノテーションの仕組みは無い。強調したい行はコード内の行コメントで書く

## 書かないもの

- **HTML タグ** — `<br>` `<small>` `<table>` `<style>` すべて。素の Markdown で表現できない構成にしない（改行位置を調整したくなったら、収まる長さに書き直す）。`<!-- _class: ... -->` は Marp のディレクティブ、`<https://…>` は Markdown の autolink なので、どちらも対象外
- **`slides/theme.css` への追記**、inline style、`<!-- _color: red -->` 系の装飾ディレクティブ — 既存のクラスで組めないときは中身の方を分割・整理する
- **画像の絶対パス** `/foo.svg` — GitHub Pages ではデッキが `/repo/deck/` に置かれるので壊れる。`./public/foo.svg` と書く（`slides/public/*` は CI が `dist/<deck>/public/*` にコピーする）
