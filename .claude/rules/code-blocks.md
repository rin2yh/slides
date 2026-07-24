---
paths:
  - "slides/**/*.md"
  - "!slides/node_modules/**"
---

# コードブロック規約

## 通常のコード（言語ハイライト）

素の ``` ```lang ``` フェンス。shiki が色付けする。

````md
```go
func Abs(n int) int {
    if n < 0 {
        return -n
    }
    return n
}
```
````

## 行の diff / 強調

shiki notation transformer（`slides/setup/shiki.ts` で登録済み）を使う。**行末コメント**に書く:

````md
```go
func Abs(n int) int {
    GoCover.Count[0] = 0 // [!code ++]
    if n < 0 { // [!code highlight]
        GoCover.Count[1] = 0 // [!code --]
        return -n // [!code --]
    } // [!code --]
    return n
}
```
````

- `// [!code ++]` → アクセント色 + 濃い bg（実行 / 挿入）
- `// [!code --]` → 灰色、bg なし（通らなかった / 削除）
- `// [!code highlight]` → 薄い bg（文脈として注目）
- `// [!code focus]` → focus 対象以外を薄くしてフォーカス強調（`transformerNotationFocus` も登録済み）

notation コメント自体は出力から取り除かれる（見た目には残らない）。

## 端末出力

``` ```shell ``` フェンス（`slides/setup/transformers.ts` の codeblock transformer が `<pre class="dc-shell">` に書き換える）:

````md
```shell
$ go test -cover
coverage: 80.0% {badge}of statements{/badge}
```
````

- `{badge}text{/badge}` → アクセントソフト背景の帯
- `{mark}text{/mark}` → アクセント色ボールド
- `$` プロンプトはそのまま文字として書く（特別扱いはしない）

トリガーする言語識別子: `shell` / `sh` / `console` / `terminal`。

## リスト（参考）

- `1. 導入` → **目次スタイル**（44px、番号は mono / accent）。目次スライドは素の Markdown ol で書く（自前コンポーネントを作らない）
- `- item` → 通常の bullet（32px）
