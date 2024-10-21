// firebaseConfig.js



import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, onSnapshot  } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

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
        return user.email;  // ログイン中のユーザーのEメールを返す
    } catch (error) {
        console.error('ユーザーがログインしていません: ', error);
        return null;  // ユーザーがログインしていない場合、nullを返す
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

        if (!querySnapshot.empty) {
            // Eメールが既に存在する場合
            let existingDocId = "";
            let existingScore = 0;
            querySnapshot.forEach((doc) => {
                existingDocId = doc.id; // ドキュメントIDを取得
                existingScore = doc.data().score; // 既存のスコアを取得
            });

            // 新しいスコアが既存のスコアよりも大きい場合に更新
            if (score > existingScore) {
                await updateDoc(doc(db, collectionName, existingDocId), {
                    score: score // スコアを更新
                });
                console.log("既存のスコアが更新されました");
            } else {
                console.log("既存のスコアの方が大きいため、保存しませんでした");
            }
        } else {
            // Eメールが存在しない場合、新しいスコアを保存
            await addDoc(collection(db, collectionName), {
                score: score,
                email: email,
                timestamp: new Date() // 保存時刻を追加する場合
            });
            console.log("新しいスコアが保存されました");
        }
    } catch (e) {
        console.error("エラーが発生しました: ", e);
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
            let rank = 1;
            // 取得したデータを一行ずつHTMLに表示
            scores.forEach(score => {
                const accountName = score.data.email.slice(0, 10);
                const scoreElement = document.createElement('p'); // 各データを表示するための <p> 要素を作成
                scoreElement.textContent = `${rank} ,ID: ${accountName}, スコア: ${score.data.score}`; // 各データを設定
                scoreListElement.appendChild(scoreElement); //  <p> 要素を追加
                rank++;
            });
        });
    } catch (error) {
        console.error('データの表示中にエラーが発生しました:', error);
    }
};





