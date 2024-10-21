import { getUserEmail,saveScoreAndEmail, displayDataInHTMLRealtime } from '../firebaseConfig.js'


"use strict";

var ctx, paddle, ball, timer, blocks = [];
var balls = 3, score = 0, elapsedTime = 0;
var WIDTH = 600, HEIGHT = 600;
var colors = ['red', 'orange', 'yellow', 'green', 'purple', 'blue'];
var difficulty = ''; // 難易度を保持するための変数を追加

function Ball() {
    this.r = 10; // 半径を先に設定する
    this.x = WIDTH / 2;
    this.y = HEIGHT - 30; // ボールをパドルの上に配置
    this.dx = 0;
    this.dy = 0;
    this.dir = 0;
    this.speed = 3.0;
}

function Paddle() {
    this.w = 110;
    this.h = 20;
    this.x = (WIDTH - this.w) / 2;
    this.y = HEIGHT - 20;
    this.keyL = false;
    this.keyR = false;
}

function Block(x, y, i) {
    this.x = x;
    this.y = y;
    this.w = 50;
    this.h = 20;
    this.color = colors[i];
}

// パドルとブロックそれぞれの描画メソッドを独立して定義
Paddle.prototype.draw = function (ctx) {
    ctx.fillStyle = 'white'; // パドルの色を白に設定
    ctx.fillRect(this.x, this.y, this.w, this.h);
};

Block.prototype.draw = function (ctx) {
    ctx.fillStyle = this.color; // ブロックの色を設定
    ctx.fillRect(this.x, this.y, this.w, this.h);
};

function init() {
    ctx = document.getElementById('canvas').getContext('2d');
    ctx.font = "20pt Arial";

    window.addEventListener('keydown', function (e) {
        toggleKey(e.keyCode, true);
    }, true);
    window.addEventListener('keyup', function (e) {
        toggleKey(e.keyCode, false);
    }, true);

    paddle = new Paddle();
    ball = new Ball();

    if (isNaN(timer)) {
        timer = setInterval(mainLoop, 15);

    }

    setInterval(function () {
        elapsedTime++;
        ball.speed += 0.1;
    }, 1000);
}

 window.startGame = function(selectedDifficulty) {
    // ゲームが終了した後に再スタートする場合に備えて、timerをクリア
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    
    // チュートリアルモーダルを非表示にする
    document.getElementById('tutorialModal').style.display = 'none';
    
    // 初期化（paddle, ballなどのオブジェクトを初期化）
    init();

    // 難易度に応じてボールの速度を設定
    difficulty = selectedDifficulty; // 選択された難易度を保存
    switch (selectedDifficulty) {
        case 'Easy':
            ball.speed = 2.5;
            break;
        case 'Normal':
            ball.speed = 4.0;
            break;
        case 'Hard':
            ball.speed = 5.5;
            break;
    }

    // ゲーム開始（ブロック生成とボールの速度・方向設定）
    start();
}

function toggleKey(code, flag) {
    if (code === 37) paddle.keyL = flag;
    if (code === 39) paddle.keyR = flag;
}

function start() {
    blocks = [];
    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 9; j++) {
            blocks.push(new Block(j * 60 + 35, i * 30 + 50, i));
        }
    }

    // ボールの動きを設定
    ball.dx = ball.speed * Math.cos(Math.PI / 4);
    ball.dy = -ball.speed * Math.sin(Math.PI / 4);
}

async function mainLoop() {
    if (paddle.keyL) {
        paddle.x = Math.max(0, paddle.x - 10);
    }
    if (paddle.keyR) {
        paddle.x = Math.min(WIDTH - paddle.w, paddle.x + 10);
    }

    // ボールの移動
    ball.x += ball.dx;
    ball.y += ball.dy;

    // 壁との衝突判定
    if (ball.x + ball.r > WIDTH || ball.x - ball.r < 0) {
        ball.dx *= -1;
    }
    if (ball.y - ball.r < 0) {
        ball.dy *= -1;
    }

    // パドルとの衝突判定
    if (ball.y + ball.r > paddle.y &&
        ball.x > paddle.x && ball.x < paddle.x + paddle.w) {
        ball.dy *= -1;
        ball.y = paddle.y - ball.r; // パドルの上にボールを配置
    }

    // ゲームオーバー判定
    if (ball.y + ball.r > HEIGHT) {
        clearInterval(timer);
        timer = NaN;
        const title = document.title; // ゲームのタイトルを取得
        const userEmail = await getUserEmail(); // ユーザーのメールを取得
        await saveScoreAndEmail(title, score, userEmail); // スコアとメールを保存
        alert("ゲームオーバー！再挑戦してください。");

        return;
    }

    draw();

    blocks = blocks.filter(function (block) {
        if (ball.x > block.x && ball.x < block.x + block.w &&
            ball.y - ball.r < block.y + block.h && ball.y + ball.r > block.y) {
            ball.dy *= -1; // ボールのY方向を反転
            score += 10; // スコアを加算
            return false; // ブロックを削除
        }
        return true; // ブロックを保持
    });
}

function draw() {
    // 背景の塗りつぶし
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // ブロックを描画
    blocks.forEach(function (block) {
        block.draw(ctx);
    });

    // パドルを描画
    paddle.draw(ctx);

    // ボールを描画
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();

    // スコア、時間、難易度の描画
    ctx.fillStyle = 'white';
    ctx.fillText('スコア: ' + score + ' | 時間: ' + elapsedTime + '秒 | 難易度: ' + difficulty, 20, 30);
}

const title = document.title;

displayDataInHTMLRealtime(title);