import {
  getUserEmail,
  saveScoreAndEmail,
  displayDataInHTMLRealtime,
} from "../firebaseConfig.js";

("use strict");

// グローバル変数の定義
var ctx,
  ship,
  beam,
  aliens = [],
  bombs = [],
  item,
  score = 0,
  stage = 1,
  clock = 0,
  mainT = NaN,
  alienT = NaN;

// タイマー関連の変数
var remainingTime = 180; // 3分（180秒）
var timerInterval = NaN; // タイマー用のインターバルID

//背景を読み込み
var backgroundImg = new Image();
backgroundImg.src = "cosmos-1853491_1920.jpg"; // 背景画像のパス

var scrollY = 0; // 背景のY座標を管理する変数

var powerItemImgY = -10; // PowerItem画像の初期位置（画面外からスタート）

var powerItemImgActive = true; // 「PowerItem」がアクティブかどうかのフラグ

var powerItemImgSpawnInterval = 1800; // 30秒（1800フレーム：1フレーム50ms）
var powerItemImgSpawnClock = powerItemImgSpawnInterval; // 「PowerItem」の出現を管理するタイマー

var scoreMultiplierActive = false; // スコア倍増のフラグ
var scoreMultiplierEndTime = 0; // スコア倍増終了時間

// ビームクラス: プレイヤーの発射するビーム
function Beam() {
  this.x = 0;
  this.y = -100;
  this.offset = 0;
  this.even = false;
  this.isEven = function () {
    return this.even;
  };
}

// 爆弾クラス: エイリアンが投下する爆弾
function Bomb() {
  this.x = 0;
  this.y = 600;
  this.offset = 48;
  this.even = false;
  this.time = rand(200) + 50; // 次に落ちるまでの時間
  this.isEven = function () {
    return this.even;
  };
}

// エイリアンクラス: 敵キャラクター
function Alien(x, y, point, offset) {
  this.x = x;
  this.y = y;
  this.point = point; // 倒した時のスコア
  this.offset = offset;
  this.speedX = (Math.random() * 10 + 1) * (Math.random() > 0.5 ? 1 : -1); // 横方向速度（1〜3, 正負ランダム）
  this.speedY = Math.random() * 10 + 10; // 下方向速度（0.5〜1.0）
  this.isEven = function () {
    return Alien.isEven;
  };
}

// 宇宙船クラス：プレイヤーキャラクター
function Ship() {
  this.x = 290;
  this.y = 550; // 初期位置
  this.offset = 192;
  this.moveL = false; // 左移動フラグ
  this.moveR = false; // 右移動フラグ
  this.isBlinking = false; // 点滅中フラグ
  this.blinkEndTime = 0; // 点滅終了時間
  this.isEven = function () {
    return true;
  };
}

// 'P-1.png'
function Item(image, drawX, drawY) {
  this.image = new Image();
  this.image.src = image;
  this.x = drawX;
  this.y = drawY;
  this.offset = 100;
  this.sizeX = 30;
  this.sizeY = 30;
}

function startTimer() {
  // 既存のタイマーをクリア（再スタート対応）
  if (!isNaN(timerInterval)) {
    clearInterval(timerInterval);
  }

  // 1秒ごとにカウントダウン
  timerInterval = setInterval(function () {
    remainingTime--;
    if (remainingTime <= 0) {
      remainingTime = 0;
      clearInterval(timerInterval);
      gameOver(); // タイマーが0になったらゲームオーバー
    }
  }, 1000);
}

function spawnAlien() {
  for (let i = 0; i < 2; i++) {
    // 1回で2体生成
    var x = rand(540) + 30; // ランダムなX座標 (30～570)
    var y = rand(200) - 200; // ランダムなY座標 (-200～0)
    var offset = rand(2) === 0 ? 96 : 144; // スプライトの種類をランダム化
    var randomPoints = Math.floor(Math.random() * 6) * 10 + 50;
    var newAlien = new Alien(x, y, randomPoints, offset);

    if (isPositionValid(x, y, aliens)) {
      aliens.push(newAlien);
      bombs.push(new Bomb());
    } else {
      console.error("Failed to find a valid position for Alien.");
    }
  }
}

// 配置が重複しないかチェック
function isPositionValid(newX, newY, aliens) {
  const margin = 20; // 他のエイリアンとの最低距離
  return aliens.every((alien) => {
    return (
      Math.abs(alien.x - newX) > margin && Math.abs(alien.y - newY) > margin
    );
  });
}

var alienSpawnInterval = NaN; // エイリアン出現用のインターバルID

function startAlienSpawning() {
  // 一定間隔でエイリアンを生成
  alienSpawnInterval = setInterval(function () {
    if (remainingTime > 0) {
      // タイマーが0以上の場合のみ生成
      spawnAlien();
    } else {
      clearInterval(alienSpawnInterval); // タイマーが0になったら停止
    }
  }, 1000); // 1秒間隔(エイリアンの出現間隔)
}

// スプライトの描画に関するオブジェクト
var baseBitmap = {
  draw: function (ctx) {
    if (!this.strip) {
      this.strip = document.getElementById("strip"); // スプライトシートの取得
    }
    ctx.drawImage(
      this.strip,
      this.offset + (this.isEven() ? 0 : 24),
      0,
      24,
      24,
      this.x,
      this.y,
      24,
      24
    );
  },
};

var itemBitmap = {
  draw: function (ctx) {
    ctx.drawImage(this.image, this.x, this.y, 30, 30);
  },
};

// 各クラスに描画の機能を継承
Ship.prototype = Beam.prototype = Alien.prototype = Bomb.prototype = baseBitmap;

Item.prototype = itemBitmap;

// エイリアンの移動や状態管理のプロパティ
Alien.isEven = false; // 描画状態の切り替え
Alien.isDown = false; // 下方向移動のフラグ
Alien.isLeft = false; // 左方向移動のフラグ
Alien.interval = 1000; // 移動間隔

// ランダムな整数を返す関数
function rand(max) {
  return Math.floor(Math.random() * max);
}

// 初期化関数: ゲームの準備
window.init = function () {
  ctx = document.getElementById("canvas").getContext("2d");
  ctx.font = "20pt Arial";
  score = 0;
  stage = 1;

  // キー操作のイベントリスナーを設定
  addEventListener("keydown", keyDown, true);
  addEventListener("keyup", keyUp, true);

  // チュートリアルを表示
  document.getElementById("tutorial").style.display = "flex";
};

// ゲーム開始関数
window.start = function () {
  document.getElementById("tutorial").style.display = "none"; // チュートリアルを非表示

  ship = new Ship(); // 宇宙船の初期化
  beam = new Beam(); // ビームの初期化
  clock = 0;

  // タイマーの初期化と開始
  remainingTime = 180; // タイマーをリセット
  startTimer();

  // エイリアン出現の初期化と開始
  aliens = []; // 既存のエイリアンをクリア
  bombs = [];
  startAlienSpawning(); // 定期的にエイリアンを生成

  // メインループとエイリアン移動ループを開始
  if (isNaN(alienT)) {
    alienT = setTimeout(alienLoop, Alien.interval);
  }

  if (isNaN(mainT)) {
    mainT = setInterval(mainLoop, 50);
  }

  // エイリアンを初期化
  aliens = [];
  bombs = [];
  var numAliens = 20; // 出現させたいエイリアンの総数
  for (var i = 0; i < numAliens; i++) {
    var x, y, newAlien;
    var offset, point;

    if (i % 2 === 0) {
      // 赤いエイリアン
      offset = 96; // 赤いエイリアンのスプライト
      point = 150; // 赤いエイリアンのポイント
    } else {
      // 黄色いエイリアン
      offset = 144; // 黄色いエイリアンのスプライト
      point = 100; // 黄色いエイリアンのポイント
    }

    var attempts = 0; // 試行回数

    do {
      x = rand(540) + 30; // ランダムなX座標 (30～570)
      y = rand(200) - 200; // ランダムなY座標 (-200～0)
      newAlien = new Alien(x, y, point, offset);
      attempts++;
    } while (!isPositionValid(x, y, aliens) && attempts < 100); // 重ならないように配置

    if (attempts < 100) {
      aliens.push(newAlien);
      bombs.push(new Bomb());
    } else {
      console.error(
        "Failed to find a valid position for Alien after 100 attempts."
      );
    }
  }

  // 配置が重複しないかをチェック
  function isPositionValid(newX, newY, aliens) {
    const margin = 20; // 他のエイリアンとの最低距離
    return aliens.every((alien) => {
      return (
        Math.abs(alien.x - newX) > margin && Math.abs(alien.y - newY) > margin
      );
    });
  }

  // メインループとエイリアン移動ループを開始
  if (isNaN(alienT)) {
    alienT = setTimeout(alienLoop, Alien.interval);
  }

  if (isNaN(mainT)) {
    mainT = setInterval(mainLoop, 50);
  }

  // 20秒ごとに「P」を生成
  setInterval(() => {
    item = new Item("P-1.png", Math.random() * 500, 0); // ランダムなX座標
  }, 20000);
};

// キー押下時の処理
function keyDown(evt) {
  if (evt.keyCode == 32) {
    // スペースキーでビーム発射
    evt.preventDefault();
    if (beam.y < 0) {
      beam.y = 520;
      beam.x = ship.x;
    }
  }

  if (evt.keyCode == 37) ship.moveL = true; // 左移動

  if (evt.keyCode == 39) ship.moveR = true; // 右移動
}

// キー離した時の処理
function keyUp(evt) {
  if (evt.keyCode == 37) ship.moveL = false;
  if (evt.keyCode == 39) ship.moveR = false;
}

// エイリアンの移動処理（速度を考慮）
function alienLoop() {
  Alien.isEven = !Alien.isEven; // 描画状態を切り替え

  aliens.forEach(function (alien) {
    // エイリアンの位置を更新
    alien.x += alien.speedX;
    alien.y += alien.speedY;

    // 画面の境界をチェック
    if (alien.x < 0 || alien.x > 570) {
      // 横方向の画面外チェック
      alien.speedX *= -1; // 速度の方向を反転
      alien.x = Math.max(0, Math.min(alien.x, 570)); // 範囲内に収める
    }

    if (alien.y > 550) {
      // 下方向の画面外チェック
      alien.y = -50; // 上に戻す
      alien.x = rand(540) + 30; // 新しい位置をランダム設定
    }
  });

  // エイリアン移動の間隔を調整して再呼び出し
  Alien.interval = 200 + rand(100); // エイリアンの移動速度調整(200～300ms）
  setTimeout(alienLoop, Alien.interval);
}

// ゲームオーバー処理
function gameOver() {
  clearInterval(mainT);
  mainT = NaN;
  clearTimeout(alienT);
  alienT = NaN;
  draw();
}

// メインループ: ゲーム全体の処理を更新
function mainLoop() {
  clock++;

  scrollY += 1; // 背景スクロール

  var hit = -1;

  // ビームとエイリアンの当たり判定
  if (beam.y > -30) {
    beam.y -= 15;
    beam.even = !beam.even;

    aliens.forEach(function (e, i) {
      if (
        e.x - 15 < beam.x &&
        beam.x < e.x + 15 &&
        e.y - 10 < beam.y &&
        beam.y < e.y + 20
      ) {
        hit = i;
        beam.y = -100; // ビームがエイリアンに当たったら非表示

        // スコア倍増が有効なら、倍増したスコアを加算
        if (scoreMultiplierActive) {
          score += e.point * 2; // ポイントを2倍
        } else {
          score += e.point; // 通常ポイント
        }
        return; // 一度当たったエイリアンは処理しない
      }
    });

    // ビームと P の当たり判定
    if (
      item && // アイテムが存在する
      item.x - 15 < beam.x &&
      beam.x < item.x + 15 &&
      item.y - 10 < beam.y &&
      beam.y < item.y + 20
    ) {
      // ビームが P に当たった場合の処理
      beam.y = -100; // ビームを非表示
      item = null; // P を削除

      // スコア加算（ 1000 点）
      score += 1000;
      console.log("P hit! Score increased by 1000.");
    }
  }

  // ヒットしたエイリアンを削除
  if (hit >= 0) {
    aliens.splice(hit, 1);
  }

  // スコア倍増効果の終了チェック
  if (scoreMultiplierActive && clock >= scoreMultiplierEndTime) {
    scoreMultiplierActive = false; // スコア倍増フラグを無効にする
  }

  // 爆弾処理
  bombs.forEach(function (b) {
    if (b.time < clock) {
      var a = aliens[rand(aliens.length)];
      (b.x = a.x), (b.y = a.y + 30);
      b.time += rand(200) + 50;
    } else if (b.y < 600) {
      b.y += 10;
    }

    b.even = !b.even;

    // 爆弾が宇宙船に当たった場合
    if (b.x - 15 < ship.x && ship.x < b.x + 15 && 530 < b.y && b.y < 550) {
      // スコアをマイナス200
      score = Math.max(0, score - 200);

      // 点滅開始
      ship.isBlinking = true;
      ship.blinkEndTime = clock + 30; // 30フレーム後に終了 (約1.5秒)

      // 爆弾を画面外にリセット
      b.y = 600;
    }
  });

  // 宇宙船の移動処理
  if (ship.moveR) {
    ship.x = Math.min(ship.x + 5, 570);
  }
  if (ship.moveL) {
    ship.x = Math.max(ship.x - 5, 0);
  }

  draw();
}

// 描画処理
async function draw() {
  // 背景を描画
  ctx.drawImage(backgroundImg, 0, scrollY % 600, 600, 600);
  ctx.drawImage(backgroundImg, 0, (scrollY % 600) - 600, 600, 600);

  // エイリアンを描画
  aliens.forEach(function (a) {
    a.draw(ctx);
  });

  // 宇宙船を描画（点滅中は一定フレームで非表示）
  if (!ship.isBlinking || Math.floor(clock / 10) % 2 === 0) {
    ship.draw(ctx);
  }

  if (item) {
    item.draw(ctx);
    item.y += 1;
  }

  // Pの画像を描画.サイズ調整
  // if (playerImgActive) {
  //     ctx.drawImage(playerImg, 270, playerImgY, 30, 30); // 幅と高さを30に変更
  // }

  // 点滅終了判定
  if (ship.isBlinking && clock >= ship.blinkEndTime) {
    ship.isBlinking = false; // 点滅終了
  }

  // ビームを描画
  beam.draw(ctx);

  // 爆弾を描画
  bombs.forEach(function (b) {
    b.draw(ctx);
  });

  // スコアを描画
  ctx.font = "14pt Arial"; //文字のサイズを設定
  ctx.fillStyle = "rgb(0,255,0)";
  ctx.fillText(`スコア: ${("0000000" + score).slice(-7)}`, 450, 40);

  // タイマーを描画
  ctx.font = "14pt Arial"; // タイマー用の文字サイズ
  ctx.fillStyle = "rgb(255,255,255)";
  var minutes = Math.floor(remainingTime / 60);
  var seconds = remainingTime % 60;
  ctx.fillText(
    `残り時間: ${minutes}:${seconds.toString().padStart(2, "0")}`,
    450,
    20
  );

  //ゲーム終了時の表示とスコアを保存
  if (isNaN(mainT)) {
    ctx.fillText("GAME OVER", 220, 150);

    const title = document.title;
    const userEmail = await getUserEmail();
    await saveScoreAndEmail(title, score, userEmail);
  }

  // リアルタイムデータを表示
  const title = document.title;
  displayDataInHTMLRealtime(title);
}
