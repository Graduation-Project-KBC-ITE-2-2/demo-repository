import { auth , toggleModalVisibility, guestLogin} from "./firebaseConfig.js";  // Firebase設定をインポート

const loginButton = document.getElementById('loginButton');
const signupButton = document.getElementById('signup-button');
const guestLoginButton = document.getElementById('guestLoginButton');  // ゲストログインボタンを取得


window.onload = function() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === 'success') {
        // alert('ログイン成功');
    }

    auth.onAuthStateChanged(user => {
        const accountName = document.getElementById('account-name');
        if(user){

        if (user.isAnonymous) {
            accountName.innerText = 'ゲスト';  // ゲストユーザーの場合は「ゲスト」と表示
        } else {
            // ログインしている場合、アカウント名を表示
            accountName.innerText = user.email.charAt(0);
        }
            accountName.style.display = 'flex';
            document.getElementById('modal').style.display = 'none';

            // ログアウトボタンに変更
            loginButton.innerText = 'ログアウト';
            loginButton.onclick = () => {
                auth.signOut().then(() => {
                    console.log('ユーザーはログアウトしました。');
                    location.reload();
                }).catch(error => {
                    console.error('ログアウトエラー:', error);
                });
            };
            signupButton.style.display = 'none';


            
        } 
    });
    guestLoginButton.onclick = async () => {
        console.log("ゲストログインボタンがクリックされました");  // デバッグ用
        try {
            const user = await guestLogin();
            console.log('ゲストとしてログインしました:', user);
            location.reload();
        } catch (error) {
            console.error('ゲストログイン中にエラーが発生しました:', error);
        }
    };
   
};
