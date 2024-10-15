"use strict";
    var W = 10, H = 10, BOMB = 10, cell = [], opened = 0;

    function init() {
        var main = document.getElementById("main");
        main.innerHTML = "";  // 既存のテーブルをクリア
    
        for (var i = 0; i < H; i++) {
            cell[i] = [];
            var tr = document.createElement("tr");
            for (var j = 0; j < W; j++) {
                var td = document.createElement("td");
                td.addEventListener("click", click);
                td.className = "cell";
                td.y = i;
                td.x = j;
                cell[i][j] = td;
                tr.appendChild(td);
            }
            main.appendChild(tr);
        }
    
        for (var i = 0; i < BOMB; i++) {
            while (true) {
                var x = Math.floor(Math.random() * W);
                var y = Math.floor(Math.random() * H);
                if (!cell[y][x].bomb) { // 修正: yとxの位置を交換
                    cell[y][x].bomb = true; // 修正: yとxの位置を交換
                    break;
                }
            }
        }
    }

    function count(x, y) {
        var b = 0;
        for (var j = y - 1; j <= y + 1; j++) {
            for (var i = x - 1; i <= x + 1; i++) {
                if (cell[j] && cell[j][i]) {
                    if (cell[j][i].bomb) b++;
                }
            }
        }
        return b;
    }

    function open(x, y) {
    for (var j = y - 1; j <= y + 1; j++) {
        for (var i = x - 1; i <= x + 1; i++) {
            if (cell[j] && cell[j][i]) {
                var c = cell[j][i];
                if (c.opened || c.bomb) {
                    continue;
                }
                flip(c);
                var n = count(i, j); // xとyの順番を修正
                if (n == 0) {
                    open(i, j);
                } else {
                    c.textContent = n;
                    c.style.color = "black"; // 数字を見やすくするための色変更
                }
            }
        }
    }
}

    function flip(cell) {
        cell.className = "cell open";
        cell.opened = true;
        if (++opened >= (W * H - BOMB)) {
            document.getElementById("title").textContent = "Good Job!";
        }
    }

    function click(e) {
        var src = e.currentTarget;
        if (src.bomb) {
            cell.forEach(function (tr) {
                tr.forEach(function (td) {
                    if (td.bomb) {
                        td.textContent = "+";
                    }
                });
            });
            document.getElementById("title").textContent = "Game Over";
        } else {
            open(src.x, src.y);
        }
    }

    function startGame() {
        // チュートリアルモーダルを非表示にしてテーブルを表示
        document.getElementById('tutorial').style.display = 'none';
        document.getElementById('main').style.display = 'block'; // テーブルを表示
    
        // ゲーム盤の初期化
        init();
    }

    document.getElementById("startButton").addEventListener("click", startGame); // ゲーム開始ボタンにイベントリスナーを追加
