---
paths:
  - "slides/**/*.md"
  - "!slides/node_modules/**"
---

# フロントマター規約

## ヘッドマター（ファイル冒頭）

- 全スライド共通の値は `defaults:` に置く（例: `hashtag`）
  - 理由: 各スライドで同じ値を書き直さないため。変更時も 1 箇所で済む
- `canvasWidth: 1920` / `aspectRatio: 16/9` はデザインのキャンバスサイズ。触らない
- フォントは `Noto Sans JP` と `JetBrains Mono` の 2 系統。weight は `'400,500,700,900'`

## per-slide frontmatter

- content スライド（`##` で始まる）→ **何も書かない**
  - 理由: Slidev のデフォルトレイアウトが `default` なので明示不要。書き手が触るのはカスタム props が要る時だけ
- section divider（`#` で始まる）→ `no: N` と `title:` を書く
  - 理由: `layout: section` は preparser (`slides/setup/preparser.ts`) が `#` を検出して自動で付ける。`no:` は SECTION 番号、`title:` は Slidev の overview 用（`#` 見出し本文からは overview がタイトル抽出しない）
- cover / thanks → `layout: cover` に `event` / `speaker` / `handle` / `handleUrl` を書く
- profile → `layout: profile` に `title` / `image` / `facts` を書く（overview のため `title:` 必須）
- `layout: default` / `hashtag: xxx` を per-slide で明示的に書くのは **やらない**（Slidev のデフォルトと `defaults:` に任せる）

## title の扱い

- default layout のスライドでは `title:` は書かなくていい（Markdown の `##` から自動抽出される）
- profile など「slot 越しに h2 が入るカスタムレイアウト」は `title:` を明示する
  - 理由: Slidev の overview はレイアウトのスロット構造からはタイトルを抽出できず、`undefined` 表示になる
