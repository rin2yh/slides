---
paths:
  - "slides/**/*.md"
  - "!slides/node_modules/**"
---

# コードブロック規約

## 通常のコード（言語ハイライト）

素の ``` ```lang ``` フェンス。Marp（marp-core）が highlight.js でシンタックスハイライトする。

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

対応言語は highlight.js の標準セット（`go` / `shell` / `bash` / `ts` / `js` / `python` など）。

## コード内の注釈

diff アノテーションや行ハイライト（Slidev で使っていた `[!code ++]` `[!code --]` `[!code highlight]`）は**使わない**方針。「この行が挿入された」「この行が実行された」のような説明は、**コード内の行コメント**で書く：

````md
```go
func Abs(n int) int {
    GoCover.Count[0] = 1   // 通った
    if n < 0 {
        GoCover.Count[1] = 0   // 通らなかった
        return -n
    }
    GoCover.Count[2] = 1   // 通った
    return n
}
```
````

## 端末出力

素の ``` ```shell ``` フェンス。プロンプトも文字として素直に書く：

````md
```shell
$ go test -cover
coverage: 80.0% of statements
```
````

端末パネル用の Vue コンポーネント（`<Code :lines>` / `{badge}` / `{mark}`）は廃止。強調が要る文字はそのまま書き、装飾はしない。

## リスト（参考）

- `1. 導入` → **目次スタイル**（44px、番号は mono / accent）
- `- item` → 通常の bullet（32px）
