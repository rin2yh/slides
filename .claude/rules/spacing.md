---
paths:
  - "slides/**/*.md"
  - "!slides/node_modules/**"
---

# 余白（margin）規約

- インライン `style="margin-top:X"` / `style="margin-bottom:X"` を書かない
  - 理由: 各要素は自分に必要な default margin を持ち、Marp の `section` が flex column なので、隣接要素の型でスペースは決まる。書き手が per-slide で調整しなくてよい
- ズレたら **CSS 側の共通ルール**（`slides/theme.css`）を直す
  - 該当要素の `margin` を変える
  - 隣接ペア固有の調整は `A + B` セレクタで書く（例: `section h2 + p { margin-top: 0 }`）
- 「per-slide でだけ効かせたい」余白調整は避ける
  - 理由: 同じ形が別スライドで出たときに再現できない。共通ルールにできる形を探す
