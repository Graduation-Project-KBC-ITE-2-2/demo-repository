import { getUserEmail, nickname, getUserScoresByEmail, getUsertotleScoresByEmail, getScoreRank, sendPasswordReset,auth} from "../firebaseConfig.js";


window.addEventListener("load", async function () {
    const collections = ['Asteroid', 'Bloks Game', 'Mine Sweeper', 'Cave', 'Missile Command', 'Quicks', 'SpaceInvader', 'Memorizer', 'SnakeBite', 'Tetris','user_name'];
    const loading = document.getElementById("loading");
    const gameList = document.getElementById('game-list');
    const scorelist = document.getElementById('scorelist');
    const Myname = document.getElementById("username");
    const Myemail = document.getElementById("email");
    const totlescore = document.getElementById("totleScore");
    const resetPasswordButton = document.getElementById('reset-password-btn');

    // ログアウトリンクのクリックイベントを設定
    const logoutLink = document.getElementById("logoutLink");

    logoutLink.addEventListener("click", (event) => {
    event.preventDefault(); // デフォルトのリンク動作を防止

    auth.signOut()
        .then(() => {
        console.log("ユーザーはログアウトしました。");
        // ログアウト後にトップページにリダイレクト
        window.location.href = "/index.html"; // トップページのURLにリダイレクト
        })
        .catch((error) => {
        console.error("ログアウトエラー:", error);
        });
    });



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

        resetPasswordButton.onclick = async () => {
            if (email) {
                resetPasswordButton.disabled = true;
                resetPasswordButton.innerText = "処理中...";
                try {
                    await sendPasswordReset(email);
                } finally {
                    resetPasswordButton.disabled = false;
                    resetPasswordButton.innerText = "パスワード再設定";
                }
            } else {
                alert("メールアドレスを入力してください。");
            }
        };


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
                    
                    <a href="${mainLink}" style="color: gold; text-decoration: underline;">トータル - スコア: ${data[col]} 
                    <br> ランク: ${userall}人中 / ${Rank}位</a> 
                `;
                }else{
                    gameItem.innerHTML = `
                    <a href="${colLink}" style="color: black; text-decoration: underline;">${col}</a> 
                    - スコア: ${data[col]} <br> <a href="${mainLink}" style="color: gold; text-decoration: underline;">
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
                    crownIcon.style.width = col === "user_name" ? "100px" : "30px";
                    gameItem.appendChild(crownIcon);
                }
            }
        }


        // <div class="footer-content">
        //   <p>© 2024 ミニゲーム集. All Rights Reserved.</p>
        //   <nav class="footer-nav">
        //     <a href="/index.html">TOP</a>
        //     <a href="/privacy-policy.html">プライバシーポリシー</a>
        //     <a href="/terms-of-service.html">利用規約</a>
        //     <a href="/Production/production.html">製作</a>
        //     <a href="/Inquiry/inquiry.html">お問い合わせ</a>
        //   </nav>
        // </div>
        // `;

        // function loadCSS(href) {
        //     const baseURL = '/demo-repository/'; // ViteのベースURL
        //     const link = document.createElement('link');
        //     link.rel = 'stylesheet';
        //     link.href = baseURL + href; // ベースURL + 相対パス
        //     document.head.appendChild(link);
        //   }
    
        //   loadCSS('/../main.css');


        //   function updateLinksWithBaseURL() {
        //     const baseURL = '/demo-repository/'; // Vite のベースURL
        //     const links = document.querySelectorAll('a'); // すべてのリンクを取得
          
        //     links.forEach((link) => {
        //       const href = link.getAttribute('href');
          
        //       // href が '/' で始まる場合のみベースURLを追加
        //       if (href && href.startsWith('/')) {
        //         // もし baseURL の末尾が '/' で、href の先頭も '/' の場合、二重スラッシュを防ぐ
        //         const updatedHref = baseURL.endsWith('/')
        //           ? baseURL.slice(0, -1) + href
        //           : baseURL + href;
          
        //         link.setAttribute('href', updatedHref);
        //       }
        //     });
        //   }
          
        //   // ページが読み込まれた後にリンクを更新
        //   document.addEventListener('DOMContentLoaded', updateLinksWithBaseURL);

// ページが読み込まれた後にCSSを追加

  

    } catch (e) {
        console.error("エラーが発生しました：", e);
    } finally {
        // ローディング画面を非表示
        loading.style.display = "none";
    }
});
