
import { setupCounter } from './counter.js';



// document.querySelector('#header').innerHTML = `

//       <ul class="header">
//           <li class="asteroid"><a href="demo-repository/Asteroid/asteroid.htm">Asteroid</a></li>
//           <li class="Blocks"><a href="Blocks/blocks.htm">Blocks</a></li>
//           <li class="MineSweeper"><a href="MineSweeper/minesweeper.html">MineSweeper</a></li>
//           <li class="Cave"><a href="Cave/cave.html">Cave</a></li>
//           <li class="MissileCommand"><a href="MissileCommand/missilecommand.htm">MissileCommand</a></li>
//           <li class="Qix"><a href="Qix/Qix.htm">Qix</a></li>
//           <li class="Invader"><a href="Invader/SpaceInvader.htm">Invader</a></li>
//           <li class="Memorizer"><a href="Memorizer/memorizer.html">Memorizer</a></li>
//           <li class="SnakeBite"><a href="SnakeBite/SnakeBite.html">SnakeBite</a></li>
//           <li class="Tetris/Tetris.htm">Tetris</a></li>
//           <li><a href="index.html">Top</a></li>

//       </ul>
const title = document.title;
const header = document.getElementById(title);
if(header){
  header.style.display = "none"
}

document.querySelector('#footer').innerHTML = `

      <div class="footer-content">
        <p>© 2024 ミニゲーム集. All Rights Reserved.</p>
        <nav class="footer-nav">
          <a href="/index.html">TOP</a>
          <a href="/privacy-policy.html">プライバシーポリシー</a>
          <a href="/terms-of-service.html">利用規約</a>
          <a href="/Production/production.html">製作</a>
          <a href="/Inquiry/inquiry.html">お問い合わせ</a>
        </nav>
      </div>
      `;

      function loadCSS(href) {
        const baseURL = '/demo-repository/'; // ViteのベースURL
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = baseURL + href; // ベースURL + 相対パス
        document.head.appendChild(link);
      }

      loadCSS('main.css');


      


