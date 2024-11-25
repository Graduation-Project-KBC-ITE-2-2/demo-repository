// gameLogic.js

// 必要なモジュールや定数をインポート
import {
  field,
  block,
  nextBlock,
  keyevents,
  count,
  interval,
  score,
  timer,
} from "./main.js";
import { Block } from "./block.js";
import { draw } from "./draw.js";
import { getUserEmail, saveScoreAndEmail } from "../../firebaseConfig.js";

// ゲームの初期化関数
export function initGame() {
  console.log("init called");

  // フィールドの初期化
  field.length = 0; // フィールドをリセット
  for (let y = 0; y < 22; y++) {
    field[y] = new Array(12).fill(0);
    field[y][0] = 8; // 左壁
    field[y][11] = 8; // 右壁
  }
  for (let x = 0; x < 12; x++) {
    field[21][x] = 8; // 底の壁
  }

  // ゲーム状態の初期化
  count.value = 0;
  score.value = 0;
  interval.value = 40;
  keyevents.length = 0;

  // ブロックの初期化
  nextBlock.value = null;
  goNextBlock();

  // メインループの開始
  if (timer.value) {
    clearInterval(timer.value);
  }
  timer.value = setInterval(mainLoop, 10);
}

// メインループ関数
export async function mainLoop() {
  count.value++;

  // スピードアップ
  if (count.value % 1000 === 0) {
    interval.value = Math.max(1, interval.value - 1);
  }

  // ゲームオーバーの判定
  if (isGameOver()) {
    clearInterval(timer.value);
    timer.value = null;

    const title = document.title;
    const userEmail = await getUserEmail();
    await saveScoreAndEmail(title, score.value, userEmail);

    // モーダルウィンドウを表示
    document.getElementById("tutorial").style.display = "flex"; // チュートリアルを表示
  } else {
    // ブロックの位置を更新
    block.value.update();
  }

  // 描画
  draw({
    field: field,
    block: block.value,
    nextBlock: nextBlock.value,
    score: score.value,
    timer: timer.value,
  });
}

// ゲームオーバーの判定関数
export function isGameOver() {
  let filled = 0;
  field[0].forEach(function (c) {
    if (c != 0) {
      filled++;
    }
  });
  return filled > 2;
}

// 次のブロックを生成する関数
export function goNextBlock() {
  block.value = nextBlock.value || new Block();
  nextBlock.value = new Block();
}

// ブロックが衝突するか判定する関数
export function isHit(x, y, r) {
  const data = block.value.type[r];
  const w = block.value.w;

  for (let i = 0; i < w; i++) {
    for (let j = 0; j < w; j++) {
      if (
        i + y >= 0 &&
        j + x >= 0 &&
        i + y < field.length &&
        j + x < field[0].length &&
        field[i + y][j + x] != 0 &&
        data[i * w + j] != 0
      ) {
        return true;
      }
    }
  }
  return false;
}

// ラインを消去する関数
export function eraseLine() {
  let erased = 0;
  for (let y = 20; y >= 0; y--) {
    // 下から上へ
    if (
      field[y].every(function (v) {
        return v != 0;
      })
    ) {
      erased++;
      field.splice(y, 1); // 1行削除
      // 新しい空行を追加
      const newLine = new Array(12).fill(0);
      newLine[0] = 8; // 左壁
      newLine[11] = 8; // 右壁
      field.unshift(newLine); // 1行追加
      y++; // 消去した行からもう一度チェック
    }
  }
  return erased;
}
