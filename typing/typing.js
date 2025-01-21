const words = [
  //あ
  "ああ言えばこう言う",
  "愛多ければ憎しみ至る",
  "後の祭り",
  "雨降って地固まる",
  "案ずるより産むが易い",
  //い
  "石の上にも三年",
  "急がば回れ",
  "一富士二鷹三茄子",
  "一寸の虫にも五分の魂",
  "犬も歩けば棒に当たる",
  //う
  "魚心あれば水心",
  "馬の耳に念仏",
  "嘘から出た実", 
  "売り言葉に買い言葉",
  "嘘つきは泥棒のはじまり",
  //え
  "えびで鯛を釣る",
  "得手に帆を揚げる",
  "縁の下の力持ち",
  "江戸の仇を長崎で討つ",
  //お
  "同じ穴の狢",
  "同じ釜の飯を食う",
  "鬼が出るか蛇が出るか",
];

const wordElement = document.getElementById("word");
const inputElement = document.getElementById("input");
const scoreElement = document.getElementById("score");
const timeElement = document.getElementById("time");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");

let score = 0;
let time = 90;
let previousWord = null;
let wordIndex = Math.floor(Math.random() * words.length);
let currentWord = words[wordIndex];
let isPlaying = false;
let timerId;
let timerIntervalId;

// 表示更新関数
function updateDisplay() {
  wordElement.textContent = currentWord;
  scoreElement.textContent = `スコア: ${score}`;
  timeElement.textContent = `残り時間: ${time}`;
}

// 文字列の正規化
function normalizeString(str) {
  return str.replace(/^\s+|\s+$/g, "").normalize("NFKC");
}

// ランダムに次の単語を選択するが、直前の単語と異なるものを選ぶ
function getNextWord() {
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * words.length);
  } while (words[newIndex] === previousWord);
  previousWord = words[newIndex];
  return words[newIndex];
}

// 入力イベントでの処理（リアルタイム判定）
inputElement.addEventListener("input", () => {
  if (normalizeString(inputElement.value) === currentWord) {
    score++;
    inputElement.value = ""; // 入力欄をクリア
    currentWord = getNextWord(); // 次の単語を取得
    updateDisplay();

    // 視覚的フィードバック（正解時の背景色変更）
    wordElement.style.backgroundColor = "lightgreen";
    setTimeout(() => {
      wordElement.style.backgroundColor = ""; // 元の背景色に戻す
    }, 300);
  }
});


// スタートボタンの処理
startBtn.addEventListener("click", () => {
  if (!isPlaying) {
    isPlaying = true;
    updateDisplay();
    timerId = setTimeout(() => {
      clearInterval(timerIntervalId);
      inputElement.disabled = true;
      alert(`ゲーム終了！スコア: ${score}`);
      isPlaying = false;
    }, time * 1000);

    timerIntervalId = setInterval(() => {
      time--;
      updateDisplay();
      if (time <= 0) {
        clearInterval(timerIntervalId);
        isPlaying = false;
      }
    }, 1000);
  }
});

// 初期状態でゲーム画面を非表示
document.querySelector("#game-container, .main").style.display = "none"; // 適宜調整

// スタートボタンをクリックした時の動作
document.getElementById("startButton").addEventListener("click", () => {
  document.getElementById("tutorial").style.display = "none"; // モーダルを非表示
  document.querySelector("#game-container, .main").style.display = "block"; // ゲーム画面を表示
});

// リセットボタンの処理
resetBtn.addEventListener("click", () => {
  score = 0;
  time = 90;
  currentWord = getNextWord();
  isPlaying = false;
  inputElement.disabled = false;
  inputElement.value = "";

  clearInterval(timerIntervalId);
  clearTimeout(timerId);

  updateDisplay();
});
