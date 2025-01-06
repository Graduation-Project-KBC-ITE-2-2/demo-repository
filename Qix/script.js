"use strict";
var timer = NaN,
  areas = [],
  score = 0,
  enemies = [],
  ship,
  ctx;
var gameOver = false; // ゲームオーバーのフラグ
var level = 1; // 現在のステージ
var levelCleared = false; // ステージクリアのフラグ
var clearedLevel = 1; // クリアしたステージの番号を保存
var gameWon = false; // ゲームクリアのフラグ
var levelScore = 0; // ステージごとのスコア
var levelTotalArea = 0; // ステージごとの合計エリア
var timeRemaining = 60; // 初期制限時間（秒）
var difficultyMultiplier = 1 + (level - 1) * 0.3; // 増加率を0.5から0.3に

function Rect(left, top, right, bottom) {
  this.left = left;
  this.top = top;
  this.right = right;
  this.bottom = bottom;
  this.width = function () {
    return this.right - this.left;
  };
  this.height = function () {
    return this.bottom - this.top;
  };
  this.clone = function () {
    return new Rect(this.left, this.top, this.right, this.bottom);
  };
  this.draw = function (ctx) {
    ctx.fillStyle = "lightgreen";
    ctx.fillRect(this.left, this.top, this.width(), this.height());
    ctx.strokeStyle = "green";
    ctx.strokeRect(this.left, this.top, this.width(), this.height());
  };
}

function startGame() {
  // スクロールを無効化
  document.body.classList.add("no-scroll");
  console.log("Start button clicked"); // デバッグ用
  document.getElementById("tutorial").style.display = "none"; // チュートリアルを非表示
  gameOver = false; // ゲームオーバーのフラグをリセット
  score = 0; // スコアをリセット
  init(); // ゲームの初期化を実行
}

function Edge(r, delta) {
  this.r = r;
  this.theta = 0;
  this.delta = delta;
  this.x = 0;
  this.y = 0;

  // ★ 点滅用のプロパティを追加
  this.blinkInterval = 500; // 点滅間隔（ミリ秒）
  this.lastBlinkTime = Date.now();
  this.visible = true;

  this.update = function () {
    this.theta = (this.theta + this.delta) % (Math.PI * 2);
    this.x = Math.cos(this.theta) * this.r;
    this.y = Math.sin(this.theta) * this.r;

    // ★ 点滅の状態を更新
    var currentTime = Date.now();
    if (currentTime - this.lastBlinkTime >= this.blinkInterval) {
      this.visible = !this.visible; // 表示状態を反転
      this.lastBlinkTime = currentTime;
    }
  };

  this.isHit = function (cx, cy) {
    var dx = this.x / 10,
      dy = this.y / 10;
    for (
      var x0 = cx - this.x, y0 = cy - this.y, i = 0;
      i < 20;
      i++, x0 += dx, y0 += dy
    ) {
      if (
        ship.x - ship.w / 2 < x0 &&
        x0 < ship.x + ship.w / 2 &&
        ship.y - ship.w / 2 < y0 &&
        y0 < ship.y + ship.w / 2
      ) {
        return true;
      }
    }
    return false;
  };

  this.draw = function (ctx, cx, cy) {
    if (!this.visible) {
      return; // 非表示状態の場合、描画しない
    }
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(cx - this.x, cy - this.y);
    ctx.lineTo(cx + this.x, cy + this.y);
    ctx.closePath();
    ctx.stroke();
  };
}

function Enemy() {
  this.edges = [
    new Edge(20, 0.6),
    new Edge(40, 0.4),
    new Edge(60, 0.2),
    new Edge(100, 0.1),
  ];

  this.prevX = this.x = rand(600);
  this.prevY = this.y = rand(600);
  this.nextX = rand(600);
  this.nextY = rand(600);
  this.count = 0;
  this.limit = rand(20) + 50;

  /// ★ 点滅用のプロパティを追加
  this.blinkInterval = 500; // 点滅間隔（ミリ秒）
  this.lastBlinkTime = Date.now();
  this.visible = true;

  this.update = function () {
    if (++this.count > this.limit) {
      // 次の移動場所の設定
      this.prevX = this.nextX;
      this.prevY = this.nextY;
      this.nextX = ship.rect.left + rand(ship.rect.width());
      this.nextY = ship.rect.top + rand(ship.rect.height());
      this.limit = rand(20) + 50;
      this.count = 0;
    } else {
      // 徐々に中心位置を移動
      this.x =
        this.prevX + ((this.nextX - this.prevX) * this.count) / this.limit;
      this.y =
        this.prevY + ((this.nextY - this.prevY) * this.count) / this.limit;
    }

    this.edges.forEach(function (e) {
      e.update();
    });

    // ★ 点滅の状態を更新
    var currentTime = Date.now();
    if (currentTime - this.lastBlinkTime >= this.blinkInterval) {
      this.visible = !this.visible; // 表示状態を反転
      this.lastBlinkTime = currentTime;
    }
  };

  this.isHit = function () {
    var that = this;
    return this.edges.some(function (e) {
      return e.isHit(that.x, that.y);
    });
  };

  this.draw = function (ctx) {
    if (!this.visible) {
      return; // 非表示状態の場合、描画しない
    }

    for (var i = 0; i < this.edges.length; i++) {
      this.edges[i].draw(ctx, this.x, this.y);
    }
  };
}

function Ship() {
  this.rect = new Rect(10, 10, 590, 590);
  this.x = this.rect.left;
  this.y = this.rect.top;
  this.w = 20;
  this.dx = 0;
  this.dy = 0;
  this.sx = 0;
  this.sy = 0;
  this.image = document.getElementById("ship");
  this.count = 0;

  this.keyL = false;
  this.keyU = false;
  this.keyR = false;
  this.keyD = false;

  this.update = function () {
    this.count++;

    if (this.dx != 0 || this.dy != 0) {
      // 移動中 ＝ 無防備モード
      this.x = Math.max(
        this.rect.left,
        Math.min(this.rect.right, this.x + this.dx)
      );
      this.y = Math.max(
        this.rect.top,
        Math.min(this.rect.bottom, this.y + this.dy)
      );

      var r = null;
      if (this.x == this.rect.left || this.x == this.rect.right) {
        // 水平方向に分割
        r = this.rect.clone();
        if (this.y - this.rect.top > this.rect.bottom - this.y) {
          this.rect.bottom = r.top = this.y;
        } else {
          this.rect.top = r.bottom = this.y;
        }
      } else if (this.y == this.rect.top || this.y == this.rect.bottom) {
        // 垂直方向に分割
        r = this.rect.clone();
        if (this.x - this.rect.left > this.rect.right - this.x) {
          this.rect.right = r.left = this.x;
        } else {
          this.rect.left = r.right = this.x;
        }
      }

      if (r) {
        this.dx = this.dy = 0;
        areas.push(r);
        var area = r.width() * r.height();
        var adjustedScore = Math.sqrt(area) * 0.3; // 面積に基づくスコア計算
        levelScore += area; // 面積をステージスコアに加算
        score += adjustedScore; // グローバルスコアに加算
      }

      return;
    }

    // キー入力処理
    if (this.keyR && this.x < this.rect.right) {
      if (this.y == this.rect.top || this.y == this.rect.bottom) {
        this.x = Math.min(this.rect.right, this.x + 10);
      } else {
        this.dx += 10;
        this.sx = this.x;
        this.sy = this.y;
      }
    }

    if (this.keyL && this.x > this.rect.left) {
      if (this.y == this.rect.top || this.y == this.rect.bottom) {
        this.x = Math.max(this.rect.left, this.x - 10);
      } else {
        this.dx -= 10;
        this.sx = this.x;
        this.sy = this.y;
      }
    }

    if (this.keyU && this.y > this.rect.top) {
      if (this.x == this.rect.left || this.x == this.rect.right) {
        this.y = Math.max(this.rect.top, this.y - 10);
      } else {
        this.dy -= 10;
        this.sx = this.x;
        this.sy = this.y;
      }
    }

    if (this.keyD && this.y < this.rect.bottom) {
      if (this.x == this.rect.left || this.x == this.rect.right) {
        this.y = Math.min(this.rect.bottom, this.y + 10);
      } else {
        this.dy += 10;
        this.sx = this.x;
        this.sy = this.y;
      }
    }
  };

  this.draw = function (ctx) {
    // 現在の範囲
    ctx.strokeStyle = "blue";
    ctx.strokeRect(
      this.rect.left,
      this.rect.top,
      this.rect.width(),
      this.rect.height()
    );

    // 自分自身を描画
    ctx.drawImage(this.image, this.x - this.w / 2, this.y - this.w / 2);

    // シールド時の描画
    if (this.dx == 0 && this.dy == 0) {
      ctx.strokeStyle = "white";
      ctx.beginPath();
      ctx.arc(this.x, this.y, 10 + (this.count % 3), 0, Math.PI * 2, true);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(this.sx, this.sy);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
    }
  };
}

function rand(r) {
  return Math.floor(Math.random() * r);
}

function init() {
  level = 1;
  gameWon = false;
  score = 0;
  gameOver = false;
  startLevel(level);

  var canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  ctx.font = "20pt Arial";
  timer = setInterval(mainLoop, 100);

  addEventListener("keydown", function (e) {
    toggleKey(e.keyCode, true);
  });
  addEventListener("keyup", function (e) {
    toggleKey(e.keyCode, false);
  });
}

function startLevel(level) {
  enemies = [];
  for (var i = 0; i < level; i++) {
    enemies.push(new Enemy());
  }
  ship = new Ship();
  ship.rect = new Rect(10, 10, 590, 590);
  ship.x = ship.rect.left;
  ship.y = ship.rect.top;
  areas = [];
  levelCleared = false;
  levelScore = 0;
  levelTotalArea = ship.rect.width() * ship.rect.height();

  // 難易度倍率を設定（例: レベル1 = x1, レベル2 = x1.5, レベル3 = x2）
  difficultyMultiplier = 1 + (level - 1) * 0.5;

  // 制限時間を初期化
  timeRemaining = 60; // 各ステージごとに60秒
}

function toggleKey(code, flag) {
  switch (code) {
    case 37:
      ship.keyL = flag;
      break;
    case 38:
      ship.keyU = flag;
      break;
    case 39:
      ship.keyR = flag;
      break;
    case 40:
      ship.keyD = flag;
      break;
  }
}

function mainLoop() {
  if (!gameOver && !levelCleared) {
    enemies.forEach(function (enemy) {
      enemy.update();
    });
    ship.update();

    if (ship.dx != 0 || ship.dy != 0) {
      if (
        enemies.some(function (enemy) {
          return enemy.isHit();
        })
      ) {
        gameOver = true;
      }
    }

    // 制限時間を減らす
    timeRemaining -= 0.1; // 0.1秒ごとに減らす
    if (timeRemaining <= 0) {
      gameOver = true; // 時間切れでゲームオーバー
    }

    var s = Math.floor((levelScore / levelTotalArea) * 10000);
    if (levelScore / levelTotalArea >= 0.75) {
      levelCleared = true;
      clearedLevel = level;
      setTimeout(function () {
        level++;
        if (level > 3) {
          gameOver = true;
          gameWon = true;
        } else {
          startLevel(level);
        }
      }, 2000);
    }
  }

  draw();
}

function draw() {
  var canvasHeight = ctx.canvas.height;

  // 背景の描画
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 600, canvasHeight);

  // エリアの描画
  areas.forEach(function (r) {
    r.draw(ctx);
  });

  // 敵の描画
  enemies.forEach(function (enemy) {
    enemy.draw(ctx);
  });

  // 自機の描画
  ship.draw(ctx);

  // スコア情報の表示
  var percentComplete = ((levelScore / levelTotalArea) * 100).toFixed(1); // 小数点1桁まで表示
  ctx.fillStyle = "white";
  ctx.fillText("Score: " + Math.floor(score), 20, canvasHeight - 60);
  ctx.fillText(
    "Time Left: " + timeRemaining.toFixed(1) + "s",
    20,
    canvasHeight - 40
  );
  ctx.fillText("Area: " + percentComplete + "%", 20, canvasHeight - 20);

  // ゲーム終了時のメッセージ
  if (gameOver) {
    if (gameWon) {
      ctx.fillStyle = "yellow";
      ctx.fillText("YOU WIN!", 220, canvasHeight / 2);
    } else {
      ctx.fillStyle = "red";
      ctx.fillText("GAME OVER", 220, canvasHeight / 2);
    }
  } else if (levelCleared) {
    ctx.fillStyle = "yellow";
    ctx.fillText("STAGE " + clearedLevel + " CLEAR", 180, canvasHeight / 2);

    // ボーナス計算
    score += Math.floor(timeRemaining * difficultyMultiplier * 0.5);
    ctx.fillText(
      "Bonus: +" + Math.floor(timeRemaining * difficultyMultiplier * 1),
      180,
      canvasHeight / 2 + 40
    );
  }
}
