# diagrams

`slides/public/` に置いている図のソース。SVG は生成物なので、直すときはこちらを直して同名で再生成する。

`public/` と同じくデッキごとにディレクトリを切る。`slides/diagrams/<deck>/arch.puml` → `slides/public/<deck>/arch.svg` のように、ディレクトリとファイル名を対応させる。

PlantUML は Java を入れずに **pumlv 自身**で描ける。`pumlv .` でこのディレクトリを開き、表示された図を SVG として保存する。
Mermaid 側は mermaid の CLI などで SVG 化する。

生成した SVG は `<img>` 参照になるため Web フォントが効かない。端末にあるフォントへフォールバックさせる必要があるので、
`font-family` に `'Hiragino Sans'` を含めてある。差し替えるときも同様にしておくこと。
