---
marp: true
theme: dc
paginate: true
size: 16:9
title: tinygo.vimとgopls-lazyが噛み合わなかった話
description: TinyGo開発時にgopls-lazy経由でパッケージを解決できなくなった問題と、その原因・回避策について
date: 2026-10-20
---

<!-- _class: cover -->

# tinygo.vimとgopls-lazyが<br>噛み合わなかった話

Rinrin — [@rin2yh](https://x.com/rin2yh)

---

<!-- _class: profile -->

## 自己紹介

![](./public/shared/icon.jpg)

| | |
|---|---|
| 名前 | Rinrin |
| 職種 | フルスタックエンジニア |
| 趣味 | アニメ、ゲーム、キーボード |
| ひとこと | 最寄り駅から田町まで直線距離14.3km |

---

## 目次

1. 前提
2. 起きたこと
3. 原因の調査
4. 対応

---

<!-- _class: section -->

SECTION 01

# 前提

---

## [tinygo.vim](https://github.com/sago35/tinygo.vim)とは

- TinyGo向けのVim/Neovimプラグイン
- `:TinygoTarget` でターゲットに応じた設定を適用
- `GOROOT`、`GOOS`、`GOARCH`、`GOFLAGS` をgoplsに設定
- 設定後にgoplsを再起動



---

## [gopls-lazy](https://github.com/sivchari/gopls-lazy)とは

- goplsの前段で動作するLSPプロキシ
- 大規模ワークスペースでの解析負荷を軽減
  - 解析範囲の制御
  - パッケージ情報のキャッシュ

---

## 今回の開発環境

- Neovim + gopls-lazy + tinygo.vim
- TinyGoでは通常のGoと異なる環境でパッケージを解析する
  - 例：`wioterminal` では `GOOS=linux`、`GOARCH=arm`、TinyGo用の `GOROOT` を使用
- `.tinygo.json` でターゲットを指定
- dotfiles側で `:TinygoTarget` を自動実行

```json
{
  "target": "wioterminal"
}
```



---

<!-- _class: section -->

SECTION 02

# 起きたこと

---

## NeovimでTinyGoのパッケージを解決できない

![w:1450](./public/tinygo-gopls-lazy/error-screen.png)

---

## `machine` のパッケージ解決はどこで失敗するのか？

**TinyGoの環境を揃えて、実行方法ごとに比較**

| 検証方法 | `machine` の解決 |
|---|---|
| `go list machine` | 成功 |
| `go list ./...` | 成功 |
| gopls | 成功 |
| gopls-lazy v0.4.1 | 失敗 |

**→ gopls-lazyを経由した場合にのみ失敗**

---

<!-- _class: section -->

SECTION 03

# 原因の調査

---

## 仮説①：gopls-lazyがTinyGoの環境変数を引き継いでいない

**検証：gopls-lazyと、そこから起動されたgoplsの環境変数を確認**

| プロセス | `GOROOT` | `GOOS` | `GOARCH` | `GOFLAGS` |
|---|---|---|---|---|
| gopls-lazy | TinyGo用 | `linux` | `arm` | wioterminal用 |
| gopls | TinyGo用 | `linux` | `arm` | wioterminal用 |

**結果：どちらのプロセスにもTinyGoの環境変数が設定されていた**



---

## 仮説②：古いキャッシュが再利用されている

**検証方法**
- 保存済みの解析結果をコピーした保存先と、空の保存先を用意
- 比較用Luaスクリプトで `vim.lsp.start()` の `cmd_env.HOME` を切り替える
- 同じTinyGo環境でそれぞれのgopls-lazyを起動して比較

**検証結果**

| 起動前のキャッシュ | `machine` の解決 |
|---|---|
| あり | 失敗 |
| なし | 成功 |

**→ キャッシュの有無がパッケージ解決に影響していた**

<!-- 口頭：gopls-lazyはHOME配下にキャッシュを保存するため、`cmd_env.HOME`を変更して保存先を分けました。キャッシュあり・なしの状態を用意し、同じTinyGo環境で解析結果を比較しました。 -->

---

## キャッシュの中身を比較

**検証方法**
- キャッシュ内の `resp`（Base64形式のJSON）をデコード
- `Packages` から `PkgPath == "machine"` の `Errors` を確認
- エラー内のパスをTinyGoの `GOROOT` と照合

**検証結果**
- **起動前にキャッシュあり：** Go 1.25.14の `GOROOT` を参照するエラー
- **起動前にキャッシュなし：** 起動後に生成されたキャッシュの `Errors` は空

**→ 通常のGo環境の解析結果がTinyGoでも再利用されていた**

---

<!-- _class: section -->

SECTION 04

# 対応

---

## TinyGoではgoplsを直接起動

**今回はgopls-lazy自体を修正せず、利用側で回避**

- gopls-lazyとTinyGoを併用するケースは少ないと考えた
- 通常の開発ではgopls-lazyを引き続き使いたい
- `.tinygo.json` に `target` がある場合のみgoplsを直接起動

```lua
local cmd = vim.deepcopy(vim.lsp.config.gopls.cmd)
cmd[#cmd] = 'gopls'
vim.lsp.config('gopls', { cmd = cmd })
```

---

## 修正前後で変わったgoplsの起動経路

![h:640](./public/tinygo-gopls-lazy/flowchart-before-after.svg)


---

## まとめ

- TinyGoとgopls-lazyの併用でパッケージ解決に失敗
- 通常のGo環境で作られた古い解析結果がTinyGoでも再利用されていた
- TinyGoではgoplsを直接起動して回避


---

<!-- _class: logo -->

## GopherCon Japan 2027

![w:1050](./public/tinygo-gopls-lazy/gophercon-japan-2027-main-visual.webp)

# CfP締切まであと1週間！

**10月25日（日）23:59 JST 締切**

初登壇の方も歓迎！

応募：[gophercon.jp/ja/2027/cfp/](https://gophercon.jp/ja/2027/cfp/)

| ![w:200](./public/tinygo-gopls-lazy/cfp-qr.png) | 応募用QRコード |
|---|---|

---

<!-- _class: cover -->

# ご清聴いただき、<br>ありがとうございました

Rinrin — [@rin2yh](https://x.com/rin2yh)

---

## 参考資料

- [gopls-lazy](https://github.com/sivchari/gopls-lazy)
- [gopls-lazy v0.4.1 graph.go](https://github.com/sivchari/gopls-lazy/blob/v0.4.1/graph.go)
- [tinygo.vim](https://github.com/sago35/tinygo.vim)
- [rin2yh/dotfiles](https://github.com/rin2yh/dotfiles)

<!-- 発表では説明しない予備スライド -->

---

## 補足：キャッシュの仕組み

**保存済みキャッシュを先に返し、必要に応じてバックグラウンドで再検証する**

![h:700](./public/tinygo-gopls-lazy/seq-cache.svg)

<!-- 発表では説明しない予備スライド -->
