---
paths:
  - "slides/**/*.md"
---

# デッキの設定

## ヘッドマター

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

- `theme: dc` は `slides/theme.css` の `/* @theme dc */`。読み込みは `.marprc.yml` 側でやっているので登録名だけ書く
- `size: 16:9` は Marp の canvas 指定。実サイズ 1920×1080 は theme.css 側で持つ
- `footer` はイベントのハッシュタグ。cover / section divider では theme.css が消す
- `date` は Marp も CI も読まない。`site/index.html` の一覧に行を足すときに引く発表日
- `og:image` / `og:url` は CI（`.github/actions/build-decks/action.yml`）が渡すので、ここには書かない

## _class（レイアウト）

`_` 始まりはそのスライドだけに効く。`<!-- class: xxx -->` は以降の全スライドに効いてしまうので使わない。

使えるのは theme.css にある次の 5 つだけ。**足りなくても新しいクラスを作らない。**

| クラス | 用途 | スライドの中身 |
|---|---|---|
| （無し） | content | `##` から始める |
| `cover` | 表紙 / 締め | `#` タイトル + イベント名・名前 |
| `section` | 章の切れ目 | `SECTION 0X` の p + `#` 見出し |
| `profile` | 自己紹介 | `##` + 画像 + テーブル |
| `compare` | 図を 2 枚横に並べる | `##` +「画像 + キャプション」の段落 ×2 + 結論の 1 行 |
| `logo` | 右の余白にロゴ | `##` + `![w:220](...)` + 本文 |

- `profile` / `compare` の画像は**幅を指定しない**。theme.css が幅を持っている
- `compare` は画像を含む段落を 1 カラム分として扱い、画像の無い段落だけ全幅に落とす。結論の 1 行を画像と同じ段落に混ぜない
