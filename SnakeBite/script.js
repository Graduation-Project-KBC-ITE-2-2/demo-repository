"use strict";
import { getUserEmail, saveScoreAndEmail, displayDataInHTMLRealtime } from '../firebaseConfig.js';
import { addKeyListenerForStart } from '../Key.js'

var W, H, S = 20;
var snake = [], foods = [];
var keyCode = 0;
var point = 0;
var bestScore = localStorage.getItem('bestScore') || 0;
var timer = NaN;
var ctx;
var gameStarted = false;

// Pointオブジェクト
function Point(x, y) {
    this.x = x;
    this.y = y;
}

// 初期化関数
function init() {
    var canvas = document.getElementById('field');
    if (canvas) {
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
    } else {
        console.error("ゲームのキャンバスが見つかりませんでした。");
    }
}

// スタートボタンが押されたときにゲームを開始する関数
// ゲームのスタート関数
window.startGame = function() {
    const tutorialElement = document.getElementById("tutorial");
    const containerElement = document.getElementById("container");

    if (tutorialElement) {
        // チュートリアルを非表示にする
        tutorialElement.style.display = "none";
    } else {
        console.error("チュートリアル要素が見つかりませんでした。");
        return;
    }

    if (containerElement) {
        // ゲームエリア全体を表示
        containerElement.style.display = "flex"; // 明示的にflexを設定
    }

    // ゲーム開始処理
    console.log("ゲームが開始されました");
    gameStarted = true;
    init();
    timer = setInterval(tick, 200); // ゲームループを開始
};

window.retryGame = function() {
    document.getElementById('retryButton').style.display = 'none';
    gameStarted = true;
    init();
    timer = setInterval(tick, 200);
};

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
    for (var i = 0; i < data.length; i++) {
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

async function tick() {
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
        gameStarted = false;

        if (point > bestScore) {
            bestScore = point;
            localStorage.setItem('bestScore', bestScore);
        }

        const title = document.title;
        const userEmail = await getUserEmail();
        await saveScoreAndEmail(title, point, userEmail);

        paint();

        ctx.fillStyle = "red";
        ctx.font = "40px sans-serif";
        ctx.fillText("Game Over", W * S / 4, H * S / 2);

        document.getElementById('retryButton').style.display = 'block';
        return;
    }

    snake.unshift(new Point(x, y));

    if (isHit(foods, x, y)) {
        point += 10;
        moveFood(x, y);
    } else {
        snake.pop();
    }

    paint();
}

window.onload = function() {
    document.addEventListener("DOMContentLoaded", () => {
        addKeyListenerForStart('tutorial', startGame, 32);
        addKeyListenerForStart('retryButton', retryGame, 32);
    });
};

function paint() {
    ctx.clearRect(0, 0, W * S, H * S);
    ctx.fillStyle = "rgb(256,0,0)";
    ctx.fillText("Score " + point, S, S * 2);
    ctx.fillText("Best Score " + bestScore, S, S * 3);

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

const title = document.title;
displayDataInHTMLRealtime(title);
