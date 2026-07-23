---
paths:
  - "slides/**/*.md"
  - "!slides/node_modules/**"
---

# テーブル記述規約

- ベースは Markdown 表。素直に書ける限り HTML `<table>` にしない
- 行アクセントは preparser の属性記法で書く

## 記法

```md
| 単位 | 分かること | コスト | 仕組み |
|---|---|---|:-:|
| ブロック単位（Go cover） | ブロックが実行されたか | 軽い | ブロック先頭にカウンタ1つ | {.accent}
| 式・条件単位 | branch / condition | 重い | `&&` / `\|\|` を展開 |
```

- 行末に `| {.className}` を付けると、preparser が **その表全体を HTML に書き換え** てクラスを付ける
- 使えるクラス: `.accent`（強調行）/ `.dim`（ミュート行）/ `.ok`（実行済みマーカ行）/ `.total`（合計行、上罫線 + 太字）
- 列配置は `|:-:|`（center）/ `|--:|`（right）で。preparser が `text-align` を td/th に付与する
- セル内でパイプを書くには `\|`（preparser は `\|` エスケープと `` ` `` code span 内のパイプを尊重）

## `{.class}` を付けた表のセル内で使える記法

preparser が表全体を HTML に書き出すとき、セル内容は独自の軽量パーサ (`renderCellInline`) を通る。**`**bold**` と `` `code` `` しか変換されない**。以下はセル内で効かない:

- Markdown リンク `[text](url)` / autolink `<https://…>`
- MDC 記法 / 他の Markdown インライン記法
- `<br>` を書きたい場合は生のまま入れれば通る（HTML block として書き出される）

素の Markdown 表（`{.class}` なし）ならセル内容は markdown-it が処理するので通常の Markdown が全部使える。**リンクやリッチな記法をセルに入れたい表では、代わりに raw `<table>` を書く**（inline style は書かず、必要なら CSS クラスを足す）。

## Markdown で書けないもの

- `<tfoot>` や `colspan` は Markdown 表では表現できない → その表だけ raw `<table>` を書く
- raw `<table>` を書く場合も **inline style は書かない**。必要なら共通 CSS（`slides/style.css`）にクラスを足す
