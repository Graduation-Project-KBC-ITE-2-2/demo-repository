import { getUserEmail, saveScoreAndEmail, displayDataInHTMLRealtime } from '../firebaseConfig.js';

"use strict";

// 変数の宣言
var ctx, paddle, ball, timer, blocks = [];
var balls = 3, score = 0, elapsedTime = 0; // ゲームの初期設定
var WIDTH = 600, HEIGHT = 600; // キャンバスのサイズ
var colors = ['red', 'orange', 'yellow', 'green', 'purple', 'blue']; // ブロックの色
var difficulty = ''; // 難易度を保持するための変数

// ボールのコンストラクタ
function Ball() {
    this.r = 10; // ボールの半径
    this.x = WIDTH / 2; // 初期X座標
    this.y = HEIGHT - 30; // 初期Y座標（パドルの上）
    this.dx = 0; // X方向の速度
    this.dy = 0; // Y方向の速度
    this.dir = 0; // 方向
    this.speed = 3.0; // 初期速度
}

// パドルのコンストラクタ
function Paddle() {
    this.w = 110; // パドルの幅
    this.h = 20; // パドルの高さ
    this.x = (WIDTH - this.w) / 2; // 初期X座標
    this.y = HEIGHT - 20; // 初期Y座標
    this.keyL = false; // 左キーの押下状態
    this.keyR = false; // 右キーの押下状態
}

// ブロックのコンストラクタ
function Block(x, y, i) {
    this.x = x; // ブロックのX座標
    this.y = y; // ブロックのY座標
    this.w = 50; // ブロックの幅
    this.h = 20; // ブロックの高さ
    this.color = colors[i]; // ブロックの色
    this.point = (6 - i) * 10; // ブロックの得点
}

// パドルの描画メソッド
Paddle.prototype.draw = function (ctx) {
    ctx.fillStyle = 'white'; // パドルの色
    ctx.fillRect(this.x, this.y, this.w, this.h); // パドルを描画
};

// ブロックの描画メソッド
Block.prototype.draw = function (ctx) {
    ctx.fillStyle = this.color; // ブロックの色
    ctx.fillRect(this.x, this.y, this.w, this.h); // ブロックを描画
};

// 初期化関数
function init() {
    ctx = document.getElementById('canvas').getContext('2d'); // 2Dコンテキストを取得
    ctx.font = "20pt Arial"; // フォントの設定

    // キーの押下イベントを登録
    window.addEventListener('keydown', function (e) {
        toggleKey(e.keyCode, true);
    }, true);
    window.addEventListener('keyup', function (e) {
        toggleKey(e.keyCode, false);
    }, true);

    paddle = new Paddle(); // パドルの生成
    ball = new Ball(); // ボールの生成

    draw(); // 初回描画

    // メインループを開始
    if (isNaN(timer)) {
        timer = setInterval(mainLoop, 15);
    }

    // 1秒ごとにボールの速度を0.1上げる処理を追加
    setInterval(function () {
        elapsedTime++; // 経過時間を更新
        ball.speed += 1.5; // ボールの速度を増加
        if (isPlaying()) { // ゲームがプレイ中なら
            let angle = Math.atan2(ball.dy, ball.dx); // 現在の方向を取得
            ball.dx = ball.speed * Math.cos(angle); // X方向の速度を再計算
            ball.dy = ball.speed * Math.sin(angle); // Y方向の速度を再計算
        }
    }, 1000); // 1秒ごとに実行
}

// ゲーム開始関数
window.startGame = function(selectedDifficulty) {
    // ゲームが終了した後に再スタートする場合に備えて、timerをクリア
    if (timer) {
        clearInterval(timer); // 現在のタイマーをクリア
        timer = null; // タイマーをリセット
    }
    
    // チュートリアルモーダルを非表示にする
    document.getElementById('tutorialModal').style.display = 'none';
    
    // 初期化（paddle, ballなどのオブジェクトを初期化）
    init();

    // 難易度に応じてボールの速度を設定
    difficulty = selectedDifficulty; // 選択された難易度を保存
    switch (selectedDifficulty) {
        case 'Easy':
            ball.speed = 2.5; // Easyの速度
            break;
        case 'Normal':
            ball.speed = 4.0; // Normalの速度
            break;
        case 'Hard':
            ball.speed = 5.5; // Hardの速度
            break;
    }

    // ゲーム開始（ブロック生成とボールの速度・方向設定）
    start();
}

// キーの押下状態を管理する関数
function toggleKey(code, flag) {
    if (code === 37) paddle.keyL = flag; // 左キー
    if (code === 39) paddle.keyR = flag; // 右キー
    if (code === 32 && !isPlaying()) { // スペースキーでゲームを開始
        ball.x = paddle.x + paddle.w / 2; // ボールの初期位置
        ball.y = paddle.y - ball.r; // パドルの上にボールを配置
        ball.dx = ball.speed * Math.cos(Math.PI / 4); // ボールの初期X方向速度
        ball.dy = -ball.speed * Math.sin(Math.PI / 4); // ボールの初期Y方向速度
        if (isNaN(timer)) {
            timer = setInterval(mainLoop, 15); // メインループを開始
        }
    }
}

// ブロックの初期化関数
function start() {
    blocks = []; // ブロックのリセット
    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 9; j++) {
            blocks.push(new Block(j * 60 + 35, i * 30 + 50, i)); // ブロックを生成
        }
    }
}

// メインループ
async function mainLoop() {
    if (paddle.keyL) {
        paddle.x = Math.max(0, paddle.x - 10); // 左に移動
    }
    if (paddle.keyR) {
        paddle.x = Math.min(WIDTH - paddle.w, paddle.x + 10); // 右に移動
    }

    // ボールの移動
    ball.x += ball.dx; // X方向の移動
    ball.y += ball.dy; // Y方向の移動

    // 壁との衝突判定
    if (ball.x + ball.r > WIDTH || ball.x - ball.r < 0) {
        ball.dx *= -1; // X方向の速度を反転
    }
    if (ball.y - ball.r < 0) {
        ball.dy *= -1; // Y方向の速度を反転
    }

    // パドルとの衝突判定
    if (ball.y + ball.r > paddle.y &&
        ball.x > paddle.x && ball.x < paddle.x + paddle.w) {
        ball.dy *= -1; // Y方向の速度を反転
        ball.y = paddle.y - ball.r; // パドルの上にボールを配置
    }

    // ゲームオーバー判定
    if (ball.y + ball.r > HEIGHT) {
        if (--balls > 0) { // 残機があれば
            ball = new Ball(); // 新しいボールを生成
            ball.speed = getSpeedByDifficulty(); // ボールの速度を再設定（難易度に基づく）
            ball.dx = ball.speed * Math.cos(Math.PI / 4); // 新しい速度を設定
            ball.dy = -ball.speed * Math.sin(Math.PI / 4);
        } else {
            clearInterval(timer); // ゲーム終了時にタイマーをクリア
            timer = NaN; // タイマーをリセット
            const title = document.title; // ゲームのタイトルを取得
            const userEmail = await getUserEmail(); // ユーザーのメールを取得
            await saveScoreAndEmail(title, score, userEmail); // スコアとメールを保存
            alert("ゲームオーバー！再挑戦してください。"); // ゲームオーバーのアラート
            return;
        }
    }

    draw(); // 描画処理を呼び出す

    // ブロックとの衝突判定
    blocks = blocks.filter(function (block) {
        if (ball.x > block.x && ball.x < block.x + block.w &&
            ball.y - ball.r < block.y + block.h && ball.y + ball.r > block.y) {
            ball.dy *= -1; // Y方向の速度を反転
            score += block.point; // スコアを更新
            return false; // 衝突したブロックを削除
        }
        return true; // 衝突していないブロックを保持
    });

    if (blocks.length === 0) { // すべてのブロックが消えた場合
        start(); // 新しいブロックを生成
    }
}

// ゲームがプレイ中かどうかを判定する関数
function isPlaying() {
    return ball.dx !== 0 || ball.dy !== 0; // ボールが動いているかをチェック
}

// 描画処理
function draw() {
    // 背景の塗りつぶし
    ctx.fillStyle = 'rgb(0,0,0)'; // 背景色
    ctx.fillRect(0, 0, WIDTH, HEIGHT); // 背景を描画

    // ブロックを描画
    blocks.forEach(function (block) {
        block.draw(ctx); // 各ブロックを描画
    });

    // パドルを描画
    paddle.draw(ctx); // パドルを描画

    // ボールを描画
    ctx.fillStyle = 'yellow'; // ボールの色
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); // ボールを描画
    ctx.fill();

    // ボールの残機を右上に描画
    for (var i = 0; i < balls; i++) {
        ctx.fillStyle = 'yellow'; // 残機の色
        ctx.beginPath();
        ctx.arc(570 - i * 30, 30, 10, 0, Math.PI * 2); // 残機を描画
        ctx.fill();
    }

    // スコア、時間、難易度の描画
    ctx.fillStyle = 'white'; // テキストの色
    ctx.fillText('スコア: ' + score + ' | 時間: ' + elapsedTime + '秒 | 難易度: ' + difficulty, 20, 30);
}

// 難易度に応じたボールの速度を取得する関数
function getSpeedByDifficulty() {
    switch (difficulty) {
        case 'Easy':
            return 2.5; // Easyの速度
        case 'Normal':
            return 4.0; // Normalの速度
        case 'Hard':
            return 5.5; // Hardの速度
        default:
            return 3.0; // デフォルトの速度
    }
}

// タイトルを取得してリアルタイムでデータを表示
const title = document.title;
displayDataInHTMLRealtime(title);
