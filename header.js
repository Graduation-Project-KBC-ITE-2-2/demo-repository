// header.js

// ヘッダーHTMLをテンプレートリテラルとして定義
const headerHTML = `
<header>
  <ul class="header">
    <li><a href="/Asteroid/asteroid.htm">Asteroid</a></li>
    <li><a href="/Blocks/blocks.htm">Blocks</a></li>
    <li><a href="/Cave/cave.html">Cave</a></li>
    <li><a href="/Invader/SpaceInvader.htm">Invader</a></li>
    <li><a href="/MineSweeper/minesweeper.html">MineSweeper</a></li>
    <li><a href="/Memorizer/memorizer.html">Memorizer</a></li>
    <li><a href="/MissileCommand/missilecommand.htm">MissileCommand</a></li>
    <li><a href="/Qix/Qix.htm">Qix</a></li>
    <li><a href="/Tetris/Tetris.htm">Tetris</a></li>
    <li><a href="/index.html">Top</a></li>
  </ul>
</header>
`;

// DOMが読み込み終わったらheaderHTMLを挿入する
document.addEventListener("DOMContentLoaded", () => {
  // bodyや特定の要素に挿入する
  // ここではbodyの最初に挿入する例
  document.body.insertAdjacentHTML("afterbegin", headerHTML);
});
