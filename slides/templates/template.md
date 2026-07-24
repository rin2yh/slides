---
theme: default
title: プレゼンテーションのタイトル
info: |
  デザインシステムに沿った Slidev テンプレート
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
  ogTitle: プレゼンテーションのタイトル
  ogDescription: デザインシステムに沿った Slidev テンプレート
  ogImage: auto
defaults:
  hashtag: asakusago
layout: cover
event: Asakusa.go #8
speaker: Rinrin
handle: '@rin2yh'
handleUrl: https://x.com/rin2yh
---

# プレゼンテーションのタイトルをここに

---
layout: profile
title: 自己紹介
image: /images/icon.jpg
facts:
  - { label: 名前, value: Rinrin }
  - { label: 職種, value: フルスタックエンジニア }
  - { label: 趣味, value: アニメ、ゲーム、キーボード }
  - { label: ひとこと, value: 何か一言を書く }
---

---
---

## 目次

1. 1つ目のトピック
2. 2つ目のトピック
3. 3つ目のトピック
4. 4つ目のトピック

---
no: 1
---

# セクション名

---
---

## 見出しをここに置く

本文をここに記述します。読みやすい行間と文字サイズを保ち、1スライドに詰め込みすぎないようにします。**強調したい語**はアクセント色にできます。

**最も伝えたい一文をここに。**

---
---

## コードで確認する

補足説明をここに。強調したい行はハイライトできる。

```go {all|2-4|all}
func Abs(n int) int {
    if n < 0 {
        return -n
    }
    return n
}
```

---
---

## 端末で確認する

<h3>コマンド</h3>

```shell
$ go test -cover
coverage: 80.0% {badge}of statements{/badge}
```

---
---

## 表で整理・比較する

素の表はそのまま Markdown で書ける。

| 項目 | 説明 |
|---|---|
| 選択肢 A | メリットをここに |
| 選択肢 B | 比較対象の説明をここに |

アクセント行を作りたい場合は行末に `{.accent}` を付ける。

| 項目 | 説明 |
|---|---|
| 選択肢 A | **推し**：メリットをここに | {.accent}
| 選択肢 B | 比較対象の説明をここに |

---
---

## 引用で裏づける

> ここに引用文を配置します。原文の主張をそのまま示し、根拠として使います。

— 出典・著者・媒体（年）

---
---

## 図で説明する

<div class="dc-figure-placeholder">
  <div class="box"></div>
  <span class="label">図版 / スクリーンショット</span>
</div>

---
---

## Q. 今日の問いをここに?

**A. 結論をここに一文で**

要点

1. 要点その1をここに
2. 要点その2をここに
3. 要点その3をここに

---
layout: cover
event: Thank you
speaker: Rinrin
handle: '@rin2yh'
handleUrl: https://x.com/rin2yh
---

# ご清聴いただき、<br>ありがとうございました

---
---

## 参考文献

<div class="refs">
  <div class="ref">
    <div class="title">著者「タイトル」媒体, 年</div>
    <a class="dc-mono" href="https://example.com" target="_blank">https://example.com</a>
  </div>
  <div class="ref">
    <div class="title">著者「タイトル」媒体, 年</div>
    <a class="dc-mono" href="https://example.com" target="_blank">https://example.com</a>
  </div>
</div>
