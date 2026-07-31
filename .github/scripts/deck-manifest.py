#!/usr/bin/env python3
"""slides/*.md のヘッドマターから、blog に渡すデッキ一覧を JSON で吐く。

公開 URL は GitHub Pages の配置（<owner>.github.io/<repo>/<deck>/）に合わせる。
OGP 画像のファイル名は .github/actions/build-decks/action.yml が決めているので、
片方を変えたらもう片方も直す。
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path

SLIDES = Path("slides")
REQUIRED = ("title", "description", "date")


def unquote(value):
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "'\"":
        return value[1:-1]
    return value


def head_matter(path):
    """ヘッドマターを dict にする。ネストも配列も使っていないので 1 行 1 項目で読む。"""
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        sys.exit(f"{path}: ヘッドマターが無い")
    body = text[4:]
    end = body.find("\n---")
    if end < 0:
        sys.exit(f"{path}: ヘッドマターが閉じていない")

    fields = {}
    for line in body[:end].split("\n"):
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        key, sep, value = line.partition(":")
        if sep:
            fields[key.strip()] = unquote(value.strip())
    return fields


def site_base():
    """公開サイトのルート URL。CI では GITHUB_REPOSITORY、手元では origin から引く。"""
    repo = os.environ.get("GITHUB_REPOSITORY")
    if not repo:
        url = subprocess.run(
            ["git", "config", "--get", "remote.origin.url"],
            capture_output=True,
            text=True,
        ).stdout.strip()
        matched = re.search(r"[:/]([^/:]+)/([^/]+?)(?:\.git)?$", url)
        if not matched:
            sys.exit("公開 URL を決められない: GITHUB_REPOSITORY も origin も無い")
        repo = f"{matched.group(1)}/{matched.group(2)}"
    owner, name = repo.split("/", 1)
    return f"https://{owner}.github.io/{name}"


def main():
    base = site_base()
    decks = []

    for path in sorted(SLIDES.glob("*.md")):
        fields = head_matter(path)
        missing = [key for key in REQUIRED if not fields.get(key)]
        if missing:
            sys.exit(f"{path}: ヘッドマターに {', '.join(missing)} が無い")

        url = f"{base}/{path.stem}/"
        decks.append(
            {
                "slug": path.stem,
                "title": fields["title"],
                "description": fields["description"],
                "date": fields["date"],
                "url": url,
                "ogImage": f"{url}og-image.png",
            }
        )

    if not decks:
        sys.exit("slides/*.md が 1 枚も無い")

    # 一覧ページと同じ「日付の新しい順」。同日は slug で決め打ちして並びを固定する
    decks.sort(key=lambda deck: (deck["date"], deck["slug"]), reverse=True)

    json.dump(decks, sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
