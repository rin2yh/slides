---
marp: true
theme: dc
paginate: true
size: 16:9
title: TinyGoの実装からHIDを理解する
description: tiny-deckの音量操作を例に、HID Consumer Control ReportがUSBホストとOSへ届く仕組みを説明する。
date: 2026-10-02
---

<!-- _class: cover -->

# TinyGoの実装から<br>HIDを理解する

Rinrin — [@rin2yh](https://x.com/rin2yh)

---

<!-- _class: profile -->

## 自己紹介

![](./public/shared/icon.jpg)

| 名前 | Rinrin |
|---|---|
| 職種 | フルスタックエンジニア |
| 趣味 | アニメ、ゲーム、キーボード |
| TinyGo歴 | 〜半年 |
| ひとこと | 親知らず全部抜いてクリーンに。ジャンクフード食べたい！ |

---

## 目次

1. 導入
2. TinyGoの実装からHIDを理解する
3. HIDがPCに届くまで
4. まとめ

---

<!-- _class: section -->

SECTION 01

# 導入

---

## このセッションに至った経緯

tiny-deckは、tinygo-keebで作ったzero-kb02を使ってMacを少し便利にするプロジェクト。

- tiny-deckで普段使いできるzero-kb02を目指す
- 作る過程でHIDをふわっと理解した
- もう少しちゃんと知りたくなった

**仮説：組み込み系が苦手なWebアプリ開発者のGopherでも、TinyGoを入口にするとハードウェア寄りの話に近づきやすいのではないか。**

[rin2yh/tiny-deck](https://github.com/rin2yh/tiny-deck)

---

## HIDとは

HIDは**Human Interface Devices**の略。

人の操作をPCへ伝えるデバイスなどを、USB上で共通の方法で扱うためのクラス仕様。

- 代表例：キーボード、マウス、ゲームパッド
- データの読み方はReport Descriptorでデバイス自身が説明する

[USB-IF: Human Interface Devices (HID) Specifications and Tools](https://www.usb.org/hid)

---

<!-- _class: section -->

SECTION 02

# TinyGoの実装からHIDを理解する

---

## tiny-deckからHIDを使う

ロータリーエンコーダーを回して音量を操作する。

```go
keyboard.KeyMediaVolumeInc // 音量を上げる
keyboard.KeyMediaVolumeDec // 音量を下げる
```

TinyGoでは`keyboard`パッケージからMedia Keyを送る。

**このキーはHID仕様上の「Keyboard」ではなく「Consumer Control」。**

[tiny-deck: internal/keyboard/encoder/media.go](https://github.com/rin2yh/tiny-deck/blob/main/internal/keyboard/encoder/media.go)

---

## Media KeyがConsumer Controlとして処理されるまで

TinyGoの`Keycode`は、キーの種類を上位ビットで表す。

```go
KeyMediaVolumeInc Keycode = 0xE9 | 0xE400
KeyMediaVolumeDec Keycode = 0xEA | 0xE400
```

`Down()`は上位部分`0xE4`を見て、Consumer Control用の`downCon()`へ渡す。

`0xE9` / `0xEA` は後でHID Usageとして解釈される値。

[TinyGo: keycode.go](https://github.com/tinygo-org/tinygo/blob/dev/src/machine/usb/hid/keyboard/keycode.go#L98-L99) · [keyboard.go: Down / downCon](https://github.com/tinygo-org/tinygo/blob/dev/src/machine/usb/hid/keyboard/keyboard.go#L280-L310)

---

## Consumer Control Reportを組み立ててUSBへ送るまで

`downCon()`がUsageを保持し、`keyboardSendKeys()`がReportを組み立てる。`SendUSBPacket()`はReportをUSB INエンドポイントへ送る。

```go
// keyboardSendKeys() のConsumer Control Report
b[0] = 0x03 // REPORT_ID
b[1] = uint8(kb.con[0])
b[2] = uint8((kb.con[0] & 0x0300) >> 8)

// SendUSBPacket()
machine.SendUSBInPacket(hidEndpoint, b)
```

[TinyGo: keyboardSendKeys() / downCon()](https://github.com/tinygo-org/tinygo/blob/dev/src/machine/usb/hid/keyboard/keyboard.go#L258-L279) · [SendUSBPacket()](https://github.com/tinygo-org/tinygo/blob/dev/src/machine/usb/hid/hid.go#L97-L100)

---

## HID Reportとは

HIDデバイスとUSB Hostの間でやり取りする、入力・出力・状態などの実データ。

たとえば今回のReportには「どのReportか」と「どのConsumer Usageか」が入る。


---

## 実機でReportを観測する

tiny-deckのロータリーエンコーダーを操作し、macOSのIOKit / IOHIDManager経由でSwiftからInput Reportをキャプチャ。

| 操作 | 観測したReport |
|---|---|
| 右回し | `03 E9 00` |
| 左回し | `03 EA 00` |
| 操作後 | `03 00 00` |

この時点では、値の意味までは読み解かない。

---

## Report Descriptorとは

Report Descriptorは、Reportの形式と各フィールドの意味をUSB Hostへ伝えるデータ構造。

- 複数の **Item** を組み合わせて記述する
- Usage PageやUsageでデータの用途を示す
- Report SizeやReport Countでフィールドの大きさ・個数を示す

ホストはReport Descriptorに記述された形式に従って、Reportを解釈する。

[USB-IF: Device Class Definition for HID 1.11](https://www.usb.org/document-library/device-class-definition-hid-111)

---

## HID Usage Tables

Usage TablesはUsage IDとその意味を定義する。Usage PageはUsageの分類単位で、Usageはその中の具体的な機能を示す。

---

## Consumer PageのUsage

Consumer Page（Usage Page `0x0C`）の抜粋。列はUsage ID、Usage Name、Usage Type、Section。

![w:1050](./public/understanding-hid-through-tinygo/usage-tables.png)

出典：[HID Usage Tables 1.7, Consumer Page §15.9](https://www.usb.org/documents?search=HID+usage+tables)

---

## Descriptorを使ってReportを読む

観測した3バイトを、Report DescriptorとUsage Tablesを使って解釈する。

| バイト | 読み方 |
|---|---|
| `03` | Report ID 3 |
| `E9 00` | Consumer Usage `0x00E9` = Volume Increment |
| `EA 00` | Consumer Usage `0x00EA` = Volume Decrement |
| `00 00` | Consumer Controlの押下なし |

---

<!-- _class: section -->

SECTION 03

# HIDがPCに届くまで

---

## 今回読んだコードの範囲

![w:1200](./public/understanding-hid-through-tinygo/seq-device.svg)

ロータリーエンコーダーの入力からReportをUSBへ送信するまでのコードを読んだ。

---

## USB Host（PC）がReportを解釈するまで

![w:1200](./public/understanding-hid-through-tinygo/seq-host.svg)

OS内部の具体的な実装はOSごとに異なるが、HID Usageを音量操作として扱う。

---

<!-- _class: section -->

SECTION 04

# まとめ

---

## HIDの入力がPCで扱われるまで

1. ロータリーエンコーダーの入力をTinyGo側でMedia Keyとして扱う
2. TinyGoのHID実装がConsumer Control Reportを生成してUSBへ送る
3. USB HostがDescriptorに従ってReportを解釈する
4. OSが音量操作として処理する

---

<!-- _class: cover -->

# ご清聴いただき、<br>ありがとうございました

Rinrin — [@rin2yh](https://x.com/rin2yh)

---

## 参考文献

- USB-IF, [Human Interface Devices (HID) Specifications and Tools](https://www.usb.org/hid)
- USB-IF, [Device Class Definition for HID 1.11](https://www.usb.org/document-library/device-class-definition-hid-111)
- USB-IF, [HID Usage Tables 1.7](https://www.usb.org/documents?search=HID+usage+tables)
- TinyGo, [keycode.go](https://github.com/tinygo-org/tinygo/blob/dev/src/machine/usb/hid/keyboard/keycode.go) · [keyboard.go](https://github.com/tinygo-org/tinygo/blob/dev/src/machine/usb/hid/keyboard/keyboard.go) · [hid.go](https://github.com/tinygo-org/tinygo/blob/dev/src/machine/usb/hid/hid.go)
- rin2yh, [tiny-deck](https://github.com/rin2yh/tiny-deck) · [media encoder](https://github.com/rin2yh/tiny-deck/blob/main/internal/keyboard/encoder/media.go)
- ITF, [HIDクラス](https://itf.co.jp/tech/road-to-usb-master/hid_class)
- おなかすいたWiki, [レポートディスクリプタ](https://wiki.onakasuita.org/pukiwiki/?%E3%83%AC%E3%83%9D%E3%83%BC%E3%83%88%E3%83%87%E3%82%A3%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%97%E3%82%BF)
- nozo, [Zenn Scrap](https://zenn.dev/nozo/scraps/3bb14d03e682af)

---

## 付録：Report DescriptorのItem

| Item | 役割 |
|---|---|
| `Usage Page` | Usageの分類を選ぶ（例：Consumer） |
| `Usage` | フィールドやCollectionの用途を示す |
| `Report Size` | 1フィールドあたりのビット数 |
| `Report Count` | フィールドの個数 |
| `Input` | デバイスからホストへ送るデータを宣言 |

値の範囲を扱うItemとして`Logical Minimum / Maximum`などもある。

---

## 付録：Usage PageとUsageの構造

- Usage Pageは大分類。例：Generic Desktop、Keyboard/Keypad、Consumer
- Usageは、そのPage内で意味を持つ識別子
- 同じUsage番号でも、Usage Pageが異なれば意味は異なる

したがって、`0xE9`だけでは意味が定まらない。

**Consumer PageのUsage `0xE9`は、Volume Incrementを表す。**

---

## 付録：`E9 00`とlittle-endian

Consumer Usageは16ビット値。HID Reportでは下位バイトから並ぶ。

```text
送信バイト: E9 00
値の組立て: 0x00 × 256 + 0xE9
Usage値:     0x00E9
```

TinyGoの`keyboardSendKeys()`も、Usageの下位バイトを先に書き出している。
