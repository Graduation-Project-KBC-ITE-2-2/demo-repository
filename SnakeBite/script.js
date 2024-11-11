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
var totalFoods = 5; // 初期の餌の数
var foodsEaten = 0; // 食べた餌の数

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
        foodsEaten = 0;

        // 蛇の初期化
        snake.push(new Point(W / 2, H / 2));

        // 餌の初期化
        for (var i = 0; i < totalFoods; i++) {
            addFood();
        }

        window.onkeydown = keydown;
        paint();
    } else {
        console.error("ゲームのキャンバスが見つかりませんでした。");
    }
}

// スタートボタンが押されたときにゲームを開始する関数
window.startGame = function() {
    const tutorialElement = document.getElementById("tutorial");
    const containerElement = document.getElementById("container");

    if (tutorialElement) {
        tutorialElement.style.display = "none";
    } else {
        console.error("チュートリアル要素が見つかりませんでした。");
        return;
    }

    if (containerElement) {
        containerElement.style.display = "flex";
    }

    gameStarted = true;
    init();
    timer = setInterval(tick, 200);
};

window.retryGame = function() {
    document.getElementById('retryButton').style.display = 'none';
    gameStarted = true;
    init();
    timer = setInterval(tick, 200);
};

// 餌の追加
function addFood() {
    let attempts = 0;
    while (true) {
        var x = Math.floor(Math.random() * W);
        var y = Math.floor(Math.random() * H);

        if (!isHit(snake, x, y) && !isHit(foods, x, y)) {
            foods.push(new Point(x, y));
            console.log("新しい餌を追加しました:", x, y);
            break;
        }

        attempts++;
        if (attempts > 100) {
            console.warn("餌の追加に失敗しました。適切な位置が見つかりません。");
            break;
        }
    }
}

// 餌を消す関数
function removeFood(x, y) {
    foods = foods.filter(function (p) {
        return !(p.x === x && p.y === y);
    });
    console.log("餌を削除しました。残りの餌の数:", foods.length);
}

function isHit(data, x, y) {
    x = Math.round(x);
    y = Math.round(y);
    for (var i = 0; i < data.length; i++) {
        if (data[i].x === x && data[i].y === y) {
            console.log("衝突を検出:", x, y);
            return true;
        }
    }
    return false;
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

    // 自分自身や壁に衝突した場合
    if (isHit(snake, x, y) || x < 0 || x >= W || y < 0 || y >= H) {
        endGame("Game Over");
        return;
    }

    // 蛇の移動
    snake.unshift(new Point(x, y));

    // 餌との衝突判定
    if (isHit(foods, x, y)) {
        point += 10;
        foodsEaten++;
        console.log("餌に衝突しました。ポイント:", point);
        console.log("食べた餌の数:", foodsEaten);
        removeFood(x, y);

        // ゲームクリア判定
        if (foodsEaten >= totalFoods) {
            endGame("Game Clear!");
            return;
        }
    } else {
        snake.pop();
    }

    paint();
}

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

async function endGame(message) {
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

    ctx.fillStyle = message === "Game Clear!" ? "green" : "red";
    ctx.font = "40px sans-serif";
    ctx.fillText(message, W * S / 4, H * S / 2);

    document.getElementById('retryButton').style.display = 'block';
}

const title = document.title;
displayDataInHTMLRealtime(title);