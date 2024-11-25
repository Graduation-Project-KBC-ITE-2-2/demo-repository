// gameLogic.js

// 必要なモジュールや定数をインポート

//main.js ファイルから、ゲームの状態を管理するための変数をインポート
import {
  field,
  block,
  nextBlock,
  keyevents,
  count,
  interval,
  score,
  timer,
} from "./main.js";
//block.js ファイルから Block クラスをインポート
import { Block } from "./block.js";
//draw.js ファイルから draw 関数をインポート
import { draw } from "./draw.js";
//firebaseConfig.js ファイルから、Firebase に関連する関数をインポート
import { getUserEmail, saveScoreAndEmail } from "../../firebaseConfig.js";

// ゲームの初期化関数
//この関数はゲームの開始時に呼び出され、ゲームの状態をリセットし、必要な初期設定を行います
export function initGame() {
  console.log("init called"); //関数の実行を確認

  // フィールドの初期化
  field.length = 0; // ゲームフィールド（プレイエリア）をリセット(初期化)
  for (let y = 0; y < 22; y++) {
    //フィールドの初期化ループ（縦方向）
    field[y] = new Array(12).fill(0); //フィールドの初期化ループ（横方向）
    field[y][0] = 8; // 左壁 0番目は8＝壁
    field[y][11] = 8; // 右壁 11番目は8＝壁
  }
  for (let x = 0; x < 12; x++) {
    field[21][x] = 8; // フィールドの最下行（21行目）を 8 に設定します。底の壁が作られます
  }

  // ゲーム状態の初期化
  count.value = 0; //ゲーム内のタイマーやフレームカウンターをリセットします
  score.value = 0; //プレイヤーのスコアを 0 にリセットします
  interval.value = 40; //ブロックの落下間隔を初期値の 40 に設定します。値が小さいほどブロックの落下速度が速くなります
  keyevents.length = 0; //キー入力イベントを保持する配列をクリアします。前回の入力が残らないようにします。

  // ブロックの初期化
  nextBlock.value = null; //次に出現するブロックを初期化します。null に設定することで、最初のブロック生成時に新しいブロックが作成
  goNextBlock(); //次のブロックを現在のブロックとしてセットし、新しい次のブロックを生成

  // メインループの開始
  if (timer.value) {
    //既にタイマーが動作している場合（timer.value が存在する場合）、それを停止(前回のタイマーを引き継がない)
    clearInterval(timer.value);
  }
  // mainLoop(ゲームのメインの処理を行います。ブロックの落下、入力の処理、描画の更新など)を 10 ミリ秒ごとに呼び出すタイマーを設定
  // 10ミリだと100FPS 16で60FPS(正確には16.67ms)
  timer.value = setInterval(mainLoop, 16);
}

// メインループ関数
// メインループは、ゲームが動いている間ずっと繰り返し実行される関数で、ゲームの進行や画面の更新を管理します
export async function mainLoop() {
  count.value++; // ゲーム内の時間を進めています

  // 一定の時間が経過するごとに、ゲームのスピードを上げています
  //カウントが600で割り切れるとき処理を行う（1分ごとに）
  if (count.value % 600 === 0) {
    //ブロックの落下速度を1ずつ速くしますが、最も速くても「1(1000FPS)」になるようにしています
    interval.value = Math.max(1, interval.value - 1);
  }

  // ゲームオーバーの判定
  if (isGameOver()) {
    clearInterval(timer.value); //ゲームを停止する
    timer.value = null; //タイマーをリセット

    const title = document.title; //ゲームのタイトル（名前）を取得
    const userEmail = await getUserEmail(); //ーザーのメールアドレスを取得します。これはスコアをユーザーに紐付ける
    await saveScoreAndEmail(title, score.value, userEmail); //ユーザーのスコアとメールアドレスをサーバーやデータベースに保存

    // モーダルウィンドウを表示
    document.getElementById("retry").style.display = "flex"; // ゲーム終了画面を表示
  } else {
    // ゲームオーバーでない場合 ブロックの位置を更新
    block.value.update();
  }

  // 画面を更新する（描画）
  draw({
    field: field, //ブロックがどこにあるか、フィールド全体の状態。
    block: block.value, //現在落ちているブロックの情報。
    nextBlock: nextBlock.value, //次に出てくるブロックの情報。
    score: score.value, //現在のスコア。
    timer: timer.value, //ゲームのタイマー情報。
  });
}

// ゲームオーバーの判定関数
export function isGameOver() {
  let filled = 0;
  //field[0] ゲームのフィールド（ブロックが配置されるエリア）の一番上の行を指します。
  //forEach：一番上の行の各セル（ブロックの位置）を順番に確認
  field[0].forEach(function (c) {
    //セルが空（0）でない場合、つまりブロックが存在する場合
    if (c != 0) {
      filled++; //filled++：ブロックがあるセルの数を数えます。
    }
  });
  return filled > 2; //一番上の行に3つ以上のブロックがある場合。(壁も含めて)結果を返します。条件を満たせば true（ゲームオーバー）、そうでなければ false。
}

// 次のブロックを生成する関数
export function goNextBlock() {
  //  次に出てくる予定のブロックが存在すればそれを使います。存在しなければ、新しいブロックを作成
  block.value = nextBlock.value || new Block();
  nextBlock.value = new Block(); //新しいブロックを作成し,次に出てくるブロックとして保存します。
}

// ブロックが衝突するか判定する関数

//x：ブロックの横方向の位置（左から何マス目か）
//y：ブロックの縦方向の位置（上から何マス目か）
//r：ブロックの回転状態（0～3の値で、ブロックの向きを表す）
export function isHit(x, y, r) {
  const data = block.value.type[r]; //現在のブロックの、指定された回転状態 r に対応する形状データを取得
  const w = block.value.w; //ブロックの幅を表します。ブロックは正方形のグリッドで表現されるため、幅と高さは同じです。例えば、2×2、3×3、4×4 など。

  for (let i = 0; i < w; i++) {
    //ブロックの縦方向のセルを順に処理します。
    for (let j = 0; j < w; j++) {
      //ブロックの横方向のセルを順に処理します
      if (
        //i + y と j + x：ブロックのセルがフィールド内のどの位置に来るかを計算しています。
        i + y >= 0 && //フィールドの上端を超えていないか。
        j + x >= 0 && //フィールドの左端を超えていないか。
        i + y < field.length && //フィールドの下端を超えていないか。
        j + x < field[0].length && //フィールドの右端を超えていないか。
        field[i + y][j + x] != 0 && //フィールドのその位置に何か（壁や固定されたブロック）が存在するか。
        data[i * w + j] != 0 //ブロックのそのセルにブロックの一部が存在するか。
        //両方とも != 0 であれば、そのセルでブロックとフィールド上の何かが重なっていることになる。
      ) {
        return true; //衝突が検出されたら、即座に true を返して関数を終了
      }
    }
  }
  return false; //すべてのセルを確認しても衝突がなかった場合、false を返す
}

// ラインを消去する関数
export function eraseLine() {
  let erased = 0; //消去した行数をカウントするための変数です。最初は0に設定します。
  for (let y = 20; y >= 0; y--) {
    // 下から上に向かって、各行が横一列にブロックで埋まっているかをチェック
    if (
      //行がブロックで埋まっているかどうかを判断します。
      field[y].every(function (v) {
        return v != 0; //セルにブロックがある場合を意味します
      })
    ) {
      erased++; //消去した行数を1増やします。
      field.splice(y, 1); //  フィールドの y 番目の行を削除します。
      // 新しい空行を追加
      const newLine = new Array(12).fill(0); //長さ12の新しい配列を作成し、全ての要素を 0 に設定します。これは新しい空の行を表す
      newLine[0] = 8; // 左壁
      newLine[11] = 8; // 右壁 行の両端（左端と右端）に壁を設定します。8 は壁を表す値です。
      field.unshift(newLine); // 新しい行をフィールドの一番上に追加
      y++; // 消去した行からもう一度チェック
    }
  }
  return erased; //消去したラインの数を関数の呼び出し元に返します。
  // 消去したライン数に応じてスコアを加算したり、ゲームの状態を更新するために使用します。
}
