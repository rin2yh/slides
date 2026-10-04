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
| 所属 | 株式会社スリーシェイク |
| 職種 | フルスタックエンジニア |
| 趣味 | アニメ、ゲーム、キーボード |
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

## ゴール

### TinyGoの実装を通して、HIDデバイスからホストへ入力が伝わるまでの基本的な仕組みを理解する

ポイント

- 入力がどのようなデータとして表現されるか
- TinyGoの中で入力がどのように処理されるか
- HIDデバイスからホストへどう伝わるか

---

## おことわり

- HIDは深遠かつ時間の関係上、今回は一部をピックアップして話す
    - 今回はHIDの音量調節のみ
    - 他のHIDも、同様の方法で理解できるはず！
- TinyGoの実装とHIDの仕様にフォーカスし、OS内部の実装までは深掘りしない
    - デバイス側はReport生成〜USB送信まで
    - USBホストのPC側はHIDドライバによる解釈まで

※ 筆者はまだHIDに明るくないので、全てを理解している訳ではなく、誤りが含まれる可能性があります。
なるべく技術的な正確性を担保するよう努力していますが、もし誤りがあれば後でこっそり教えてください。

---

## HIDとは

**Human Interface Devices**の略。

- 人の操作をPCへ伝えるデバイスなどを、USB上で共通の方法で扱うための仕様。
- 1996年、USB-IFがHID over USB仕様を承認
    - USB-IF: USB Implementers Forum。USBの仕様を策定/管理する非営利団体
- 代表例：キーボード、マウス、ゲームパッド

[USB-IF: Human Interface Devices (HID) Specifications and Tools](https://www.usb.org/hid)

---

## Consumer Controlとは

HIDの中で、音量や再生・停止などのメディア関連の操作を扱うための分類。
一般にMedia Keyと呼ばれる。

例
- 音量調節: Volume Increment / Decrement, Mute
- 再生・停止: Play / Pause

---

<!-- _class: section -->

SECTION 02

# TinyGoの実装からHIDを理解する

---

## ロータリーエンコーダーから音量を操作する実装例


```go
func DispatchVolume(ev Event) {
    kb := keyboard.Port()

    switch {
    case ev.Delta > 0:
        kb.Press(keyboard.KeyMediaVolumeInc)
    case ev.Delta < 0:
        kb.Press(keyboard.KeyMediaVolumeDec)
    }
}
```
`ev.Delta`をロータリーエンコーダーの回転量として扱い、正負で回転方向を判定する。
`KeyMediaVolumeInc` / `KeyMediaVolumeDec`で音量調節を実行している。


[tiny-deck: media.go](https://github.com/rin2yh/tiny-deck/blob/da05a5741dfd91e2e95381abe14ff961055a0bcd/internal/keyboard/encoder/media.go)

---
## KeyMediaVolumeInc / Dec がTinyGo内部でどう扱われるか

```go
KeyMediaVolumeInc Keycode = 0xE9 | 0xE400
KeyMediaVolumeDec Keycode = 0xEA | 0xE400
// 省略...
func (kb *keyboard) Down(c Keycode) error {
    msb := uint8(c >> 8)
    // 省略...
    if 0xE4 <= msb && msb <= 0xE7 {
        // downCon()では値をkb.conに保持し、keyboardSendKeys(true)を呼び出す
        return kb.downCon(uint16(c & 0x03FF))
    }
    // 省略...
```

<!-- `Down()` は上位ビットを見て `downCon()` へ処理を分岐する。 -->

[TinyGo: keycode.go](https://github.com/tinygo-org/tinygo/blob/7bcf6656fa321f86f892bfe8abb6a252f31d0282/src/machine/usb/hid/keyboard/keycode.go#L98-L99) · [keyboard.go: Down()](https://github.com/tinygo-org/tinygo/blob/7bcf6656fa321f86f892bfe8abb6a252f31d0282/src/machine/usb/hid/keyboard/keyboard.go#L280-L310)

---

## Consumer Controlの値をUSB送信用のバイト列に変換する

```go
func (kb *keyboard) keyboardSendKeys(consumer bool) bool {
    var b [9]byte
    // 省略...
    if consumer {
        b[0] = 0x03 // REPORT_ID
        b[1] = uint8(kb.con[0])
        b[2] = uint8((kb.con[0] & 0x0300) >> 8)

        return kb.sendKey(consumer, b[:3])
    }
    // 省略...
```

HIDでやり取りするデータをReportと呼ぶ。REPORT_ID は、Reportの種類を示すID。
[TinyGo: keyboardSendKeys() / downCon()](https://github.com/tinygo-org/tinygo/blob/7bcf6656fa321f86f892bfe8abb6a252f31d0282/src/machine/usb/hid/keyboard/keyboard.go#L258-L279) · [SendUSBPacket()](https://github.com/tinygo-org/tinygo/blob/7bcf6656fa321f86f892bfe8abb6a252f31d0282/src/machine/usb/hid/hid.go#L97-L100)

---

## ReportをUSBに送信する

```go
func (kb *keyboard) sendKey(consumer bool, b []byte) bool {
    kb.tx(b)
    return true
}
// 省略...
func (kb *keyboard) tx(b []byte) {
    hid.SendUSBPacket(b)
}
// 省略...
func SendUSBPacket(b []byte) {
    machine.SendUSBInPacket(hidEndpoint, b)
}
```

`sendKey()` → `tx()` → `SendUSBPacket()` と処理が渡され、最後にReportがUSBへ送信される。

[TinyGo: keyboard.go — sendKey()](https://github.com/tinygo-org/tinygo/blob/7bcf6656fa321f86f892bfe8abb6a252f31d0282/src/machine/usb/hid/keyboard/keyboard.go#L253-L256) · [hid.go — SendUSBPacket()](https://github.com/tinygo-org/tinygo/blob/7bcf6656fa321f86f892bfe8abb6a252f31d0282/src/machine/usb/hid/hid.go#L97-L100)

---

## 実際に送信されるReport

ロータリーエンコーダを回しながら、Reportをキャプチャしたログ。

```sh
# 右回し
reportID=3 bytes=03 E9 00
# 操作後
reportID=3 bytes=03 00 00
# 左回し
reportID=3 bytes=03 EA 00
# 操作後
reportID=3 bytes=03 00 00
```

ログを見てよくわからないもの
- reportID=**3**
- bytesが表す内容

<!-- scriptはswiftで実装 by codex -->

---

## HID Usage Tables

Usageを定義した表。

- Usage: HID上の操作や機能を識別する32bitの値
    - Usage Page: 上位16bit。関連するUsageをまとめるための値
    - Usage ID: 下位16bit。そのUsage Page内のUsageを識別する値
- 今回扱う音量調節は、Consumer PageのUsageとして定義
    - Consumer Page: 音量や再生・停止などに関するUsageをまとめたUsage Page
---

## Consumer PageのUsage

列はUsage ID、Usage Name、Usage Type、Section。

![w:1050](./public/understanding-hid-through-tinygo/usage-tables.png)

出典：[HID Usage Tables 1.7, Consumer Page §15.9](https://www.usb.org/documents?search=HID+usage+tables)

---

## Report Descriptorとは

Reportの形式と各フィールドの意味をUSBホストへ伝えるデータ構造。

- 複数のItemを組み合わせて記述する
- Usage PageやUsageでデータの用途を示す
- Report SizeやReport Countでフィールドの大きさ・個数を示す

USBホストはReport Descriptorに記述された形式に従って、Reportを解釈する。

[USB-IF: Device Class Definition for HID 1.11](https://www.usb.org/document-library/device-class-definition-hid-111)

---

## TinyGoのConsumer Control Descriptor

TinyGoのUSB Descriptorは、Consumer ControlのInput Reportを次のItemで定義する。

```go
HIDUsagePageConsumer,
HIDReportID(3),
// Other Collection and range items are omitted
HIDReportSize(16),
HIDReportCount(1),
HIDInputDataAryAbs,
```

- Usage PageはConsumer、Report IDは3
- Report Size 16 × Report Count 1で、入力フィールドは16ビット
- InputはデバイスからUSBホストへ送る入力データを定義する

[TinyGo: descriptor/hid.go — Consumer Control](https://github.com/tinygo-org/tinygo/blob/7bcf6656fa321f86f892bfe8abb6a252f31d0282/src/machine/usb/descriptor/hid.go#L207-L218)

---

## Descriptorを使ってReportを読む

Report Descriptorで各バイトの役割を確認し、Usage TablesでUsageの意味を調べる。

| バイト | 読み方 |
|---|---|
| `03` | Descriptorで定義されたReport ID 3 |
| `E9 00` | 16ビットのUsage値 `0x00E9`。Consumer PageではVolume Increment |
| `EA 00` | 16ビットのUsage値 `0x00EA`。Consumer PageではVolume Decrement |
| `00 00` | Consumer Controlの押下なし |

---

<!-- _class: section -->

SECTION 03

# HIDがPCに届くまで

---

## 今回読んだコードの範囲

![w:1200](./public/understanding-hid-through-tinygo/seq-device.svg)

TinyGoのHID実装で、Media Keyの分岐からConsumer Control Reportの送信までのコードを読んだ。

---

## USBホスト（PC）がReportを解釈するまで

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
3. HIDドライバがDescriptorに従ってReportを解釈する
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
- TinyGo, [keycode.go](https://github.com/tinygo-org/tinygo/blob/7bcf6656fa321f86f892bfe8abb6a252f31d0282/src/machine/usb/hid/keyboard/keycode.go) · [keyboard.go](https://github.com/tinygo-org/tinygo/blob/7bcf6656fa321f86f892bfe8abb6a252f31d0282/src/machine/usb/hid/keyboard/keyboard.go) · [hid.go](https://github.com/tinygo-org/tinygo/blob/7bcf6656fa321f86f892bfe8abb6a252f31d0282/src/machine/usb/hid/hid.go) · [descriptor/hid.go](https://github.com/tinygo-org/tinygo/blob/7bcf6656fa321f86f892bfe8abb6a252f31d0282/src/machine/usb/descriptor/hid.go)
- rin2yh, [tiny-deck](https://github.com/rin2yh/tiny-deck)
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
| `Input` | デバイスからUSBホストへ送るデータを宣言 |

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

今回のConsumer Control ReportではUsageを16ビットで送る。HID Reportでは下位バイトから並ぶ。

```text
送信バイト: E9 00
値の組立て: 0x00 × 256 + 0xE9
Usage値:     0x00E9
```

TinyGoの`keyboardSendKeys()`も、Usageの下位バイトを先に書き出している。
