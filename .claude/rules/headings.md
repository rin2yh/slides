---
paths:
  - "slides/**/*.md"
  - "!slides/node_modules/**"
---

# 見出し規約

見出しレベルは「見た目のロール」と 1 対 1 で対応させる。文書構造上の階層のためではなく、装飾スタイルを選ぶ手段として使う。

- `#` → **section divider スライド**（章の切れ目）
  - preparser で自動的に `layout: section` になる（`SECTION 0X` + 巨大 h1）
  - 使うのは章切り替えのみ。**content スライドで `#` を使わない**
  - 理由: Slidev デフォルトの h1 は content 用スタイルではないので、そのままだと余白と大きさがデザインとズレる
- `##` → **content 見出し**
  - h2 58px、下マージン 36px
  - content スライドの見出しはすべてこれ
- `###` → **セクションタグ**（モノスペースの小ラベル）
  - mono / accent color / 24px。shell や表の直前に置く小見出しに使う
  - 例: 「statement 全体で取れる」のような機能ラベル
