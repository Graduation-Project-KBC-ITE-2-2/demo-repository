"use strict";
var y = 250, v = 0, keyDown = false, WALLS = 80, score = 0;
var walls = [], slope = 0, timer, ship, main;
var highScores = JSON.parse(localStorage.getItem('highScores')) || [0, 0, 0]; // ハイスコア3位までを取得

function init() {
    // 初期化時にゲームオーバー表示を非表示にする
    document.getElementById('gameOver').style.visibility = "hidden";
    document.getElementById('bang').style.visibility = "hidden";
    document.getElementById('retryButton').style.visibility = "hidden"; // ゲーム再開ボタンを非表示
    document.getElementById('startButton').style.visibility = "hidden"; // スタートボタンも非表示
    
    score = 0; // スコアをリセット
    document.getElementById('score').textContent = "Score: " + score; // スコア表示を初期化
    
    // 前回の壁をリセットするために、古い壁を削除
    for (var i = 0; i < walls.length; i++) {
        if (walls[i]) {
            main.removeChild(walls[i]);
        }
    }
    walls = []; // 配列も空にする

    // 壁の作成と船の位置のリセット
    main = document.getElementById('main');
    ship = document.getElementById('ship');
    y = 250; // 船の初期位置
    v = 0; // 船の速度もリセット
    ship.style.top = y + 'px'; // 船の位置をリセット

    for (var i = 0 ; i < WALLS ; i++) {
        walls[i] = document.createElement("div");
        walls[i].style.position = "absolute";
        walls[i].style.top = "100px";
        walls[i].style.left = i * 10 + "px";
        walls[i].style.width = "10px";
        walls[i].style.height = "400px";
        walls[i].style.backgroundColor = "#333333";
        main.appendChild(walls[i]);
    }

    slope = Math.floor(Math.random() * 5) + 1;
    timer = setInterval(mainloop, 50);
    window.addEventListener('keydown', function () { keyDown = true; });
    window.addEventListener('keyup', function () { keyDown = false; });

    // ハイスコア表示を更新
    updateHighScores();
}

function startGame() {
    // モーダルを非表示にする
    document.getElementById('modal').style.display = 'none';
    
    // ゲーム画面を表示する
    document.getElementById('main').style.display = 'block';

    // ゲームの初期化
    init();
}


function hitTest(){
    var st = parseInt(ship.style.top) + 10;
    var sh = parseInt(ship.style.height);
    var sb = st + sh - 20;

    var wt = parseInt(walls[14].style.top);
    var wh = parseInt(walls[14].style.height);
    var wb = wh + wt;

    return (st < wt) || (sb > wb );
}

function mainloop() {
    if (hitTest()) {
        clearInterval(timer);
        document.getElementById('bang').style.top = (y - 40) + "px";
        document.getElementById('bang').style.visibility = "visible";
        
        // ゲームオーバーの表示
        document.getElementById('gameOver').style.visibility = "visible";

        // ゲーム再開ボタンを表示
        document.getElementById('retryButton').style.visibility = "visible";

        // スコアを保存してハイスコアを更新
        saveHighScore(score);
        return;
    }

    score += 10;
    document.getElementById('score').textContent = "Score: " + score; // スコアを更新

    v += keyDown ? -3 : 3;
    y += v;
    ship.style.top = y + 'px';

    var edge = walls[WALLS - 1].style;
    var t = parseInt(edge.top);
    var h = parseInt(edge.height);
    var b = h + t;
    t += slope;
    b += slope;
    if ((t < 0) && (slope < 0) || (b > 600) && (slope > 0)) {
        slope = (Math.floor(Math.random() * 5) + 1) * (slope < 0 ? 1 : -1);
        edge.top = (t + 10) + "px";
        edge.height = (h - 20) + "px";
    } else {
        edge.top = t + "px";
    }

    for (var i = 0 ; i < WALLS - 1 ; i++) {
        walls[i].style.top = walls[i + 1].style.top;
        walls[i].style.height = walls[i + 1].style.height;
    }
}

// スコアを保存してハイスコアリストを更新
function saveHighScore(newScore) {
    highScores.push(newScore);
    highScores.sort(function(a, b){return b - a;}); // 降順にソート
    highScores = highScores.slice(0, 3); // 上位3つを保持
    localStorage.setItem('highScores', JSON.stringify(highScores));

    // ハイスコア表示を更新
    updateHighScores();
}

// ハイスコアを表示
function updateHighScores() {
    var highScoreBoard = document.getElementById('highScores');
    highScoreBoard.innerHTML = "High Scores: " + highScores.join(', ');
}

// ページが読み込まれた後にハイスコアを表示
window.onload = function() {
    updateHighScores();
};
