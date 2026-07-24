---
paths:
  - "slides/**/*.md"
  - "!slides/node_modules/**"
---

# スライド記述のアンチパターン

以下をやるとどこかで必ずデザインがズレて後から手戻る。個別の詳細ルールはそれぞれの `.md` にあるので、ここは短い一覧にとどめる。

- **スライドファイルに `<style>` 局所ブロックを書かない**
  - 装飾は `slides/style.css` に集約する。個別スライドの `<style>` は使い捨てで、次に同じ形が出たとき再利用できない
- **`<span class="dc-mono">…</span>` を書かない** — `` ` ` `` で済む
- **色や font-size を inline style で指定しない** — デザイントークン（`var(--dc-accent)` 等）をクラスとして `slides/style.css` に足す

Frontmatter・余白関連はそれぞれ:

- `layout:` / `hashtag:` を per-slide で書かない → `.claude/rules/frontmatter.md`
- `style="margin-top:X"` を per-slide で殴らない → `.claude/rules/spacing.md`
- SVG を Markdown 内に直接書かない際の対処 → skill `slidev-troubleshooting`
