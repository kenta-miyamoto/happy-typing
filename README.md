# Happy Typing

日本語フレーズをローマ字で入力して練習できる、ブラウザだけで動くタイピング練習アプリです。

公開ページ: [https://kenta-miyamoto.github.io/happy-typing/](https://kenta-miyamoto.github.io/happy-typing/)

![Happy Typingのコース選択画面](assets/readme/happy-typing-home.jpg)

## 特徴

- プリセットから練習コースを選んで開始
- 1プレイ最大10問をランダム出題
- 日本語の出題文、かな、入力するローマ字ガイドを表示
- `shi` / `si`、`chi` / `ti`、`tsu` / `tu` など複数のローマ字入力に対応
- 入力済み、現在位置、未入力、ミスタイプを文字単位で表示
- ミスタイプしたワードだけを結果画面から再挑戦
- タイム、入力数、平均毎秒タイプ数を表示
- Web Audio APIによる打鍵音とミスタイプ音
- ビルド不要の静的HTML/CSS/JavaScript構成

## 使い方

1. コース選択画面で練習したいプリセットを選びます。
2. プレイ画面で `Space` を押して開始します。
3. 表示されたローマ字をキーボードで入力します。
4. 1ワードを最後まで入力すると自動で次の問題へ進みます。
5. 結果画面で、ミスしたワードだけ再挑戦できます。

プレイ中に `Escape` を押すと、現在のプレイを最初からやり直せます。右上の音符ボタンでサウンドのオン/オフを切り替えられます。

## 収録プリセット

| プリセット | ワード数 |
| --- | ---: |
| 基本フレーズ | 12 |
| プログラミング用語 | 12 |
| 寿司打 10文字 | 127 |
| 寿司打 11文字 | 107 |
| 寿司打 12文字 | 106 |
| 寿司打 13文字 | 95 |
| 寿司打 14文字 | 118 |

## ローカルで動かす

このアプリは `fetch()` でプリセットJSONを読み込むため、`index.html` を直接開くのではなくローカルサーバー経由で起動してください。

```sh
python3 -m http.server 8000
```

ブラウザで次のURLを開きます。

```text
http://localhost:8000/
```

## ファイル構成

```text
.
├── index.html
├── styles.css
├── app.js
├── assets/
│   ├── enter-kun-logo.png
│   ├── favicon.png
│   └── readme/
│       └── happy-typing-home.jpg
└── presets/
    ├── index.json
    ├── basic.json
    ├── programming.json
    └── sushida-*.json
```

## プリセットを追加する

`presets/` にJSONファイルを追加し、`presets/index.json` の `presets` 配列へファイルパスを登録します。

```json
{
  "id": "example",
  "title": "サンプル",
  "description": "説明文をここに書きます。",
  "items": [
    {
      "text": "表示する日本語",
      "kana": "ひょうじするにほんご"
    }
  ]
}
```

- `text`: 画面に大きく表示する出題文
- `kana`: ローマ字入力候補を生成するための読み

## 技術メモ

- フレームワークなしのシングルページアプリです。
- ローマ字候補は `app.js` 内のかなマップから生成しています。
- 出題、ミスタイプ記録、再挑戦対象はブラウザ上の状態として管理しています。
- 外部音声ファイルは使わず、効果音はWeb Audio APIで生成しています。
