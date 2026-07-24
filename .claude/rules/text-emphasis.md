---
paths:
  - "slides/**/*.md"
  - "!slides/node_modules/**"
---

# テキスト装飾規約

強調の意味と書き方を 1 対 1 で対応させる。「どのタグで書けばよかったっけ」で迷わせない・使い分けを一目で読めるように。

## 太字

- `**text**` → **アクセントカラー**の太字
  - CSS: `.slidev-layout strong { color: var(--dc-accent) }`
- `<b>text</b>` → **通常色**の太字
  - アクセントを持ち込みたくない強調に使う

## モノスペース

- `` `code` `` → 灰色モノスペース（inline code）
- ``**`code`**`` → **アクセント色**モノスペース太字
  - コード片を強く強調したいとき

## 大きい強調文・キャプション

コンポーネントを使う（詳細は skill `slidev-components`）:

- `<Lead>text</Lead>` — 44px ボールドの punchline
- `<Lead size="sm">text</Lead>` — 32px ボールド（章末結論・小サブリード）
- `<Caption>text</Caption>` — 24px muted（引用の出典・小補足）

これらは default で自分に必要な margin を持つ。余白の管理方針は `.claude/rules/spacing.md` を参照。

### `<Lead>` / `<Caption>` の中で `**bold**` を使うとき

コンポーネントのタグと本文を **1 行に詰めて書くと Markdown が処理されず**、`**構文解析**` がそのまま `**` 付きで描画される（markdown-it が本文を生テキスト扱いするため）。強調を効かせたいときは開始/終了タグと本文の間に空行を入れて block 記法で書く:

```md
<Lead size="sm">

Go標準ライブラリの**構文解析・整形パッケージ**で実現。

</Lead>
```

装飾のために生の `<strong>` / `<b>` を書くのではなく、この block 記法で素の `**bold**` を効かせる。詳細は skill `slidev-components`。
