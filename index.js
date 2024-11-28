import { auth, toggleModalVisibility, guestLogin, NicknameSave,  nickname } from "./firebaseConfig.js"; // Firebase設定をインポート

const loginButton = document.getElementById("loginButton");
const signupButton = document.getElementById("signup-button");
const guestLoginButton = document.getElementById("guestLoginButton"); // ゲストログインボタンを取得

window.onload = function () {
  const params = new URLSearchParams(window.location.search);
  let nicknameValue ="";
  if (params.get("login") === "success") {
    // alert('ログイン成功');
  }
  auth.onAuthStateChanged(async(user) => {
    const accountName = document.getElementById("account-name");
    if(user){
      if (user.isAnonymous) {
        accountName.innerText = "ゲスト"; // ゲストユーザーの場合は「ゲスト」と表示
      } else {
        nicknameValue = await nickname(user.email);
        console.log(nicknameValue);
        accountName.innerText = nicknameValue.charAt(0);
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
  auth.onAuthStateChanged((user) => {
    if (user) {
      document.getElementById("modal").style.display = "none";

      // ログアウトボタンに変更
      loginButton.innerText = "ログアウト";
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
      signupButton.style.display = "none";
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


};
