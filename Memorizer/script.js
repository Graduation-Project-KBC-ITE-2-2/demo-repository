import { getUserEmail, saveScoreAndEmail, displayDataInHTMLRealtime } from '../firebaseConfig.js';


var round = 0;
var questions = [];
var qCount = 0;
var qTimer = NaN;
var answers = [];
var sounds = [];
var bestScore = localStorage.getItem('bestScore') !== null ? parseInt(localStorage.getItem('bestScore')) : 0;

function gobj(id) { return document.getElementById(id); }

window.init = function() {
    const buttons = document.querySelectorAll("button[data-index]");
    buttons.forEach(button => {
        var index = button.getAttribute('data-index');
        button.style.zIndex = "1";
        button.onclick = function(e) {
            if (qTimer) { return; }
            blink(index);
            answer(parseInt(index)); // indexを整数に変換
        };
        sounds.push(new Audio("sound" + (parseInt(index) + 1) + ".mp3")); // サウンドの配列に追加
    });
    
    // ベストスコアの表示を初期化時に行う
    gobj("bestScore").textContent = "ラウンド: " + round + " | ベストスコア: " + bestScore;
        console.log('Best Score displayed:', bestScore);
    console.log('Best Score displayed on init:', bestScore); // ベストスコアを表示
    showTutorial(); // チュートリアルを表示
}


function showTutorial() {
    gobj("tutorial").style.display = "flex";
}

window.hideTutorial = function() {
    gobj("tutorial").style.display = "none";
    setTimeout(function() {
        startGame();
    }, 1000); // 1秒のディレイを追加してリスタート
}

function startGame() {
    showMessage("ゲーム開始！");
    gobj("message").style.whiteSpace = "nowrap";
    setTimeout(function() {
        round = 0;
        questions = [];
        answers = [];
        nextRound();
    }, 1000); // 1秒のディレイを追加してゲームを開始
}

function showMessage(mess) {
    const messageElem = gobj("message");
    messageElem.textContent = mess;
    messageElem.style.display = "flex";
    messageElem.style.justifyContent = "center";
    messageElem.style.alignItems = "center";
    messageElem.style.position = "absolute"; // absoluteにしてゲームエリアに対して配置
    messageElem.style.top = "50%";
    messageElem.style.left = "50%";
    messageElem.style.transform = "translate(-50%, -50%)";
    messageElem.style.fontSize = "48px";
    messageElem.style.color = "white";
    messageElem.style.zIndex = "1000"; // 他の要素より上に表示するための設定

    setTimeout(function() {
        messageElem.style.display = "none";
    }, 2000);
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
    gobj("bestScore").textContent = "ラウンド: " + round + " | ベストスコア: " + bestScore;
    round++;
    showMessage("ラウンド: " + round);
    gobj("message").style.whiteSpace = "nowrap";
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
        showMessage("覚えましょう！");
    gobj("message").style.whiteSpace = "nowrap";
    setTimeout(function() {
        gobj("message").style.display = "none";
    }, 1000);
    }
}

async function answer(val) {
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
            localStorage.setItem('bestScore', bestScore.toString());
            console.log('Best Score saved to localStorage:', bestScore);
        }
        // ベストスコアの表示更新
        // gobj("ベストスコア").textContent = "Best Score: " + bestScore;
    } else if (answers.length == questions.length) {
        showMessage("正解です");
        // ラウンドクリア時にもベストスコアを更新
        if (round > bestScore) {
            bestScore = round;
            localStorage.setItem('bestScore', bestScore.toString());
            console.log('Best Score saved to localStorage on round clear:', bestScore);
        }
        gobj("bestScore").textContent = "ベストスコア: " + bestScore;
        setTimeout(nextRound, 2000); // 2秒後に次のラウンドへ
    }
    const title = document.title;
    const userEmail = await getUserEmail();
    await saveScoreAndEmail(title, bestScore, userEmail);
}
const title = document.title;
console.log(title);
displayDataInHTMLRealtime(title);
