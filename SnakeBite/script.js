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

// 草や土のテクスチャ画像を読み込む
var grassTexture = new Image();
grassTexture.src = "grass.png"; // 草の画像のパスを指定
var dirtTexture = new Image();
dirtTexture.src = "dirt.png"; // 土の画像のパスを指定

// 壁のテクスチャ画像を読み込む
var wallTexture = new Image();
wallTexture.src = "wall.png"; // 壁の画像のパスを指定

// ゲームのタイトルを取得（ランキングに使用？）
const title = document.title;

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

var backgroundPattern = []; // 背景パターンを格納する配列

function initCanvas() {
  canvas = document.getElementById("field");
  if (canvas) {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx = canvas.getContext("2d");

    // ステージ設定の適用
    var settings = stageSettings[currentStage];
    numCellsX = settings.numCellsX;
    numCellsY = settings.numCellsY;

    // ブロックサイズの均一化: キャンバスに合わせた一貫したサイズを計算
    S = Math.floor(Math.min(canvasWidth / numCellsX, canvasHeight / numCellsY));

    W = numCellsX;
    H = numCellsY;

    // フォントサイズを再設定
    ctx.font = S * 0.8 + "px sans-serif";

    // 壁の初期化
    walls = [];
    for (var x = 1; x < W - 1; x++) {
      walls.push(new Point(x, 1)); // 上辺
      walls.push(new Point(x, H - 2)); // 下辺
    }
    for (var y = 2; y < H - 2; y++) {
      walls.push(new Point(1, y)); // 左辺
      walls.push(new Point(W - 2, y)); // 右辺
    }

    // 背景パターンを生成
    backgroundPattern = [];
    for (let y = 0; y < numCellsY; y++) {
      const row = [];
      for (let x = 0; x < numCellsX; x++) {
        row.push(Math.random() < 0.5 ? "grass" : "dirt"); // ランダムで草または土
      }
      backgroundPattern.push(row);
    }

    // 蛇と餌をリセット
    snake = [];
    foods = [];
    foodsEaten = 0;
    totalFoods = settings.totalFoods;

    snake.push(new Point(Math.floor(W / 2), Math.floor(H / 2)));

    for (var i = 0; i < totalFoods; i++) {
      addFood();
    }

    window.onkeydown = keydown;
    paint();

    if (timer) clearInterval(timer);
    timer = setInterval(tick, settings.speed);
  } else {
    console.error("ゲームのキャンバスが見つかりませんでした。");
  }
}

// スタートボタンが押されたときにゲームを開始する関数
window.startGame = function () {
  // チュートリアルを非表示にする
  const tutorial = document.getElementById("tutorial");
  if (tutorial) {
    tutorial.style.display = "none";
  } else {
    console.error("チュートリアル要素が見つかりませんでした。");
  }

  const retry = document.getElementById("retry");
  if (tutorial) {
    retry.style.display = "none";
  } else {
    console.error("リトライ要素が見つかりませんでした。");
  }

  // ゲームコンテナを表示する
  const container = document.getElementById("container");
  if (container) {
    container.style.display = "flex";
  } else {
    console.error("コンテナ要素が見つかりませんでした。");
  }

  // ゲームの初期化
  initGame();
};
window.retryGame = function () {
  document.getElementById("retryButton").style.display = "none";
  const retryModal = document.getElementById("retry");
  if (retryModal) {
    retry.style.display = "none";
  } else {
    console.error("リトライ要素が見つかりませんでした。");
  }

  gameStarted = true;
  currentStage = 1; // ステージをリセット
  point = 0; // スコアをリセット
  initCanvas();
};

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
  // キャンバス全体に背景色を塗る
  ctx.fillStyle = "rgb(51, 51, 51)"; // 背景色を黒に設定
  ctx.fillRect(0, 0, canvas.width, canvas.height); // 背景全体を塗りつぶす

  // 背景の固定描画
  if (grassTexture.complete && dirtTexture.complete) {
    for (let y = 1; y < numCellsY - 1; y++) {
      // 上下の壁を避ける
      for (let x = 1; x < numCellsX - 1; x++) {
        // 左右の壁を避ける
        const texture =
          backgroundPattern[y][x] === "grass" ? grassTexture : dirtTexture;
        ctx.drawImage(texture, x * S, y * S, S, S); // 各グリッドに対応するテクスチャを描画
      }
    }
  } else {
    ctx.fillStyle = "rgb(200,200,200)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // 壁の描画
  walls.forEach(function (p) {
    if (wallTexture.complete) {
      // 壁画像を描画
      ctx.drawImage(wallTexture, p.x * S, p.y * S, S, S);
    } else {
      // 画像がロードされていない場合はデフォルトの四角形を描画
      ctx.fillStyle = "rgb(128,128,128)";
      ctx.fillRect(p.x * S, p.y * S, S, S);
    }
  });

  // 餌の描画
  ctx.fillStyle = "rgb(0,0,255)";
  foods.forEach(function (p) {
    ctx.fillText("🐀", p.x * S, (p.y + 1) * S);
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
        initCanvas();
      }, 2000);
    } else {
      // 最終ステージクリア時
      ctx.fillStyle = "green";
      ctx.font = "40px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "全ステージクリア！おめでとうございます！",
        canvas.width / 2,
        canvas.height / 2
      );
      // リトライボタンを表示
      const retryButton = document.getElementById("retryButton");
      if (retryButton) {
        retryButton.style.display = "block"; // ボタンを表示
      } else {
        console.error("リトライボタンが見つかりませんでした。");
      }

      // ゲームクリア時には retry モーダルは表示しないか、
      // 表示する場合は別のクリア用モーダルを用意するなど対応する
      // document.getElementById("retry").style.display = "none"; // 非表示のままにする
    }
  } else {
    // Game Over の場合のみ表示
    ctx.fillStyle = "red";
    ctx.font = "40px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    // モーダルウィンドウを表示
    const retryModal = document.getElementById("retry");
    retryModal.style.display = "flex";

    const retryButton = document.getElementById("retryButton");
    if (retryButton) {
      retryButton.style.display = "block"; // ここでボタンを再び表示
    } else {
      console.error("リトライボタンが見つかりませんでした。");
    }
  }
}

grassTexture.onload = () => {
  dirtTexture.onload = () => {
    initCanvas(); // 画像がロードされてから初期化
  };
};

window.addEventListener("load", () => {
  // キャンバスの初期化
  initCanvas();

  // リアルタイムデータの表示
  displayDataInHTMLRealtime(title);

  // スタートボタンのクリックイベントリスナー
  const startButton = document.getElementById("startButton");
  if (startButton) {
    startButton.addEventListener("click", window.startGame);
  }

  // リトライボタンのクリックイベントリスナー
  const retryButton = document.getElementById("retryButton");
  if (retryButton) {
    retryButton.addEventListener("click", window.retryGame); // `retryGame` 関数を呼び出す
  }

  // スペースキーでゲームを開始する機能を追加
  window.addEventListener("keydown", function (e) {
    if (e.code === "Space") {
      const tutorialModal = document.getElementById("tutorial");
      if (tutorialModal && tutorialModal.style.display !== "none") {
        window.startGame();
      }
    }
  });

  // リトライモーダルでの「R」キーによるリトライ機能を追加
  window.addEventListener("keydown", function (e) {
    if (e.code === "KeyR") {
      const retryModal = document.getElementById("retry");
      if (retryModal && retryModal.style.display !== "none") {
        window.retryGame();
      }
    }
  });
});
