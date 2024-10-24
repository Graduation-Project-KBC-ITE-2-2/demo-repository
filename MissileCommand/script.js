import { getUserEmail, saveScoreAndEmail, displayDataInHTMLRealtime } from '../firebaseConfig.js';

    "use strict";
    var houses = [], missiles = [], shoot, timer = NaN,
        count = 0, score = 0, ctx;

function House(x) {
    this.x = x;
    this.y = 550;
    this.w = 40;
    this.hit = false;
}

function Missle(){
    this.maxCount = 500;
    this.interval = 1000;

    this.reload = function(){
        this.sX = rand(800);
        this.eX = rand(800);
        this.interval = this.interval * 0.9;
        this.firetime = rand(this.interval) + count;
        this.x = 0;
        this.y = 0;
        this.r = 0;
    };

    this.draw = function(ctx){
        ctx.strokeStyle = ctx.fillStyle = 'rgb(0,255,255)';

        // 軌跡の描画
        line(ctx, this.sX, 0, this.x, this.y);

        // 爆発
        if(this.r > 0){
            circle(ctx, this.x, this.y, this.r < 50 ? this.r : (100 - this.r));
        }
    };

    this.reload();
}

function Shoot() {
    this.scopeX = 400;
    this.scopeY = 300;
    this.scopeW = 50;
    this.image = document.getElementById('scope');
    this.count = 0;
    this.shotX = 0;
    this.shotY = 0;
    this.shotR = 0;
    this.fire = false;
    this.draw = function (ctx) {
        ctx.strokeStyle = ctx.fillStyle = 'rgb(0,255,0)';

        // 照準器の描画
        ctx.drawImage(this.image,
            this.scopeX - this.scopeW / 2, this.scopeY - this.scopeW / 2);

        if (!this.fire) return;

        if (this.shotR == 0 && this.count < 100) {
            // 軌跡の描画
            var ratio = this.count / 100;

            var y = 600 - (600 - this.shotY) * ratio;

            // 左側レーザー
            line(ctx, 0, 600, (this.shotX * ratio), y);

            // 右側レーザー
            line(ctx, 800, 600, (800 - (800 - this.shotX) * ratio), y);

        } else if (this.shotR > 0) {
            // 爆発
            circle(ctx, this.shotX, this.shotY, this.shotR);
        }
    }
}

function rand(r) { return Math.floor(Math.random() * r) }

function explodeSound() {
    document.getElementById('explode').play();
}

function line(ctx, x0, y0, x1, y1) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.closePath();
    ctx.stroke();
}

function circle(ctx, x, y, r) {
    if (r <= 0) return;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fill();
}

 window.init = function() {
    shoot = new Shoot();

    var canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    ctx.font = "20pt Arial";

    canvas.addEventListener('mousemove', mousemove);
    canvas.addEventListener('mousedown', mousedown);

    // 初回は start() を呼ばない
}


 window.start = function() {
    console.log("Game started"); // デバッグ用

    // チュートリアルを非表示にする
    document.getElementById('tutorial').style.display = 'none';
    
    score = 0;

    houses = [];
    for (var i = 0 ; i < 13 ; i++) {
        houses.push(new House(i * 60 + 20));
    }

    missiles = [];
    for (var i = 0 ; i < 8 ; i++) {
        missiles.push(new Missle());
    }

    timer = setInterval(mainLoop, 20);
}



function mainLoop() {
    count++;

    // 自分のミサイル発射時、その状態を更新
    if (shoot.fire) {
        shoot.count++;

        if (100 <= shoot.count && shoot.count < 200) {
            shoot.shotR++;
        } else if (200 <= shoot.count && shoot.count < 300) {
            shoot.shotR--;
        } else if (300 <= shoot.count) {
            shoot.fire = false;
        }
    }

    // ミサイルの状態を更新
    missiles.forEach(function (m) {
        var c = count - m.firetime;
        if (c < 0) {
            return;
        }
        if (m.r > 0) { // 爆発
            if (m.r++ > 100) {
                m.reload()
            }

        } else {
            // ミサイルの場所更新
            m.x = (m.eX - m.sX) * c / m.maxCount + m.sX;
            m.y = 600 * c / m.maxCount;

            // 自分の迎撃ミサイルとの衝突判定
            var dx = Math.pow(shoot.shotX - m.x, 2);
            var dy = Math.pow(shoot.shotY - m.y, 2);
            if ((dx + dy) < Math.pow(shoot.shotR, 2)) {
                m.r = 1;
                score += 100;
                explodeSound();
                return;
            }

            // 地面に衝突時
            if (c > m.maxCount) {

                // 家に衝突したか判定
                houses.forEach(function (house) {
                    if ((house.x + house.w < m.x - 50) ||
                        (m.x + 50 < house.x)) {
                    } else {
                        house.hit = true;
                    }
                });

                if (houses.every(function (house) {
                        return house.hit
                })) {
                    clearInterval(timer);
                    timer = NaN;
                }

                explodeSound();
                m.r = 1;
            }
        }
    });

    draw();
}

function mousemove(e) {
    var canvas = document.getElementById('canvas');
    var rect = canvas.getBoundingClientRect();  // キャンバスの位置を取得

    // キャンバス内の正確なマウス座標を計算
    shoot.scopeX = e.clientX - rect.left;
    shoot.scopeY = e.clientY - rect.top;
}


function mousedown(e) {
    var canvas = document.getElementById('canvas');
    var rect = canvas.getBoundingClientRect();  // キャンバスの位置を取得

    // キャンバス内の正確なマウスクリック位置を計算
    var mouseX = e.clientX - rect.left;
    var mouseY = e.clientY - rect.top;

    // 迎撃ミサイルの発射
    if (!shoot.fire) {
        shoot.shotX = mouseX;  // 修正されたマウスのX座標
        shoot.shotY = mouseY;  // 修正されたマウスのY座標
        shoot.shotR = 0;
        shoot.count = 0;
        shoot.fire = true;
    }
}


async function draw() {
    var strip = document.getElementById('strip'); // stripを定義
    
    // 背景を塗りつぶし
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(0, 0, 800, 600);

    // 家の描画
    houses.forEach(function (h) {
        ctx.drawImage(strip, (h.hit ? 20 : 0), 0, 20, 20, h.x, h.y, h.w, h.w);
    });

    // 自分のミサイルの描画
    shoot.draw(ctx);

    // 敵のミサイルの描画
    missiles.forEach(function (m) {
        if (m.x != 0 && m.y != 0) {
            m.draw(ctx);
        }
    });

    // スコアの描画
    ctx.fillStyle = 'rgb(0,255,0)';
    ctx.fillText(('00000' + score).slice(-5), 570, 30);

    if (isNaN(timer)) {
        ctx.fillText('GAME OVER', 320, 150);
        const title = document.title;
        const userEmail = await getUserEmail();
        await saveScoreAndEmail(title, score, userEmail);
    }
}

const title = document.title;

displayDataInHTMLRealtime(title);