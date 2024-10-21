import { loginUser } from '../firebaseConfig.js';

// ログインボタンのクリックイベントを設定
document.getElementById('login-button').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const user = await loginUser(email, password);
        // ログイン成功時の処理
        window.location.href = '../index.html?login=success';

    } catch (error) {
        document.getElementById('error-message').innerText = error.message;
    }
});
