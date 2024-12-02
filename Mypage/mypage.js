import {getUserEmail, nickname, getUserScoresByEmail} from "../firebaseConfig.js";


    
        const email = await getUserEmail();
        const Nickname = await nickname(email);
        let totle = 0;
        
        const Myname = document.getElementById("username");
        const Myemail = document.getElementById("email");
        const gameList = document.getElementById('game-list');
        const collections = ['Asteroid', 'Blocks', 'MineSweeper','Cave','MissileCommand','Qix','Invader','Memorizer','SnakeBite','Tetris'];

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
                    totle += data[col];
                }
                
            }
            console.log(totle )
        })

        export {totle};
        
