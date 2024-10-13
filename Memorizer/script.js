var round = 0;
var questions = [];
var qCount = 0;
var qTimer = NaN;
var answers = [];
var sounds = [];
var bestScore = localStorage.getItem('bestScore') || 0;

function gobj(id) { return document.getElementById(id); }

function init() {
    const buttons = document.querySelectorAll("button[data-index]");
    buttons.forEach(button => {
        var index = button.getAttribute('data-index');
        button.onclick = function(e) {
            if (qTimer) { return; }
            blink(index);
            answer(parseInt(index)); // indexを整数に変換
        };
        sounds.push(new Audio("sound" + (parseInt(index) + 1) + ".mp3")); // サウンドの配列に追加
    });
    
    // ベストスコアの表示を初期化時に行う
    gobj("bestScore").textContent = "Best Score: " + bestScore; // ベストスコアを表示
    showTutorial(); // チュートリアルを表示
}


function showTutorial() {
    gobj("tutorial").style.display = "flex";
}

function hideTutorial() {
    gobj("tutorial").style.display = "none";
    startGame();
}

function startGame() {
    nextRound(); // 修正: 直接ゲームを開始
}

function showMessage(mess) {
    gobj("message").textContent = mess;
}

function blink(index) {
    var fgcolors = ["#F00", "#FF0", "#0F0", "#00F"];
    var bgcolors = ["#600", "#660", "#060", "#006"];

    gobj("b" + index).style.backgroundColor = fgcolors[index];
    sounds[index].currentTime = 0;
    sounds[index].play();

    setTimeout(function () {
        for (var i = 0; i < 4; i++) {
            gobj("b" + i).style.backgroundColor = bgcolors[i];
        }
    }, 400);
}

function nextRound() {
    round++;
    showMessage("Round: " + round);
    var r = Math.floor(Math.random() * 4);
    questions.push(r);
    answers = [];
    qCount = 0;
    qTimer = setInterval(showQuizItem, 600);
}

function showQuizItem() {
    blink(questions[qCount]);
    if (++qCount >= questions.length) {
        clearInterval(qTimer);
        qTimer = NaN;
        showMessage("Start answering!");
    }
}

function answer(val) {
    answers.push(val);
    var mistake = false;
    
    // 回答のチェック
    for (var i = 0; i < answers.length; i++) {
        if (answers[i] != questions[i]) {
            mistake = true;
            break;
        }
    }

    // 間違えた場合
    if (mistake) {
        showMessage("Game Over: " + round);
        
        // ベストスコアの更新と保存
        if (round > bestScore) {
            bestScore = round;
            localStorage.setItem('bestScore', bestScore); // ベストスコアをlocalStorageに保存
        }
        
        // ベストスコアの表示更新
        gobj("bestScore").textContent = "Best Score: " + bestScore;
    
    // 正解した場合
    } else if (answers.length == questions.length) {
        showMessage("GOOD");
        setTimeout(nextRound, 2000); // 2秒後に次のラウンドへ
    }
}

