---
paths:
  - "slides/**/*.md"
  - "!slides/node_modules/**"
---

# テキスト装飾規約

強調の意味と書き方を 1 対 1 で対応させる。「どのタグで書けばよかったっけ」で迷わせない。

## 太字

- `**text**` → **周囲の文字色を継承した普通の太字**（色は付かない）
  - CSS: `section strong { color: inherit; font-weight: 700 }`
  - 本文中の語を強調しても、色は周囲と同じ濃色（`#1b1f23` / `#3a4046`）のまま太くなるだけ

## アクセント（青）は構造要素が持つ

青（`var(--dc-accent)`）は「強調」ではなく**構造**に割り当てる。`**` で青くしようとしない。青が出るのは次の構造要素だけ：

- `###` セクションタグ（mono の小ラベル）
- 目次の番号（`ol` marker）
- リンク
- section divider の `SECTION 0X` の p
- blockquote の左罫線

## モノスペース

- `` `code` `` → 灰色モノスペース（inline code）
- ``**`code`**`` → 周囲色の**太字**モノスペース（色は付かない）

## 大きい強調文・引用キャプション

**Vue コンポーネント（`<Lead>` `<Caption>` `<Summary>` `<Refs>`）は廃止**。全部素の Markdown で書く：

- **punchline / 章末結論** → `**bold**`（本文と同じ 32px の太字。章末に句点付きの文で置く）
- **引用の出典・小補足** → `<small>text</small>`（24px muted）
- **決定 + 理由の 2 段構造** → 素の unordered list `- **決定** — 理由`
- **参考文献** → 素の unordered list。URL は autolink `<https://…>` で
