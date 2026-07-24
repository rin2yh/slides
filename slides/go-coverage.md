---
theme: default
title: なぜGoのカバレッジはstmtとfnなのか
info: 'Asakusa.go #8 発表資料'
highlighter: shiki
lineNumbers: false
favicon: /favicon.ico
drawings:
  persist: false
transition: none
mdc: true
canvasWidth: 1920
aspectRatio: 16/9
fonts:
  sans: Noto Sans JP
  mono: JetBrains Mono
  weights: '400,500,700,900'
seoMeta:
  ogTitle: なぜGoのカバレッジはstmtとfnなのか
  ogDescription: |-
    Asakusa.go #8のスライドです。
    なぜGoのカバレッジはstmtとfnなのか、Goのカバレッジ計測を利用した時に感じた小さな疑念を発端に調査結果をまとめました。Goが選んだ選択と思想、そこから見えてくるカバレッジについて話します。
  ogImage: auto
defaults:
  hashtag: asakusago
layout: cover
event: 'Asakusa.go #8'
speaker: Rinrin
handle: '@rin2yh'
handleUrl: https://x.com/rin2yh
---

# なぜGoのカバレッジは<br>stmtとfnなのか

---
layout: profile
title: 自己紹介
image: /images/icon.jpg
facts:
  - { label: 名前, value: Rinrin }
  - { label: 職種, value: フルスタックエンジニア }
  - { label: 趣味, value: アニメ、ゲーム、キーボード }
  - { label: Go歴, value: 2年 }
  - { label: ひとこと, value: asakusaは3〜4回遊びに。美味しいもの多い！ }
---

---
title: 目次
---

## 目次

1. 導入
2. Goの選択とその理由
3. 仕組み
4. まとめ

---
title: 導入
no: 1
---

# 導入

---
title: Goのカバレッジで取れるのはstmtとfnだけ?
---

## Goのカバレッジで取れるのはstmtとfnだけ?

### statement 全体で取れる

<Code :lines="[
  '$ go test -cover',
  'coverage: 80.0% {badge}of statements{/badge}',
]" />

### function ごとに取れる

<Code :lines="[
  '$ go tool cover -func',
  '{badge}grade.go:4:  Grade   80.0%{/badge}',
]" />

### Vitest は branch も取れる

<Code :lines="['% Stmts | {badge}% Branch{/badge} | % Funcs | % Lines']" />

<Lead>Vitest では branch も取れるのに、なぜGoは取れないのか?</Lead>

---
title: Goの選択とその理由
no: 2
---

# Goの選択と<br>その理由

---
title: 計測にはバイナリ計測とソースコード計測の2系統がある
---

## 計測にはバイナリ計測とソースコード計測の2系統がある

<Pipeline :nodes="[
  { label: 'ソースコード', branch: { title: 'ソースコード計測', desc: ['コンパイル前にソースを', '書き換えてカウンタを挿入'] } },
  { label: 'コンパイル', muted: true },
  { label: '実行', branch: { title: 'バイナリ計測', desc: ['実行中のバイナリを外から監視し、', 'どこが実行されたか記録する'] } },
]" />

<Lead>Goはどちらを選んだのか。</Lead>

---
title: ソースコード計測
---

## ソースコード計測

| 方式 | 移植性 |
|---|---|
| ソースコード計測（Go cover） | **高い**：AST だけで完結し、環境に依存しない {.accent} |
| バイナリ計測（gcov, V8） | 低い：OS / CPU / debug info に依存し、環境ごとに実装が必要になる |

> "For the new test coverage tool for Go, we took a different approach that avoids dynamic debugging. The idea is simple: Rewrite the package's source code before compilation to add instrumentation..."

<Caption>— The cover story, Rob Pike, The Go Blog (2013)</Caption>

<Lead size="sm">

Go標準ライブラリの**構文解析・整形パッケージ**で実現。Pikeが最重視した弱点の**移植性**を回避できる。

</Lead>

---
title: 計測の単位はブロック
---

## 計測の単位はブロック

ソースコード計測では、AST をどの単位で区切って計測するかを選べる。**分岐はソース上に明示的に現れない**ため、波括弧で区切られたブロックが自然な単位になる。

| 単位 | 分かること | コスト | 仕組み |
|---|---|---|---|
| ブロック単位（Go cover） | ブロックが実行されたか | 軽い | ブロック先頭にカウンタ1つ {.accent} |
| 式・条件単位 | branch / condition | 重い | `&&` / `\|\|` を分岐へ展開し、オペランドごとにカウンタ |

**ブロック**（basic block）とは、`if` / `for` / `range` / `switch` / `type switch` / `select`、`break` ・ `continue` ・ `goto` ・ `fallthrough`、ラベル付き文、ネストした `{ }`、`panic()` で区切られた**区間**。

デメリットは、ブロック内部の分岐を細かく計測できないこと。
<b>＝Goで branch を計測できず、取れない</b>

---
title: 仕組み
no: 3
---

# 仕組み

---
title: 計測したいソースコード
---

## 計測したいソースコード

例：整数の絶対値を返す **`Abs`** 関数。`Abs(3)` で1回だけテストを実行してみる。

```go
func Abs(n int) int {
    if n < 0 {
        return -n
    }
    return n
}
```

---
title: コンパイル前にカウンタ配列を作る
---

## コンパイル前にカウンタ配列を作る

各ブロックの先頭にカウンタを 1 つ挿入。3ブロックなので長さ 3 の配列ができる。

```go
func Abs(n int) int {
    GoCover.Count[0] = 0 // [!code ++]
    if n < 0 { // [!code highlight]
        GoCover.Count[1] = 0 // [!code ++]
        return -n // [!code highlight]
    }
    GoCover.Count[2] = 0 // [!code ++]
    return n // [!code highlight]
}
```

---
title: テスト実行時にカウンタ配列を更新
---

## テスト実行時にカウンタ配列を更新

**`Abs(3)`** の時、`n < 0` は偽なので `return -n` のブロックは通らない。

```go
func Abs(n int) int {
    GoCover.Count[0] = 1 // [!code ++]
    if n < 0 { // [!code highlight]
        GoCover.Count[1] = 0 // [!code --]
        return -n // [!code --]
    } // [!code --]
    GoCover.Count[2] = 1 // [!code ++]
    return n // [!code highlight]
}
```

---
title: 集計
---

## 集計

<Caption>

**`Abs(3)`** を 1 回テストした場合

</Caption>

| ブロック | カウンタ | 場所 | stmt数 | 実行 |
|---|---|---|:-:|:-:|
| ① | `Count[0]` | `if n < 0 文` | 1 | ✓ {.ok} |
| ② | `Count[1]` | `return -n` | 1 | ✗ {.dim} |
| ③ | `Count[2]` | `return n` | 1 | ✓ {.ok} |
| 合計 |  |  | 3 | 2 {.total} |

**命令網羅（stmt）** = 実行 stmt ÷ 全 stmt = `2 / 3` = **`66.7%`**

### 実行結果（ツール出力）

<Code :lines="[
  '$ go tool cover -func',
  'abs.go:2:  Abs  {mark}66.7%{/mark}',
]" />

---
title: まとめ
no: 4
---

# まとめ

---
title: Q. なぜGoのカバレッジはstmtとfnなのか?
---

## Q. なぜGoのカバレッジはstmtとfnなのか?

<Lead>A. ブロック単位のソースコード計装を行っているから</Lead>

<Caption>2 つの決定と、その理由</Caption>

<Summary :items="[
  { text: '計測方式は <b>ソースコード計測</b>', reason: 'AST だけで完結し環境に依存しない＝移植性が高いから' },
  { text: '計測単位は <b>ブロック単位</b>', reason: 'ソース書き換えでは分岐がソース上に現れず、波括弧で区切られたブロックが自然な単位だから' },
]" />

---
layout: cover
title: Thanks
event: Thank you
speaker: Rinrin
handle: '@rin2yh'
handleUrl: https://x.com/rin2yh
---

# ご清聴いただき、<br>ありがとうございました

---
title: 参考文献
---

## 参考文献

<Refs>

- Rob Pike「The cover story」The Go Blog, 2013<br><https://go.dev/blog/cover>
- Go cover ツール実装 `src/cmd/cover/`<br><https://github.com/golang/go/tree/master/src/cmd/cover>
- 高橋寿一『知識ゼロから学ぶソフトウェアテスト 第3版 ― アジャイル・AI時代の必携教科書』翔泳社, 2024<br><https://www.shoeisha.co.jp/book/detail/9784798182452>
- Vitest 公式ドキュメント「Coverage」<br><https://vitest.dev/guide/coverage.html>

</Refs>
