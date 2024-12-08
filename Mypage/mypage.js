import { getUserEmail, nickname, getUserScoresByEmail, getUsertotleScoresByEmail, getScoreRank } from "../firebaseConfig.js";

window.addEventListener("load", async function () {
    const collections = ['Asteroid', 'Bloks Game', 'MineSweeper', 'Cave', 'Missile Command', 'Qix', 'SpaceInvader', 'Memorizer', 'SnakeBite', 'Tetris','user_name'];
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
            let gameItem;
            if(col === "user_name"){
                gameItem = document.createElement("h3");
            }else{
                gameItem = document.createElement("p");
            }
            
            gameItem.id = col;
            gameList.appendChild(gameItem);
            const crownIcon = document.createElement("img");

            if (data[col] != null) {
                let Rank = rank.userranks.get(col) || 0; // 該当するランクを取得
                let userall = rank.useralls.get(col) || 0; // 該当する全体ランクを取得

                if(col == "user_name"){
                    gameItem.innerText = `トータル - スコア: ${data[col]} - 総合ランク: ${Rank}位 /${userall}人中`;
                }else{
                    gameItem.innerText = `${col} - スコア: ${data[col]} - ランク: ${Rank}位 /${userall}人中`;
                }
                if (Rank === 1) {
                    crownIcon.src = "icon.png";
                }else if(Rank === 2){
                    crownIcon.src = "2icon.png";
                }else if(Rank === 3){
                    crownIcon.src = "3icon.png";
                }
                crownIcon.alt = "Crown";
                if(col == "user_name"){
                    crownIcon.style.width = "80px";
                }else{
                    crownIcon.style.width = "30px"; // 必要に応じてサイズを調整
                }
                
                gameItem.appendChild(crownIcon);
                
            }
        }


    } catch (e) {
        console.error("エラーが発生しました：", e);
    } finally {
        // ローディング画面を非表示
        loading.style.display = "none";
    }
});
