// draw.js

// 必要なモジュールや定数をインポート
import { colors } from "./constants.js";

// 描画コンテキストを保持する変数
export let ctx;

// 背景画像を保持する変数
let bgImage;

// `ctx` を初期化する関数
export function initCanvas() {
  const canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  ctx.font = "20pt Arial";

  // // 背景画像をロード
  // bgImage = new Image();
  // bgImage.src = "./images/background.png"; // 画像のパスを指定

  // // 画像がロードされたら初期描画を行う
  // bgImage.onload = () => {
  //   drawInitial(); // 初期描画関数を呼び出す
  // };
}

// 初期描画関数（オプション）
function drawInitial() {
  draw({
    field: [], // 初期フィールドデータ
    block: null,
    nextBlocks: [],
    score: 0,
    level: 1,
    levelMax: null,
    timer: null,
  });
}

// ブロックを描画する関数
export function drawBlock(x, y, colorIndex) {
  const baseColor = colors[colorIndex];

  // グラデーションの作成
  const grd = ctx.createLinearGradient(x, y, x + 24, y + 24);
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
  let num = parseInt(color.replace("#", ""), 16),
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
  const { field, block, nextBlocks, score, level, levelMax, timer } = gameState;

  // キャンバスサイズを取得
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;

  // 背景の描画（例: 単色背景）
  ctx.fillStyle = "rgb(0,0,0)"; // 好きな色に変更可能
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // // 背景の描画
  // if (bgImage && bgImage.complete) {
  //   ctx.drawImage(bgImage, 0, 0, canvasWidth, canvasHeight);
  // } else {
  //   // 画像がロードされていない場合のフォールバック
  //   ctx.fillStyle = "rgb(0,0,0)";
  //   ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  // }

  // フィールドの描画
  for (let y = 0; y < field.length; y++) {
    for (let x = 0; x < field[y].length; x++) {
      const v = field[y][x];
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
  if (nextBlocks && Array.isArray(nextBlocks)) {
    nextBlocks.forEach(function (nextBlock, blockIndex) {
      if (nextBlock) {
        nextBlock.data.forEach(function (v, i, data) {
          if (v != 0) {
            const w = Math.sqrt(data.length);
            const x = i % w;
            const y = Math.floor(i / w);
            // 各次のブロックを異なる位置に描画
            const posX = 440 + x * 25;
            const posY = 70 + y * 25 + blockIndex * 150; // インデックスに応じてY位置をずらす
            drawBlock(posX, posY, v);
          }
        });
      }
    });
  }

  // 次に落ちてくるブロックを表示
  ctx.fillText("NEXT", 450, 40);

  // 各種情報の描画
  ctx.fillStyle = "rgb(0,255,0)";
  ctx.fillText("SCORE", 410, 410);
  ctx.fillText(("00000" + score).slice(-5), 510, 440);

  // NEXT の外枠を描画
  ctx.strokeStyle = "white"; // 枠線の色を変更
  ctx.lineWidth = 1; // 枠線の太さ
  //ctx.strokeRect(370, 45, 120, 120); // x, y, 幅, 高さ

  // レベル表示
  ctx.fillText("LEVEL", 410, 470);
  if (levelMax && level >= levelMax) {
    // レベルが最大レベルに達した場合
    ctx.fillText("MAX", 500, 490);
  } else {
    // 通常のレベル表示
    ctx.fillText(("0" + level).slice(-3), 500, 490);
  }

  // SCORE の外枠を描画
  ctx.strokeStyle = "white"; // 枠線の色
  ctx.lineWidth = 1; // 枠線の太さ
  //ctx.strokeRect(495, 45, 130, 30); // x, y, 幅, 高さ

  // LEVEL の外枠を描画
  //ctx.strokeRect(500, 85, 130, 30); // x, y, 幅, 高さ

  // ゲームオーバー時のテキスト表示
  if (!timer) {
    ctx.fillText("GAME OVER", 290, 270);
  }
}
