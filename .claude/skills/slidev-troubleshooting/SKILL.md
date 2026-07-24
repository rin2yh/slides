---
name: slidev-troubleshooting
description: このプロジェクトの Slidev レンダリングパイプラインで起こる特有の症状の切り分けと修正。「コード内のインデントが消える／崩れる」「diff ハイライトが効かない or 色が消える」「スライド本体が真っ白になった」「テーブルの列数が合わない」「Node 25 で Shiki disposed エラー」「Slidev の goto ダイアログを消したい」「margin が思った通りに空かない／余計に空く」「HMR で反映されない」「dev server が固まった」「dist を消したい」「SVG を書いたら崩れた」等、書き方の問題ではなくパイプライン (markdown-it / Vue コンパイラ / shiki / Slidev のカスタム CSS) 側のクセや運用トラブルに起因する症状を扱う。書き方そのものは `.claude/rules/`、コンポーネント API は `slidev-components` を先に見る。
---

# Slidev troubleshooting

このデッキで実際に踏んだ症状と、原因・修正パターン。書き方（記法・コンベンション）の問題ではなく、Slidev + markdown-it + Vue + shiki のパイプラインが混ざったところで出る「なぜか通らない」「色が消えた」系を扱う。

先に「どこで起きているか」を切り分けると効率がいい:

- **Markdown 側で完結する症状**（レンダー結果を見なくても書き方でわかる）→ `.claude/rules/` の該当ルール（frontmatter / headings / tables / code-blocks 等）へ
- **ビルドは通るが見た目が壊れる** → 大抵はここに来る
- **ビルドが失敗する** → まず `npx slidev build slides/<file>.md 2>&1 | tail` でエラーを見る

以下、症状 → 原因 → 対処。

## コード内のインデントが 1 スペースに潰れる

**症状**: `<div>` で囲った自作パネルの中で 4 空白が 1 空白になる。ソースには 4 空白入っているのに描画が「潰れた」状態。

**原因**: Vue のテンプレートコンパイラは `<div>` の text 空白を default で `condense` する。`v-pre` はディレクティブ処理を skip するだけで、text 空白圧縮は防げない。

**対処**: `<pre>` 要素を使う。Vue コンパイラは `<pre>` の中の空白は常に保持する。自作パネルも `<pre>` にする（`<Code>` コンポーネントの `<pre class="dc-code" v-html>` がこの形。動的な中身は v-html で props 文字列として流し込むと、そもそもテンプレートの空白圧縮を経由しない）。行ごとに background を出したいなら `<span>` を `display: block` にして pre 内に並べる（`<div>` は避ける、余計な空白挿入の温床）。

素の ``` ```lang ``` フェンスはこの制約と無関係（shiki が独自に `<pre><code>` を吐く）ので、可能ならそちらで済ませる。

## diff ハイライトのコード色が消える／出ない

**症状**: ``` ```go ``` に `// [!code ++]` を書いたのに、色付きにならない or 逆に全部が同色に潰れて可読性が落ちる。

**原因**:

- **色付きにならない場合** — `slides/setup/shiki.ts` の transformer が読み込まれていない。headmatter に `highlighter: shiki` が入っているか確認（テンプレは入っている）。それでも駄目な時は **dev server を再起動**（HMR で `setup/*.ts` の変更が拾われないことがある）
- **色が潰れる場合** — `.slidev-layout pre .line { color: inherit !important }` と `.line.diff.add { color: X !important }` が同じ specificity で衝突している

**対処**: `.line.diff.add` に直接 color を当てず、**子 span を狙う**:

```css
.slidev-layout pre .line.diff.add span {
  color: var(--dc-accent) !important;
  font-weight: 700;
}
```

Shiki は 1 トークンずつ `<span style="--shiki-light:#XXX">` を吐くので、そちらを上書きする方が specificity と inline style の両方に勝つ。

## スライド全体が真っ白（コンテンツごと消えた）

**原因**: `.slidev-page` を `display: none` した。`.slidev-page` は Slidev の「スライド本体」の class 名なので、UI overlay を隠すつもりで消すとスライドごと消える。

**対処**: `.slidev-page` は絶対に触らない。オーバーレイを消したいときは各パーツの ID / class をピンポイントで狙う（例: `#slidev-goto-dialog { display: none }`）。

## Slidev の goto ダイアログを消したい

**原因**: Slidev の `G` キーで開くジャンプダイアログ。デフォルトの UI で邪魔。

**対処**（2 段構え）:

1. `slides/setup/shortcuts.ts` で `g` キーバインドを filter で外す

   ```ts
   import { defineShortcutsSetup } from '@slidev/types'
   export default defineShortcutsSetup((_nav, base) => base.filter(s => s.key !== 'g'))
   ```

2. `slides/style.css` に CSS で hide も入れておく（他ルートで表示されないよう保険）

   ```css
   #slidev-goto-dialog { display: none !important; }
   ```

## テーブルの列数が合わない・余計な列が出る

**症状**: preparser で `|{.accent}` 行を含む表を書いたら、次の行のセル数がヘッダより多く、右側に空セルが飛び出る。

**原因**: セル分割時に `\|` エスケープや `` ` `` code span 内のパイプを尊重していない古い実装だった。現状 `slides/setup/preparser.ts` の `splitCells` は両方対応済み。

**対処**: `splitCells` の実装を確認。壊れているなら:

- `\|` は文字通りのパイプに戻す
- `` `...|...` `` の中のパイプは分割しない

セル内容に混ぜたい場合は素直に `\|` エスケープを使う（例: `` `&&` / `\|\|` を展開 ``）。

## Node 25 で `Shiki instance has been disposed` エラー

**症状**: `npm run dev` 起動時 or hot reload 時に

```
ShikiError: Shiki instance has been disposed
```

**原因**: 古い Slidev CLI (`^0.50.x`) が Node 25+ で走ると Shiki のライフサイクル管理でぶっ壊れる既知のバグ。

**対処**: `@slidev/cli` を `^52` に上げる。`package.json` は既にその状態で、`npm install` するだけ。dev server が固まった場合は `pkill -f slidev` で殺してから再起動。

## margin が思ったより広い／狭い

**症状**: 隣接要素の間のスペースがデザインとズレる。特に h2 の直後、blockquote の直後、`<pre>` の直後で顕著。

**原因の切り分け**:

1. **要素同士のマージン collapse が効いていない** — スライドの root コンテナが `display: flex` になっていると collapse しない（flex アイテムは margin collapse しない）。`slides/layouts/default.vue` の `.dc-content` が `display: block` になっているか確認
2. **要素の default margin が抜けている** — `slides/style.css` の該当要素のルールを確認。特に `pre` / `.dc-code` は自分で `margin` を持っている
3. **sibling selector の型が違う** — 例: `A + B { margin-top: 0 }` は A の**直後**の B にしか効かない。間に `<p>` が入ると効かない

**対処原則**:

- インラインで `style="margin-top:X"` を殴らない
- 起こしたい調整を CSS 側の sibling selector or 要素 default に足す
- 「この pair のとき狭くしたい／広げたい」は `A + B` セレクタで書く

## SVG が Markdown 内で崩れる

**症状**: `<svg>...</svg>` を .md にべた書きしたら、テキスト要素が超巨大になったり、位置がぐちゃぐちゃになる。

**原因**: MDC (`mdc: true`) が SVG の子要素をコンポーネント／テキストノードとして解釈して構造を壊す。

**対処**: SVG は必ず Vue コンポーネントに切り出す。コンポーネント内なら Vue のテンプレートコンパイラが SVG 名前空間として正しく扱う。ただしテンプレート内で書くとテキストの空白圧縮に当たることがあるので、**`v-html` で raw HTML 文字列として流し込む** のが一番安定する。または SVG をやめて HTML + CSS の絶対配置で描く（`<Pipeline>` はこの方針）。

## ビルドは通るのに UI が期待と違うとき

以下を順にチェック:

1. `slides/public/images/` に画像があるか、パスが `/images/xxx` の形になっているか（entry file と同じ dir の `public/` から serve される）
2. `slides/style.css` に該当ルールがあるか、`!important` の specificity で負けていないか
3. dev server が生きたままだと HMR で中途半端に反映される — 一度殺して再起動
4. `dist/` を消して build し直す — Vite の cache が古いと変な状態が残ることがある

## dev server が固まった / 反応しない

**症状**: `q` や Ctrl-C が効かない、restart したのに古い状態が残る、Shiki disposed 系のエラーで stuck。

**対処**:

```sh
pkill -f slidev        # dev server を強制終了
rm -rf slides/dist     # 前回のビルド成果物を破棄（entry file と同じ dir の dist）
rm -rf .slidev         # Slidev の cache も消してよい
npm run dev slides/<file>.md
```

`setup/*.ts` を編集したときは HMR が拾わないことが多い。**必ず dev server を再起動する**。

## 何をやっても直らないとき

- ビルド後の JS assets を `grep` で覗く（`dist/assets/md-*.js`）— どう class が出ているか / どんな span が生成されているかが見えるとデバッグしやすい
- 症状に一番近い実物を `slides/go-coverage.md` から探す。動いている書き方があるなら真似る方が早い
