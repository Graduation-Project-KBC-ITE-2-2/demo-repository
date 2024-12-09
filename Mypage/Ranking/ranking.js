import {displayDataInHTMLRealtimeall} from "../../firebaseConfig.js"

// URLのクエリパラメータを取得
const urlParams = new URLSearchParams(window.location.search);

// 'game' パラメータの値を取得
const game = urlParams.get('game');

displayDataInHTMLRealtimeall(game);

const title = document.getElementById('rankingtitle');
if(game === "user_name"){
    title.innerText = "総合 - ランキング";
}else{
    title.innerText = game+" - "+ "ランキング";
}
