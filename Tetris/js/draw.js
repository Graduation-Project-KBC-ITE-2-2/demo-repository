// draw.js

// 必要なモジュールや定数をインポート
import { colors } from "./constants.js";

// 描画コンテキストを保持する変数
export let ctx;

// `ctx` を初期化する関数
export function initCanvas() {
  const canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  ctx.font = "20pt Arial";
}

// ブロックを描画する関数
export function drawBlock(x, y, colorIndex) {
  var baseColor = colors[colorIndex];

  // グラデーションの作成
  var grd = ctx.createLinearGradient(x, y, x + 24, y + 24);
  grd.addColorStop(0, lightenColor(baseColor, 0.3)); // 明るい色
  grd.addColorStop(1, baseColor); // 基本色

  ctx.fillStyle = grd;
  ctx.fillRect(x, y, 24, 24);

  // ブロックの枠線を描画（任意）
  ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
  ctx.strokeRect(x, y, 24, 24);
}

// 色を明るくする関数
export function lightenColor(color, percent) {
  var num = parseInt(color.replace("#", ""), 16),
    amt = Math.round(2.55 * percent * 100),
    R = (num >> 16) + amt,
    G = ((num >> 8) & 0x00ff) + amt,
    B = (num & 0x0000ff) + amt;

  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 0 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

// フィールド全体を描画する関数
export function draw(gameState) {
  const { field, block, nextBlock, score, timer } = gameState;

  // 背景の塗りつぶし
  ctx.fillStyle = "rgb(0,0,0)";
  ctx.fillRect(0, 0, 700, 600);

  // フィールドの描画
  for (var y = 0; y < field.length; y++) {
    for (var x = 0; x < field[y].length; x++) {
      var v = field[y][x];
      if (v != 0) {
        drawBlock(50 + x * 25, 25 + y * 25, v);
      }
    }
  }

  // 落下中のブロックの描画
  if (block) {
    block.draw(ctx);
  }

  // 次に出現するブロックの描画
  if (nextBlock) {
    nextBlock.data.forEach(function (v, i, data) {
      if (v != 0) {
        var w = Math.sqrt(data.length);
        var x = i % w;
        var y = Math.floor(i / w);
        drawBlock(390 + x * 25, 60 + y * 25, v);
      }
    });
  }

  // 各種情報の描画
  ctx.fillStyle = "rgb(0,255,0)";
  ctx.fillText("SCORE", 500, 40);
  ctx.fillText("NEXT", 390, 40);
  ctx.fillText(("0000000" + score).slice(-7), 500, 70);

  // 外枠のスタイル設定
  ctx.strokeStyle = "white"; // 枠線の色
  ctx.lineWidth = 1; // 枠線の太さ

  // SCORE の外枠を描画
  ctx.strokeRect(495, 45, 130, 30); // x, y, 幅, 高さ

  // NEXT の外枠を描画
  ctx.strokeRect(370, 45, 120, 120); // x, y, 幅, 高さ

  // NEXT2 の外枠を描画
  ctx.strokeRect(370, 180, 120, 120); // x, y, 幅, 高さ

  // ゲームオーバー時のテキスト表示
  if (!timer) {
    ctx.fillText("GAME OVER", 290, 270);
  }
}
