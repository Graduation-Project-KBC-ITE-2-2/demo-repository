// main.js

// 必要なモジュールや関数をインポート
import { initGame } from "./gameLogic.js";
import { setupEventHandlers } from "./eventHandlers.js";
import { initCanvas } from "./draw.js";
import { displayDataInHTMLRealtime } from "../../firebaseConfig.js";

// グローバルなゲーム状態を保持する変数を定義し、エクスポート
export let field = [];
export let block = { value: null };
export let nextBlock = { value: null };
export let keyevents = [];
export let count = { value: 0 };
export let interval = { value: 40 };
export let score = { value: 0 };
export let timer = { value: null };

// ゲームのタイトルを取得
const title = document.title;

// ゲームの開始関数を定義
window.startGame = function () {
  // チュートリアルを非表示にする
  const tutorial = document.getElementById("tutorial");
  if (tutorial) {
    tutorial.style.display = "none";
  } else {
    console.error("チュートリアル要素が見つかりませんでした。");
  }

  // ゲームコンテナを表示する（必要に応じて）
  const container = document.getElementById("container");
  if (container) {
    container.style.display = "flex";
  } else {
    console.error("コンテナ要素が見つかりませんでした。");
  }

  // ゲームの初期化
  initGame();
};

// ページが読み込まれたときに実行される処理
window.addEventListener("load", () => {
  // キャンバスの初期化
  initCanvas();

  // イベントハンドラーのセットアップ
  setupEventHandlers();

  // リアルタイムデータの表示
  displayDataInHTMLRealtime(title);

  // スタートボタンのクリックイベントリスナーを設定
  const startButton = document.getElementById("startButton");
  if (startButton) {
    startButton.addEventListener("click", window.startGame);
  } else {
    console.error("スタートボタンが見つかりませんでした。");
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
});
