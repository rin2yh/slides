---
marp: true
theme: 3shake
paginate: true
size: 16:9
title: TinyGoから理解するHID
description: tiny-deckの音量操作を例に、HID Consumer Control ReportがUSBホストとOSへ届く仕組みを説明する。
date: 2026-10-02
---

<!-- _class: cover -->

# TinyGoから理解するHID

Rinrin — [@rin2yh](https://x.com/rin2yh)

---

<!-- _class: profile -->

## 自己紹介

![](./public/shared/icon.jpg)

- 名前: Rinrin
- 所属: 株式会社スリーシェイク
- 職種: フルスタックエンジニア
- 趣味: アニメ、ゲーム、キーボード
- ひとこと: 親知らず全部抜いてクリーンに。ジャンクフード食べたい！

---

## 目次

1. 導入
2. TinyGoで入力が送信されるまで
3. 送信されたデータの意味を理解する
4. HIDがPCに届くまで

---

<!-- _class: section -->

SECTION 01

# 導入

---

## ゴール

### TinyGoの実装を通して、HIDデバイスからUSBホストへ入力が伝わるまでの基本的な仕組みを理解する

ポイント

- 入力がどのようなデータとして表現されるか
- TinyGoの中で入力がどのように処理されるか
- HIDデバイスからUSBホストへどう伝わるか

---

## おことわり

- HIDは深遠かつ時間の関係上、今回は一部をピックアップして話す
    - 今回はHIDの音量調節のみ
    - 他のHIDも、同様の方法で理解できるはず！
- TinyGoの実装とHIDの仕様にフォーカスし、OS内部の実装までは追わない
    - デバイス側はReport生成〜USB送信まで
    - USBホストのPC側はHIDドライバによる解釈まで

※ 筆者はまだHIDに明るくなく、全てを理解しているわけではありません。誤りを含む可能性があります。
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

# TinyGoで入力が送信されるまで

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
`KeyMediaVolumeInc` / `KeyMediaVolumeDec`で音量を調節している。


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

<!-- KeyMediaVolumeInc の値は 0xE4E9。上位の 0xE4 はTinyGoが付けた「Consumer Controlのキー」という目印で、下位の 0xE9 はHIDで決められた Volume Increment の値。 -->
<!-- Down() は上位バイトを見てキーの種類を判定する。0xE4〜0xE7 なら Consumer Control なので downCon() に渡す。 -->
<!-- c & 0x03FF で目印を外し、0xE9 だけを kb.con（押下中の Consumer Control キーを保持する配列）に入れる。 -->

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
<!-- kb.con[0] の値を下位バイト・上位バイトに分け、Report ID 03 と合わせて3バイトのReportを作る。 -->

HIDでやり取りするデータをReportと呼ぶ。REPORT_ID は、Reportの種類を示すID。
<!-- Reportのデータ構造: Report Descriptorは付録に入れています -->
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
# クリア
reportID=3 bytes=03 00 00
# 左回し
reportID=3 bytes=03 EA 00
# クリア
reportID=3 bytes=03 00 00
```

ログを見てよくわからないもの
- bytesの`E9 00`
    - `03`はReport ID(スライド12枚目の`keyboardSendKeys()`を参照)

<!-- scriptはswiftで実装 by codex -->

---

<!-- _class: section -->

SECTION 03

# 送信されたデータの意味を理解する

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

<!-- Consumer Page（Usage Page `0x0C`）から、今回扱うUsageを抜粋。 -->

| Usage ID | Usage Name | Usage Type | Section |
|---|---|---|---|
| `0xE9` | Volume Increment | RTC | 15.9 |
| `0xEA` | Volume Decrement | RTC | 15.9 |

<!-- RTCとあるが、抜粋しただけなのと今回は見なくて良いので気にしないでください。RTC: Re-trigger Control, 「値が 1 の間、イベント完了後に再度イベントを発生させる」タイプの Control -->

出典：[HID Usage Tables 1.7, Consumer Page §15.9](https://www.usb.org/documents?search=HID+usage+tables)

---

## E9 00の意味

| バイト | 読み方 |
|---|---|
| `03` | Report ID 3 |
| `E9 00` | 16ビットのUsage値 `0x00E9`。Consumer PageではVolume Increment |
| `EA 00` | 16ビットのUsage値 `0x00EA`。Consumer PageではVolume Decrement |
| `00 00` | Consumer Controlの押下なし |


<!-- E9 00 は16bitの値で、little-endianなので 0x00E9 と読む -->

---

<!-- _class: section -->

SECTION 04

# HIDがPCに届くまで

---

## 今回読んだコードの範囲

![w:780](./public/understanding-hid-through-tinygo/seq-device.svg)

<!-- TinyGoのHID実装で、Media Keyの分岐からConsumer Control Reportの送信までのコードを読んだ。 -->

---

## USBホストがReportを解釈するまで

![w:1440](./public/understanding-hid-through-tinygo/seq-host.svg)
<!-- USBホストがReportを受け取ったあと、HIDドライバがHIDの入力として解釈する。 -->
<!-- その結果がOS側の入力処理に渡されて、最終的にVolume Incrementとして音量変更に反映される。 -->
<!-- OS内部の具体的な実装はOSごとに異なるが、HID Usageを音量操作として扱う。 -->

---

## まとめ：HIDデバイスからUSBホストへ入力が伝わるまで

1. ロータリーエンコーダー側で入力を発生させる
2. マイコン側でTinyGoのHID実装がConsumer Control Reportを生成してUSBへ送る
3. PC側でHIDドライバがReportを解釈する
4. PC側でOSが音量操作として処理する

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


<!-- _class: section -->

# 付録

---

## Report Descriptorとは

Reportの形式と各フィールドの意味をUSBホストへ伝えるデータ構造。

- 複数のItemを組み合わせて記述する
    - Item: Report Descriptor内に並ぶ、Usage PageやReport Sizeなどの設定項目
- Usage PageやUsageでデータの用途を示す
- Report SizeやReport Countでフィールドの大きさ・個数を示す

USBホストはReport Descriptorに記述された形式に従って、Reportを解釈する。

[USB-IF: Device Class Definition for HID 1.11](https://www.usb.org/document-library/device-class-definition-hid-111)

---

## Report DescriptorのItem

| Item | 役割 |
|---|---|
| `Usage Page` | Usageの分類を選ぶ（例：Consumer） |
| `Usage` | フィールドやCollectionの用途を示す |
| `Report Size` | 1フィールドあたりのビット数 |
| `Report Count` | フィールドの個数 |
| `Input` | デバイスからUSBホストへ送るデータを宣言 |

値の範囲を扱うItemとして`Logical Minimum / Maximum`などもある。

---

## little-endianとは

複数バイトで1つの値を表すときに、下位バイトから順に並べる方式。（逆はbig-endian）

- 16bit値 `0x1234`
- little-endian: `34 12`
- big-endian: `12 34`

