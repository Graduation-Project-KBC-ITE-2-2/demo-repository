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
            const rank =  await getScoreRank();
            Myname.innerText = Nickname;
            Myemail.innerText = email;

            getUserScoresByEmail(email,collections).then((data) => {
                for(const col of collections){
                    const gameItem = document.createElement("p");
                    const gameItemrank = document.createElement("p");
                    gameItem.id = col;
                    gameItemrank.id = col+"rank";
                    gameList.appendChild(gameItem);
                    scorelist.appendChild(gameItemrank);
                    let gemaname = document.getElementById(col);
                    let gemarankname = document.getElementById(col+"rank");

                    
                    if( data[col] != null){
                        gemaname.innerText = `${col} - スコア: ${data[col]}`;
                        // let Rank = 0;
                        // let userall = 0;
                        // for(const rank of rank.userranks){
                        //     if (rank.has(col)) {
                        //         Rank = rank.get(col);
                        //         break;
                        //     }
                        // }
                        // for(const all of rank.useralls){
                        //     if (all.has(col)) {
                        //         userall = all.get(col);
                        //         break;
                        //     }
                        // }
                        // gemarankname.innerText = `${col} - ランク: ${Rank}/${userall}`;
                    }
                    
                }
            })
            totlescore.innerText = `トータルスコア: ${totle}`;
            console.log(rank.userranks["Asteroid"]);
            console.log(rank.useralls);

        }catch(e){
            console.error("エラーが発生しました：", e);

        }finally{
            loading.style.display = "none";
        }



        

        
            // ローディング画面を非表示にしてメインコンテンツを表示

        });
        



        

    