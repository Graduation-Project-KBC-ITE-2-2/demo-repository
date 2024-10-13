"use strict";	
var W, H, S = 20;
var snake = [], foods = [];
var keyCode = 0;
var point = 0;
var bestScore = localStorage.getItem('bestScore') || 0;  // ベストスコアをローカルストレージから取得
var timer = NaN;
var ctx;
var gameStarted = false; // ゲーム開始フラグ

// Pointオブジェクト
function Point(x, y) {
    this.x = x;
    this.y = y;
}

// 初期化関数
function init() {
    var canvas = document.getElementById('field');
    W = canvas.width / S;
    H = canvas.height / S;
    ctx = canvas.getContext('2d');
    ctx.font = "20px sans-serif";
    
    // 蛇と餌をリセット
    snake = [];
    foods = [];
    point = 0;

    // 蛇の初期化
    snake.push(new Point(W / 2, H / 2));

    // 餌の初期化
    for (var i = 0 ; i < 10 ; i++) {
        addFood();
    }

    window.onkeydown = keydown;
    paint();
}

// スタートボタンが押されたときにゲームを開始する関数
function startGame() {
    console.log("Start button clicked");
    if (!gameStarted) {
        console.log("Game started!");
        gameStarted = true;

        // チュートリアルを非表示にし、ゲームエリアを表示
        document.getElementById('tutorial').style.display = 'none';
        document.getElementById('game').style.display = 'block';

        init(); // 初期化処理
        timer = setInterval(tick, 200); // ゲームループを開始
    }
}

// 餌の追加
function addFood() {
    while (true) {
        var x = Math.floor(Math.random() * W);
        var y = Math.floor(Math.random() * H);

        if (isHit(foods, x, y) || isHit(snake, x, y)) {
            continue;
        }

        foods.push(new Point(x, y));
        break;
    }
}

// 衝突判定
function isHit(data, x, y) {
    for (var i = 0 ; i < data.length ; i++) {
        if (data[i].x == x && data[i].y == y) {
            return true;
        }
    }
    return false;
}

function moveFood(x, y) {
    foods = foods.filter(function (p) {
        return (p.x != x || p.y != y);
    });
    addFood();
}

function tick() {
    var x = snake[0].x;
    var y = snake[0].y;

    switch (keyCode) {
        case 37: x--; break; // 左
        case 38: y--; break; // 上
        case 39: x++; break; // 右
        case 40: y++; break; // 下
        default: paint(); return;
    }

    // 自分 or 壁に衝突？
    if (isHit(snake, x, y) || x < 0 || x >= W || y < 0 || y >= H) {
        clearInterval(timer);
        gameStarted = false; // ゲーム終了

        // ベストスコアの更新
        if (point > bestScore) {
            bestScore = point;
            localStorage.setItem('bestScore', bestScore);  // ベストスコアを保存
        }

        paint(); // 最後の状態を描画

        // ゲームオーバーを表示
        ctx.fillStyle = "red";
        ctx.font = "40px sans-serif";
        ctx.fillText("Game Over", W * S / 4, H * S / 2);

        return;
    }

    // 頭を先頭に追加
    snake.unshift(new Point(x, y));

    if (isHit(foods, x, y)) {
        point += 10;    // 餌を食べた
        moveFood(x, y);
    } else {
        snake.pop();    // 食べてない→しっぽを削除
    }

    paint();
}


function paint() {
    ctx.clearRect(0, 0, W * S, H * S);
    ctx.fillStyle = "rgb(256,0,0)";
    ctx.fillText("Score " + point, S, S * 2);
    ctx.fillText("Best Score " + bestScore, S, S * 3);  // ベストスコアを表示

    ctx.fillStyle = "rgb(0,0,255)";
    foods.forEach(function (p) {
        ctx.fillText("🐀", p.x * S, (p.y + 1) * S);
    });
    snake.forEach(function (p) {
        ctx.fillText("🐍", p.x * S, (p.y + 1) * S);
    });
}

function keydown(event) {
    keyCode = event.keyCode;
}