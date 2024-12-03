// block.js

// 必要なモジュールや定数をインポート
import { blocks } from "./constants.js";
import { isHit, eraseLine, consumeBlock } from "./gameLogic.js";
import { drawBlock } from "./draw.js";
import { field, keyevents, count, interval, score } from "./main.js";

// サウンドオブジェクトの作成
export const dropSound = new Audio("block_touch_sound.wav");

// ランダムな整数を生成する関数
export function rand(r) {
  return Math.floor(Math.random() * r);
}

// ブロックのクラス定義
export function Block() {
  this.turn = rand(4); // ブロックの回転状態（0〜3）
  this.type = blocks[rand(blocks.length)]; // ブロックの種類をランダムに選択
  this.data = this.type[this.turn]; // 選択されたブロックの現在の回転状態のデータ

  this.w = Math.sqrt(this.data.length); // ブロックの幅（2, 3, 4）
  this.x = rand(6 - this.w) + 2; // ブロックの初期のx座標（フィールドの中央付近に配置）
  this.y = 1 - this.w; // ブロックの初期のy座標（フィールドの上部から出現）
  this.fire = interval.value + count.value; // ブロックが次に落下するタイミング

  this.update = function () {
    // ブロックの位置や状態を更新
    if (isHit(this.x, this.y + 1, this.turn)) {
      // ブロックが下に移動できない場合の処理
      dropSound.play(); // ブロック固定時の効果音を再生
      // ブロックの各セルをフィールドに固定
      processBlockCells(this, function (x, y, value) {
        field[y][x] = value;
      });
      // ラインの消去とスコアの更新
      var erased = eraseLine(); //フィールド上のラインが揃っているかをチェックし、揃っていれば消去します。
      if (erased > 0) {
        score.value += Math.pow(2, erased) * 10; // 消去したライン数に応じてスコアを加算します。例えば、1ライン消去で10点、2ラインで20点と指数関数的に増加します。
      }
      // キーイベントをリセット
      keyevents.length = 0;
      // 次のブロックを生成
      consumeBlock();
      return;
    }

    // ブロックを一定の間隔で自動的に1マス下に移動させます。
    if (this.fire < count.value) {
      // this.fireとcount.valueを比較して、次に落下するタイミングを決定します。
      this.fire = count.value + interval.value;
      this.y++; //// ブロックを1マス下に移動させる
    }

    // keyevents配列からユーザーのキー入力を取得し、ブロックの動作を決定
    while (keyevents.length > 0) {
      var code = keyevents.shift();
      var dx = 0,
        dy = 0,
        nd = this.turn;

      switch (code) {
        case "Space":
          // 時計回りに回転
          nd = (nd + 1) % 4;
          break;
        case "KeyZ":
          // 反時計回りに回転
          nd = (nd - 1 + 4) % 4; // 負の値を避けるために4を足しています
          break;
        case "ArrowLeft":
          dx = -1; // 左に移動
          break;
        case "ArrowRight":
          dx = +1; // 右に移動
          break;
        case "ArrowDown":
          dy = +1; // 下に高速移動
          break;
        default:
          continue; // その他のキーは無視
      }

      // 衝突判定を行い、移動や回転が可能であれば状態を更新
      if (!isHit(this.x + dx, this.y + dy, nd)) {
        this.x += dx;
        this.y += dy;
        this.turn = nd;
        this.data = this.type[this.turn];
      }
    }
  };
  // ブロックを画面上に描画
  this.draw = function () {
    processBlockCells(this, function (x, y, value) {
      // processBlockCells関数を使用して、ブロックの各セルを描画
      drawBlock(50 + x * 25, 25 + y * 25, value); // drawBlock関数で、指定した座標にブロックのセルを描画
      // 座標計算: ブロックの位置に基づいて描画位置を計算しています
    });
  };
}

// ブロックの各セルを走査し、指定した関数funcを適用する
export function processBlockCells(block, func) {
  for (var i = 0; i < block.data.length; i++) {
    var x = i % block.w;
    var y = Math.floor(i / block.w);
    var v = block.data[i];
    if (
      0 <= y + block.y &&
      y + block.y < field.length &&
      0 <= x + block.x &&
      x + block.x < field[0].length &&
      v != 0
    ) {
      func(x + block.x, y + block.y, v);
    }
  }
}
//processBlockCells関数は、ブロックのセル操作を簡潔かつ効率的に行うための関数
//ブロックの描画やフィールドへの固定など、セル単位での操作が必要な場面で頻繁に使用
