import { getUserEmail, nickname, getUserScoresByEmail, getUsertotleScoresByEmail, getScoreRank } from "../firebaseConfig.js";

window.addEventListener("load", async function () {
    const collections = ['Asteroid', 'Bloks Game', 'Mine Sweeper', 'Cave', 'Missile Command', 'Quicks', 'SpaceInvader', 'Memorizer', 'SnakeBite', 'Tetris','user_name'];
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
        // for (const col of collections) {

        //     // ゲームのスコアとランク用の DOM 要素を作成
        //     let gameItem;
        //     if(col === "user_name"){
        //         gameItem = document.createElement("h3");
        //     }else{
        //         gameItem = document.createElement("p");
        //     }
            
        //     gameItem.id = col;
        //     gameList.appendChild(gameItem);
        //     const crownIcon = document.createElement("img");

        //     if (data[col] != null) {
        //         let Rank = rank.userranks.get(col) || 0; // 該当するランクを取得
        //         let userall = rank.useralls.get(col) || 0; // 該当する全体ランクを取得
        //         const link = document.createElement("a");
        //         link.href = `rankings.html?game=${encodeURIComponent(col)}`;
        //         if(col == "user_name"){
        //             gameItem.innerText = `トータル - スコア: ${data[col]} - 総合ランク: ${userall}人中 / ${Rank}位 `;
        //         }else{
        //             gameItem.innerText = `${col} - スコア: ${data[col]} - ランク: ${userall}人中 / ${Rank}位`;
        //         }
        //         crownIcon.alt = "Crown";
        //         if (Rank === 1) {
        //             crownIcon.src = "icon.png";
        //         }else if(Rank === 2){
        //             crownIcon.src = "2icon.png";
        //         }else if(Rank === 3){
        //             crownIcon.src = "3icon.png";
        //         }else{

        //             crownIcon.src = "zako.jpg";
                    
        //         }
                
        //         if(col == "user_name"){
        //             crownIcon.style.width = "80px";
        //         }else{
        //             crownIcon.style.width = "30px"; // 必要に応じてサイズを調整
        //         }
                
        //         gameItem.appendChild(crownIcon);
                
        //     }
        // }

        // for (const col of collections) {
        //     // ゲームのスコアとランク用の DOM 要素を作成
        //     let gameItem;
        //     if (col === "user_name") {
        //         gameItem = document.createElement("h3");
        //     } else {
        //         gameItem = document.createElement("p");
        //     }
        
        //     gameItem.id = col;
        //     gameList.appendChild(gameItem);
        
        //     // スコアとランクが存在する場合のみ処理
        //     if (data[col] != null) {
        //         let Rank = rank.userranks.get(col) || 0; // 該当するランクを取得
        //         let userall = rank.useralls.get(col) || 0; // 該当する全体ランクを取得
        
        //         // リンク要素を作成して、ゲーム名を含める
        //         const link = document.createElement("a");
        //         link.href = `rankings.html?game=${encodeURIComponent(col)}`;
        //         link.style.textDecoration = "none"; // リンクのスタイル調整
        //         link.style.color = "inherit"; // 親の色に合わせる
        
        //         if (col === "user_name") {
        //             link.innerText = `トータル - スコア: ${data[col]} - 総合ランク: ${userall}人中 / ${Rank}位 `;
        //         } else {
        //             link.innerText = `${col} - スコア: ${data[col]} - ランク: ${userall}人中 / ${Rank}位`;
        //         }
        
        //         // 王冠アイコンの作成
        //         const crownIcon = document.createElement("img");
        //         crownIcon.alt = "Crown";
        
        //         // ランクに応じたアイコンを設定
        //         if (Rank === 1) {
        //             crownIcon.src = "icon.png";
        //         } else if (Rank === 2) {
        //             crownIcon.src = "2icon.png";
        //         } else if (Rank === 3) {
        //             crownIcon.src = "3icon.png";
        //         } else {
        //             crownIcon.src = "zako.jpg";
        //         }
        
        //         // アイコンのスタイル調整
        //         if (col === "user_name") {
        //             crownIcon.style.width = "80px";
        //         } else {
        //             crownIcon.style.width = "30px"; // 必要に応じてサイズを調整
        //         }
        
        //         // リンクとアイコンを gameItem に追加
        //         gameItem.appendChild(link);
        //         if (crownIcon.src) {
        //             gameItem.appendChild(crownIcon);
        //         }
        //     }
        // }

        for (const col of collections) {
            let gameItem;
            if (col === "user_name") {
                gameItem = document.createElement("h3");
            } else {
                gameItem = document.createElement("p");
            }
        
            gameItem.id = col;
            gameList.appendChild(gameItem);
        
            if (data[col] != null) {
                let Rank = rank.userranks.get(col) || 0; // 該当するランクを取得
                let userall = rank.useralls.get(col) || 0; // 該当する全体ランクを取得
                const lowerCol = col.toLowerCase(); // colを小文字に変換

                // メインのリンク作成（col部分以外のテキストリンク）
                const mainLink = `Ranking/ranking.html?game=${encodeURIComponent(col)}`;
                
                // col部分だけ別URL
                const colLink = `../${col}/${lowerCol}.html`;
        
                // innerHTMLを使って部分リンクを設定
                if(col == "user_name"){
                    gameItem.innerHTML = `
                    
                    <a href="${mainLink}" style="color: blue; text-decoration: underline;">トータル - スコア: ${data[col]} 
                    - ランク: ${userall}人中 / ${Rank}位</a> 
                `;
                }else{
                    gameItem.innerHTML = `
                    <a href="${colLink}" style="color: blue; text-decoration: underline;">${col}</a> 
                    - スコア: ${data[col]} - <a href="${mainLink}" style="color: blue; text-decoration: underline;">
                    ランク: ${userall}人中 / ${Rank}位</a> 
                `;
                }
        
                // 王冠アイコンの設定
                const crownIcon = document.createElement("img");
                crownIcon.alt = "Crown";
                if (Rank === 1) {
                    crownIcon.src = "icon.png";
                } else if (Rank === 2) {
                    crownIcon.src = "2icon.png";
                } else if (Rank === 3) {
                    crownIcon.src = "3icon.png";
                } else {
                    crownIcon.src = "zako.jpg"; 
                }
        
                // アイコンを gameItem に追加
                if (crownIcon.src) {
                    crownIcon.style.width = col === "user_name" ? "80px" : "30px";
                    gameItem.appendChild(crownIcon);
                }
            }
        }

          
          loadCSS('../header.css');


    } catch (e) {
        console.error("エラーが発生しました：", e);
    } finally {
        // ローディング画面を非表示
        loading.style.display = "none";
    }
});
