---
paths:
  - "slides/**/*.md"
  - "!slides/node_modules/**"
---

# テーブル記述規約

- ベースは Markdown 表。素直に書ける限り HTML `<table>` にしない
- 行アクセントは **最後のセル内の末尾に `{.class}`** を書く

## 記法

```md
| 単位 | 分かること | コスト | 仕組み |
|---|---|---|:-:|
| ブロック単位（Go cover） | ブロックが実行されたか | 軽い | ブロック先頭にカウンタ1つ {.accent} |
| 式・条件単位 | branch / condition | 重い | `&&` / `\|\|` を展開 |
```

- **行の最後のセルの末尾に `{.className}`** を書くと、その `<tr>` にクラスが付く（`slides/vite.config.ts` の markdown-it プラグインが行トークンへ付与）
- 使えるクラス: `.accent`（強調行）/ `.dim`（ミュート行）/ `.ok`（実行済みマーカ行）/ `.total`（合計行、上罫線 + 太字）
- `{.class}` マーカーはレンダリング時に取り除かれる（セルの表示内容には残らない）
- 列配置は `|:-:|`（center）/ `|--:|`（right）で。markdown-it がネイティブに `text-align` を付与する
- セル内でパイプを書くには `\|`（markdown-it 標準のエスケープ）

## セル内で使える記法

セル内容は markdown-it（+ MDC）が普通にインラインパースするので、**通常の Markdown が全部使える**（`**bold**` / `` `code` `` / リンク `[text](url)` / autolink `<https://…>` / MDC 記法など）。`{.class}` を付けた行のセルも同じ。生 HTML（`<br>` 等）もそのまま通る。

## Markdown で書けないもの

- `<tfoot>` や `colspan` は Markdown 表では表現できない → その表だけ raw `<table>` を書く
- raw `<table>` を書く場合も **inline style は書かない**。必要なら共通 CSS（`slides/style.css`）にクラスを足す
