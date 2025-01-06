// header.js


import { auth, toggleModalVisibility, guestLogin, NicknameSave,  nickname, loginUser } from "./firebaseConfig.js"; // Firebase設定をインポート

// ヘッダーHTMLをテンプレートリテラルとして定義
const headerHTML = `

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<header>
  <ul class="header">
        <li><a href="/Asteroid/asteroid.html">Asteroid</a></li>
        <li><a href="/Bloks Game/bloks game.html">Blocks</a></li>
        <li><a href="/Cave/cave.html">Cave</a></li>
        <li><a href="/SpaceInvader/spaceinvader.html">Invader</a></li>
        <li><a href="/Mine Sweeper/mine sweeper.html">MineSweeper</a></li>
        <li><a href="/Memorizer/memorizer.html">Memorizer</a></li>
        <li><a href="/Missile Command/missile command.html">MissileCommand</a></li>
        <li><a href="/Qix/qix.html">Qix</a></li>
        <li><a href="/SnakeBite/snakebite.html">SnakeBite</a></li>
        <li><a href="/Tetris/tetris.html">Tetris</a></li>
        <li id = "ミニゲーム集"><a href="/index.html">Top</a></li>
  </ul>
      <div class="account-container" id="account-container">
        
        <div class="account-name" id="account-name"></div>
        <div class="dropdown-menu" id="dropdown-menu">
        <div class="fullnickname" id="fullnickname"></div>
        <div class="mypage" id="mypage"><a href="/Mypage/mypage.html">マイページ</a></div>
          <div class="nickname-input">
            <input type="text" id="nickname" placeholder="ニックネームを入力" />
            <button id="save-nickname">保存</button>
          </div>
        </div>
      </div>
</header>
`;

// DOMが読み込み終わったらheaderHTMLを挿入する
document.addEventListener("DOMContentLoaded", () => {
  // bodyや特定の要素に挿入する
  // ここではbodyの最初に挿入する例
  document.body.insertAdjacentHTML("afterbegin", headerHTML);
});

function loadCSS(href) {
  const baseURL = '/demo-repository/'; // ViteのベースURL
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = baseURL + href; // ベースURL + 相対パス
  document.head.appendChild(link);
}

loadCSS('styles.css');

      function updateLinksWithBaseURL() {
        const baseURL = '/demo-repository/'; // Vite のベースURL
        const links = document.querySelectorAll('a'); // すべてのリンクを取得
      
        links.forEach((link) => {
          const href = link.getAttribute('href');
      
          // href が '/' で始まる場合のみベースURLを追加
          if (href && href.startsWith('/')) {
            // もし baseURL の末尾が '/' で、href の先頭も '/' の場合、二重スラッシュを防ぐ
            const updatedHref = baseURL.endsWith('/')
              ? baseURL.slice(0, -1) + href
              : baseURL + href;
      
            link.setAttribute('href', updatedHref);
          }
        });
      }
      
      // ページが読み込まれた後にリンクを更新
      document.addEventListener('DOMContentLoaded', updateLinksWithBaseURL);

window.onload = function () {
  let nicknameValue ="";
  auth.onAuthStateChanged(async(user) => {
    const accountName = document.getElementById("account-name");
    if(user){
      if (user.isAnonymous) {
        accountName.innerText = "ゲスト"; // ゲストユーザーの場合は「ゲスト」と表示
      } else {
        const useremail = user.email;
        nicknameValue = await nickname(user.email);
        console.log(nicknameValue);
        const fullnickname = document.getElementById("fullnickname");
        if(nicknameValue == "NoNickname"){
          accountName.innerText = useremail.charAt(0);
          fullnickname.innerText = useremail;
        }else{
          accountName.innerText = nicknameValue.charAt(0);
          fullnickname.innerText = nicknameValue;
        }
        document.getElementById('account-name').addEventListener('click', function () {
          const dropdownMenu = document.getElementById('dropdown-menu');
          if (dropdownMenu.style.display === 'none' || dropdownMenu.style.display === '') {
            dropdownMenu.style.display = 'block';
          } else {
            dropdownMenu.style.display = 'none';
          }
        });
        accountName.style.display = "flex";
        // 保存ボタンをクリックしたときにニックネームを保存して表示する
        document.getElementById('save-nickname').addEventListener('click', function () {
          const nickname = document.getElementById('nickname').value;
          if (nickname) {
            NicknameSave(user.email, nickname);
            document.getElementById('dropdown-menu').style.display = 'none'; // メニューを閉じる
          }
        });
      }
    }else{

    }
  
  });

}
      
