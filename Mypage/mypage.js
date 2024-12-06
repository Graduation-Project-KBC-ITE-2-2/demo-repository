import { getUserEmail, nickname, getUserScoresByEmail, getUsertotleScoresByEmail, getScoreRank } from "../firebaseConfig.js";

window.addEventListener("load", async function () {
    const collections = ['Asteroid', 'Blocks', 'MineSweeper', 'Cave', 'Missile Command', 'Qix', 'Invader', 'Memorizer', 'SnakeBite', 'Tetris'];
    const loading = document.getElementById("loading");
    const gameList = document.getElementById('game-list');
    const scorelist = document.getElementById('scorelist');
    const Myname = document.getElementById("username");
    const Myemail = document.getElementById("email");
    const totlescore = document.getElementById("totleScore");

    try {
        // 非同期で必要なデータを取得
        const email = await getUserEmail();
        const Nickname = await nickname(email);
        const totle = await getUsertotleScoresByEmail(email);
        const rank = await getScoreRank();

        // ユーザー情報を表示
        Myname.innerText = Nickname;
        Myemail.innerText = email;

        // 各ゲームのスコアとランクを表示
        const data = await getUserScoresByEmail(email, collections);
        for (const col of collections) {
            // ゲームのスコアとランク用の DOM 要素を作成
            const gameItem = document.createElement("p");
            const gameItemrank = document.createElement("p");
            gameItem.id = col;
            gameItemrank.id = col + "rank";
            gameList.appendChild(gameItem);
            scorelist.appendChild(gameItemrank);

            if (data[col] != null) {
                let Rank = rank.userranks.get(col) || 0; // 該当するランクを取得
                let userall = rank.useralls.get(col) || 0; // 該当する全体ランクを取得

                gameItem.innerText = `${col} - スコア: ${data[col]}`;
                gameItemrank.innerText = `${col} - ランク: ${Rank}/${userall}`;
            }
        }

        // トータルスコアを表示
        totlescore.innerText = `トータルスコア: ${totle}`;

    } catch (e) {
        console.error("エラーが発生しました：", e);
    } finally {
        // ローディング画面を非表示
        loading.style.display = "none";
    }
});
