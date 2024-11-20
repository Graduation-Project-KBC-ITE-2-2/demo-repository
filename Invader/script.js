import { getUserEmail, saveScoreAndEmail, displayDataInHTMLRealtime } from '../firebaseConfig.js';

"use strict";

// グローバル変数の定義
var ctx, ship, beam, aliens = [], bombs = [],
    score = 0, stage = 1, clock = 0, mainT = NaN, alienT = NaN;

var backgroundImg = new Image();
backgroundImg.src = 'cosmos-1853491_1920.jpg'; // 背景画像のパス

var scrollY = 0; // 背景のY座標を管理する変数

// ビームクラス: プレイヤーの発射するビーム
function Beam() {
    this.x = 0;
    this.y = -100;
    this.offset = 0;
    this.even = false;
    this.isEven = function () { return this.even; }
}

// 爆弾クラス: エイリアンが投下する爆弾
function Bomb() {
    this.x = 0;
    this.y = 600;
    this.offset = 48;
    this.even = false;
    this.time = rand(200) + 50; // 次に落ちるまでの時間
    this.isEven = function () { return this.even; }
}

// エイリアンクラス: 敵キャラクター
function Alien(x, y, point, offset) {
    this.x = x;
    this.y = y;
    this.point = point; // 倒した時のスコア
    this.offset = offset;
    this.speedX = (Math.random() * 10 + 1) * (Math.random() > 0.5 ? 1 : -1); // 横方向速度（1〜3, 正負ランダム）
    this.speedY = Math.random() * 10 + 10; // 下方向速度（0.5〜1.0）
    this.isEven = function () { return Alien.isEven; }
}

// プレイヤーキャラクター（宇宙船）クラス
function Ship() {
    this.x = 0;
    this.y = 550; // 初期位置
    this.offset = 192;
    this.moveL = false; // 左移動フラグ
    this.moveR = false; // 右移動フラグ
    this.isEven = function () { return true; }
}

// スプライトの描画に関するオブジェクト
var bitmap = {
    draw: function (ctx) {
        if (!this.strip) {
            this.strip = document.getElementById('strip'); // スプライトシートの取得
        }
        ctx.drawImage(this.strip,
            this.offset + (this.isEven() ? 0 : 24), 0, 24, 24,
            this.x, this.y, 24, 24);
    }
};

// 各クラスに描画の機能を継承
Ship.prototype = Beam.prototype = Alien.prototype = Bomb.prototype = bitmap;

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
window.init = function() {
    ctx = document.getElementById('canvas').getContext('2d');
    ctx.font = "20pt Arial";
    score = 0;
    stage = 1;

    // キー操作のイベントリスナーを設定
    addEventListener('keydown', keyDown, true);
    addEventListener('keyup', keyUp, true);

    // チュートリアルを表示
    document.getElementById('tutorial').style.display = 'flex';
};

// ゲーム開始関数
window.start = function() {
    document.getElementById('tutorial').style.display = 'none'; // チュートリアルを非表示

    ship = new Ship(); // 宇宙船の初期化
    beam = new Beam(); // ビームの初期化
    clock = 0;
    //Alien.interval = 1000 - stage * 50; // ステージ進行でエイリアンの移動速度アップ

    // エイリアンと爆弾を初期化
    // エイリアンを個体単位でランダムに出現させる
aliens = [];
bombs = [];
var numAliens = 20; // 出現させたいエイリアンの総数
for (var i = 0; i < numAliens; i++) {
    var x, y, newAlien;
    var offset = (i % 2 === 0) ? 96 : 144; // スプライトの種類をランダム化
    var attempts = 0; // 試行回数

    do {
        x = rand(540) + 30; // ランダムなX座標 (30～570)
        y = rand(200) - 200; // ランダムなY座標 (-200～0)
        newAlien = new Alien(x, y, rand(40) + 10, offset); // スコアは10～50
        attempts++;
    } while (!isPositionValid(x, y, aliens) && attempts < 100); // 重ならないように配置

    if (attempts < 100) {
        aliens.push(newAlien);
        bombs.push(new Bomb());
    } else {
        console.error('Failed to find a valid position for Alien after 100 attempts.');
    }
}

// 配置が重複しないかをチェック
function isPositionValid(newX, newY, aliens) {
    const margin = 20; // 他のエイリアンとの最低距離
    return aliens.every(alien => {
        return Math.abs(alien.x - newX) > margin && Math.abs(alien.y - newY) > margin;
    });
}

    
    // メインループとエイリアン移動ループを開始
    if (isNaN(alienT)) {
        alienT = setTimeout(alienLoop, Alien.interval);
    }
    if (isNaN(mainT)) {
        mainT = setInterval(mainLoop, 50);
    }
};

// キー押下時の処理
function keyDown(evt) {
    if (evt.keyCode == 32) { // スペースキーでビーム発射
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
        if (alien.x < 0 || alien.x > 570) { // 横方向の画面外チェック
            alien.speedX *= -1; // 速度の方向を反転
            alien.x = Math.max(0, Math.min(alien.x, 570)); // 範囲内に収める
        }

        if (alien.y > 550) { // 下方向の画面外チェック
            alien.y = -50; // 上に戻す
            alien.x = rand(540) + 30; // 新しい位置をランダム設定
        }
    });

    // エイリアン移動の間隔を調整して再呼び出し
    Alien.interval = 300 + rand(200); // より速くなるように調整（300～500ms）
    setTimeout(alienLoop, Alien.interval);
}


// ゲームオーバー処理
function gameOver() {
    clearInterval(mainT); mainT = NaN;
    clearTimeout(alienT); alienT = NaN;
    draw();
}

// メインループ: ゲーム全体の処理を更新
function mainLoop() {
    clock++;

    scrollY += 1; // 背景スクロール

    if (aliens.length == 0) { // ステージクリア条件
        if (clock > 100) {
            stage++;
            start();
        }
        return;
    }

    // ビーム処理
    var hit = -1;
    if (beam.y > -30) {
        beam.y -= 15;
        beam.even = !beam.even;
        aliens.forEach(function (e, i) {
            if (e.x - 15 < beam.x && beam.x < e.x + 15 &&
                e.y - 10 < beam.y && beam.y < e.y + 20) {
                hit = i; beam.y = -100; score += e.point; // スコア加算
                return;
            }
        });
    }
    if (hit >= 0) {
        aliens.splice(hit, 1); // ヒットしたエイリアンを削除

        if (aliens.length == 0) { // ステージクリア
            clock = 0;
            draw();
            return;
        }
    }

    // 爆弾処理
    bombs.forEach(function (b) {
        if (b.time < clock) {
            var a = aliens[rand(aliens.length)];
            b.x = a.x, b.y = a.y + 30;
            b.time += rand(200) + 50;
        }
        else if (b.y < 600) {
            b.y += 10;
        }

        b.even = !b.even;
        if (b.x - 15 < ship.x && ship.x < b.x + 15 && 530 < b.y && b.y < 550) {
            gameOver();
        }
    });

    // 宇宙船の移動処理
    if (ship.moveR) { ship.x = Math.min(ship.x + 5, 570); }
    if (ship.moveL) { ship.x = Math.max(ship.x - 5, 0); }

    draw();
}

// 描画処理
async function draw() {
    // 背景を描画
    ctx.drawImage(backgroundImg, 0, scrollY % 600, 600, 600);
    ctx.drawImage(backgroundImg, 0, (scrollY % 600) - 600, 600, 600);

    // エイリアンを描画
    aliens.forEach(function (a) { a.draw(ctx); });

    // 宇宙船を描画
    ship.draw(ctx);

    // ビームを描画
    beam.draw(ctx);

    // 爆弾を描画
    bombs.forEach(function (b) { b.draw(ctx); });

    // スコアを描画
    ctx.fillStyle = 'rgb(0,255,0)';
    ctx.fillText(('0000000' + score).slice(-7), 470, 30);

    if (aliens.length == 0) {
        ctx.fillText('STAGE CLEAR', 200, 150);
    }

    if (isNaN(mainT)) {
        ctx.fillText('GAME OVER', 220, 150);

        const title = document.title;
        const userEmail = await getUserEmail();
        await saveScoreAndEmail(title, score, userEmail);
    }
}

// リアルタイムデータを表示
const title = document.title;
displayDataInHTMLRealtime(title);
