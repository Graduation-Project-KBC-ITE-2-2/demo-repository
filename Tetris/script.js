
"use strict";
var ctx, W = 12, H = 22, field, block, nextBlock, keyevents = [];
var interval = 40, count, score, timer;
// サウンドオブジェクトの作成
var dropSound = new Audio('block_touch_sound.wav');

// 標準的なテトリスの配色に変更
var colors = ['#000000', '#FFA500', '#0000FF', '#800080', '#008000', '#FF0000', '#FFFF00', '#00FFFF', '#808080'];

var blocks = [
    [
        [
            0, 0, 1,
            1, 1, 1,
            0, 0, 0
        ], [
            0, 1, 0,
            0, 1, 0,
            0, 1, 1
        ], [
            0, 0, 0,
            1, 1, 1,
            1, 0, 0
        ], [
            1, 1, 0,
            0, 1, 0,
            0, 1, 0
        ],
    ], [
        [
            2, 0, 0,
            2, 2, 2,
            0, 0, 0
        ], [
            0, 2, 2,
            0, 2, 0,
            0, 2, 0
        ], [
            0, 0, 0,
            2, 2, 2,
            0, 0, 2
        ], [
            0, 2, 0,
            0, 2, 0,
            2, 2, 0
        ]
    ], [
        [
            0, 3, 0,
            3, 3, 3,
            0, 0, 0
        ], [
            0, 3, 0,
            0, 3, 3,
            0, 3, 0
        ], [
            0, 0, 0,
            3, 3, 3,
            0, 3, 0
        ], [
            0, 3, 0,
            3, 3, 0,
            0, 3, 0
        ]
    ], [
        [
            4, 4, 0,
            0, 4, 4,
            0, 0, 0
        ], [
            0, 0, 4,
            0, 4, 4,
            0, 4, 0
        ], [
            0, 0, 0,
            4, 4, 0,
            0, 4, 4
        ], [
            0, 4, 0,
            4, 4, 0,
            4, 0, 0
        ]
    ], [
        [
            0, 5, 5,
            5, 5, 0,
            0, 0, 0
        ], [
            0, 5, 0,
            0, 5, 5,
            0, 0, 5
        ], [
            0, 0, 0,
            0, 5, 5,
            5, 5, 0
        ], [
            5, 0, 0,
            5, 5, 0,
            0, 5, 0
        ]
    ], [
        [
            6, 6,
            6, 6
        ], [
            6, 6,
            6, 6
        ], [
            6, 6,
            6, 6
        ], [
            6, 6,
            6, 6
        ]
    ], [
        [
            0, 7, 0, 0,
            0, 7, 0, 0,
            0, 7, 0, 0,
            0, 7, 0, 0
        ], [
            0, 0, 0, 0,
            7, 7, 7, 7,
            0, 0, 0, 0,
            0, 0, 0, 0
        ], [
            0, 0, 7, 0,
            0, 0, 7, 0,
            0, 0, 7, 0,
            0, 0, 7, 0
        ], [
            0, 0, 0, 0,
            0, 0, 0, 0,
            7, 7, 7, 7,
            0, 0, 0, 0
        ]
    ]
];

// drawBlock 関数と lightenColor 関数を追加
function drawBlock(x, y, colorIndex) {
    var baseColor = colors[colorIndex];

    // グラデーションの作成
    var grd = ctx.createLinearGradient(x, y, x + 24, y + 24);
    grd.addColorStop(0, lightenColor(baseColor, 0.3)); // 明るい色
    grd.addColorStop(1, baseColor); // 基本色

    ctx.fillStyle = grd;
    ctx.fillRect(x, y, 24, 24);

    // ブロックの枠線を描画（任意）
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.strokeRect(x, y, 24, 24);
}

function lightenColor(color, percent) {
    var num = parseInt(color.replace("#", ""), 16),
        amt = Math.round(2.55 * percent * 100),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;

    return "#" + (
        0x1000000 +
        (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 0 ? 0 : B) : 255)
    ).toString(16).slice(1);
}

function Block() {
    this.turn = rand(4);                    // 向き
    this.type = blocks[rand(blocks.length)];
    this.data = this.type[this.turn];

    this.w = Math.sqrt(this.data.length);   // 2 or 3 or 4
    this.x = rand(6 - this.w) + 2;          // 落下開始時のx座標
    this.y = 1 - this.w;
    this.fire = interval + count;

    this.update = function () {
        // 一番下に到達？
        if (isHit(this.x, this.y + 1, this.turn)) {
            // ブロックが固定された瞬間にサウンドを再生
            dropSound.play();
    
            processBlockCells(function (x, y, value) {
                field[y][x] = value;
            });
        
            var erased = eraseLine();
            if (erased > 0) {
                score += Math.pow(2, erased) * 10;
            }
        
            keyevents = [];
            goNextBlock();
        }
        
        // ブロックを1行下へ移動
        if (this.fire < count) {
            this.fire = count + interval;
            this.y++;
        }
        
        // キーイベントの処理
        while (keyevents.length > 0) {
            var code = keyevents.shift();
            var dx = 0, dy = 0, nd = this.turn;
        
            switch (code) {
                case 'Space': nd = (nd + 1) % 4; break;
                case 'ArrowLeft': dx = -1; break;
                case 'ArrowRight': dx = +1; break;
                case 'ArrowDown': dy = +1; break;
                default: continue;
            }
        
            if (!isHit(this.x + dx, this.y + dy, nd)) {
                this.x = this.x + dx;
                this.y = this.y + dy;
                this.turn = nd;
                this.data = this.type[this.turn];
            }
        }
    };
    
    

    this.draw = function (ctx) {
        processBlockCells(function (x, y, value) {
            drawBlock(50 + x * 25, 25 + y * 25, value);
        });
    }

}

function rand(r) {
    return Math.floor(Math.random() * r);
}

function processBlockCells(func) {
    for (var i = 0; i < block.data.length; i++) {
        var x = i % block.w;
        var y = Math.floor(i / block.w);
        var v = block.data[i];
        if (0 <= y + block.y && y + block.y < H &&
            0 <= x + block.x && x + block.x < W && v != 0) {
            func(x + block.x, y + block.y, v);
        }
    }
}

function init() {
    var canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    ctx.font = "20pt Arial";

    count = 0;
    score = 0;
    interval = 40; // ゲームスピードをリセット
    keyevents = []; // キーイベントのリセット

    // モーダルウィンドウを非表示にする
    document.getElementById('tutorial').style.display = 'none';
    document.getElementById('gameOverModal').style.display = 'none';

    // フィールドの初期化
    field = new Array(H);
    for (var y = 0; y < H; y++) {
        field[y] = new Array(W);
        for (var x = 0; x < W; x++) {
            field[y][x] = (x == 0 || x == W - 1) ? 8 : 0;
        }
    }
    for (var i = 0; i < W; i++) {
        field[H - 1][i] = 8;
    }

    // ブロックの初期化
    nextBlock = null;
    goNextBlock();

    // メインループの開始
    if (timer) {
        clearInterval(timer);
    }
    timer = setInterval(mainLoop, 10);

    
    // キーイベントのリスナーを登録
    window.addEventListener('keydown', function (e) {
    // デフォルトの動作を防ぐ
    if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(e.code)) {
        e.preventDefault();
    }
    keyevents.push(e.code);
});
}

var bestScore = localStorage.getItem('bestScore') || 0; // ローカルストレージからベストスコアを取得

function mainLoop() {
    count++;

    // スピードアップ
    if (count % 1000 === 0) {
        interval = Math.max(1, interval - 1);
    }

    // ゲームオーバーの判定
    if (isGameOver()) {
        clearInterval(timer);
        timer = null;

        // ベストスコアの更新
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('bestScore', bestScore); // 新しいベストスコアを保存
        }

        // モーダルウィンドウを表示
        document.getElementById('gameOverModal').style.display = 'flex';
    } else {
        // ブロックの位置を更新
        block.update();
    }

    draw();
}

function isGameOver() {
    var filled = 0;
    field[0].forEach(function (c) {
        if (c != 0) { filled++ }
    });
    return filled > 2;
}

function goNextBlock() {
    block = nextBlock || new Block();
    nextBlock = new Block();
}

function isHit(x, y, r) {
    var data = block.type[r];
    for (var i = 0; i < block.w; i++) {
        for (var j = 0; j < block.w; j++) {
            if (i + y >= 0 && j + x >= 0 && i + y < H && j + x < W &&
                field[i + y][j + x] != 0 && data[i * block.w + j] != 0) {
                return true;
            }
        }
    }
    return false;
}

function eraseLine() {
    var erased = 0;
    for (var y = 20; y >= 0; y--) {   // 下から上へ
        if (field[y].every(function (v) { return v != 0; })) {
            erased++;
            field.splice(y, 1);             // 1行削除
            // 新しい空行を正しく追加
            var newLine = new Array(W).fill(0);
            newLine[0] = 8; // 左壁
            newLine[W - 1] = 8; // 右壁
            field.unshift(newLine);    // 1行追加
            y++;    // 消去した行からもう一度チェック
        }
    }
    return erased;
}

function draw() {
    // 背景の塗りつぶし
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(0, 0, 700, 600);

    // フィールドの描画
    for (var y = 0; y < H; y++) {
        for (var x = 0; x < W; x++) {
            var v = field[y][x];
            if (v != 0) {
                drawBlock(50 + x * 25, 25 + y * 25, v);
            }
        }
    }

    // 落下中のブロックの描画
    if (block) {
        block.draw(ctx);
    }

    // 次に出現するブロックの描画
    if (nextBlock) {
        nextBlock.data.forEach(function (v, i, data) {
            if (v != 0) {
                var w = Math.sqrt(data.length);
                var x = i % w;
                var y = Math.floor(i / w);
                drawBlock(400 + x * 25, 300 + y * 25, v);
            }
        });
    }

    // 各種情報の描画
    ctx.fillStyle = 'rgb(0,255,0)';
    ctx.fillText('YOUR SCORE', 400, 110);
    ctx.fillText(('0000000' + score).slice(-7), 440, 150);
    ctx.fillText('BEST SCORE', 400, 190);  // ベストスコアのラベル
    ctx.fillText(('0000000' + bestScore).slice(-7), 440, 230);  // ベストスコアを表示
    ctx.fillText('next', 380, 270);

    // 外枠のスタイル設定
    ctx.strokeStyle = 'white'; // 枠線の色
    ctx.lineWidth = 1;         // 枠線の太さ

    // SCORE の外枠を描画
    ctx.strokeRect(390, 125, 200, 30); // x, y, 幅, 高さ

    // BEST SCORE の外枠を描画
    ctx.strokeRect(390, 205, 200, 30); // x, y, 幅, 高さ

    // NEXT の外枠を描画
    ctx.strokeRect(380, 290, 120, 120); // x, y, 幅, 高さ

    // ゲームオーバー時のテキスト表示
    if (!timer) {
        ctx.fillText('GAME OVER', 410, 70);
    }
}

// リトライボタンの処理
function retryGame() {
    init();
}

// ゲーム一覧に戻るボタンの処理
function returnToIndex() {
    window.location.href = '../index.html';
}



// スタートボタンのクリックでゲームを開始
function startGame() {
    init(); // ゲーム開始
}


