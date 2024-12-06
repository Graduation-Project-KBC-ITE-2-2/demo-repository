import {getUserEmail, nickname, getUserScoresByEmail,getUsertotleScoresByEmail, getScoreRank} from "../firebaseConfig.js";

window.addEventListener("load",  async function () {

        
        const Myname = document.getElementById("username");
        const Myemail = document.getElementById("email");
        const gameList = document.getElementById('game-list');
        const loading = document.getElementById("loading");
        const collections = ['Asteroid', 'Blocks', 'MineSweeper','Cave','Missile Command','Qix','Invader','Memorizer','SnakeBite','Tetris'];

        try{
            const email = await getUserEmail();
            const Nickname = await nickname(email);
            const totle = await getUsertotleScoresByEmail(email);
            let totlescore = document.getElementById("totleScore");
            const rank = getScoreRank();

            Myname.innerText = Nickname;
            Myemail.innerText = email;

            getUserScoresByEmail(email,collections).then((data) => {
                for(const col of collections){
                    const gameItem = document.createElement("p");
                    gameItem.id = col;
                    gameList.appendChild(gameItem);
                    let gemaname = document.getElementById(col);
                    if( data[col] != null){
                        gemaname.innerText = `${col} - スコア: ${data[col]}`;
                    }
                    
                }
            })
            totlescore.innerText = `トータルスコア: ${totle}`;
            console.log(rank.userranks);
            console.log(rank.useralls);

        }catch(e){
            console.error("エラーが発生しました：", e);

        }finally{
            loading.style.display = "none";
        }



        

        
            // ローディング画面を非表示にしてメインコンテンツを表示

        });
        



        

    