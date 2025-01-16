import { loginUser, auth, guestLogin } from '../firebaseConfig.js';

// ログインボタンのクリックイベントを設定
const loginButton = document.getElementById("loginButton");
auth.onAuthStateChanged(async(user) => {
    if (user){
      loginButton.onclick = () => {
        auth
          .signOut()
          .then(() => {
            console.log("ユーザーはログアウトしました。");
            location.reload();
          })
          .catch((error) => {
            console.error("ログアウトエラー:", error);
          });
      };
    }else{
        createModal();
    }
});


function createModal() {
    // モーダル全体のdivを作成
    const modal = document.createElement('div');
    modal.id = 'modal';
  
    // モーダルのコンテンツ部分を作成
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
  
    // ログインコンテナを作成
    const loginContainer = document.createElement('div');
    loginContainer.className = 'login-container';
  
    // タイトル（h1）を作成
    const title = document.createElement('h1');
    title.innerText = 'ログイン';
  
    // メールアドレス入力欄を作成
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.id = 'email';
    emailInput.placeholder = 'メールアドレス';
    emailInput.required = true;
  
    // パスワード入力欄を作成
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.id = 'password';
    passwordInput.placeholder = 'パスワード';
    passwordInput.required = true;
  
    // ログインボタンを作成
    const loginButton = document.createElement('button');
    loginButton.id = 'login-button';
    loginButton.className = 'auth-button';
    loginButton.innerText = 'ログイン';
  
    // ゲストログインボタンを作成
    // const guestLoginButton = document.createElement('button');
    // guestLoginButton.id = 'guestLoginButton';
    // guestLoginButton.innerText = 'ゲストログイン';
  
    // エラーメッセージ表示用のdivを作成
    const errorMessage = document.createElement('div');
    errorMessage.id = 'error-message';
    errorMessage.className = 'error-message';
  
    // 要素を組み立てる
    loginContainer.appendChild(title);
    loginContainer.appendChild(emailInput);
    loginContainer.appendChild(passwordInput);
    loginContainer.appendChild(loginButton);
    // loginContainer.appendChild(guestLoginButton);
    loginContainer.appendChild(errorMessage);
    modalContent.appendChild(loginContainer);
    modal.appendChild(modalContent);
  
    // モーダルをbodyに追加
    document.body.appendChild(modal);
    document.getElementById('login-button').addEventListener('click', async () => {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      try {
          const user = await loginUser(email, password);
          // ログイン成功時の処理
          window.location.href = 'index.html?login=success';
  
      } catch (error) {
          document.getElementById('error-message').innerText = error.message;
      }
  });
    guestLoginButton.onclick = async () => {
      console.log("ゲストログインボタンがクリックされました"); // デバッグ用
      try {
        const user = await guestLogin();
        console.log("ゲストとしてログインしました:", user);
        location.reload();
      } catch (error) {
        console.error("ゲストログイン中にエラーが発生しました:", error);
      }
    };
  }
  
  
  

