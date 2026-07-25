---
paths:
  - "slides/**/*.md"
---

# フロントマター規約

## ヘッドマター（ファイル冒頭）

Marp の YAML frontmatter は `marp: true` から始める。デッキ全体に効く設定と、`title` / `description` などのメタデータをまとめて書く。

```yaml
---
marp: true
theme: dc
paginate: true
size: 16:9
footer: '#goconnect'
title: Javaなしで安全に使えるPlantUMLビューア「pumlv」
description: PlantUMLのビューアを作った話です。
date: 2026-07-29
---
```

- `theme: dc` は `slides/theme.css` の `/* @theme dc */` ヘッダに対応。テーマ CSS は `.marprc.yml` 側で `theme: slides/theme.css` として読み込ませているので、ここは登録名だけ書けばよい
- `paginate: true` を全体で ON にし、`section.cover::after { display: none }` などのテーマ CSS 側で cover / section divider の pagination を消している
- `size: 16:9` は Marp の canvas。実サイズ（1920×1080）は `slides/theme.css` の `section { width: 1920px; height: 1080px }` で指定
- `footer` は全スライド左下に出すイベントのハッシュタグ。cover / section divider では `section.cover > footer { display: none }` などのテーマ CSS 側で消している
- `title` / `description` は Marp が `<head>` の meta タグに展開する（`og:title` / `og:description` にもなる）
- `date: YYYY-MM-DD` は発表日の記録。Marp も CI も読まない。サイトトップの一覧（`site/index.html`）に `<li>` を足すときに、日付をここから引く
- SNS カード用の `og:image` と `og:url` は CI（`.github/actions/build-decks/action.yml`）で `--og-image` / `--url` を渡して埋め込むので、frontmatter には書かない

## per-slide ディレクティブ

Marp のスライド区切りは `---`。個別スライドのレイアウトは **HTML コメントディレクティブ** で書く。

`_class` の**アンダースコア接頭**はそのスライドだけに効く指定。アンダースコア無しの `<!-- class: xxx -->` は「その後の全スライド」に効くので使わない。

使えるクラスは `slides/theme.css` にある次の 5 つ。ここに無いレイアウトが要るときは theme.css に `section.<name>` を足し、この表にも追記する。

| クラス | 用途 | スライドの中身 |
|---|---|---|
| （無し） | 通常の content スライド | `##` 見出しから始める |
| `cover` | 表紙 / 締め | `#` タイトル + イベント名・名前の p |
| `section` | 章の切れ目 | `SECTION 0X` を p、`# 見出し` を h1 |
| `profile` | 自己紹介 | `##` + 画像 + facts テーブル |
| `compare` | 図を 2 枚横に並べる | `##` + 「画像 + キャプション」の段落 ×2 + 結論の 1 行 |
| `logo` | 本文の右余白にロゴを置く | `##` + `![w:220](...)` + 本文 |

`profile` の画像は**幅を指定しない**（`![](./public/images/icon.jpg)`）。テーマ CSS が `width: 100%` でカラム幅いっぱいに出す。

`compare` は画像を含む段落を 1 カラム分として扱い、画像を含まない段落だけを全幅に落とす。結論の 1 行は画像と同じ段落に混ぜない。

```md
<!-- _class: compare -->

## 見出し

![](./public/a.svg)
**A** — 説明

![](./public/b.svg)
**B** — 説明

結論の1行
```
