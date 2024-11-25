// block.js

// 必要なモジュールや定数をインポート
import { blocks } from "./constants.js";
import { rand } from "./utils.js";
import { isHit, eraseLine, goNextBlock } from "./gameLogic.js";
import { drawBlock } from "./draw.js";
import { dropSound } from "./sound.js";
import { field, keyevents, count, interval, score } from "./main.js";

// ブロックのクラス定義
export function Block() {
  this.turn = rand(4); // 向き
  this.type = blocks[rand(blocks.length)];
  this.data = this.type[this.turn];

  this.w = Math.sqrt(this.data.length); // 2 or 3 or 4
  this.x = rand(6 - this.w) + 2; // 落下開始時のx座標
  this.y = 1 - this.w;
  this.fire = interval.value + count.value; // 修正：interval.value と count.value を使用

  this.update = function () {
    // 一番下に到達？
    if (isHit(this.x, this.y + 1, this.turn)) {
      // ブロックが固定された瞬間にサウンドを再生
      dropSound.play();

      processBlockCells(this, function (x, y, value) {
        field[y][x] = value;
      });

      var erased = eraseLine();
      if (erased > 0) {
        score.value += Math.pow(2, erased) * 10; // score をオブジェクトとして扱う
      }

      keyevents.length = 0; // キーイベントをリセット
      goNextBlock();
      return; // これ以上の処理をせずに終了
    }

    // ブロックを1行下へ移動
    if (this.fire < count.value) {
      // 修正：count.value を使用
      this.fire = count.value + interval.value; // 修正：interval.value と count.value を使用
      this.y++;
    }

    // キーイベントの処理
    while (keyevents.length > 0) {
      var code = keyevents.shift();
      var dx = 0,
        dy = 0,
        nd = this.turn;

      switch (code) {
        case "Space":
          nd = (nd + 1) % 4;
          break;
        case "ArrowLeft":
          dx = -1;
          break;
        case "ArrowRight":
          dx = +1;
          break;
        case "ArrowDown":
          dy = +1;
          break;
        default:
          continue;
      }

      if (!isHit(this.x + dx, this.y + dy, nd)) {
        this.x += dx;
        this.y += dy;
        this.turn = nd;
        this.data = this.type[this.turn];
      }
    }
  };

  this.draw = function () {
    processBlockCells(this, function (x, y, value) {
      drawBlock(50 + x * 25, 25 + y * 25, value);
    });
  };
}

// ブロックの各セルに対して処理を行う関数
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
