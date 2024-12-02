// eventHandlers.js

// 必要なモジュールや変数をインポート
import { keyevents } from "./main.js";

// イベントハンドラーを設定する関数をエクスポート
export function setupEventHandlers() {
  // キーボードの入力（キーが押されたとき）を監視します
  window.addEventListener("keydown", function (e) {
    // 特定のキーの標準の動きを止めます（例えば、スペースキーでページがスクロールしないように）
    if (["Space", "ArrowLeft", "ArrowRight", "ArrowDown"].includes(e.code)) {
      e.preventDefault(); // ブラウザのデフォルトの動作を防ぎます
    }
    // 押されたキーがまだ記録されていなければ、キーの情報を保存します
    if (!keyevents.includes(e.code)) {
      keyevents.push(e.code); // キーの情報をリストに追加します
    }
  });

  // リトライボタンの処理
  window.retryGame = function () {
    window.startGame(); // ゲームを再スタート
  };

  // ゲーム一覧に戻るボタンの処理
  window.returnToIndex = function () {
    window.location.href = "../index.html"; // ゲーム一覧のページに移動します
  };
}
