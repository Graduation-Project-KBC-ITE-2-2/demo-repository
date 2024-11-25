// eventHandlers.js

// 必要なモジュールや変数をインポート
import { keyevents } from "./main.js";

// イベントハンドラーを設定する関数をエクスポート
export function setupEventHandlers() {
  // キーイベントのリスナーを登録
  window.addEventListener("keydown", function (e) {
    // デフォルトの動作を防ぐ
    if (["Space", "ArrowLeft", "ArrowRight", "ArrowDown"].includes(e.code)) {
      e.preventDefault();
    }
    if (!keyevents.includes(e.code)) {
      // キーイベントが重複しないようにする
      keyevents.push(e.code);
    }
  });

  // リトライボタンの処理
  window.retryGame = function () {
    window.startGame(); // ゲームを再スタート
  };

  // ゲーム一覧に戻るボタンの処理
  window.returnToIndex = function () {
    window.location.href = "../index.html";
  };
}
