#!/usr/bin/env python3
"""slide-index-entry の評価を機械的に採点する。

各 run ディレクトリ (…/eval-N-name/{with_skill,without_skill}/) を見て
grading.json を書く。目視ではなくスクリプトで判定するのは、
「1行だけ追加されたか」「日付が降順か」のような判定が
人間の目より正確かつ再現可能だから。
"""
import io
import json
import os
import re
import subprocess
import sys

LI_RE = re.compile(
    r'<li>\s*<a href="([^"]*)"\s*>(.*?)</a>\s*<time datetime="([^"]*)"\s*>([^<]*)</time>\s*</li>',
    re.S,
)


def odir(run):
    """outputs/ の実体。run-1/ 配下に移した後もそのまま採点できるようにする。"""
    p = os.path.join(run, "run-1", "outputs")
    return p if os.path.isdir(p) else os.path.join(run, "outputs")


def read(p):
    try:
        return io.open(p, encoding="utf-8").read()
    except OSError:
        return ""


def entries(html):
    """<ul> 内の <li> を出現順に (href, text, datetime, shown) で返す。"""
    m = re.search(r"<ul>(.*?)</ul>", html, re.S)
    if not m:
        return []
    return LI_RE.findall(m.group(1))


def pre_state(run):
    """編集前の site/index.html（サンドボックスの HEAD）。"""
    try:
        return subprocess.run(
            ["git", "-C", os.path.join(run, "repo"), "show", "HEAD:site/index.html"],
            capture_output=True, text=True, check=True,
        ).stdout
    except Exception:
        return ""


def li_lines(html):
    return [l for l in html.splitlines() if "<li>" in l]


def added_removed(pre, post):
    a = li_lines(pre)
    b = li_lines(post)
    return [l for l in b if l not in a], [l for l in a if l not in b]


def ok(text, passed, evidence):
    return {"text": text, "passed": bool(passed), "evidence": evidence}


def desc(dates):
    return dates == sorted(dates, reverse=True)


def grade_eval0(run):
    post = read(os.path.join(odir(run), "index.html"))
    pre = pre_state(run)
    es = entries(post)
    hrefs = [e[0] for e in es]
    dates = [e[2] for e in es]
    tgt = [e for e in es if "go-coverage" in e[0]]
    add, rem = added_removed(pre, post)
    raw_li = [l for l in post.splitlines() if "go-coverage" in l]
    out = []
    out.append(ok("go-coverage の <li> が一覧に追加されている", bool(tgt),
                  "href 一覧: %s" % hrefs))
    out.append(ok("href が ./go-coverage/ 形式（末尾スラッシュあり・.html なし）",
                  bool(tgt) and tgt[0][0] == "./go-coverage/",
                  "href=%r" % (tgt[0][0] if tgt else None)))
    out.append(ok("<time> の datetime と表示テキストが frontmatter の 2026-04-19 と一致",
                  bool(tgt) and tgt[0][2] == "2026-04-19" and tgt[0][3].strip() == "2026-04-19",
                  "datetime=%r text=%r" % ((tgt[0][2], tgt[0][3]) if tgt else (None, None))))
    out.append(ok("リンクテキストが frontmatter の title と完全一致",
                  bool(tgt) and tgt[0][1].strip() == "なぜGoのカバレッジはstmtとfnなのか",
                  "text=%r" % (tgt[0][1].strip() if tgt else None)))
    out.append(ok("一覧全体が日付の降順（go-coverage が pumlv-go と go-generics の間に入る）",
                  desc(dates) and hrefs == ["./pumlv-go/", "./go-coverage/", "./go-generics/"],
                  "順序: %s" % list(zip(hrefs, dates))))
    out.append(ok("差分が <li> 1 行の追加のみ（既存 2 行は無変更）",
                  len(add) == 1 and len(rem) == 0,
                  "追加=%d 削除=%d" % (len(add), len(rem))))
    out.append(ok("<li> が 1 行に収まり、インデントが半角スペース 6",
                  len(raw_li) == 1 and raw_li[0].startswith("      <li>") and raw_li[0].rstrip().endswith("</li>"),
                  "行数=%d 先頭=%r" % (len(raw_li), raw_li[0][:14] if raw_li else None)))
    return out


def grade_eval1(run):
    post = read(os.path.join(odir(run), "index.html"))
    pre = pre_state(run)
    resp = read(os.path.join(odir(run), "response.md"))
    diff = read(os.path.join(odir(run), "diff.txt"))
    es = entries(post)
    tgt = [e for e in es if "rust-async" in e[0]]
    asked = any(k in resp for k in ["発表日", "日付", "いつ", "date"]) and "?" in resp.replace("？", "?")
    out = []
    out.append(ok("勝手な日付で rust-async の <li> を追加していない", not tgt,
                  "rust-async のエントリ数=%d" % len(tgt)))
    out.append(ok("テンプレ初期値 2026-01-01 を index.html に書き込んでいない",
                  "2026-01-01" not in post, "2026-01-01 の出現=%s" % ("2026-01-01" in post)))
    out.append(ok("response.md で発表日をユーザーに確認している", asked,
                  "response.md 冒頭: %r" % resp[:160]))
    out.append(ok("site/index.html を変更していない（保留して止まった）",
                  post.strip() == pre.strip() and "site/index.html" not in diff,
                  "index.html 同一=%s / diff 長=%d" % (post.strip() == pre.strip(), len(diff))))
    return out


def grade_eval2(run):
    post = read(os.path.join(odir(run), "index.html"))
    pre = pre_state(run)
    es = entries(post)
    hrefs = [e[0] for e in es]
    dates = [e[2] for e in es]
    gr = [e for e in es if "go-rust-compare" in e[0]]
    tt = [e for e in es if "testing-tips" in e[0]]
    add, rem = added_removed(pre, post)
    pum_pre = [l for l in li_lines(pre) if "pumlv-go" in l]
    pum_post = [l for l in li_lines(post) if "pumlv-go" in l]
    raw_new = [l for l in post.splitlines()
               if "go-rust-compare" in l or "testing-tips" in l]
    out = []
    out.append(ok("go-rust-compare の <li> が追加されている", bool(gr), "href 一覧: %s" % hrefs))
    out.append(ok("title の & が &amp; にエスケープされている（生 & / 二重エスケープでない）",
                  bool(gr) and gr[0][1].strip() == "Go &amp; Rust の比較",
                  "リンクテキスト=%r" % (gr[0][1].strip() if gr else None)))
    out.append(ok("testing-tips の <li> が追加されている", bool(tt), "href 一覧: %s" % hrefs))
    out.append(ok("並び順が 2026-08-20 → 2026-07-29 → 2026-06-10 の降順",
                  desc(dates) and dates == ["2026-08-20", "2026-07-29", "2026-06-10"],
                  "日付順: %s" % dates))
    out.append(ok("既存の pumlv-go 行が一字一句変更されていない",
                  pum_pre == pum_post and len(pum_post) == 1,
                  "変更前後一致=%s 件数=%d" % (pum_pre == pum_post, len(pum_post))))
    out.append(ok("追加された 2 件の href がどちらも ./<name>/ 形式",
                  bool(gr) and bool(tt) and gr[0][0] == "./go-rust-compare/" and tt[0][0] == "./testing-tips/",
                  "href=%s" % [e[0] for e in (gr + tt)]))
    out.append(ok("差分が <li> 2 行の追加のみ（既存行の巻き添え変更なし）",
                  len(add) == 2 and len(rem) == 0, "追加=%d 削除=%d" % (len(add), len(rem))))
    out.append(ok("追加した <li> がそれぞれ 1 行・インデント半角 6",
                  len(raw_new) == 2 and all(
                      l.startswith("      <li>") and l.rstrip().endswith("</li>") for l in raw_new),
                  "行数=%d" % len(raw_new)))
    return out


GRADERS = {
    "eval-0-insert-mid-list": grade_eval0,
    "eval-1-template-default-date": grade_eval1,
    "eval-2-multi-deck-escaping": grade_eval2,
}


def main(iteration):
    for name, fn in GRADERS.items():
        for cfg in ("with_skill", "without_skill"):
            run = os.path.join(iteration, name, cfg)
            if not os.path.isdir(run):
                continue
            exps = fn(run)
            passed = sum(1 for e in exps if e["passed"])
            rate = round(passed / len(exps), 4) if exps else 0.0
            result = {
                "eval_name": name,
                "configuration": cfg,
                "expectations": exps,
                "passed": passed,
                "total": len(exps),
                "pass_rate": rate,
                "summary": {
                    "passed": passed,
                    "failed": len(exps) - passed,
                    "total": len(exps),
                    "pass_rate": rate,
                },
            }
            dest = os.path.join(run, "run-1")
            if os.path.isdir(dest):
                run = dest
            with io.open(os.path.join(run, "grading.json"), "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            print("%-30s %-14s %d/%d" % (name, cfg, passed, len(exps)))
            for e in exps:
                if not e["passed"]:
                    print("    FAIL: %s  [%s]" % (e["text"], e["evidence"]))


if __name__ == "__main__":
    main(sys.argv[1])
