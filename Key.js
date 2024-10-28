
    // 指定したキーでできるようにイベントリスナーを追加する関数
    export function addKeyListenerForStart(elementId, callback, key) {
        window.addEventListener('keydown', function(e) {
            if (e.keyCode === key) {  // スペースキーのキーコードは32
                const element = document.getElementById(elementId);
                const displayStatus = window.getComputedStyle(element).display;

                // 指定された要素が表示されているときにコールバック関数を実行
                if (displayStatus !== 'none') {
                    callback();
                }
            }
        });
    }
  

// キーコード一覧
// 方向キー
// 左矢印: 37
// 上矢印: 38
// 右矢印: 39
// 下矢印: 40

// 制御キー
// Enter: 13
// Esc: 27
// Tab: 9
// Backspace: 8
// Delete: 46

// 数字キー
// 0: 48
// 1: 49
// 2: 50
// 3: 51
// 4: 52
// 5: 53
// 6: 54
// 7: 55
// 8: 56
// 9: 57

// アルファベットキー
// A: 65
// B: 66
// C: 67
// D: 68
// E: 69
// F: 70
// G: 71
// H: 72
// I: 73
// J: 74
// K: 75
// L: 76
// M: 77
// N: 78
// O: 79
// P: 80
// Q: 81
// R: 82
// S: 83
// T: 84
// U: 85
// V: 86
// W: 87
// X: 88
// Y: 89
// Z: 90

// ファンクションキー
// F1: 112
// F2: 113
// F3: 114
// F4: 115
// F5: 116
// F6: 117
// F7: 118
// F8: 119
// F9: 120
// F10: 121
// F11: 122
// F12: 123


