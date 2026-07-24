---
paths:
  - "slides/**/*.md"
  - "!slides/node_modules/**"
---

# 見出し規約

見出しレベルは「見た目のロール」と 1 対 1 で対応させる。文書構造上の階層のためではなく、装飾スタイルを選ぶ手段として使う。

- `#` → **section divider スライド**（章の切れ目）
  - `<!-- _class: section -->` を併記して初めて Marp の section スタイル（巨大 h1 + SECTION 番号）が効く
  - 章切り替えのみで使う。**content スライドで `#` を使わない**
  - 番号は自動採番されない。`SECTION 01` のように p として自分で書く：
    ```md
    <!-- _class: section -->

    SECTION 01

    # 導入
    ```
- `##` → **content 見出し**
  - h2 58px、下マージン 36px
  - content スライドの見出しはすべてこれ
- `###` → **セクションタグ**（モノスペースの小ラベル）
  - mono / accent color / 24px。shell や表の直前に置く小見出しに使う
  - 例: 「statement 全体で取れる」のような機能ラベル
