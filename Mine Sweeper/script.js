"use strict";

import {
  getUserEmail,
  saveScoreAndEmail,
  displayDataInHTMLRealtime,
} from "../firebaseConfig.js";

var stages = [
  { width: 8, height: 8, bombs: 10 }, // ステージ1
  { width: 12, height: 12, bombs: 20 }, // ステージ2
  { width: 16, height: 16, bombs: 40 }, // ステージ3
];
var currentStage = 0; // 現在のステージ
var W, H, BOMB;
var cell = [],
  opened = 0,
  totle = 0;
var timerInterval, startTime; // タイマー用変数

function init() {
  const stage = stages[currentStage]; // 現在のステージ設定を取得
  W = stage.width;
  H = stage.height;
  BOMB = stage.bombs;
  var main = document.getElementById("main");
  main.innerHTML = ""; // 既存のテーブルをクリア

  opened = 0; // 開いたセルのリセット
  clearInterval(timerInterval); // タイマー停止
  document.getElementById("timer").textContent = "Time: 0"; // タイマー初期化

  for (var i = 0; i < H; i++) {
    cell[i] = [];
    var tr = document.createElement("tr");
    for (var j = 0; j < W; j++) {
      var td = document.createElement("td");
      td.addEventListener("click", click);
      td.addEventListener("contextmenu", flagCell); // 右クリックイベント追加
      td.className = "cell";
      td.y = i;
      td.x = j;
      td.flagged = false; // フラグ状態を初期化
      cell[i][j] = td;
      tr.appendChild(td);
    }
    main.appendChild(tr);
  }

  for (var i = 0; i < BOMB; i++) {
    while (true) {
      var x = Math.floor(Math.random() * W);
      var y = Math.floor(Math.random() * H);
      if (!cell[y][x].bomb) {
        cell[y][x].bomb = true;
        break;
      }
    }
  }

  startTimer(); // ゲーム開始時にタイマー開始
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById("timer").textContent = `Time: ${elapsed}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function count(x, y) {
  var b = 0;
  for (var j = y - 1; j <= y + 1; j++) {
    for (var i = x - 1; i <= x + 1; i++) {
      if (cell[j] && cell[j][i]) {
        if (cell[j][i].bomb) b++;
      }
    }
  }
  return b;
}

function open(x, y) {
  for (var j = y - 1; j <= y + 1; j++) {
    for (var i = x - 1; i <= x + 1; i++) {
      if (cell[j] && cell[j][i]) {
        var c = cell[j][i];
        if (c.opened || c.bomb) {
          continue;
        }
        flip(c);
        var n = count(i, j);
        if (n == 0) {
          open(i, j);
        } else {
          c.textContent = n;
          c.style.color = "black";
        }
      }
    }
  }
}

async function flip(cell) {
  cell.className = "cell open";
  cell.opened = true;
  if (++opened >= W * H - BOMB) {
    stopTimer(); // ゲームクリア時にタイマー停止
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const title = document.title; // ゲームのタイトルを取得
    const userEmail = await getUserEmail(); // ユーザーのメールを取得
    const score = 1000 - elapsed;
    // await saveScoreAndEmail(title, score, userEmail); 
    document.getElementById(
      "title"
    ).textContent = `Good Job! Time: ${elapsed}s - スコア ${score}`;


    if (currentStage < stages.length - 1) {
      // 次のステージへ
      currentStage++;
       setTimeout(async() => {
        init(); // 次のステージを初期化
        totle += score;
        await saveScoreAndEmail(title, totle, userEmail);
      }, 2000);
    } else {
      // 最終ステージクリア
      document.getElementById("title").textContent = "Congratulations! 全ステージクリア！";
      await saveScoreAndEmail(title, totle, userEmail);
    }
  }
}

function flagCell(e) {
  e.preventDefault(); // 右クリックのデフォルト動作をキャンセル

  var src = e.currentTarget;

  if (src.opened) return; // すでに開かれているセルはフラグ不可

  if (src.flagged) {
    // 既にフラグがある場合、フラグを解除
    src.textContent = "";
    src.flagged = false;
  } else {
    // フラグを設置
    src.textContent = "🚩";
    src.flagged = true;
  }
}


function click(e) {
  var src = e.currentTarget;
  if (src.flagged) return; // フラグがあるセルはクリック不可
  if (src.bomb) {
    // 全セルの爆弾を表示
    cell.forEach(function (tr) {
      tr.forEach(function (td) {
        if (td.bomb) {
          td.textContent = "💣";
        }
        td.removeEventListener("click", click); // クリックイベントを無効化
        td.removeEventListener("contextmenu", flagCell); // フラグイベントも無効化
      });
    });

    stopTimer(); // ゲームオーバー時にタイマー停止
    document.getElementById("title").textContent = "Game Over";

    // リトライボタンを表示
    document.getElementById("retryButton").style.display = "block";
  } else {
    open(src.x, src.y);
  }
}

// retryGame 関数をグローバルスコープに追加
window.retryGame = function () {
  document.getElementById("retryButton").style.display = "none"; // リトライボタンを隠す
  document.getElementById("title").textContent = "Minesweeper"; // タイトルをリセット
  init(); // ゲームを初期化
};

function startGame() {
  const tutorial = document.getElementById("tutorial"); // 修正
  const gameContainer = document.getElementById("game-container");
  const main = document.getElementById("main");

  if (tutorial) tutorial.style.display = "none"; // 修正
  if (gameContainer) gameContainer.style.display = "block";
  if (main) main.style.display = "block";

  init();
}

// タイトルを取得してリアルタイムでデータを表示
const title = document.title;
displayDataInHTMLRealtime(title);

window.init = init;
window.startGame = startGame;

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("startButton").addEventListener("click", startGame);
});
