"use strict";
import {
  getUserEmail,
  saveScoreAndEmail,
  displayDataInHTMLRealtime,
} from "../firebaseConfig.js";
var canvasWidth = 800; // キャンバスの幅
var canvasHeight = 600; // キャンバスの高さ
var numCellsX, numCellsY, S, W, H, totalFoods;
var snake = [],
  foods = [],
  walls = [];
var keyCode = 0,
  point = 0;
var timer = NaN,
  canvas,
  ctx,
  gameStarted = false;

var foodsEaten = 0; // 食べた餌の数

// ステージ管理の変数を追加
var currentStage = 1;
var maxStage = 10;

// Pointオブジェクト
function Point(x, y) {
  this.x = x;
  this.y = y;
}

// ステージ設定の追加
var stageSettings = {
  1: { totalFoods: 5, speed: 300, numCellsX: 20, numCellsY: 15 },
  2: { totalFoods: 10, speed: 280, numCellsX: 21, numCellsY: 16 },
  3: { totalFoods: 15, speed: 260, numCellsX: 23, numCellsY: 17 },
  4: { totalFoods: 20, speed: 240, numCellsX: 24, numCellsY: 18 },
  5: { totalFoods: 25, speed: 220, numCellsX: 25, numCellsY: 19 },
  6: { totalFoods: 30, speed: 200, numCellsX: 26, numCellsY: 20 },
  7: { totalFoods: 35, speed: 180, numCellsX: 27, numCellsY: 21 },
  8: { totalFoods: 40, speed: 160, numCellsX: 28, numCellsY: 22 },
  9: { totalFoods: 45, speed: 140, numCellsX: 29, numCellsY: 23 },
  10: { totalFoods: 50, speed: 120, numCellsX: 30, numCellsY: 24 },
};

function init() {
  canvas = document.getElementById("field");
  if (canvas) {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx = canvas.getContext("2d");

    // ステージ設定の適用
    var settings = stageSettings[currentStage];

    // ステージごとのフィールドサイズを更新
    numCellsX = settings.numCellsX;
    numCellsY = settings.numCellsY;
    W = numCellsX;
    H = numCellsY;

    // マスのサイズを再計算
    S = Math.min(canvasWidth / numCellsX, canvasHeight / numCellsY);

    // フォントサイズを再設定
    ctx.font = S * 0.8 + "px sans-serif";

    // 壁の初期化（内側に配置）
    walls = [];
    for (var x = 1; x < W - 1; x++) {
      walls.push(new Point(x, 1)); // 上辺
      walls.push(new Point(x, H - 2)); // 下辺
    }
    for (var y = 2; y < H - 2; y++) {
      walls.push(new Point(1, y)); // 左辺
      walls.push(new Point(W - 2, y)); // 右辺
    }

    // 蛇と餌をリセット
    snake = [];
    foods = [];
    foodsEaten = 0;
    totalFoods = settings.totalFoods;

    // 蛇の初期化
    snake.push(new Point(Math.floor(W / 2), Math.floor(H / 2)));

    // 餌の初期化
    for (var i = 0; i < totalFoods; i++) {
      addFood();
    }

    window.onkeydown = keydown;
    paint();

    // ゲーム速度の設定
    if (timer) clearInterval(timer);
    timer = setInterval(tick, settings.speed);
  } else {
    console.error("ゲームのキャンバスが見つかりませんでした。");
  }
}

// スタートボタンが押されたときにゲームを開始する関数
window.startGame = function () {
  const tutorialElement = document.getElementById("tutorial");
  const containerElement = document.getElementById("container");

  if (tutorialElement) {
    tutorialElement.style.display = "none";
  } else {
    console.error("チュートリアル要素が見つかりませんでした。");
    return;
  }

  if (containerElement) {
    containerElement.style.display = "flex";
  }

  gameStarted = true;
  init();
};

// リトライ関数の修正
window.retryGame = function () {
  document.getElementById("retryButton").style.display = "none";
  gameStarted = true;
  currentStage = 1; // ステージをリセット
  point = 0; // スコアをリセット
  init();
};

// 餌の追加
function addFood() {
  let attempts = 0;
  while (true) {
    // 壁の内側に限定するため、ランダムな位置を設定
    var x = Math.floor(Math.random() * (W - 2)) + 1; // 1 ～ W-2
    var y = Math.floor(Math.random() * (H - 2)) + 1; // 1 ～ H-2

    // 蛇、既存の餌、壁と重ならない場合のみ餌を追加
    if (!isHit(snake, x, y) && !isHit(foods, x, y) && !isHit(walls, x, y)) {
      foods.push(new Point(x, y));
      break;
    }

    attempts++;
    if (attempts > 100) {
      console.warn("餌の配置に失敗しました。");
      break;
    }
  }
}

// 餌を削除する関数
function removeFood(x, y) {
  foods = foods.filter(function (p) {
    const isMatch = p.x === x && p.y === y;
    if (isMatch) console.log("餌を削除しました:", x, y);
    return !isMatch;
  });
}

// 衝突判定関数
function isHit(data, x, y) {
  for (var i = 0; i < data.length; i++) {
    if (data[i].x === x && data[i].y === y) {
      return true;
    }
  }
  return false;
}

async function tick() {
  var x = snake[0].x;
  var y = snake[0].y;

  switch (keyCode) {
    case 37:
      x--;
      break; // 左
    case 38:
      y--;
      break; // 上
    case 39:
      x++;
      break; // 右
    case 40:
      y++;
      break; // 下
    default:
      paint();
      return;
  }

  // 壁との衝突判定を追加
  if (isHit(walls, x, y) || isHit(snake, x, y)) {
    endGame("Game Over");
    return;
  }

  // 蛇の移動
  snake.unshift(new Point(x, y));

  // 餌との衝突判定
  if (isHit(foods, x, y)) {
    point += 10;
    foodsEaten++;
    removeFood(x, y);

    // ゲームクリア判定
    if (foodsEaten >= totalFoods) {
      endGame("Game Clear!");
      return;
    }
  } else {
    snake.pop();
  }

  paint();
}

function paint() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 壁の描画
  ctx.fillStyle = "rgb(128,128,128)";
  walls.forEach(function (p) {
    ctx.fillText("🔲", p.x * S, (p.y + 1) * S); // 壁の絵文字を変更
  });

  // 餌の描画
  ctx.fillStyle = "rgb(0,0,255)";
  foods.forEach(function (p) {
    ctx.fillText("🐀", p.x * S, (p.y + 1) * S); // 餌の絵文字を変更
  });

  // 蛇の描画
  snake.forEach(function (p) {
    ctx.fillText("🐍", p.x * S, (p.y + 1) * S);
  });

  ctx.fillStyle = "rgb(256,0,0)";
  ctx.fillText("Score " + point, S, S * 1);
}

function keydown(event) {
  keyCode = event.keyCode;
}

// endGame関数の修正
async function endGame(message) {
  clearInterval(timer);
  gameStarted = false;

  const title = document.title;
  const userEmail = await getUserEmail();
  await saveScoreAndEmail(title, point, userEmail);

  paint();

  if (message === "Game Clear!") {
    if (currentStage < maxStage) {
      // ステージクリアのメッセージを表示
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "green";
      ctx.font = "40px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "ステージ " + currentStage + " クリア",
        canvas.width / 2,
        canvas.height / 2
      );

      // 2秒後に次のステージを開始
      setTimeout(() => {
        currentStage++;
        init();
      }, 2000);
    } else {
      ctx.fillStyle = "green";
      ctx.font = "40px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "全ステージクリア！おめでとうございます！",
        canvas.width / 2,
        canvas.height / 2
      );
      document.getElementById("retryButton").style.display = "block";
    }
  } else {
    ctx.fillStyle = "red";
    ctx.font = "40px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    document.getElementById("retryButton").style.display = "block";
  }
}

const title = document.title;
displayDataInHTMLRealtime(title);
