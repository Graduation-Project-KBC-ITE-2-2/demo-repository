// firebaseConfig.js



import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, onSnapshot  } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
//import {totle} from "/Mypage/mypage.js";

// Firebaseの設定情報
const firebaseConfig = {
    apiKey: "AIzaSyBiHjBk7rMiz4Fw7IoLPpFo1FTrQxqy_58",
    authDomain: "acau-3ebcf.firebaseapp.com",
    projectId: "acau-3ebcf",
    storageBucket: "acau-3ebcf.appspot.com",
    messagingSenderId: "407904196633"
};

// Firebaseアプリの初期化
const app = initializeApp(firebaseConfig);

// Firebaseサービスの初期化
const auth = getAuth(app);
const db = getFirestore(app);

export {auth,db};

// ログインしているユーザー情報を取得する関数
export const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                resolve(user);  // ログインしているユーザー情報を返す
            } else {
                reject('ユーザーがログインしていません');
            }
        });
    });
};

// ログイン中のユーザーのEメールを取得する関数
export const getUserEmail = async () => {
    try {
        const user = await getCurrentUser(); // 現在のユーザー情報を取得
        if (user) {
            // ユーザーがログインしている場合
            if (user.isAnonymous) {
                return user.uid;  // 匿名ユーザーの場合はユーザーIDを返す
            } else {
                return user.email;  // ログイン中のユーザーのEメールを返す
            }
        } else {
            console.error('ユーザーがログインしていません');
            return null;  // ユーザーがログインしていない場合、nullを返す
        }
    } catch (error) {
        console.error('エラーが発生しました: ', error);
        return null;  // エラーが発生した場合もnullを返す
    }
};

// Firestoreからユーザーデータを取得する関数
export const getDatasFromFirestore = async (data) => {
    try {
        const querySnapshot = await getDocs(collection(db, data));
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, data: doc.data() });
        });
        return users;  // Firestoreから取得したユーザーデータを返す
    } catch (error) {
        console.error("Firestoreからデータの取得に失敗しました", error);
        throw error;
    }
};

export const loginUser = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('ログイン成功:', user);
            return user;  // 成功した場合、ユーザー情報を返す
        })
        .catch((error) => {
            const errorMessage = error.message;
            console.error('ログインエラー:', error);
            throw new Error(errorMessage);  // エラーメッセージを返す
        });
};


/**
 * スコアとEメールを指定したコレクションに保存または更新する関数
 * 同じEメールが存在する場合、スコアを比較して保存するか決定する
 * @param {string} collectionName - 保存先のコレクション名
 * @param {number} score - 保存するスコア
 * @param {string} email - 保存するEメール
 * @returns {Promise<void>} - 保存が成功した場合は何も返さない
 */
export async function saveScoreAndEmail(collectionName, score, email) {
    try {
        // 既存のEメールを持つドキュメントを取得
        const q = query(collection(db, collectionName), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        //現在のニックネームを取得
        const Younickname = await nickname(email)

        if (!querySnapshot.empty) {
            // Eメールが既に存在する場合
            let existingDocId = "";
            let existingnic = "";
            let existingScore = 0;
            querySnapshot.forEach((doc) => {
                existingDocId = doc.id; // ドキュメントIDを取得
                existingnic = doc.data().nickname;//保存されたニックネームを取得
                existingScore = doc.data().score; // 既存のスコアを取得
            });
            console.log(existingnic);

            // 新しいスコアが既存のスコアよりも大きい場合に更新
            if (score > existingScore) {
                await updateDoc(doc(db, collectionName, existingDocId), {
                    nickname: Younickname,
                    score: score // スコアを更新
                });
                console.log("既存のスコアが更新されました");
            }else if( Younickname !== existingnic){
                await updateDoc(doc(db, collectionName, existingDocId), {
                    nickname: Younickname //ニックネームを更新
                });
            } else {
                console.log("既存のスコアの方が大きいため、保存しませんでした");
            }
        } else {
            // Eメールが存在しない場合、新しいスコアを保存
            await addDoc(collection(db, collectionName), {
                score: score,
                email: email,
                nickname: Younickname,
                timestamp: new Date() // 保存時刻を追加する場合
            });
            console.log("新しいスコアが保存されました");
        }
    } catch (e) {
        console.error("エラーが発生しました: ", e);
    }
}

//ニックネームを保存する
export async function NicknameSave(email, nickname) {
    const trimmedNickname = nickname.trim(); // ニックネームの前後の空白を除去

    // 空白のみのニックネーム、または空白を含むニックネームを無効にする
    if (trimmedNickname === "" || /\s/.test(trimmedNickname)) {
        alert("ニックネームに空白を含むことはできません。再度入力してください。");
        return; // 処理を中断
    }

    const q = query(collection(db, "user_name"), where("nickname", "==", trimmedNickname));
    const querySnapshot = await getDocs(q);
    const u = query(collection(db, "user_name"), where("email", "==", email));
    const userSnapshot = await getDocs(u);

    try {
        if (!querySnapshot.empty) {
            console.log("既に存在します");
            alert("既に存在します。再度違う名前を入力してください");
        } else {
            if (!userSnapshot.empty) {
                // Eメールが既に存在する場合
                let existingDocId = "";
                let existingnickname = "";
                userSnapshot.forEach((doc) => {
                    existingDocId = doc.id; // ドキュメントIDを取得
                    existingnickname = doc.data().nickname; // 既存のニックネームを取得
                });
                await updateDoc(doc(db, "user_name", existingDocId), {
                    nickname: trimmedNickname // 空白除去後のニックネームを保存
                });
                location.reload();
                alert("Updated完了");
            } else {
                await addDoc(collection(db, "user_name"), {
                    email: email,
                    nickname: trimmedNickname // 空白除去後のニックネームを保存
                });
                location.reload();
                alert("ニックネームを登録しました");
            }
        }
    } catch (e) {
        console.log(e);
    }
}


export async function nickname(email) {
    const n = query(
      collection(db, "user_name"), // user_name コレクションへの参照
      where("email", "==", email)  // where 条件を正しく記述
    );
  
    try {
      const snapshot = await getDocs(n); // 非同期でドキュメントを取得
  
      if (!snapshot.empty) {
        let nickname = "";
        snapshot.forEach((doc) => {
          nickname = doc.data().nickname; // ニックネームを取得
        });
        console.log("取得したニックネーム:", nickname);
        return nickname;
      } else {
        console.log("ニックネームが見つかりません");
        return "NoNickname";
      }
    } catch (e) {
      console.error(e); // エラーをコンソールに出力
      return "Error";
    }
  }

// スコアボードにランキングを表示する関数（リアルタイム更新対応）
export const displayDataInHTMLRealtime = (collectionName) => {
    try {
        const scoreListElement = document.getElementById('scorelist'); // データを挿入するHTML要素を取得

        // Firestoreのコレクションを監視し、リアルタイム更新
        const collectionRef = collection(db, collectionName);
        onSnapshot(collectionRef, (snapshot) => {
            const scores = [];

            // スナップショットからデータを取得し、スコアを大きい順に並べ替え
            snapshot.forEach(doc => {
                scores.push({ id: doc.id, data: doc.data() });
            });

            // scoreListElementを初期化
            scoreListElement.innerHTML = '';

            // スコアを降順に並べ替え
            scores.sort((a, b) => b.data.score - a.data.score);

            // 上位10人だけを抽出
            const topScores = scores.slice(0, 10);  // 最初の10人を取得

            let rank = 1;
            // 取得したデータを一行ずつHTMLに表示
            topScores.forEach(score => {
                let accountName = score.data.nickname.slice(0, 10);  // Eメールの先頭10文字を表示
                if(accountName == "NoNickname"){
                    accountName = score.data.email.slice(0, 10);
                }
                const scoreElement = document.createElement('p'); // 各データを表示するための <p> 要素を作成
                scoreElement.textContent = `${rank} ,ID: ${accountName}, スコア: ${score.data.score}`; // 各データを設定
                scoreListElement.appendChild(scoreElement); // <p> 要素を追加
                rank++;
            });
        });
    } catch (error) {
        console.error('データの表示中にエラーが発生しました:', error);
    }
};

const firebasecollections = ['Asteroid', 'Blocks', 'MineSweeper','Cave','MissileCommand','Qix','Invader','Memorizer','SnakeBite','Tetris'];

//特定のユーザーのスコアを取得
export async function getUserScoreByEmail(email, collectionName) {
    try {
      const collectionRef = collection(db, collectionName); // コレクションを参照
      const q = query(collectionRef, where('email', '==', email)); // クエリ作成
      const querySnapshot = await getDocs(q); // クエリを実行
  
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]; // 最初のドキュメントを取得
        const data = doc.data(); // ドキュメントデータを取得
        return data.score || null; // スコアが存在する場合は返す、なければ null
      } else {
        return null; // 該当するデータがない場合
      }
    } catch (error) {
      console.error('データ取得中にエラーが発生しました:', error);
      throw error;
    }
  }

  // 特定のユーザーのスコアを複数のコレクションから取得
export async function getUserScoresByEmail(email, collectionNames) {
    const scores = {}; // 各コレクションのスコアを格納するオブジェクト
  
    try {
      for (const collectionName of collectionNames) {
        const collectionRef = collection(db, collectionName); // コレクションを参照
        const q = query(collectionRef, where('email', '==', email)); // クエリ作成
        const querySnapshot = await getDocs(q); // クエリを実行
  
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0]; // 最初のドキュメントを取得
          const data = doc.data(); // ドキュメントデータを取得
          scores[collectionName] = data.score || null; // スコアをコレクション名をキーにして格納
        } else {
          scores[collectionName] = null; // 該当データがない場合は null を格納
        }
      }
  
      return scores; // すべてのスコアを返す
    } catch (error) {
      console.error('データ取得中にエラーが発生しました:', error);
      throw error;
    }
  }

  export async function getUsertotleScoresByEmail(email) {
    try {
        // `getUserScoresByEmail` を実行してスコアデータを取得
        const data = await getUserScoresByEmail(email, firebasecollections);

        let totle = 0; // 合計スコア
        // Firestoreから該当するユーザーのデータを取得
        const q = query(collection(db, "user_name"), where("email", "==", email));
        const querySnapshot = await getDocs(q);

        for (const col of firebasecollections) {
            if (data[col] != null) {
                totle += data[col]; // スコアを合計
            }
        }

        if (!querySnapshot.empty) {
            // Eメールが既に存在する場合
            let existingDocId = "";
            let existotleScore = 0;
            querySnapshot.forEach((doc) => {
                existingDocId = doc.id; // ドキュメントIDを取得
                existotleScore = doc.data().totleScore; // 既存のスコアを取得
            });
            console.log(existotleScore);

            // 新しいスコアが既存のスコアよりも大きい場合に更新
            if (existotleScore !== totle) {
                await updateDoc(doc(db, "user_name", existingDocId), {
                    totleScore: totle // スコアを更新
                });
                console.log("トータルスコアが更新されました");
            }else {
                console.log("変化ありませんでした");
            }
        } else {
            // Eメールが存在しない場合、新しいスコアを保存
            await addDoc(collection(db, "user_name"), {
                email: email,
                nickname: "NoNickname",
                totleScore: totle,
                timestamp: new Date() // 保存時刻を追加する場合
            });
            console.log("新しいスコアが保存されました");
        }

        console.log(`合計スコア: ${totle}`);
        return totle; // 必要に応じて関数の呼び出し元に返す
    } catch (error) {
        console.error("エラーが発生しました:", error);
    }
}


export function toggleModalVisibility(noneId) {
    const noneIdElement = document.getElementById(noneId);  // 渡されたIDで要素を取得

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // ユーザーがログインしている場合、非表示
            noneIdElement.style.display = 'none';
        } else {
            // ユーザーがログインしていない場合、表示
            noneIdElement.style.display = 'block';
        }
    });
}



export const guestLogin = async () => {
    const auth = getAuth();
    try {
        const userCredential = await signInAnonymously(auth);
        const user = userCredential.user;
        console.log("ゲストユーザーとしてログイン成功:", user);
        return user;
    } catch (error) {
        console.error("ゲストログイン中にエラーが発生しました:", error);
        throw error;
    }
};