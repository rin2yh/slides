---
theme: default
title: スライドテンプレート
author: Rinrin
info: |
  Slidev で書く汎用スライドテンプレート
highlighter: shiki
lineNumbers: false
drawings:
  persist: false
transition: slide-left
mdc: true
layout: cover
---

# スライドタイトル

サブタイトル / 発表者名

<div class="pt-8 text-sm opacity-70">
  YYYY/MM/DD
</div>

---
layout: default
---

# 目次

1. セクション1
2. セクション2
3. セクション3

---
layout: section
---

# セクション1

セクションの導入コピー

---
layout: default
---

# 見出し

- 箇条書き 1
- 箇条書き 2
- 箇条書き 3

<div class="mt-6 text-sm opacity-70">
  補足テキスト
</div>

---
layout: two-cols
---

# 左カラム

左側の内容

::right::

# 右カラム

右側の内容

---
layout: quote
---

> 引用テキスト。強調したい発言や名言。

<div class="mt-4 text-sm opacity-70">— 出典</div>

---
layout: default
---

# コードスライド

```ts {all|2|3-5|all}
function greet(name: string) {
  const message = `Hello, ${name}`
  return {
    message,
    at: new Date(),
  }
}
```

---
layout: end
---

# ご清聴ありがとうございました

<div class="text-sm opacity-70">Q&amp;A</div>
