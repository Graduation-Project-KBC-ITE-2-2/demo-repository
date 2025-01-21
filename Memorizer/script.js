import {
  getUserEmail,
  saveScoreAndEmail,
  displayDataInHTMLRealtime,
} from "../firebaseConfig.js";

("use strict");

// === 定数と変数 ===
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 800;

let round = 0;
let questions = [];
let qCount = 0;
let answers = [];
let sounds = [];
let currentScore = 0;
let bestScore = localStorage.getItem("bestScore")
  ? parseInt(localStorage.getItem("bestScore"))
  : 0;
let buttonCount = 4;
let difficultyMultiplier = 1;
let originalColors = [];
let buttons = [];

// === 初期化と開始処理 ===
window.init = function () {
  gobj("tutorial").classList.remove("hidden");
  document.getElementById("difficultySelection").style.display = "block";
  gobj("bestScore").textContent = "現在のスコア: 0";
  addKeyListenerForStart("tutorial", hideTutorial, 32);
  addKeyListenerForStart("retryButton", retryGame, 32);
};

window.startGame = function (count) {
  buttonCount = count;
  difficultyMultiplier = count === 4 ? 1 : count === 9 ? 1.5 : 2;
  resetGameData();
  originalColors = generateUniqueColors(buttonCount);
  createButtons(buttonCount);
  drawGame();
  loadSounds();
  startGameLogic();
};

// === ユーティリティ関数 ===
function gobj(id) {
  return document.getElementById(id);
}

function resetGameData() {
  questions = [];
  answers = [];
  round = 0;
  currentScore = 0;
}

// === ゲーム描画関連 ===
function generateUniqueColors(count) {
  const colorSet = new Set();
  while (colorSet.size < count) {
    const color = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`;
    colorSet.add(color);
  }
  return Array.from(colorSet);
}

function createButtons(count) {
  buttons = [];
  const gridSize = Math.sqrt(count); // ボタンの行・列数を計算
  const buttonMargin = 10; // ボタン間のマージン
  const buttonWidth = (canvas.width - buttonMargin * (gridSize + 1)) / gridSize; // ボタンの幅
  const buttonHeight =
    (canvas.height - buttonMargin * (gridSize + 1)) / gridSize; // ボタンの高さ

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / gridSize); // ボタンの行番号
    const col = i % gridSize; // ボタンの列番号
    const x = col * (buttonWidth + buttonMargin) + buttonMargin; // X座標を計算
    const y = row * (buttonHeight + buttonMargin) + buttonMargin; // Y座標を計算

    buttons.push({
      x,
      y,
      width: buttonWidth,
      height: buttonHeight,
      color: originalColors[i],
    });
  }
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  buttons.forEach((button) => {
    ctx.fillStyle = button.color;
    ctx.fillRect(button.x, button.y, button.width, button.height);
  });
}
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left; // マウスのX座標（Canvas内）
  const mouseY = e.clientY - rect.top; // マウスのY座標（Canvas内）

  buttons.forEach((button, index) => {
    if (
      mouseX >= button.x &&
      mouseX <= button.x + button.width &&
      mouseY >= button.y &&
      mouseY <= button.y + button.height
    ) {
      blink(index); // ボタンがクリックされたときの視覚効果
      answer(index); // ボタンのクリック処理
    }
  });
});

// === ゲームロジック ===
function startGameLogic() {
  showMessage("ゲーム開始！");
  setTimeout(() => showMessage(`ラウンド: ${round}`), 1000);
  setTimeout(() => {
    round = 0;
    nextRound();
  }, 3000);
}

function nextRound() {
  if (round === 10) {
    showMessage("ゲームクリア！おめでとうございます！");
    gobj("retryButton").style.display = "block";
    return;
  }

  round++;
  showMessage(`ラウンド: ${round}`);
  questions = Array.from({ length: round }, () =>
    Math.floor(Math.random() * buttonCount)
  );
  answers = [];
  qCount = 0;
  createButtons(buttonCount);
  drawGame();
  setTimeout(showQuizItem, 1000);
}

function showQuizItem() {
  if (qCount < questions.length) {
    // 現在の質問を点滅させる
    blink(questions[qCount]);
    qCount++;
    // 次の質問を一定時間後に表示
    setTimeout(showQuizItem, 1000);
  } else {
    // 覚えるフェーズに移行
    setTimeout(() => {
      showMessage("覚えましょう！");
      setTimeout(() => {
        drawGame(); // ゲーム画面を再描画（覚える画面をクリア）
      }, 1000); // 覚えましょう！を1秒間表示後にゲーム画面へ
    }, 1000);
  }
}

async function answer(val) {
  answers.push(val);

  if (answers[answers.length - 1] !== questions[answers.length - 1]) {
    showMessage("Game Over");
    showRetryModal();
    return;
  }

  if (answers.length === questions.length) {
    // スコアをラウンド数で加算
    currentScore += round * 10; // ラウンドごとに10点加算（例）
    showMessage("正解！");

    setTimeout(() => {
      drawGame();
      nextRound();
    }, 3000);
  }

  const title = document.title;
  const userEmail = await getUserEmail();
  await saveScoreAndEmail(title, currentScore, userEmail); // currentScoreを使用
}

// === 視覚効果 ===
function blink(index) {
  const button = buttons[index];
  console.log("Blink function called with index:", index, "Button:", button);

  if (!button) {
    console.error("Invalid button index:", index);
    return; // 無効な場合は処理を中断
  }

  const originalColor = button.color;
  if (!originalColor) {
    console.error("Button color is undefined for index:", index);
    return; // 色が未設定の場合は処理を中断
  }

  const highlightColor = lightenColor(originalColor, 30);
  button.color = highlightColor;
  drawGame();

  const soundIndex = index % sounds.length;
  sounds[soundIndex].currentTime = 0;
  sounds[soundIndex].play();

  setTimeout(() => {
    button.color = originalColor;
    drawGame();
  }, 400);
}

function lightenColor(color, percent) {
  const num = parseInt(color.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min((num >> 16) + amt, 255);
  const G = Math.min(((num >> 8) & 0x00ff) + amt, 255);
  const B = Math.min((num & 0x0000ff) + amt, 255);

  return `#${((R << 16) | (G << 8) | B).toString(16).padStart(6, "0")}`;
}

// === メッセージ表示 ===
function showMessage(mess) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "32px Arial"; // フォントサイズを調整
  ctx.textAlign = "center";
  ctx.fillText(mess, canvas.width / 2, canvas.height / 2); // 中央に表示
}

// === モーダル操作 ===
function showRetryModal() {
  const title = document.title;
  gobj("retry").classList.remove("hidden");
}

window.hideTutorial = function () {
  gobj("tutorial").style.display = "none";
  startGameLogic();
};

window.retryGame = function () {
  gobj("retry").classList.add("hidden");
  resetGameData();
  startGame(buttonCount);
};

// === サウンド関連 ===
function loadSounds() {
  sounds = ["sound1.mp3", "sound2.mp3", "sound3.mp3", "sound4.mp3"].map(
    (src) => new Audio(src)
  );
}
// ゲームデータをリアルタイムで表示
const title = document.title;
displayDataInHTMLRealtime(title);
