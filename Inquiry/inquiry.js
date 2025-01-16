import {initializeContactFormHandler} from "../firebaseConfig.js"

// フォーム送信ハンドラを初期化
const formElement = document.getElementById("contactForm");
const statusMessageElement = document.getElementById("statusMessage");

initializeContactFormHandler(formElement, statusMessageElement);