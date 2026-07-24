---
paths:
  - "slides/**/*.md"
  - "!slides/node_modules/**"
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
footer: '#asakusago'
title: なぜGoのカバレッジはstmtとfnなのか
description: >-
  Asakusa.go #8のスライドです。
  ...
---
```

- `theme: dc` は `slides/theme.css` の `/* @theme dc */` ヘッダに対応。テーマ CSS は `.marprc.yml` 側で `theme: slides/theme.css` として読み込ませているので、ここは登録名だけ書けばよい
- `paginate: true` を全体で ON にし、`section.cover::after { display: none }` などのテーマ CSS 側で cover / section divider の pagination を消している
- `size: 16:9` は Marp の canvas。実サイズ（1920×1080）は `slides/theme.css` の `section { width: 1920px; height: 1080px }` で指定
- `footer: '#asakusago'` は全スライド左下にハッシュタグ表示。cover / section divider では `section.cover > footer { display: none }` などのテーマ CSS 側で消している
- `title` / `description` は Marp が `<head>` の meta タグに展開する（`og:title` / `og:description` にもなる）
- SNS カード用の `og:image` と `og:url` は CI（`.github/actions/build-deck/action.yml`）で `--og-image` / `--url` を渡して埋め込むので、frontmatter には書かない

## per-slide ディレクティブ

Marp のスライド区切りは `---`。個別スライドの装飾は **HTML コメントディレクティブ** で書く。

- 通常の content スライド → **何も書かない**（`##` 見出しから始める）
- cover / thanks スライド → `<!-- _class: cover -->` の 1 行のみ（pagination / footer はテーマ CSS 側で消える）
- section divider → `<!-- _class: section -->`。中身は `SECTION 0X` を p、`# 見出し` を h1 で書く
- profile → `<!-- _class: profile -->`。中身は `##` + 画像 + facts テーブル

`_class` の**アンダースコア接頭**はそのスライドだけに効く指定。アンダースコア無しの `<!-- class: xxx -->` は「その後の全スライド」に効くので使わない。

`<!-- _color: red -->` のような一発物 Marpit ディレクティブで per-slide 装飾を殴らない話は `.claude/rules/authoring-anti-patterns.md` に集約している。
