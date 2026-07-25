---
paths:
  - "slides/**/*.md"
---

# テーブル記述規約

- ベースは Markdown 表。素直に書ける限り HTML `<table>` にしない
- 列配置は `|:-:|`（center）/ `|--:|`（right）で指定
- セル内でパイプを書くには `\|`（markdown-it 標準のエスケープ）

## 記法

```md
| 単位 | 分かること | コスト |
|---|---|:-:|
| ブロック単位（Go cover） | ブロックが実行されたか | 軽い |
| 式・条件単位 | branch / condition | 重い |
```

## セル内で使える記法

Marp（marp-core）は markdown-it のインラインパーサでセル内容を処理する。**通常の Markdown が全部使える**（`**bold**` / `` `code` `` / リンク `[text](url)` / autolink `<https://…>`）。生 HTML（`<br>` 等）も `.marprc.yml` の `html: true` でそのまま通る。

## Markdown で書けないもの

- `<tfoot>` や `colspan` は Markdown 表では表現できない → その表だけ raw `<table>` を書く
- raw `<table>` を書く場合も **inline style は書かない**。必要なら共通 CSS（`slides/theme.css`）にクラスを足す
- 行ごとの色分けのような、素の Markdown で表現できない装飾はやらない
