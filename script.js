document.addEventListener('DOMContentLoaded', () => {
    const gameOutput = document.getElementById('game-output');
    const timeProgressBar = document.getElementById('time-progress-bar');
    const clock = document.getElementById('clock');
    const cityDetails = document.getElementById('city-details');
    let year = 2025;
    let population = 0;
    let funds = 1000;
    let houses = 0;
    let factories = 0;
    let roads = 0;
    let happiness = 50;
    let environment = 70;
    let education = 60;
    let taxRate = 0.1; // 10%
    let gameInterval;

    // ゲーム内時間を管理する変数を追加
    let gameHour = 0;
    let gameDay = 1;
    let gameMonth = 1;

    function updateCityDetails() {
        // ゲーム内の時刻を取得
        const formattedHour = gameHour.toString().padStart(2, '0');
        const formattedDay = gameDay.toString().padStart(2, '0');
        const formattedMonth = gameMonth.toString().padStart(2, '0');
        const timeString = `${formattedMonth}/${formattedDay} ${formattedHour}:00`;
        
        const logEntry = document.createElement('p');
        logEntry.className = 'event-info new-event';
        logEntry.innerHTML = `
            <span class="event-time"><i class="far fa-clock"></i> ${timeString}</span>
            <span class="event-title">
                <span class="event-icon"><i class="fas fa-info-circle"></i></span>
                ${year}年の都市状況
            </span>
            <span class="event-message">人口: <strong>${population}人</strong> | 資金: <strong>¥${funds.toLocaleString()}</strong></span>
        `;
        gameOutput.insertBefore(logEntry, gameOutput.firstChild);
        
        // アニメーションクラスを一定時間後に削除
        setTimeout(() => {
            logEntry.classList.remove('new-event');
        }, 500);

        document.querySelector('.year-value').textContent = `${year}年`;
        document.querySelector('.population-value').textContent = `${population}人`;
        document.querySelector('.funds-value').textContent = `¥${funds.toLocaleString()}`;
        
        // 住宅、工場、道路の数を更新（全てのインスタンスを一括更新）
        document.querySelectorAll('.houses-value').forEach(el => el.textContent = houses);
        document.querySelectorAll('.factories-value').forEach(el => el.textContent = factories);
        document.querySelectorAll('.roads-value').forEach(el => el.textContent = roads);
        
        document.querySelector('.happiness-value').textContent = `${happiness}%`;
        document.querySelector('.environment-value').textContent = `${environment}%`;
        document.querySelector('.education-value').textContent = `${education}%`;
        document.querySelector('.tax-value').textContent = `${(taxRate * 100).toFixed(2)}%`;
        
        // プログレスバーの幅を更新
        document.getElementById('happiness-bar').style.width = `${happiness}%`;
        document.getElementById('environment-bar').style.width = `${environment}%`;
        document.getElementById('education-bar').style.width = `${education}%`;
    }

    function buildHouse() {
        // ゲーム内の時刻を取得
        const formattedHour = gameHour.toString().padStart(2, '0');
        const formattedDay = gameDay.toString().padStart(2, '0');
        const formattedMonth = gameMonth.toString().padStart(2, '0');
        const timeString = `${formattedMonth}/${formattedDay} ${formattedHour}:00`;
        
        if (funds >= 100) {
            houses++;
            funds -= 100;
            
            const logEntry = document.createElement('p');
            logEntry.className = 'event-success new-event';
            logEntry.innerHTML = `
                <span class="event-time"><i class="far fa-clock"></i> ${timeString}</span>
                <span class="event-title">
                    <span class="event-icon"><i class="fas fa-home"></i></span>
                    住宅建設完了
                </span>
                <span class="event-message">新しい住宅が建設されました。<br>残りの資金: <strong>¥${funds.toLocaleString()}</strong></span>
            `;
            gameOutput.insertBefore(logEntry, gameOutput.firstChild);
            
            // 固定エリアにも追加
            const fixedEventsContainer = document.getElementById('fixed-events');
            const fixedEventItem = document.createElement('div');
            fixedEventItem.className = 'event-item event-success';
            fixedEventItem.innerHTML = `
                <div class="event-icon"><i class="fas fa-home"></i></div>
                <div class="event-content">
                    <div class="event-title">住宅建設完了</div>
                    <div class="event-message">住宅数: ${houses}</div>
                </div>
                <div class="event-time">${timeString}</div>
            `;
            fixedEventsContainer.appendChild(fixedEventItem);
            
            // 一定数を超えたら古いイベントを削除
            while (fixedEventsContainer.children.length > 3) {
                fixedEventsContainer.removeChild(fixedEventsContainer.firstChild);
            }
            
            setTimeout(() => {
                logEntry.classList.remove('new-event');
            }, 500);
        } else {
            const logEntry = document.createElement('p');
            logEntry.className = 'event-danger new-event';
            logEntry.innerHTML = `
                <span class="event-time"><i class="far fa-clock"></i> ${timeString}</span>
                <span class="event-title">
                    <span class="event-icon"><i class="fas fa-exclamation-circle"></i></span>
                    建設失敗
                </span>
                <span class="event-message">資金が足りません。<br>必要金額: <strong>¥100</strong> | 現在の資金: <strong>¥${funds.toLocaleString()}</strong></span>
            `;
            gameOutput.insertBefore(logEntry, gameOutput.firstChild);
            
            // 固定エリアにも追加
            const fixedEventsContainer = document.getElementById('fixed-events');
            const fixedEventItem = document.createElement('div');
            fixedEventItem.className = 'event-item event-danger';
            fixedEventItem.innerHTML = `
                <div class="event-icon"><i class="fas fa-exclamation-circle"></i></div>
                <div class="event-content">
                    <div class="event-title">建設失敗</div>
                    <div class="event-message">資金不足: ¥${funds.toLocaleString()}/¥100</div>
                </div>
                <div class="event-time">${timeString}</div>
            `;
            fixedEventsContainer.appendChild(fixedEventItem);
            
            // 一定数を超えたら古いイベントを削除
            while (fixedEventsContainer.children.length > 3) {
                fixedEventsContainer.removeChild(fixedEventsContainer.firstChild);
            }
            
            setTimeout(() => {
                logEntry.classList.remove('new-event');
            }, 500);
        }
        updateCityDetails();
    }

    function buildFactory() {
        // ゲーム内の時刻を取得
        const formattedHour = gameHour.toString().padStart(2, '0');
        const formattedDay = gameDay.toString().padStart(2, '0');
        const formattedMonth = gameMonth.toString().padStart(2, '0');
        const timeString = `${formattedMonth}/${formattedDay} ${formattedHour}:00`;
        
        if (funds >= 200) {
            factories++;
            funds -= 200;
            
            const logEntry = document.createElement('p');
            logEntry.className = 'event-success new-event';
            logEntry.innerHTML = `
                <span class="event-time"><i class="far fa-clock"></i> ${timeString}</span>
                <span class="event-title">
                    <span class="event-icon"><i class="fas fa-industry"></i></span>
                    工場建設完了
                </span>
                <span class="event-message">新しい工場が建設されました。<br>残りの資金: <strong>¥${funds.toLocaleString()}</strong></span>
            `;
            gameOutput.insertBefore(logEntry, gameOutput.firstChild);
            
            // 固定エリアにも追加
            const fixedEventsContainer = document.getElementById('fixed-events');
            const fixedEventItem = document.createElement('div');
            fixedEventItem.className = 'event-item event-success';
            fixedEventItem.innerHTML = `
                <div class="event-icon"><i class="fas fa-industry"></i></div>
                <div class="event-content">
                    <div class="event-title">工場建設完了</div>
                    <div class="event-message">工場数: ${factories}</div>
                </div>
                <div class="event-time">${timeString}</div>
            `;
            fixedEventsContainer.appendChild(fixedEventItem);
            
            // 一定数を超えたら古いイベントを削除
            while (fixedEventsContainer.children.length > 3) {
                fixedEventsContainer.removeChild(fixedEventsContainer.firstChild);
            }
            
            setTimeout(() => {
                logEntry.classList.remove('new-event');
            }, 500);
        } else {
            const logEntry = document.createElement('p');
            logEntry.className = 'event-danger new-event';
            logEntry.innerHTML = `
                <span class="event-time"><i class="far fa-clock"></i> ${timeString}</span>
                <span class="event-title">
                    <span class="event-icon"><i class="fas fa-exclamation-circle"></i></span>
                    建設失敗
                </span>
                <span class="event-message">資金が足りません。<br>必要金額: <strong>¥200</strong> | 現在の資金: <strong>¥${funds.toLocaleString()}</strong></span>
            `;
            gameOutput.insertBefore(logEntry, gameOutput.firstChild);
            
            // 固定エリアにも追加
            const fixedEventsContainer = document.getElementById('fixed-events');
            const fixedEventItem = document.createElement('div');
            fixedEventItem.className = 'event-item event-danger';
            fixedEventItem.innerHTML = `
                <div class="event-icon"><i class="fas fa-exclamation-circle"></i></div>
                <div class="event-content">
                    <div class="event-title">建設失敗</div>
                    <div class="event-message">資金不足: ¥${funds.toLocaleString()}/¥200</div>
                </div>
                <div class="event-time">${timeString}</div>
            `;
            fixedEventsContainer.appendChild(fixedEventItem);
            
            // 一定数を超えたら古いイベントを削除
            while (fixedEventsContainer.children.length > 3) {
                fixedEventsContainer.removeChild(fixedEventsContainer.firstChild);
            }
            
            setTimeout(() => {
                logEntry.classList.remove('new-event');
            }, 500);
        }
        updateCityDetails();
    }

    function buildRoad() {
        // ゲーム内の時刻を取得
        const formattedHour = gameHour.toString().padStart(2, '0');
        const formattedDay = gameDay.toString().padStart(2, '0');
        const formattedMonth = gameMonth.toString().padStart(2, '0');
        const timeString = `${formattedMonth}/${formattedDay} ${formattedHour}:00`;
        
        if (funds >= 50) {
            roads++;
            funds -= 50;
            
            const logEntry = document.createElement('p');
            logEntry.className = 'event-success new-event';
            logEntry.innerHTML = `
                <span class="event-time"><i class="far fa-clock"></i> ${timeString}</span>
                <span class="event-title">
                    <span class="event-icon"><i class="fas fa-road"></i></span>
                    道路建設完了
                </span>
                <span class="event-message">新しい道路が建設されました。<br>残りの資金: <strong>¥${funds.toLocaleString()}</strong></span>
            `;
            gameOutput.insertBefore(logEntry, gameOutput.firstChild);
            
            // 固定エリアにも追加
            const fixedEventsContainer = document.getElementById('fixed-events');
            const fixedEventItem = document.createElement('div');
            fixedEventItem.className = 'event-item event-success';
            fixedEventItem.innerHTML = `
                <div class="event-icon"><i class="fas fa-road"></i></div>
                <div class="event-content">
                    <div class="event-title">道路建設完了</div>
                    <div class="event-message">道路数: ${roads}</div>
                </div>
                <div class="event-time">${timeString}</div>
            `;
            fixedEventsContainer.appendChild(fixedEventItem);
            
            // 一定数を超えたら古いイベントを削除
            while (fixedEventsContainer.children.length > 3) {
                fixedEventsContainer.removeChild(fixedEventsContainer.firstChild);
            }
            
            setTimeout(() => {
                logEntry.classList.remove('new-event');
            }, 500);
        } else {
            const logEntry = document.createElement('p');
            logEntry.className = 'event-danger new-event';
            logEntry.innerHTML = `
                <span class="event-time"><i class="far fa-clock"></i> ${timeString}</span>
                <span class="event-title">
                    <span class="event-icon"><i class="fas fa-exclamation-circle"></i></span>
                    建設失敗
                </span>
                <span class="event-message">資金が足りません。<br>必要金額: <strong>¥50</strong> | 現在の資金: <strong>¥${funds.toLocaleString()}</strong></span>
            `;
            gameOutput.insertBefore(logEntry, gameOutput.firstChild);
            
            // 固定エリアにも追加
            const fixedEventsContainer = document.getElementById('fixed-events');
            const fixedEventItem = document.createElement('div');
            fixedEventItem.className = 'event-item event-danger';
            fixedEventItem.innerHTML = `
                <div class="event-icon"><i class="fas fa-exclamation-circle"></i></div>
                <div class="event-content">
                    <div class="event-title">建設失敗</div>
                    <div class="event-message">資金不足: ¥${funds.toLocaleString()}/¥50</div>
                </div>
                <div class="event-time">${timeString}</div>
            `;
            fixedEventsContainer.appendChild(fixedEventItem);
            
            // 一定数を超えたら古いイベントを削除
            while (fixedEventsContainer.children.length > 3) {
                fixedEventsContainer.removeChild(fixedEventsContainer.firstChild);
            }
            
            setTimeout(() => {
                logEntry.classList.remove('new-event');
            }, 500);
        }
        updateCityDetails();
    }

    function nextYear() {
        year++;
        funds += Math.floor(population * 10 * taxRate);
        
        // ゲーム内の時刻を取得
        const formattedHour = gameHour.toString().padStart(2, '0');
        const formattedDay = gameDay.toString().padStart(2, '0');
        const formattedMonth = gameMonth.toString().padStart(2, '0');
        const timeString = `${formattedMonth}/${formattedDay} ${formattedHour}:00`;
        
        const logEntry = document.createElement('p');
        logEntry.className = 'event-info new-event';
        logEntry.innerHTML = `
            <span class="event-time"><i class="far fa-clock"></i> ${timeString}</span>
            <span class="event-title">
                <span class="event-icon"><i class="fas fa-calendar-alt"></i></span>
                ${year}年の新年を迎えました
            </span>
            <span class="event-message">税収により <strong>¥${Math.floor(population * 10 * taxRate).toLocaleString()}</strong> の資金が増加しました。</span>
        `;
        gameOutput.insertBefore(logEntry, gameOutput.firstChild);
        
        // 固定エリアにも追加
        const fixedEventsContainer = document.getElementById('fixed-events');
        const fixedEventItem = document.createElement('div');
        fixedEventItem.className = 'event-item event-info';
        fixedEventItem.innerHTML = `
            <div class="event-icon"><i class="fas fa-calendar-alt"></i></div>
            <div class="event-content">
                <div class="event-title">${year}年</div>
                <div class="event-message">新年を迎えました</div>
            </div>
            <div class="event-time">${timeString}</div>
        `;
        fixedEventsContainer.appendChild(fixedEventItem);
        
        // 一定数を超えたら古いイベントを削除
        while (fixedEventsContainer.children.length > 3) {
            fixedEventsContainer.removeChild(fixedEventsContainer.firstChild);
        }
        
        setTimeout(() => {
            logEntry.classList.remove('new-event');
        }, 500);
        
        updateCityDetails();
    }

    function handleInput(input) {
        switch (input.trim()) {
            case '1':
                buildHouse();
                break;
            case '2':
                buildFactory();
                break;
            case '3':
                buildRoad();
                break;
            case '4':
                nextYear();
                break;
            case '5':
                setTaxRate();
                break;
            case '6':
                viewCityDetails();
                break;
            case '7':
                gameOutput.textContent += '\nExiting game.';
                clearInterval(gameInterval);
                break;
            default:
                // ゲーム内の時刻を取得
                const formattedHour = gameHour.toString().padStart(2, '0');
                const formattedDay = gameDay.toString().padStart(2, '0');
                const formattedMonth = gameMonth.toString().padStart(2, '0');
                const timeString = `${formattedMonth}/${formattedDay} ${formattedHour}:00`;
                
                const logEntry = document.createElement('p');
                logEntry.className = 'event-system new-event';
                logEntry.innerHTML = `
                    <span class="event-time"><i class="far fa-clock"></i> ${timeString}</span>
                    <span class="event-title">
                        <span class="event-icon"><i class="fas fa-terminal"></i></span>
                        システムメッセージ
                    </span>
                    <span class="event-message">有効なオプションを選択してください：<br>
                    1. 住宅建設<br>
                    2. 工場建設<br>
                    3. 道路建設<br>
                    4. 次の年へ<br>
                    5. 税率設定<br>
                    6. 都市詳細<br>
                    7. 終了</span>
                `;
                gameOutput.insertBefore(logEntry, gameOutput.firstChild);
                
                setTimeout(() => {
                    logEntry.classList.remove('new-event');
                }, 500);
        }
    }

    function setTaxRate() {
        const newTaxRate = prompt('新しい税率を入力してください（パーセント）:');
        if (newTaxRate !== null) {
            taxRate = parseFloat(newTaxRate) / 100;
            
            // ゲーム内の時刻を取得
            const formattedHour = gameHour.toString().padStart(2, '0');
            const formattedDay = gameDay.toString().padStart(2, '0');
            const formattedMonth = gameMonth.toString().padStart(2, '0');
            const timeString = `${formattedMonth}/${formattedDay} ${formattedHour}:00`;
            
            const logEntry = document.createElement('p');
            logEntry.className = 'event-info new-event';
            logEntry.innerHTML = `
                <span class="event-time"><i class="far fa-clock"></i> ${timeString}</span>
                <span class="event-title">
                    <span class="event-icon"><i class="fas fa-percentage"></i></span>
                    税率変更
                </span>
                <span class="event-message">税率が <strong>${newTaxRate}%</strong> に設定されました。</span>
            `;
            gameOutput.insertBefore(logEntry, gameOutput.firstChild);
            
            // 固定エリアにも追加
            const fixedEventsContainer = document.getElementById('fixed-events');
            const fixedEventItem = document.createElement('div');
            fixedEventItem.className = 'event-item event-info';
            fixedEventItem.innerHTML = `
                <div class="event-icon"><i class="fas fa-percentage"></i></div>
                <div class="event-content">
                    <div class="event-title">税率変更</div>
                    <div class="event-message">新税率: ${newTaxRate}%</div>
                </div>
                <div class="event-time">${timeString}</div>
            `;
            fixedEventsContainer.appendChild(fixedEventItem);
            
            // 一定数を超えたら古いイベントを削除
            while (fixedEventsContainer.children.length > 3) {
                fixedEventsContainer.removeChild(fixedEventsContainer.firstChild);
            }
            
            setTimeout(() => {
                logEntry.classList.remove('new-event');
            }, 500);
            
            updateCityDetails();
        }
    }

    function viewCityDetails() {
        // ゲーム内の時刻を取得
        const formattedHour = gameHour.toString().padStart(2, '0');
        const formattedDay = gameDay.toString().padStart(2, '0');
        const formattedMonth = gameMonth.toString().padStart(2, '0');
        const timeString = `${formattedMonth}/${formattedDay} ${formattedHour}:00`;
        
        const logEntry = document.createElement('p');
        logEntry.className = 'event-system new-event';
        logEntry.innerHTML = `
            <span class="event-time"><i class="far fa-clock"></i> ${timeString}</span>
            <span class="event-title">
                <span class="event-icon"><i class="fas fa-clipboard-list"></i></span>
                都市の詳細情報
            </span>
            <span class="event-message">
                <strong>年:</strong> ${year}年<br>
                <strong>人口:</strong> ${population}人<br>
                <strong>資金:</strong> ¥${funds.toLocaleString()}<br>
                <strong>住宅数:</strong> ${houses}<br>
                <strong>工場数:</strong> ${factories}<br>
                <strong>道路数:</strong> ${roads}<br>
                <strong>幸福度:</strong> ${happiness}%<br>
                <strong>環境:</strong> ${environment}%<br>
                <strong>教育:</strong> ${education}%<br>
                <strong>税率:</strong> ${(taxRate * 100).toFixed(2)}%
            </span>
        `;
        gameOutput.insertBefore(logEntry, gameOutput.firstChild);
        
        // 固定エリアにも追加
        const fixedEventsContainer = document.getElementById('fixed-events');
        const fixedEventItem = document.createElement('div');
        fixedEventItem.className = 'event-item event-system';
        fixedEventItem.innerHTML = `
            <div class="event-icon"><i class="fas fa-clipboard-list"></i></div>
            <div class="event-content">
                <div class="event-title">都市情報要求</div>
                <div class="event-message">詳細を表示しました</div>
            </div>
            <div class="event-time">${timeString}</div>
        `;
        fixedEventsContainer.appendChild(fixedEventItem);
        
        // 一定数を超えたら古いイベントを削除
        while (fixedEventsContainer.children.length > 3) {
            fixedEventsContainer.removeChild(fixedEventsContainer.firstChild);
        }
        
        setTimeout(() => {
            logEntry.classList.remove('new-event');
        }, 500);
    }

    function triggerRandomEvent() {
        const events = [
            {
                title: '市内で火災発生！',
                message: '消防署が被害を最小限に抑えました。',
                effect: () => { population = Math.max(0, population - 10); },
                type: 'event-danger',
                icon: 'fire'
            },
            {
                title: '新工場がオープン！',
                message: '雇用が増加し、経済が活性化しました。',
                effect: () => { funds += 500; factories++; },
                type: 'event-success',
                icon: 'industry'
            },
            {
                title: '嵐による道路損傷',
                message: '修理作業が進行中です。',
                effect: () => { roads = Math.max(0, roads - 1); },
                type: 'event-warning',
                icon: 'cloud-showers-heavy'
            },
            {
                title: '観光客が増加！',
                message: '地域経済が活性化しています。',
                effect: () => { funds += 300; population += 5; },
                type: 'event-success',
                icon: 'suitcase'
            },
            {
                title: '環境賞を受賞',
                message: '持続可能な都市開発が評価されました。',
                effect: () => { funds += 200; },
                type: 'event-success',
                icon: 'award'
            },
            {
                title: '地震発生！',
                message: '建物が被害を受けました。復旧作業を開始します。',
                effect: () => {
                    houses = Math.max(0, houses - 1);
                    population = Math.max(0, population - 15);
                },
                type: 'event-danger',
                icon: 'globe-asia'
            },
            {
                title: '停電発生！',
                message: '市内で停電が発生しています。',
                effect: () => { happiness = Math.max(0, happiness - 10); },
                type: 'event-danger',
                icon: 'bolt'
            },
            {
                title: '水不足！',
                message: '市内で水不足が発生しています。',
                effect: () => { happiness = Math.max(0, happiness - 5); },
                type: 'event-warning',
                icon: 'tint-slash'
            },
            {
                title: '新しい公園がオープン！',
                message: '市民の幸福度が上昇しました。',
                effect: () => { happiness = Math.min(100, happiness + 10); },
                type: 'event-success',
                icon: 'tree'
            },
            {
                title: '新しい学校が完成！',
                message: '教育レベルが向上しました。',
                effect: () => { education = Math.min(100, education + 10); },
                type: 'event-success',
                icon: 'graduation-cap'
            },
            {
                title: '新病院がオープン！',
                message: '市民の健康と幸福度が向上しました。',
                effect: () => { happiness = Math.min(100, happiness + 5); },
                type: 'event-success',
                icon: 'hospital'
            },
            {
                title: '工場からの環境汚染！',
                message: '環境への悪影響が報告されています。',
                effect: () => { environment = Math.max(0, environment - 10); },
                type: 'event-warning',
                icon: 'smog'
            }
        ];
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        randomEvent.effect();
    
        // 通常の通知表示
        const notification = document.createElement('div');
        notification.className = 'event-notification';
        notification.innerHTML = `
            <strong>${randomEvent.title}</strong>
            <p>${randomEvent.message}</p>
        `;
        document.body.appendChild(notification);
    
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 4700);
    
        // ゲーム内の時刻を取得
        const formattedHour = gameHour.toString().padStart(2, '0');
        const formattedDay = gameDay.toString().padStart(2, '0');
        const formattedMonth = gameMonth.toString().padStart(2, '0');
        const timeString = `${formattedMonth}/${formattedDay} ${formattedHour}:00`;
        
        // 通常のログエントリ
        const logEntry = document.createElement('p');
        logEntry.className = `${randomEvent.type} new-event`;
        logEntry.innerHTML = `
            <span class="event-time"><i class="far fa-clock"></i> ${timeString}</span>
            <span class="event-title">
                <span class="event-icon"><i class="fas fa-${randomEvent.icon}"></i></span>
                ${randomEvent.title}
            </span>
            <span class="event-message">${randomEvent.message}</span>
        `;
        gameOutput.insertBefore(logEntry, gameOutput.firstChild);
        
        // 固定表示エリアにも追加
        const fixedEventsContainer = document.getElementById('fixed-events');
        const fixedEventItem = document.createElement('div');
        fixedEventItem.className = `event-item ${randomEvent.type}`;
        fixedEventItem.innerHTML = `
            <div class="event-icon"><i class="fas fa-${randomEvent.icon}"></i></div>
            <div class="event-content">
                <div class="event-title">${randomEvent.title}</div>
                <div class="event-message">${randomEvent.message}</div>
            </div>
            <div class="event-time">${timeString}</div>
        `;
        fixedEventsContainer.appendChild(fixedEventItem);
        
        // 一定数を超えたら古いイベントを削除
        while (fixedEventsContainer.children.length > 3) {
            fixedEventsContainer.removeChild(fixedEventsContainer.firstChild);
        }
        
        // アニメーション終了後のnew-eventクラスを削除
        setTimeout(() => {
            logEntry.classList.remove('new-event');
        }, 500);
        
        updateCityDetails();
    }

    function updateProgressBar() {
        timeProgressBar.style.width = '0%';
        setTimeout(() => {
            timeProgressBar.style.width = '100%';
        }, 100);
    }

    function updateClock() {
        // 時間を進める
        gameHour++;
        
        // 24時間経過で日付が変わる
        if (gameHour >= 24) {
            gameHour = 0;
            gameDay++;
            
            // 月末チェック（簡易的に30日/月とする）
            if (gameDay > 30) {
                gameDay = 1;
                gameMonth++;
                
                // 年末チェック
                if (gameMonth > 12) {
                    gameMonth = 1;
                    nextYear();
                }
            }
        }

        // 時刻表示を更新
        const formattedHour = gameHour.toString().padStart(2, '0');
        const formattedDay = gameDay.toString().padStart(2, '0');
        const formattedMonth = gameMonth.toString().padStart(2, '0');
        clock.textContent = `${year}/${formattedMonth}/${formattedDay} ${formattedHour}:00`;
    }

    // 初期ゲームログを設定
    function initializeGame() {
        gameOutput.innerHTML = '';
        
        const formattedHour = gameHour.toString().padStart(2, '0');
        const formattedDay = gameDay.toString().padStart(2, '0');
        const formattedMonth = gameMonth.toString().padStart(2, '0');
        const timeString = `${formattedMonth}/${formattedDay} ${formattedHour}:00`;
        
        const logEntry = document.createElement('p');
        logEntry.className = 'event-system';
        logEntry.innerHTML = `
            <span class="event-time"><i class="far fa-clock"></i> ${timeString}</span>
            <span class="event-title">
                <span class="event-icon"><i class="fas fa-play-circle"></i></span>
                CitySim へようこそ！
            </span>
            <span class="event-message">以下のオプションから選択してください：<br>
            1. 住宅建設<br>
            2. 工場建設<br>
            3. 道路建設<br>
            4. 次の年へ<br>
            5. 税率設定<br>
            6. 都市詳細<br>
            7. 終了</span>
        `;
        gameOutput.appendChild(logEntry);
        
        // 固定エリアに初期メッセージを追加
        const fixedEventsContainer = document.getElementById('fixed-events');
        const fixedEventItem = document.createElement('div');
        fixedEventItem.className = 'event-item event-system';
        fixedEventItem.innerHTML = `
            <div class="event-icon"><i class="fas fa-play-circle"></i></div>
            <div class="event-content">
                <div class="event-title">CitySim へようこそ！</div>
                <div class="event-message">ゲームを開始します</div>
            </div>
            <div class="event-time">${timeString}</div>
        `;
        fixedEventsContainer.appendChild(fixedEventItem);
    }

    updateCityDetails();
    initializeGame();

    document.addEventListener('keydown', (event) => {
        handleInput(event.key);
    });

    // 1秒ごとに時間を更新
    setInterval(updateClock, 1000);

    // 既存のsetIntervalを調整（1日に1回のペースでイベント発生）
    gameInterval = setInterval(() => {
        triggerRandomEvent();
        updateProgressBar();
    }, 24000); // 24秒（1ゲーム日）ごとにイベント発生

    updateProgressBar();
    updateClock();
});