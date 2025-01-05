import {
  getUserEmail,
  saveScoreAndEmail,
  displayDataInHTMLRealtime,
} from "../firebaseConfig.js";
import { addKeyListenerForStart } from "../Key.js";

var round = 0;
var questions = [];
var qCount = 0;
var qTimer = NaN;
var answers = [];
var sounds = [];
var currentScore = 0;
var bestScore =
  localStorage.getItem("bestScore") !== null
    ? parseInt(localStorage.getItem("bestScore"))
    : 0;
var buttonCount = 4; // デフォルトのボタン数
var difficultyMultiplier = 1; // 難易度ごとのスコア倍率
var originalColors = []; // 各ボタンの元の色を保存

function gobj(id) {
  return document.getElementById(id);
}

window.init = function () {
  document.getElementById("difficultySelection").style.display = "block";
  gobj("bestScore").textContent = "現在のスコア: 0";
  addKeyListenerForStart("tutorial", hideTutorial, 32);
  addKeyListenerForStart("retryButton", retryGame, 32);
};

window.startGame = function (count) {
  buttonCount = count; // 難易度に応じたボタン数を設定
  difficultyMultiplier = count === 4 ? 1 : count === 9 ? 1.5 : 2; // 難易度によるスコア倍率設定
  const buttonContainer = document.getElementById("buttonContainer");
  buttonContainer.innerHTML = ""; // ボタンをリセット
  buttonContainer.style.display = "grid";

  // ボタン配置を設定
  if (count === 4) {
    buttonContainer.style.gridTemplateColumns = "repeat(2, 1fr)";
  } else if (count === 9) {
    buttonContainer.style.gridTemplateColumns = "repeat(3, 1fr)";
  } else if (count === 16) {
    buttonContainer.style.gridTemplateColumns = "repeat(4, 1fr)";
  }

  questions = [];
  answers = [];
  round = 0;
  currentScore = 0;

  const colors = generateUniqueColors(buttonCount); // ユニークな色を生成
  originalColors = colors; // 元の色を保存

  // ボタンを動的に生成
  for (let i = 0; i < buttonCount; i++) {
    const button = document.createElement("button");
    button.id = `b${i}`;
    button.setAttribute("data-index", i);
    button.style.backgroundColor = colors[i]; // ユニークな色を適用
    button.style.width = "100px"; // ボタンサイズの調整
    button.style.height = "100px";
    button.style.margin = "5px";
    button.onclick = function () {
      if (qTimer) return;
      blink(i);
      answer(i);
    };
    buttonContainer.appendChild(button);
  }

  document.getElementById("difficultySelection").style.display = "none";
  gobj("gameArea").style.display = "block";
  loadSounds();
  startGameLogic();
};

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

function loadSounds() {
  // 4種類の音をランダムに割り当てる
  sounds = [
    new Audio("sound1.mp3"),
    new Audio("sound2.mp3"),
    new Audio("sound3.mp3"),
    new Audio("sound4.mp3"),
  ];
}

function startGameLogic() {
  showMessage("ゲーム開始！");
  gobj("message").style.whiteSpace = "nowrap";
  gobj("retryButton").style.display = "none";
  setTimeout(function () {
    round = 0;
    nextRound();
  }, 1000);
}

window.hideTutorial = function () {
  gobj("tutorial").style.display = "none";
  startGameLogic();
};

window.retryGame = function () {
  gobj("retryButton").style.display = "none";
  window.hideTutorial();
};

function blink(index) {
  const buttons = document.querySelectorAll("button[data-index]");

  // 元の色を取得
  const originalColor = originalColors[index];

  // 光る色を生成
  const highlightColor = lightenColor(originalColor, 30); // 元の色を30%明るく

  // ボタンの色をハイライト色に変更
  buttons[index].style.backgroundColor = highlightColor;

  // 音を再生
  const soundIndex = index % sounds.length; // sounds 配列内のインデックスを取得
  sounds[soundIndex].currentTime = 0;
  sounds[soundIndex].play();

  // 元の色に戻す
  setTimeout(function () {
    buttons[index].style.backgroundColor = originalColor;
  }, 400); // ハイライトを400ms後に元に戻す
}

// 明るい色を生成する関数
function lightenColor(color, percent) {
  const num = parseInt(color.slice(1), 16),
    amt = Math.round(2.55 * percent),
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

function showMessage(mess) {
  const messageElem = gobj("message");
  messageElem.textContent = mess;
  messageElem.style.display = "flex";
  messageElem.style.justifyContent = "center";
  messageElem.style.alignItems = "center";
  messageElem.style.position = "absolute";
  messageElem.style.top = "50%";
  messageElem.style.left = "50%";
  messageElem.style.transform = "translate(-50%, -50%)";
  messageElem.style.fontSize = "48px";
  messageElem.style.color = "white";
  messageElem.style.zIndex = "1000";

  setTimeout(function () {
    messageElem.style.display = "none";
  }, 2000);
}

function nextRound() {
  if (round === 10) {
    showMessage("ゲームクリア！おめでとうございます！");
    gobj("retryButton").style.display = "block";
    return;
  }

  gobj("bestScore").textContent =
    "ラウンド: " + round + " | ベストスコア: " + bestScore;
  round++;
  showMessage("ラウンド: " + round);

  // ラウンド数に応じて覚える数を増やす
  questions = [];
  for (let i = 0; i < round; i++) {
    questions.push(Math.floor(Math.random() * buttonCount));
  }

  answers = [];
  qCount = 0;

  setTimeout(showQuizItem, 1000); // 少し遅らせて表示
}

function showQuizItem() {
  if (qCount < questions.length) {
    blink(questions[qCount]);
    qCount++;
    setTimeout(showQuizItem, 1000); // 次の点滅まで少し遅らせる
  } else {
    setTimeout(() => {
      showMessage("覚えましょう！");
    }, 1000);
  }
}

async function answer(val) {
  answers.push(val);
  var mistake = false;

  for (var i = 0; i < answers.length; i++) {
    if (answers[i] != questions[i]) {
      mistake = true;
      break;
    }
  }

  if (mistake) {
    showMessage("Game Over: " + Math.floor(round * difficultyMultiplier));
    if (Math.floor(round * difficultyMultiplier) > bestScore) {
      bestScore = Math.floor(round * difficultyMultiplier);
      localStorage.setItem("bestScore", bestScore.toString());
    }
    gobj("retryButton").style.display = "block";
  } else if (answers.length == questions.length) {
    showMessage("正解です");
    const currentScore = Math.floor(round * difficultyMultiplier);
    if (currentScore > bestScore) {
      bestScore = currentScore;
      localStorage.setItem("bestScore", bestScore.toString());
    }
    gobj("bestScore").textContent = "ベストスコア: " + bestScore;
    setTimeout(nextRound, 2000);
  }
  const title = document.title;
  const userEmail = await getUserEmail();
  await saveScoreAndEmail(
    title,
    Math.floor(round * difficultyMultiplier),
    userEmail
  );
}

const title = document.title;
displayDataInHTMLRealtime(title);
