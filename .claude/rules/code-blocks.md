---
paths:
  - "slides/**/*.md"
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

対応言語は highlight.js の標準セット（`go` / `shell` / `bash` / `ts` / `js` / `python` など）。トークンの色は `slides/theme.css` の `.hljs-*` で絞ってあるので、そこに無いトークンは本文色のまま出る。

## コード内の注釈

行ハイライトや diff アノテーションの仕組みは無い。「この行が挿入された」「この行が実行された」のような説明は、**コード内の行コメント**で書く：

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

## 収まらないとき

`pre` は 30px / `max-width: 1400px` で、横は `overflow: auto` なので**はみ出した部分はスライド上で見えない**。長い行はコード側で折り返すか、貼る範囲を削る。font-size を inline style で縮めない（→ `.claude/rules/styling.md`）。
