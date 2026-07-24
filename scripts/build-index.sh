#!/usr/bin/env bash
# slides/*.md の frontmatter からデッキ一覧ページ（dist/index.html）を生成する。
#
#   scripts/build-index.sh [出力先ディレクトリ]   # 既定: dist
#
# 一覧の並びはファイル名の昇順。各デッキのリンク先は ./<deck>/ で、
# build-decks が同じ場所に出力する HTML と対応する。
set -euo pipefail
shopt -s nullglob

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

OUT_DIR="${1:-dist}"

# frontmatter から 1 キー分の値を取り出す。`>-` などの折りたたみブロックは 1 行に畳む。
front_matter_value() {
  awk -v key="$2" '
    NR == 1 { if ($0 == "---") { infm = 1; next } else { exit } }
    infm && $0 == "---" { exit }
    collecting {
      if ($0 ~ /^[[:space:]]+[^[:space:]]/) {
        line = $0
        sub(/^[[:space:]]+/, "", line)
        value = (value == "" ? line : value " " line)
        next
      }
      exit
    }
    $0 ~ "^" key ":" {
      found = 1
      value = substr($0, length(key) + 2)
      sub(/^[[:space:]]+/, "", value)
      sub(/[[:space:]]+$/, "", value)
      if (value ~ /^[|>][-+]?$/) { value = ""; collecting = 1; next }
      if (value ~ /^".*"$/ || value ~ /^'"'"'.*'"'"'$/) value = substr(value, 2, length(value) - 2)
      exit
    }
    END { if (found) print value }
  ' "$1"
}

html_escape() {
  sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g' -e 's/"/\&quot;/g'
}

mkdir -p "$OUT_DIR"

items=""
count=0
for f in slides/*.md; do
  deck="$(basename "$f" .md)"

  title="$(front_matter_value "$f" title)"
  [ -n "$title" ] || title="$deck"
  description="$(front_matter_value "$f" description)"

  esc_deck="$(printf '%s' "$deck" | html_escape)"
  esc_title="$(printf '%s' "$title" | html_escape)"

  item="      <li class=\"deck\">
        <a href=\"./${esc_deck}/\">
          <span class=\"deck-title\">${esc_title}</span>"
  if [ -n "$description" ]; then
    esc_description="$(printf '%s' "$description" | html_escape)"
    item="${item}
          <span class=\"deck-description\">${esc_description}</span>"
  fi
  item="${item}
        </a>
      </li>"

  items="${items}${items:+
}${item}"
  count=$((count + 1))
done

if [ "$count" -eq 0 ]; then
  items="      <li class=\"empty\">まだスライドがありません。</li>"
fi

cat > "$OUT_DIR/index.html" <<HTML
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>slides</title>
    <meta name="description" content="Rinrin の発表スライド一覧。" />
    <link rel="icon" href="./favicon.ico" />
    <link rel="stylesheet" href="./index.css" />
  </head>
  <body>
    <main class="page">
      <header class="site-header">
        <h1>slides</h1>
        <p>Rinrin の発表スライド一覧。</p>
      </header>
      <ul class="decks">
${items}
      </ul>
      <footer class="site-footer">
        <a href="https://x.com/rin2yh">@rin2yh</a>
      </footer>
    </main>
  </body>
</html>
HTML

cp site/index.css "$OUT_DIR/index.css"
if [ -f slides/public/favicon.ico ]; then
  cp slides/public/favicon.ico "$OUT_DIR/favicon.ico"
fi

echo "generated: $OUT_DIR/index.html (${count} decks)"
