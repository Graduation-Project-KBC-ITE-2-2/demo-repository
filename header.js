// header.js

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
      
