---
paths:
  - "slides/**/*.md"
---

# 装飾・レイアウト規約

**装飾は `slides/theme.css` に集約する。Markdown 側には書かない。**

per-slide の一発物で見た目を直すと、同じ形が別スライドで出たときに再現できず、デッキ全体でズレていく。ズレを見つけたら Markdown ではなく CSS を直す。

## Markdown に書かないもの

- **`<style>` ブロック** — 装飾は theme.css に置く
- **inline style（色 / font-size / margin）** — 必要な見た目はクラスとして theme.css に足し、デザイントークン（`var(--dc-accent)` 等）を使う
- **`<!-- _color: red -->` `<!-- _backgroundColor: #fff -->` のような Marpit の装飾ディレクティブ** — テーマ CSS のクラス（`<!-- _class: cover -->` など）を通して当てる。使えるクラスは `.claude/rules/frontmatter.md` の表にある

## 余白（margin）

- インライン `style="margin-top:X"` / `style="margin-bottom:X"` を書かない
  - 各要素は自分に必要な default margin を持ち、`section` が flex column なので、隣接要素の型でスペースは決まる。書き手が per-slide で調整しなくてよい
- ズレたら `slides/theme.css` の共通ルールを直す
  - 該当要素の `margin` を変える
  - 隣接ペア固有の調整は `A + B` セレクタで書く（例: `section h2 + p { margin-top: 0 }`）

## 新しいレイアウトが要るとき

theme.css に `section.<name>` を足し、`.claude/rules/frontmatter.md` の `_class` 一覧にも追記する。CSS 側には「どんな Markdown 構造を前提にしているか」をコメントで残す（`section.compare` / `section.logo` が例）。

## 画像

- **`/foo.svg` の絶対パスで参照しない** — GitHub Pages ではデッキが `/repo/deck/` にデプロイされるので、絶対パスはサイトルートを見に行って壊れる
- `./public/foo.svg` のように**デッキ HTML からの相対パス**で書く。`slides/public/*` は CI で `dist/<deck>/public/*` にコピーされる
- サイズは Marp の記法（`![w:1400](...)`）で指定する。テーマ CSS が幅を持っているレイアウト（`profile` / `compare`）では書かない

## 生 HTML

`.marprc.yml` の `html: true` で生 HTML は通るが、使うのは Markdown で表現できないものだけ：`<br>`（見出しの改行位置）、`<small>`（注釈）、`colspan` が要る表の `<table>`。
