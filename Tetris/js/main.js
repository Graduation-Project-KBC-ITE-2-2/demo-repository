// main.js ゲームのエントリーポイント（プログラム全体のスタート地点）として機能

// 必要な部品（モジュール）を集める（インポート）
import { initGame } from "./gameLogic.js";
import { setupEventHandlers } from "./eventHandlers.js";
import { initCanvas } from "./draw.js";
import { displayDataInHTMLRealtime } from "../../firebaseConfig.js";

// ゲームの状態を準備する（ゲーム状態を保持する変数を定義）

// ゲームフィールドの状態を保持する配列。各セルにブロックの有無や種類を示す値が格納されます。
export let field = [];
//現在落下中のブロックを保持するオブジェクト。value プロパティにブロックの情報が格納されます。
export let block = { value: null };
//次に出現するブロックを保持するオブジェクト。次のブロックのプレビュー表示などに使用します。
export let nextBlocks = { value: [] }; // 2つの次のブロックを保持する配列
//プレイヤーのキー入力イベントを保持する配列。キーの押下情報が格納され、ゲームロジックで処理されます。
export let keyevents = [];
//ゲーム内の時間やタイミングを管理するためのカウンターオブジェクト。ゲームの進行やスピード調整に使用します。
export let count = { value: 0 };
//ブロックの落下速度を調整するためのオブジェクト。value の値を変化させることでゲームの難易度を調整します。
//この値は初期値であり難易度を変更したい場合はGameLogic.jsの方を変更して
export let interval = { value: 40 };
//プレイヤーの現在のスコアを保持するオブジェクト。ラインを消すごとに加算されます。
export let score = { value: 0 };
export let level = { value: 1 };

//ゲームのメインループを管理するためのタイマーオブジェクト。setInterval や clearInterval で使用します。
export let timer = { value: null };

// ゲームのタイトルを取得（ランキングに使用？）
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

  const retry = document.getElementById("retry");
  if (tutorial) {
    retry.style.display = "none";
  } else {
    console.error("リトライ要素が見つかりませんでした。");
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
  // リトライボタンのクリックイベントリスナーを設定
  const retryButton = document.getElementById("retryButton");
  if (retryButton) {
    retryButton.addEventListener("click", window.startGame);
  } else {
    console.error("リトライボタンが見つかりませんでした。");
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
