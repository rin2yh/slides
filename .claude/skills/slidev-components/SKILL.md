---
name: slidev-components
description: このプロジェクトの自作 Vue コンポーネント (`<Refs>` `<Pipeline>` `<Code>`) の API と使い分け。Markdown だけでは表現しづらいスライド上のパターン（参考文献 / 数直線パイプライン図 / 端末出力パネル）を書きたい・書いたけど期待通りに描画されない、と言ったら参照する。新しいコンポーネントを追加すべきか判断したい時も。「`**bold**` を青くしたいのに濃い太字にしかならない（青は構造要素専用）」「HTML を props に混ぜたい」「v-html は安全か」「`<Refs>` の中でリストが崩れる」等の細かい疑問にも該当。素の Markdown 記法（見出し・テーブル・コードブロック）については `.claude/rules/` を先に見る。
---

# Slidev components

自作コンポーネントは **Markdown だけでは書けない繰り返しパターン** を Vue に逃がしてある。逆に言うと、素の Markdown + 共通 CSS で表現できるものは component にしない。この skill は「既にある component の使い方」と「新規追加すべきかの判断基準」を扱う。

**まず読む実物**: `slides/components/*.vue` — ソースが短く、propsとテンプレートが直接読める。CSS は同じくソース `slides/style.css` の該当セクションに集約。

## 判断基準（component にするか、Markdown + CSS で済ますか）

コンポーネント化するのは以下の全部を満たす時のみ:

1. **2 回以上出てくる** — 1 回きりなら inline HTML で妥協
2. **Markdown の記法だけでは構造を表せない** — 単なるスタイル差なら class を CSS に足すだけで済む
3. **props で受けたい可変要素がある** — 静的なら CSS クラス、動的なら component

これに当てはまらない one-off の装飾は、Markdown + `.dc-*` クラスで書く。

## 既存コンポーネント

### `<Refs>`

参考文献リスト。スロットに Markdown リストを書く。

```md
<Refs>

- Rob Pike「The cover story」The Go Blog, 2013<br><https://go.dev/blog/cover>
- Go cover ツール実装 `src/cmd/cover/`<br><https://github.com/golang/go/tree/master/src/cmd/cover>
- 高橋寿一『知識ゼロから学ぶソフトウェアテスト 第3版』翔泳社, 2024<br><https://www.shoeisha.co.jp/book/detail/9784798182452>

</Refs>
```

書き方の要件:

- 各 bullet は `タイトル<br><url>` の形。`<url>` の autolink 記法でリンクになる
- **開始タグと最初の bullet の間、最後の bullet と閉じタグの間に空行**を入れる
  - 理由: 空行がないと markdown-it が `<Refs>` の内側を raw HTML として扱い、Markdown リストが処理されない。ぱっと見リストが崩れて描画される
- タイトル部に `` `code` `` を混ぜて OK

**なぜ component か**: `.refs > ul` の list-style / gap / ネストしたリンクのブロック化・mono / accent 色を CSS で一括する必要があり、汎用の `<ul>` に紛れるとやりすぎる。

### `<Pipeline>`

水平の数直線パイプライン図（コンパイル / 処理段の説明でよく出る形）。

```md
<Pipeline :nodes="[
  { label: 'ソースコード', branch: { title: 'ソースコード計測', desc: ['コンパイル前にソースを', '書き換えてカウンタを挿入'] } },
  { label: 'コンパイル', muted: true },
  { label: '実行',       branch: { title: 'バイナリ計測', desc: ['実行中のバイナリを外から監視し、', 'どこが実行されたか記録する'] } },
]" />
```

**Props**:

- `nodes: Node[]` — 左から順に等間隔配置
  - `label: string` — ノード下のキャプション
  - `muted?: boolean` — グレーの小円（中間ノード、選ばれなかった選択肢）
  - `branch?: { title: string, desc?: string | string[] }` — ノード上に立つ分岐アノテーション（アクセント色ラベル + 縦線 + 説明）
  - `desc` は 1 行なら文字列、複数行なら `string[]`
- `maxWidth?: number` — default 1660。図全体の最大幅

**なぜ SVG じゃなく HTML+CSS positioning か**: SVG を Markdown / MDC に直接書くと Vue のテンプレートコンパイラや MDC が内部要素を text ノードとして扱って崩れる。図要素を HTML の `<div>` + 絶対配置で書くと、テキスト文字サイズがスライド本体と同じ CSS ピクセル系で決まるので周りと整合しやすい。同じ流儀で新しい図コンポーネントを追加する。

### `<Code>`

端末出力パネル（`.dc-code`）。各行を文字列で `:lines` に渡す。

```md
<Code :lines="[
  '$ go tool cover -func',
  'abs.go:2:  Abs  {mark}66.7%{/mark}',
]" />
```

**Props**:

- `lines: string[]` — 端末の各行。`white-space: pre` で改行・空白はそのまま出る
  - `{badge}text{/badge}` → アクセントソフト背景の帯 / `{mark}text{/mark}` → アクセント色ボールド（`slides/lib/code.ts` の `renderCode` が変換、v-html レンダリング）
  - `$` プロンプトは特別扱いせず、ただの文字として書く

**なぜ component か（フェンスにしない理由）**: 以前は ```shell フェンスを codeblock transformer で横取りしていたが、「フェンスが時々 shiki を通らない」フォークになる。`<Code>` にすると**フェンスは常に shiki のシンタックスハイライト専用**になり、端末パネルは明示的にコンポーネントで opt-in できる。スロットだと Vue の whitespace condense で改行が潰れるので、行は `:lines` 配列で渡す（`<Pipeline>` と同じ流儀）。

## 新規コンポーネントを追加するとき

1. **判断基準（前述）を通す** — 素の Markdown + CSS で書けないか一度試す
2. **命名は用途ベース** — `<Refs>` `<Pipeline>` `<Code>` のように、スライド内で果たす役割で名前を付ける（`<BigBoldText>` みたいな見た目ベースにしない）
3. **props はできるだけ薄く** — 文字列 / boolean / 配列で表現できるなら Vue のリアクティビティは不要
4. **CSS は `.dc-<name>` プリフィックスで `style.css` に集約** — component 内 scoped style を最小にして、共通トークン (`var(--dc-accent)` 等) で色・サイズを取る
5. **マージンは自分で持つ** — 使う側で `style="margin-top:X"` を書かせない。default で必要な余白を持ち、隣接要素の型で調整が必要なら sibling selector を CSS に足す

## v-html を使うときの注意

`<Pipeline>` の内部で `v-html` を使っている。これは props に HTML 文字列を受けたいから（`<b>強調</b>` を混ぜたい等）。

- **props 経由の HTML は Vue の空白圧縮を回避できる** — テンプレート内の `<div>` テキスト空白は Vue が 1 個に潰すが、v-html で流し込む文字列はそのまま。コードブロック等でインデント保持が必要な時は同じテクを使う
- **XSS の考慮は不要** — スライドのソースは著者自身が書くのでサニタイズしない
