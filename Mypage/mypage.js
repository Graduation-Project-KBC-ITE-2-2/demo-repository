import {getUserEmail, nickname, getUserScoresByEmail,getUsertotleScoresByEmail} from "../firebaseConfig.js";


        const email = await getUserEmail();
        const Nickname = await nickname(email);
        
        const Myname = document.getElementById("username");
        const Myemail = document.getElementById("email");
        const gameList = document.getElementById('game-list');
        const collections = ['Asteroid', 'Blocks', 'MineSweeper','Cave','Missile Command','Qix','Invader','Memorizer','SnakeBite','Tetris'];

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

        const totle = await getUsertotleScoresByEmail(email);
        let totlescore = document.getElementById("totleScore");
        totlescore.innerText = `トータルスコア: ${totle}`;

        

    