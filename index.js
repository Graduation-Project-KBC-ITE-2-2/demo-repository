import { auth } from "./firebaseConfig.js";  // Firebase設定をインポート

const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');



window.onload = function() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === 'success') {
        alert('ログイン成功');
    }

    auth.onAuthStateChanged(user => {
        const accountName = document.getElementById('account-name');

        if (user) {
            // ログインしている場合、アカウント名を表示
            accountName.innerText = user.email.charAt(0);
            accountName.style.display = 'flex';

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
        } else {
            // ログインしていない場合
            accountName.style.display = 'none';
            loginButton.innerText = 'ログイン';
            loginButton.onclick = () => {
                location.href = 'login&logout/login .html';
            };
            signupButton.style.display = 'block';
            signupButton.onclick = () => {
                location.href = 'signup.html';
            };
        }
    });
};
