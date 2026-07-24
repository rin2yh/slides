---
paths:
  - "slides/**/*.md"
  - "!slides/node_modules/**"
---

# スライド記述のアンチパターン

以下をやるとどこかで必ずデザインがズレて後から手戻る。個別の詳細ルールはそれぞれの `.md` にあるので、ここは短い一覧にとどめる。

- **`<style>` を Markdown ファイルに書かない**
  - 装飾は `slides/theme.css` に集約する。個別スライドの `<style>` は使い捨てで、次に同じ形が出たとき再利用できない
- **Vue コンポーネントを書かない**
  - `<Lead>` `<Summary>` `<Code :lines>` などのコンポーネントは廃止。素の Markdown（`**bold**` / リスト / フェンス）で表現する。Slidev の頃の書き方に戻さない
- **色や font-size を inline style で指定しない** — デザイントークン（`var(--dc-accent)` 等）をクラスとして `slides/theme.css` に足す
- **Marpit ディレクティブで per-slide 装飾を殴らない**
  - `<!-- _color: red -->` `<!-- _backgroundColor: #fff -->` 等の一発物ディレクティブで見た目を変えない。テーマ CSS のクラス（`<!-- _class: cover -->` など）を通して当てる
- **`style="margin-top:X"` を per-slide で殴らない** → `.claude/rules/spacing.md`
- **画像を `/foo.svg` の絶対パスで参照しない**
  - GitHub Pages ではデッキが `/repo/deck/` にデプロイされるので、絶対パス `/foo.svg` はサイトルートを見に行って壊れる
  - `./public/foo.svg` のように**デッキ HTML からの相対パス**で書く。`slides/public/*` は CI で `dist/<deck>/public/*` にコピーされる
