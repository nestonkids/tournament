const bracket = document.getElementById('bracket');
const tournamentData = [
    ['', ''], ['', ''], ['', ''], ['', ''],
    ['', ''], ['', ''], ['', ''], ['', ''],
    ['', ''], ['', '']
];
let winners = [[]]; // 各ラウンドの勝者を保存する配列

// レベル0のプレイヤーをシャッフルする関数
function shufflePlayers() {
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

    // ラウンド名
    const roundNames = ['1回戦', '2回戦', '準決勝', '決勝'];

    for (let i = 0; i < levels; i++) {
        const levelDiv = document.createElement('div');
        levelDiv.className = 'tournament-level'; // 各ラウンド用のデザイン

        // ラウンド名を表示
        const roundTitle = document.createElement('h3');
        roundTitle.textContent = roundNames[i];
        levelDiv.appendChild(roundTitle);

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

        if (i < levels - 1 && !winners[i]) {
            winners[i] = []; // 空の配列を初期化

            for (let j = 0; j < matchesPerLevel / 2 ** (i + 1); j++) {
                winners[i].push(['', '']); // 独立した空の配列 ['',''] を追加
            }
        }

        bracket.appendChild(levelDiv); // 全体にラウンドを追加
    }

    console.log(winners);
}

// 勝者を選択する関数
function selectWinner(level, matchIndex, playerIndex) {
    // 選択されたプレイヤーを取得
    const selectedPlayer = (level === 0 ? tournamentData : winners[level - 1])[matchIndex][playerIndex];

    if (selectedPlayer) {
        const nextLevelIndex = Math.floor(matchIndex / 2);

        if (!winners[level]) {
            const size = Math.ceil(tournamentData.length / 2 ** (level + 1));
            winners[level] = [];
            for (let i = 0; i < size; i++) {
                winners[level].push(['', '']);
            }
        }

        // 勝者を次のラウンドに追加
        winners[level][nextLevelIndex] = winners[level][nextLevelIndex] || ['', ''];

        if (winners[level][nextLevelIndex][0] === '') {
            winners[level][nextLevelIndex][0] = selectedPlayer;
        } else if (winners[level][nextLevelIndex][1] === '') {
            winners[level][nextLevelIndex][1] = selectedPlayer;
        }

        // 優勝者が決定した場合
        if (level === winners.length - 1 && nextLevelIndex === 0) {
            const winnerDisplay = document.getElementById('winnerDisplay');
            winnerDisplay.textContent = `優勝者: ${selectedPlayer}`;
        }
    }

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
