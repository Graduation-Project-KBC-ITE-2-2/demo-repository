import {
  getUserEmail,
  saveScoreAndEmail,
  displayDataInHTMLRealtime,
} from "../firebaseConfig.js";

("use strict");

// ファイル先頭あたりで
const EXPLOSION_RADIUS = 25;
const EXPLOSION_DURATION = 40;

// ゲームの状態を管理する変数
const gameState = {
  houses: [],
  missiles: [],
  lasers: [],
  explosions: [],
  timer: NaN,
  count: 0,
  score: 0,
  ctx: null,
  waveNumber: 1,
  waveInProgress: false,
  energy: 100, // バリアのエネルギーとして使用
  maxEnergy: 100,
  barrierActive: true, // バリアが有効かどうか
  barrierCooldown: 300, // 再生成までのフレーム数
  barrierCooldownCounter: 0, // クールダウンのカウント
  // 爆発の共通設定（例）
  backgroundImage: null, // 背景画像を追加
};

// 家を表すクラス
function House(x) {
  this.x = x;
  this.y = 550;
  this.w = 40;
  this.hit = false;
}

// 敵ミサイルを表すクラス
function Missile() {
  this.maxCount = 500;
  this.interval = 1000;
  this.destroyed = false;
  this.exploded = false;
  this.r = 0;
  this.reload();
}

Missile.prototype.reload = function () {
  this.sX = rand(800);
  this.eX = rand(800);
  this.firetime = rand(this.interval) + gameState.count;
  this.x = this.sX;
  this.y = 0;
};

Missile.prototype.update = function () {
  const c = gameState.count - this.firetime;
  if (c < 0) return;

  if (this.exploded) {
    this.r++;
    if (this.r > 50) {
      this.destroyed = true;
    }
  } else {
    this.x = ((this.eX - this.sX) * c) / this.maxCount + this.sX;
    this.y = (600 * c) / this.maxCount;

    // バリアとの衝突判定
    if (gameState.barrierActive) {
      const barrierY = gameState.houses[0].y - 60; // バリアのY座標
      if (this.y >= barrierY) {
        // バリアに衝突
        gameState.energy -= 30; // エネルギーを消費
        if (gameState.energy < 0) {
          gameState.energy = 0; // エネルギーは最低0にする
        }

        gameState.barrierActive = false; // バリアを無効化
        gameState.barrierCooldownCounter = gameState.barrierCooldown; // クールダウン開始

        explodeSound();

        // ミサイルが爆発するときの処理
        this.exploded = true;
        this.r = EXPLOSION_RADIUS; // 爆発半径を設定
        +gameState.explosions.push(
          new Explosion(this.x, this.y, EXPLOSION_RADIUS, EXPLOSION_DURATION)
        );
        return; // 処理を終了
      }
    }

    // 地面に衝突時
    if (c > this.maxCount) {
      gameState.houses.forEach((house) => {
        if (house.x + house.w >= this.x - 50 && this.x + 50 >= house.x) {
          house.hit = true;
        }
      });

      if (gameState.houses.every((house) => house.hit)) {
        clearInterval(gameState.timer);
        gameState.timer = NaN;
      }

      explodeSound();
      this.exploded = true;
      this.r = EXPLOSION_RADIUS;
      gameState.explosions.push(
        new Explosion(this.x, this.y, EXPLOSION_RADIUS, EXPLOSION_DURATION)
      );
    }
  }
};

Missile.prototype.draw = function (ctx) {
  ctx.strokeStyle = "rgb(0,255,255)";
  line(ctx, this.sX, 0, this.x, this.y);
  if (this.exploded && this.r > 0) {
    ctx.fillStyle = "rgba(0,255,0,0.5)";
    circle(ctx, this.x, this.y, this.r);
  }
};

// プレイヤーの爆発エフェクトを表すクラス
function Explosion(x, y, radius, duration) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.maxRadius = radius + 50; // 拡大範囲
  this.duration = duration;
}

Explosion.prototype.update = function () {
  if (this.radius < this.maxRadius) {
    this.radius += 0.5;
  }
  this.duration--;
};

Explosion.prototype.draw = function (ctx) {
  if (this.radius > 0) {
    ctx.fillStyle = "rgba(0,255,0,0.5)";
    circle(ctx, this.x, this.y, this.radius); // 正しい座標を使用
  }
};

Explosion.prototype.isFinished = function () {
  return this.duration <= 0;
};

// プレイヤーの攻撃（レーザー）を表すクラス
function Laser(targetX, targetY) {
  this.startX1 = 0; // 左側からのレーザー開始点
  this.startY1 = 600;
  this.startX2 = 800; // 右側からのレーザー開始点
  this.startY2 = 600;
  this.endX = targetX; // レーザーの目標地点X
  this.endY = targetY; // レーザーの目標地点Y
  this.explosionRadius = 25; // 爆発範囲
  this.duration = 10; // レーザーの表示持続フレーム数
}

Laser.prototype.update = function () {
  this.duration--;
};

Laser.prototype.draw = function (ctx) {
  ctx.strokeStyle = "rgb(0,255,0)";
  ctx.lineWidth = 2;

  // 左側レーザーの描画
  line(ctx, this.startX1, this.startY1, this.endX, this.endY);

  // 右側レーザーの描画
  line(ctx, this.startX2, this.startY2, this.endX, this.endY);

  // **ここでの爆発描画を削除**
};

// ランダムな整数を生成する関数
function rand(max) {
  return Math.floor(Math.random() * max);
}

// 爆発音を再生する関数
function explodeSound() {
  const explodeAudio = document.getElementById("explode");
  if (explodeAudio) {
    explodeAudio.currentTime = 0;
    explodeAudio.play();
  }
}

// 線を描画する関数
function line(ctx, x0, y0, x1, y1) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.closePath();
  ctx.stroke();
}

// 円を描画する関数
function circle(ctx, x, y, r) {
  if (r <= 0) return;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, true); // 正確な中心と半径で円を描画
  ctx.fill();
}

// 線分と円の衝突判定関数
function lineIntersectsCircle(x1, y1, x2, y2, cx, cy, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) {
    return Math.sqrt((cx - x1) ** 2 + (cy - y1) ** 2) <= r;
  }

  const unitDx = dx / length;
  const unitDy = dy / length;

  let t = unitDx * (cx - x1) + unitDy * (cy - y1);

  let closestX = x1 + unitDx * t;
  let closestY = y1 + unitDy * t;

  if (t < 0) {
    closestX = x1;
    closestY = y1;
  } else if (t > length) {
    closestX = x2;
    closestY = y2;
  }

  const distance = Math.sqrt((cx - closestX) ** 2 + (cy - closestY) ** 2);

  return distance <= r;
}

// ゲームの初期化関数
function init() {
  const canvas = document.getElementById("canvas");
  if (!canvas) {
    console.error("Canvas element not found!");
    return;
  }
  canvas.style.display = "block";
  gameState.ctx = canvas.getContext("2d");
  gameState.ctx.font = "20pt Arial";

  // 背景画像をロード
  gameState.backgroundImage = new Image();
  gameState.backgroundImage.src = "background.jpg"; // 背景画像のパス
  gameState.backgroundImage.onload = function () {
    console.log("背景画像がロードされました");
  };

  canvas.addEventListener("mousedown", mousedown);

  console.log("Game initialized");
}

// ゲーム開始関数
function start() {
  console.log("Game started");
  const tutorial = document.getElementById("tutorial");
  if (tutorial) {
    tutorial.style.display = "none";
  }
  const canvas = document.getElementById("canvas");
  if (canvas) {
    canvas.style.display = "block";
    gameState.ctx = canvas.getContext("2d");
    gameState.ctx.font = "20pt Arial";
  }

  // ゲーム状態のリセット
  gameState.score = 0;
  gameState.waveNumber = 1;
  gameState.waveInProgress = false;
  gameState.count = 0;

  // 追加: エネルギーをリセット
  gameState.energy = gameState.maxEnergy;

  // 家の初期化
  gameState.houses = [];
  for (let i = 0; i < 13; i++) {
    gameState.houses.push(new House(i * 60 + 20));
  }

  // 敵ミサイルの初期化
  gameState.missiles = [];
  const baseMissiles = 3;
  const numMissiles = baseMissiles + gameState.waveNumber * 2;
  for (let i = 0; i < numMissiles; i++) {
    const missile = new Missile();
    missile.interval = 1200 - gameState.waveNumber * 50;
    if (missile.interval < 400) missile.interval = 400;
    missile.maxCount = 600 - gameState.waveNumber * 10;
    if (missile.maxCount < 200) missile.maxCount = 200;
    missile.reload();
    gameState.missiles.push(missile);
  }

  // レーザーと爆発エフェクトの初期化
  gameState.lasers = [];
  gameState.explosions = [];

  // メインループの開始
  gameState.timer = setInterval(mainLoop, 20);
}

// メインループ関数
// メインループ関数
function mainLoop() {
  gameState.count++;

  // レーザーの更新
  gameState.lasers = gameState.lasers.filter((laser) => {
    laser.update();
    return laser.duration > 0;
  });

  // 爆発エフェクトの更新
  gameState.explosions = gameState.explosions.filter((explosion) => {
    explosion.update();
    return !explosion.isFinished();
  });

  // 敵ミサイルの更新
  gameState.missiles.forEach((missile) => {
    if (missile.destroyed) return;
    missile.update();
  });

  // ミサイル配列から破壊済みミサイルを削除
  gameState.missiles = gameState.missiles.filter(
    (missile) => !missile.destroyed
  );

  // プレイヤーの爆発エフェクトと敵ミサイルの当たり判定
  gameState.explosions.forEach((explosion) => {
    gameState.missiles.forEach((missile) => {
      if (missile.destroyed || missile.exploded) return;

      const distance = Math.sqrt(
        (explosion.x - missile.x) ** 2 + (explosion.y - missile.y) ** 2
      );
      if (distance <= explosion.radius + 10) {
        missile.exploded = true;
        missile.r = 25;
        gameState.score += 100;
        explodeSound();

        // レーザーの着弾・ミサイルに当たったとき
        gameState.explosions.push(
          new Explosion(this.x, this.y, EXPLOSION_RADIUS, EXPLOSION_DURATION)
        );
      }
    });
  });

  // エネルギーの回復処理
  const energyRegenRate = 0.1; // フレームごとの回復量
  gameState.energy += energyRegenRate;
  if (gameState.energy > gameState.maxEnergy) {
    gameState.energy = gameState.maxEnergy;
  }

  // バリアの再生成ロジック
  if (!gameState.barrierActive && gameState.barrierCooldownCounter > 0) {
    gameState.barrierCooldownCounter--;
    if (gameState.barrierCooldownCounter === 0 && gameState.energy > 0) {
      gameState.barrierActive = true; // バリアを再有効化
    }
  }

  // ウェーブ終了後、次のウェーブを開始
  if (gameState.missiles.length === 0 && !gameState.waveInProgress) {
    gameState.waveInProgress = true;
    setTimeout(startNextWave, 3000);
  }

  draw();
}

// マウスクリック時の処理
function mousedown(e) {
  const canvas = document.getElementById("canvas");
  if (!canvas) return;

  // キャンバスの境界情報を取得
  const rect = canvas.getBoundingClientRect();

  // デバイスピクセル密度を考慮したスケーリング
  const scaleX = canvas.width / rect.width; // 論理幅と表示幅の比率
  const scaleY = canvas.height / rect.height; // 論理高さと表示高さの比率

  // マウスのクリック位置をキャンバス内座標に変換
  const mouseX = (e.clientX - rect.left) * scaleX;
  const mouseY = (e.clientY - rect.top) * scaleY;

  // エネルギー消費量
  const energyCost = 15;

  if (gameState.energy < energyCost) {
    console.log("エネルギーが足りません！");
    return;
  }

  gameState.energy -= energyCost;

  // 新しいレーザーを生成して配列に追加
  const newLaser = new Laser(mouseX, mouseY);
  gameState.lasers.push(newLaser);

  // 爆発エフェクトを追加
  gameState.explosions.push(new Explosion(mouseX, mouseY, 25, 60));

  // クリック位置でのみミサイルとの当たり判定を行う
  gameState.missiles.forEach((missile) => {
    if (missile.destroyed || missile.exploded) return;

    const distance = Math.sqrt(
      (missile.x - mouseX) ** 2 + (missile.y - mouseY) ** 2
    );

    if (distance <= 10) {
      missile.exploded = true;
      missile.r = 25;
      gameState.score += 100;
      explodeSound();

      gameState.explosions.push(new Explosion(missile.x, missile.y, 25, 60));
    }
  });
}

// 次のウェーブを開始する関数
function startNextWave() {
  gameState.waveNumber++;
  gameState.waveInProgress = false;
  gameState.missiles = [];

  const baseMissiles = 3;
  const numMissiles = baseMissiles + gameState.waveNumber * 2;

  for (let i = 0; i < numMissiles; i++) {
    const missile = new Missile();
    missile.interval = 1200 - gameState.waveNumber * 50;
    if (missile.interval < 400) missile.interval = 400;
    missile.maxCount = 600 - gameState.waveNumber * 10;
    if (missile.maxCount < 200) missile.maxCount = 200;
    missile.reload();
    gameState.missiles.push(missile);
  }
}

// 描画関数
async function draw() {
  const ctx = gameState.ctx;
  if (!ctx) return;

  // 背景を描画
  if (gameState.backgroundImage) {
    ctx.drawImage(
      gameState.backgroundImage,
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height
    );
  } else {
    // 背景がロードされていない場合は黒で塗りつぶし
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(0, 0, 800, 600);
  }

  // 家の描画
  gameState.houses.forEach((house) => {
    const strip = document.getElementById("strip");
    if (strip) {
      ctx.drawImage(
        strip,
        house.hit ? 20 : 0,
        0,
        20,
        20,
        house.x,
        house.y,
        house.w,
        house.w
      );
    }
  });

  // レーザーの描画
  gameState.lasers.forEach((laser) => {
    laser.draw(ctx);
  });

  // 爆発エフェクトの描画
  gameState.explosions.forEach((explosion) => {
    explosion.draw(ctx);
  });

  // 敵ミサイルの描画
  gameState.missiles.forEach((missile) => {
    if (!missile.destroyed || missile.exploded) {
      missile.draw(ctx);
    }
  });

  // バリアの描画
  if (gameState.barrierActive && gameState.energy > 0) {
    const ctx = gameState.ctx;

    ctx.strokeStyle = "cyan"; // バリアの色
    ctx.lineWidth = 3; // バリアの太さ
    ctx.beginPath();

    // バリアのY座標
    const barrierY = gameState.houses[0].y - 60; // ビルの上に少し離れた高さ

    // バリアの左端から右端まで描画
    ctx.moveTo(0, barrierY); // 左端（X = 0）
    ctx.lineTo(ctx.canvas.width, barrierY); // 右端（X = 画面幅）

    ctx.stroke();
  }

  // スコアの描画
  ctx.fillStyle = "rgb(0,255,0)";
  ctx.font = "20pt Arial"; // フォントの設定を明示的に追加
  ctx.fillText(("00000" + gameState.score).slice(-5), 570, 30);

  // WAVE 表示
  ctx.fillStyle = "rgb(255,255,255)";
  ctx.fillText(`WAVE: ${gameState.waveNumber}`, 50, 30); // 明示的にWAVEを描画

  // エネルギーバーの描画
  const barWidth = 200;
  const barHeight = 20;
  const barX = 570;
  const barY = 40;
  const energyRatio = gameState.energy / gameState.maxEnergy;

  // エネルギーバーの枠
  ctx.strokeStyle = "rgb(255,255,255)";
  ctx.strokeRect(barX, barY, barWidth, barHeight);

  // エネルギー部分
  ctx.fillStyle = "rgb(0,255,0)";
  ctx.fillRect(barX, barY, barWidth * energyRatio, barHeight);

  // エネルギー文字
  ctx.fillStyle = "rgb(255,255,255)";
  ctx.font = "14pt Arial";
  ctx.fillText(
    `Energy: ${Math.floor(gameState.energy)}/${gameState.maxEnergy}`,
    barX,
    barY + barHeight + 20
  );

  // ゲームオーバーの表示
  if (!gameState.timer) {
    ctx.fillStyle = "rgb(255,0,0)";
    ctx.font = "20pt Arial"; // フォントサイズを再設定
    ctx.fillText("GAME OVER", 320, 150);
    showRetryModal(); // ゲームオーバーモーダルを表示
    const title = document.title;
    const userEmail = await getUserEmail();
    await saveScoreAndEmail(title, gameState.score, userEmail);
  }
}
// リトライモーダルを表示する関数
function showRetryModal() {
  const retryModal = document.getElementById("retry");
  if (retryModal) {
    retryModal.classList.remove("hidden"); // モーダルを表示
  }
}

// リトライボタンの処理
function retryGame() {
  const retryModal = document.getElementById("retry");
  if (retryModal) {
    retryModal.classList.add("hidden"); // モーダルを非表示
  }
  start(); // ゲームを再スタート
}

// **関数を window オブジェクトに割り当ててグローバルにする**
window.init = init;
window.start = start;
window.retryGame = retryGame;

// ゲームデータをリアルタイムで表示
const title = document.title;
displayDataInHTMLRealtime(title);

// **関数を window オブジェクトに割り当ててグローバルにする**
window.init = init;
window.start = start;

// **init 関数の呼び出しを defer スクリプト内で行う**
// もしくは、HTML のロード後に自動で呼び出すように設定する
