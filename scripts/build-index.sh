#!/usr/bin/env bash
# slides/*.md の frontmatter からデッキ一覧ページ（dist/index.html）を生成する。
#
#   scripts/build-index.sh [出力先ディレクトリ]   # 既定: dist
#
# 拾うのは title / description / date の 3 つ。並びは date の新しい順で、
# date が無いデッキは末尾。リンク先は ./<deck>/ で build-decks の出力先と対応する。
set -euo pipefail
shopt -s nullglob

cd "$(dirname "${BASH_SOURCE[0]}")/.."

OUT_DIR="${1:-dist}"

decks=(slides/*.md)
if [ "${#decks[@]}" -eq 0 ]; then
  echo "no decks found under slides/" >&2
  exit 1
fi

# 各デッキの frontmatter を 1 パスで読み、"日付 \t デッキ名 \t タイトル \t 説明" を
# 日付の新しい順（日付なしは末尾）に出す。値は HTML エスケープ済み。
deck_rows() {
  awk '
    function esc(s) {
      gsub(/&/, "\\&amp;", s)
      gsub(/</, "\\&lt;", s)
      gsub(/>/, "\\&gt;", s)
      gsub(/"/, "\\&quot;", s)
      return s
    }
    function emit(  d, t) {
      d = (fm["date"] ~ /^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]$/) ? fm["date"] : "0000-00-00"
      t = (fm["title"] == "" ? deck : fm["title"])
      printf "%s\t%s\t%s\t%s\n", d, esc(deck), esc(t), esc(fm["description"])
    }
    FNR == 1 {
      if (NR > 1) emit()
      deck = FILENAME
      sub(/^.*\//, "", deck)
      sub(/\.md$/, "", deck)
      delete fm
      collecting = ""
      done = 0
      infm = ($0 == "---")
      next
    }
    done || !infm { next }
    $0 == "---" { done = 1; next }
    # 折りたたみブロック（`>-` / `|`）の続き行は 1 行に畳む
    collecting != "" {
      if ($0 ~ /^[[:space:]]+[^[:space:]]/) {
        line = $0
        sub(/^[[:space:]]+/, "", line)
        fm[collecting] = (fm[collecting] == "" ? line : fm[collecting] " " line)
        next
      }
      collecting = ""
    }
    /^(title|description|date):/ {
      key = $0
      sub(/:.*/, "", key)
      value = substr($0, length(key) + 2)
      sub(/^[[:space:]]+/, "", value)
      sub(/[[:space:]]+$/, "", value)
      if (value ~ /^[|>][-+]?$/) { fm[key] = ""; collecting = key; next }
      if (value ~ /^".*"$/ || value ~ /^'"'"'.*'"'"'$/) value = substr(value, 2, length(value) - 2)
      fm[key] = value
    }
    END { if (NR > 0) emit() }
  ' "${decks[@]}" | sort -t"$(printf '\t')" -k1,1r -k2,2
}

items=""
while IFS=$'\t' read -r date deck title description; do
  items="${items}      <li>
        <a href=\"./${deck}/\">${title}</a>
"
  [ "$date" = "0000-00-00" ] || items="${items}        <time datetime=\"${date}\">${date}</time>
"
  [ -z "$description" ] || items="${items}        <p>${description}</p>
"
  items="${items}      </li>
"
done < <(deck_rows)

mkdir -p "$OUT_DIR"
cat > "$OUT_DIR/index.html" <<HTML
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>slides</title>
    <meta name="description" content="Rinrin の発表スライド一覧。" />
    <link rel="icon" href="./favicon.ico" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&amp;display=swap" />
    <style>
      /* 背景・文字色・フォントはスライド（slides/theme.css）と同じ値に揃える。
         直すときは両方を直すこと。レイアウトは合わせていない。 */
      @font-face {
        font-family: 'Latin Override';
        font-style: normal;
        font-weight: 100 900;
        font-display: swap;
        src: url('https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2') format('woff2');
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        size-adjust: 108%;
      }
      body {
        max-width: 40rem;
        margin: 0 auto;
        padding: 3rem 1.25rem;
        font-family: 'Latin Override', 'Noto Sans JP', sans-serif;
        line-height: 1.7;
        background: #fbfaf7;
        color: #1b1f23;
      }
      h1 { font-size: 1.75rem; }
      ul { list-style: none; padding: 0; }
      li { margin-bottom: 1.75rem; }
      li a { font-size: 1.1rem; font-weight: 700; }
      time { display: block; font-size: 0.85rem; color: #666; }
      li p { margin: 0.25rem 0 0; font-size: 0.9rem; }
    </style>
  </head>
  <body>
    <h1>slides</h1>
    <p>Rinrin の発表スライド一覧。</p>
    <ul>
${items%$'\n'}
    </ul>
  </body>
</html>
HTML

cp slides/public/favicon.ico "$OUT_DIR/favicon.ico"

echo "generated: $OUT_DIR/index.html (${#decks[@]} decks)"
