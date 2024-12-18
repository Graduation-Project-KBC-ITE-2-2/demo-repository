"use strict";

import {
  getUserEmail,
  saveScoreAndEmail,
  displayDataInHTMLRealtime,
} from "../firebaseConfig.js";
import { addKeyListenerForStart } from "../Key.js";

const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d");

const canvasWidth = 800;
const canvasHeight = 600;

let y = 250,
  v = 0,
  keyDown = false,
  WALLS = 80,
  score = 0;
let walls = [];
let slope = 0,
  timer;

const shipImg = new Image();
shipImg.src = "ship.png";
const bangImg = new Image();
bangImg.src = "bang.png";

let gameOverFlag = false;
let showBang = false;

function initWalls() {
  walls = [];
  for (let i = 0; i < WALLS; i++) {
    walls.push({
      x: i * 10,
      top: 100,
      height: 400,
    });
  }
}

function init() {
  gameOverFlag = false;
  showBang = false;
  score = 0;
  y = 250;
  v = 0;
  initWalls();
  slope = Math.floor(Math.random() * 5) + 1;

  // リトライモーダルやゲームオーバーテキストを非表示
  document.getElementById("retry").classList.add("hidden");
  document.getElementById("bang").style.visibility = "hidden";
  document.getElementById("startButton").style.visibility = "hidden";

  document.getElementById("score").textContent = "Score: " + score;

  clearInterval(timer);
  timer = setInterval(mainloop, 50);

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
}

function onKeyDown() {
  keyDown = true;
}

function onKeyUp() {
  keyDown = false;
}

function hitTest() {
  const shipWidth = shipImg.width;
  const shipHeight = shipImg.height;

  const st = y + 10;
  const sb = st + shipHeight - 20;
  const checkIndex = 14;

  const wt = walls[checkIndex].top;
  const wh = walls[checkIndex].height;
  const wb = wt + wh;

  return st < wt || sb > wb;
}

async function mainloop() {
  if (hitTest() && !gameOverFlag) {
    gameOverFlag = true;
    clearInterval(timer);
    showBang = true; // 爆発表示

    // スコア保存処理
    const title = document.title;
    const userEmail = await getUserEmail();
    await saveScoreAndEmail(title, score, userEmail);

    // リトライモーダル表示
    document.getElementById("retry").classList.remove("hidden");

    return;
  }

  if (!gameOverFlag) {
    score += 10;
    document.getElementById("score").textContent = "Score: " + score;

    v += keyDown ? -2 : 1; //上キーの上昇速度:（何も押していない）落下速度
    y += v;

    let edge = walls[WALLS - 1];
    let t = edge.top;
    let h = edge.height;
    let b = h + t;
    t += slope;
    b += slope;
    if ((t < 0 && slope < 0) || (b > 600 && slope > 0)) {
      slope = (Math.floor(Math.random() * 5) + 1) * (slope < 0 ? 1 : -1);
      edge.top = t + 10;
      edge.height = h - 20;
    } else {
      edge.top = t;
    }

    for (let i = 0; i < WALLS - 1; i++) {
      walls[i].top = walls[i + 1].top;
      walls[i].height = walls[i + 1].height;
    }
  }

  draw();
}

function draw() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 壁描画
  ctx.fillStyle = "#333333";
  for (let i = 0; i < WALLS; i++) {
    let w = walls[i];
    ctx.fillRect(w.x, 0, 10, w.top);
    ctx.fillRect(w.x, w.top + w.height, 10, canvasHeight - (w.top + w.height));
  }

  // 船
  ctx.drawImage(shipImg, 100, y, shipImg.width, shipImg.height);

  // 爆発表示(ゲームオーバー時)
  if (showBang) {
    ctx.drawImage(bangImg, 100, y - 40);
  }

  // スコア表示
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);
}

window.startGame = function () {
  document.getElementById("tutorial").style.display = "none";
  init();
};

window.retryGame = function () {
  document.getElementById("retry").classList.add("hidden"); // モーダルを非表示に戻す
  init(); // ゲームを再初期化して再スタート
};

// キー操作によるスタート・リトライ対応
window.onload = function () {
  addKeyListenerForStart("startButton", startGame, 32);
  addKeyListenerForStart("retryButton", retryGame, 82);
  document.getElementById("startButton").addEventListener("click", startGame);
  // リトライボタンにもクリックイベントを追加
  document.getElementById("retryButton").addEventListener("click", retryGame);
};

const title = document.title;
displayDataInHTMLRealtime(title);
