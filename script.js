const bracket = document.getElementById('bracket');
const tournamentData = [
    ['', ''], ['', ''], ['', ''], ['', ''],
    ['', ''], ['', ''], ['', ''], ['', ''],
    ['', ''], ['', '']
];
let winners = [[]]; // 各ラウンドの勝者を保存する配列

// レベル0のプレイヤーをシャッフルする関数
function shufflePlayers() {
    // 現在のトーナメントデータから選手を取得しシャッフル
    const players = tournamentData.flat().filter(player => player); // 空欄を除外した選手リストを作成
    for (let i = players.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [players[i], players[j]] = [players[j], players[i]]; // フィッシャー–イェーツシャッフルで並び替え
    }

    // シャッフルした選手をトーナメントデータに再配置
    for (let i = 0; i < tournamentData.length; i++) {
        tournamentData[i][0] = players[i * 2] || ''; // 左側の選手
        tournamentData[i][1] = players[i * 2 + 1] || ''; // 右側の選手
    }

    renderBracket(); // トーナメントを再描画
}

// トーナメント表の表示を生成する関数
function renderBracket() {
    bracket.innerHTML = ''; // トーナメント表の内容をクリア

    const levels = 4; // トーナメントのラウンド数
    const matchesPerLevel = 2 ** (levels - 1); // 初期試合数（レベル0）

    for (let i = 0; i < levels; i++) {
        const levelDiv = document.createElement('div');
        levelDiv.className = 'tournament-level'; // 各ラウンド用のデザイン

        // レベル0にシャッフルボタンを追加
        if (i === 0) {
            const shuffleButton = document.createElement('button');
            shuffleButton.textContent = 'シャッフル';
            shuffleButton.onclick = shufflePlayers;
            shuffleButton.className = 'shuffle-button';
            levelDiv.appendChild(shuffleButton);
        }

        for (let j = 0; j < matchesPerLevel / 2 ** i; j++) {
            // 試合データを取得
            const matchup = (i === 0 ? tournamentData : winners[i - 1])[j] || ['', ''];
            const matchupDiv = document.createElement('div');
            matchupDiv.className = 'matchup';

            if (matchup[0] || matchup[1]) {
                // 試合に選手がいる場合のみ表示
                matchupDiv.innerHTML = `
                    <span>${matchup[0] || '未定'}</span>
                    <button onclick="selectWinner(${i}, ${j}, 0)">${matchup[0] || '選択'}</button>
                    <span>vs</span>
                    <span>${matchup[1] || '未定'}</span>
                    <button onclick="selectWinner(${i}, ${j}, 1)">${matchup[1] || '選択'}</button>
                `;
            } else {
                // 試合が未定の場合の表示
                matchupDiv.innerHTML = `
                    <span>未定</span>
                    <span>vs</span>
                    <span>未定</span>
                `;
            }

            levelDiv.appendChild(matchupDiv); // ラウンドに試合を追加
        }

        // ラウンド2以降の選手数の制限を設定（4人まで）
        if (i === 2) {
            winners[i] = winners[i] || [];
            winners[i] = winners[i].slice(0, 4); // 選手数を最大4人に制限
        }

        // 次のラウンドの空配列を準備
        if (i < levels - 1 && !winners[i]) {
            winners[i] = new Array(matchesPerLevel / 2 ** (i + 1)).fill(['', '']);
        }

        bracket.appendChild(levelDiv); // 全体にラウンドを追加
    }
}

// 勝者を選択する関数
function selectWinner(level, matchIndex, playerIndex) {
    console.log(level);
    console.log(matchIndex);
    console.log(playerIndex);
    // 選択されたプレイヤーを取得
    const selectedPlayer = (level === 0 ? tournamentData : winners[level - 1])[matchIndex][playerIndex];

    if (selectedPlayer) {
        // 次のラウンドのインデックスを計算
        const nextLevelIndex = Math.floor(matchIndex / 2);
        console.log(nextLevelIndex);

        // 次のラウンドのデータがまだ無い場合に準備
        if (!winners[level]) {
            const size = Math.ceil(tournamentData.length / 2 ** (level + 1));
            winners[level] = [];
            for (let i = 0; i < size; i++) {
                winners[level].push(['', '']);
            }
        }

        // 勝者を次のラウンドに追加
        winners[level][nextLevelIndex] = winners[level][nextLevelIndex] || ['', ''];

        // 適切なスロット（0または1）に勝者を割り当てる
        if (winners[level][nextLevelIndex][0] === '') {
            winners[level][nextLevelIndex][0] = selectedPlayer;
        } else if (winners[level][nextLevelIndex][1] === '') {
            winners[level][nextLevelIndex][1] = selectedPlayer;
        } else {
            console.error("Unexpected error: Both slots are already filled.");
        }
    }

    // デバッグ用: 勝者リストを表示
    console.log(winners);

    renderBracket(); // トーナメントを再描画
}


// フォーム送信イベントリスナー
document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const nameInput = document.getElementById('name').value;
    const greetingParagraph = document.getElementById('greeting');

    if (nameInput) {
        greetingParagraph.textContent = `こんにちは、${nameInput}さん！お問い合わせありがとうございます。`;

        let added = false; // 選手が登録されたかを記録
        for (let i = 0; i < tournamentData.length; i++) {
            if (tournamentData[i][0] === '') {
                tournamentData[i][0] = nameInput;
                added = true;
                break;
            } else if (tournamentData[i][1] === '') {
                tournamentData[i][1] = nameInput;
                added = true;
                break;
            }
        }

        if (!added) {
            alert('トーナメントが満員です！'); // 空きがない場合のエラーメッセージ
        }

        renderBracket();
    } else {
        greetingParagraph.textContent = `名前を入力してください。`; // 名前が空の場合のエラーメッセージ
    }
});
// レベル0のプレイヤーを全て埋める関数
function fillRoundZeroPlayers() {
    const defaultPlayers = Array.from({ length: tournamentData.length * 2 }, (_, i) => `p ${i + 1}`);
    for (let i = 0; i < tournamentData.length; i++) {
        tournamentData[i][0] = defaultPlayers[i * 2];
        tournamentData[i][1] = defaultPlayers[i * 2 + 1];
    }
    renderBracket(); // トーナメントを再描画
}

renderBracket(); // 初回描画