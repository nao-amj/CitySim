document.addEventListener('DOMContentLoaded', () => {
    // DOM要素
    const gameOutput = document.getElementById('game-output');
    const timeProgressBar = document.getElementById('time-progress-bar');
    const clock = document.getElementById('clock');
    const cityDetails = document.getElementById('city-details');
    const tutorialOverlay = document.getElementById('tutorial-overlay');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const toggleMenuBtn = document.getElementById('toggle-menu');

    // ゲーム変数
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

    // ゲーム内時間を管理する変数
    let gameHour = 0;
    let gameDay = 1;
    let gameMonth = 1;
    let gamePaused = false;

    // ゲーム設定とバランス
    const GAME_CONFIG = {
        // 建設コスト
        buildCosts: {
            house: 100,
            factory: 200,
            road: 50,
            education: 300,
            environment: 250
        },
        // インフラ効果
        effects: {
            house: {
                population: 10,
                happiness: 1,
                environment: -2
            },
            factory: {
                funds: 50,
                population: 5,
                environment: -5,
                happiness: -2
            },
            road: {
                happiness: 3,
                environment: -1
            }
        },
        // タイムスケール（リアルタイム1秒 = ゲーム内何時間）
        timeScale: 1,
        // イベント発生確率（1日ごとのチェック）
        eventChance: 0.4
    };

    // チュートリアル関連
    if (localStorage.getItem('citysim-tutorial-shown') !== 'true') {
        tutorialOverlay.style.display = 'flex';
    } else {
        tutorialOverlay.style.display = 'none';
    }

    document.getElementById('close-tutorial')?.addEventListener('click', () => {
        tutorialOverlay.style.display = 'none';
        localStorage.setItem('citysim-tutorial-shown', 'true');
    });

    // タブ切り替え機能
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // アクティブタブをリセット
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.add('hidden'));
            
            // 選択したタブをアクティブに
            button.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.remove('hidden');
        });
    });

    // モバイルメニュートグル
    toggleMenuBtn?.addEventListener('click', () => {
        document.querySelector('.dashboard').classList.toggle('mobile-active');
    });

    // ゲーム状態更新関数
    function updateCityDetails() {
        // ゲーム内の時刻フォーマット
        const formattedHour = gameHour.toString().padStart(2, '0');
        const formattedDay = gameDay.toString().padStart(2, '0');
        const formattedMonth = gameMonth.toString().padStart(2, '0');
        const timeString = `${formattedMonth}/${formattedDay} ${formattedHour}:00`;
        
        // 都市状況のログ表示
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
        
        if (gameOutput.firstChild) {
            gameOutput.insertBefore(logEntry, gameOutput.firstChild);
        } else {
            gameOutput.appendChild(logEntry);
        }
        
        // アニメーションクラスを一定時間後に削除
        setTimeout(() => {
            logEntry.classList.remove('new-event');
        }, 500);

        // 統計情報の更新
        updateAllStatDisplays();
    }

    // 全ての統計表示を更新する関数
    function updateAllStatDisplays() {
        // 年表示
        document.querySelectorAll('.year-value').forEach(el => {
            el.textContent = `${year}年`;
        });
        
        // 人口表示
        document.querySelectorAll('.population-value').forEach(el => {
            el.textContent = `${population}人`;
        });
        
        // 資金表示
        document.querySelectorAll('.funds-value').forEach(el => {
            el.textContent = `¥${funds.toLocaleString()}`;
        });
        
        // インフラ数表示
        document.querySelectorAll('.houses-value').forEach(el => {
            el.textContent = houses;
        });
        
        document.querySelectorAll('.factories-value').forEach(el => {
            el.textContent = factories;
        });
        
        document.querySelectorAll('.roads-value').forEach(el => {
            el.textContent = roads;
        });
        
        // メトリクス表示
        document.querySelectorAll('.happiness-value').forEach(el => {
            el.textContent = `${happiness}%`;
        });
        
        document.querySelectorAll('.environment-value').forEach(el => {
            el.textContent = `${environment}%`;
        });
        
        document.querySelectorAll('.education-value').forEach(el => {
            el.textContent = `${education}%`;
        });
        
        document.querySelectorAll('.tax-value').forEach(el => {
            el.textContent = `${(taxRate * 100).toFixed(2)}%`;
        });
        
        // プログレスバーの更新
        if (document.getElementById('happiness-bar')) {
            document.getElementById('happiness-bar').style.width = `${happiness}%`;
        }
        
        if (document.getElementById('environment-bar')) {
            document.getElementById('environment-bar').style.width = `${environment}%`;
        }
        
        if (document.getElementById('education-bar')) {
            document.getElementById('education-bar').style.width = `${education}%`;
        }
        
        // ボタンの無効化/有効化の更新
        updateButtonStates();
    }

    // ボタンの状態を更新する関数
    function updateButtonStates() {
        // 資金に基づいてボタンを有効/無効に
        const houseCost = GAME_CONFIG.buildCosts.house;
        const factoryCost = GAME_CONFIG.buildCosts.factory;
        const roadCost = GAME_CONFIG.buildCosts.road;
        
        const houseBtns = document.querySelectorAll('.build-house');
        const factoryBtns = document.querySelectorAll('.build-factory');
        const roadBtns = document.querySelectorAll('.build-road');
        
        houseBtns.forEach(btn => {
            if (funds < houseCost) {
                btn.classList.add('disabled');
                btn.setAttribute('disabled', 'disabled');
                btn.querySelector('.cost-indicator').textContent = `¥${houseCost} (資金不足)`;
            } else {
                btn.classList.remove('disabled');
                btn.removeAttribute('disabled');
                btn.querySelector('.cost-indicator').textContent = `¥${houseCost}`;
            }
        });
        
        factoryBtns.forEach(btn => {
            if (funds < factoryCost) {
                btn.classList.add('disabled');
                btn.setAttribute('disabled', 'disabled');
                btn.querySelector('.cost-indicator').textContent = `¥${factoryCost} (資金不足)`;
            } else {
                btn.classList.remove('disabled');
                btn.removeAttribute('disabled');
                btn.querySelector('.cost-indicator').textContent = `¥${factoryCost}`;
            }
        });
        
        roadBtns.forEach(btn => {
            if (funds < roadCost) {
                btn.classList.add('disabled');
                btn.setAttribute('disabled', 'disabled');
                btn.querySelector('.cost-indicator').textContent = `¥${roadCost} (資金不足)`;
            } else {
                btn.classList.remove('disabled');
                btn.removeAttribute('disabled');
                btn.querySelector('.cost-indicator').textContent = `¥${roadCost}`;
            }
        });
    }

    // 住宅建設機能
    function buildHouse() {
        const houseCost = GAME_CONFIG.buildCosts.house;
        
        // ゲーム内の時刻を取得
        const formattedHour = gameHour.toString().padStart(2, '0');
        const formattedDay = gameDay.toString().padStart(2, '0');
        const formattedMonth = gameMonth.toString().padStart(2, '0');
        const timeString = `${formattedMonth}/${formattedDay} ${formattedHour}:00`;
        
        if (funds >= houseCost) {
            houses++;
            funds -= houseCost;
            
            // 住宅効果の適用
            population += GAME_CONFIG.effects.house.population;
            happiness = Math.min(100, happiness + GAME_CONFIG.effects.house.happiness);
            environment = Math.max(0, environment + GAME_CONFIG.effects.house.environment);
            
            // ゲームログエントリの作成
            const logEntry = document.createElement('p');
            logEntry.className = 'event-success new-event';
            logEntry.innerHTML = `
                <span class="event-time"><i class="far fa-clock"></i> ${timeString}</span>
                <span class="event-title">
                    <span class="event-icon"><i class="fas fa-home"></i></span>
                    住宅建設完了
                </span>
                <span class="event-message">新しい住宅が建設されました。<br>
                人口が <strong>+${GAME_CONFIG.effects.house.population}人</strong> 増加しました。<br>
                残りの資金: <strong>¥${funds.toLocaleString()}</strong></span>
            `;
            
            if (gameOutput.firstChild) {
                gameOutput.insertBefore(logEntry, gameOutput.firstChild);
            } else {
                gameOutput.appendChild(logEntry);
            }
            
            // 固定エリアにも追加
            const fixedEventsContainer = document.getElementById('fixed-events');
            const fixedEventItem = document.createElement('div');
            fixedEventItem.className = 'event-item event-success';
            fixedEventItem.innerHTML = `
                <div class="event-icon"><i class="fas fa-home"></i></div>
                <div class="event-content">
                    <div class="event-title">住宅建設完了</div>
                    <div class="event-message">住宅数: ${houses} | 人口: ${population}人</div>
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
            // 資金不足の場合のメッセージ
            const logEntry = document.createElement('p');
            logEntry.className = 'event-danger new-event';
            logEntry.innerHTML = `
                <span class="event-time"><i class="far fa-clock"></i> ${timeString}</span>
                <span class="event-title">
                    <span class="event-icon"><i class="fas fa-exclamation-circle"></i></span>
                    建設失敗
                </span>
                <span class="event-message">資金が足りません。<br>必要金額: <strong>¥${houseCost}</strong> | 現在の資金: <strong>¥${funds.toLocaleString()}</strong></span>
            `;
            
            if (gameOutput.firstChild) {
                gameOutput.insertBefore(logEntry, gameOutput.firstChild);
            } else {
                gameOutput.appendChild(logEntry);
            }
            
            // 固定エリアにも追加
            const fixedEventsContainer = document.getElementById('fixed-events');
            const fixedEventItem = document.createElement('div');
            fixedEventItem.className = 'event-item event-danger';
            fixedEventItem.innerHTML = `
                <div class="event-icon"><i class="fas fa-exclamation-circle"></i></div>
                <div class="event-content">
                    <div class="event-title">建設失敗</div>
                    <div class="event-message">資金不足: ¥${funds.toLocaleString()}/¥${houseCost}</div>
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
        
        updateAllStatDisplays();
    }

    // 工場建設機能
    function buildFactory() {
        const factoryCost = GAME_CONFIG.buildCosts.factory;
        
        // ゲーム内の時刻を取得
        const formattedHour = gameHour.toString().padStart(2, '0');
        const formattedDay = gameDay.toString().padStart(2, '0');
        const formattedMonth = gameMonth.toString().padStart(2, '0');
        const timeString = `${formattedMonth}/${formattedDay} ${formattedHour}:00`;
        
        if (funds >= factoryCost) {
            factories++;
            funds -= factoryCost;
            
            // 工場効果の適用
            population += GAME_CONFIG.effects.factory.population;
            happiness = Math.max(0, happiness + GAME_CONFIG.effects.factory.happiness);
            environment = Math.max(0, environment + GAME_CONFIG.effects.factory.environment);
            
            // ゲームログエントリの作成
            const logEntry = document.createElement('p');
            logEntry.className = 'event-success new-event';
            logEntry.innerHTML = `
                <span class="event-time"><i class="far fa-clock"></i> ${timeString}</span>
                <span class="event-title">
                    <span class="event-icon"><i class="fas fa-industry"></i></span>
                    工場建設完了
                </span>
                <span class="event-message">新しい工場が建設されました。<br>
                人口が <strong>+${GAME_CONFIG.effects.factory.population}人</strong> 増加し、環境が <strong>${GAME_CONFIG.effects.factory.environment}%</strong> 変化しました。<br>
                残りの資金: <strong>¥${funds.toLocaleString()}</strong></span>
            `;
            
            if (gameOutput.firstChild) {
                gameOutput.insertBefore(logEntry, gameOutput.firstChild);
            } else {
                gameOutput.appendChild(logEntry);
            }
            
            // 固定エリアにも追加
            const fixedEventsContainer = document.getElementById('fixed-events');
            const fixedEventItem = document.createElement('div');
            fixedEventItem.className = 'event-item event-success';
            fixedEventItem.innerHTML = `
                <div class="event-icon"><i class="fas fa-industry"></i></div>
                <div class="event-content">
                    <div class="event-title">工場建設完了</div>
                    <div class="event-message">工場数: ${factories} | 環境: ${environment}%</div>
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
            // 資金不足の場合のメッセージ
            const logEntry = document.createElement('p');
            logEntry.className = 'event-danger new-event';
            logEntry.innerHTML = `
                <span class="event-time"><i class="far fa-clock"></i> ${timeString}</span>
                <span class="event-title">
                    <span class="event-icon"><i class="fas fa-exclamation-circle"></i></span>
                    建設失敗
                </span>
                <span class="event-message">資金が足りません。<br>必要金額: <strong>¥${factoryCost}</strong> | 現在の資金: <strong>¥${funds.toLocaleString()}</strong></span>
            `;
            
            if (gameOutput.firstChild) {
                gameOutput.insertBefore(logEntry, gameOutput.firstChild);
            } else {
                gameOutput.appendChild(logEntry);
            }
            
            // 固定エリアにも追加
            const fixedEventsContainer = document.getElementById('fixed-events');
            const fixedEventItem = document.createElement('div');
            fixedEventItem.className = 'event-item event-danger';
            fixedEventItem.innerHTML = `
                <div class="event-icon"><i class="fas fa-exclamation-circle"></i></div>
                <div class="event-content">
                    <div class="event-title">建設失敗</div>
                    <div class="event-message">資金不足: ¥${funds.toLocaleString()}/¥${factoryCost}</div>
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
        
        updateAllStatDisplays();
    }

    // 道路建設機能
    function buildRoad() {
        const roadCost = GAME_CONFIG.buildCosts.road;
        
        // ゲーム内の時刻を取得
        const formattedHour = gameHour.toString().padStart(2, '0');
        const formattedDay = gameDay.toString().padStart(2, '0');
        const formattedMonth = gameMonth.toString().padStart(2, '0');
        const timeString = `${formattedMonth}/${formattedDay} ${formattedHour}:00`;
        
        if (funds >= roadCost) {
            roads++;
            funds -= roadCost;
            
            // 道路効果の適用
            happiness = Math.min(100, happiness + GAME_CONFIG.effects.road.happiness);
            environment = Math.max(0, environment + GAME_CONFIG.effects.road.environment);
            
            // ゲームログエントリの作成
            const logEntry = document.createElement('p');
            logEntry.className = 'event-success new-event';
            logEntry.innerHTML = `
                <span class="event-time"><i class="far fa-clock"></i> ${timeString}</span>
                <span class="event-title">
                    <span class="event-icon"><i class="fas fa-road"></i></span>
                    道路建設完了
                </span>
                <span class="event-message">新しい道路が建設されました。<br>
                幸福度が <strong>+${GAME_CONFIG.effects.road.happiness}%</strong> 増加しました。<br>
                残りの資金: <strong>¥${funds.toLocaleString()}</strong></span>
            `;
            
            if (gameOutput.firstChild) {
                gameOutput.insertBefore(logEntry, gameOutput.firstChild);
            } else {
                gameOutput.appendChild(logEntry);
            }
            
            // 固定エリアにも追加
            const fixedEventsContainer = document.getElementById('fixed-events');
            const fixedEventItem = document.createElement('div');
            fixedEventItem.className = 'event-item event-success';
            fixedEventItem.innerHTML = `
                <div class="event-icon"><i class="fas fa-road"></i></div>
                <div class="event-content">
                    <div class="event-title">道路建設完了</div>
                    <div class="event-message">道路数: ${roads} | 幸福度: ${happiness}%</div>
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
            // 資金不足の場合のメッセージ
            const logEntry = document.createElement('p');
            logEntry.className = 'event-danger new-event';
            logEntry.innerHTML = `
                <span class="event-time"><i class="far fa-clock"></i> ${timeString}</span>
                <span class="event-title">
                    <span class="event-icon"><i class="fas fa-exclamation-circle"></i></span>
                    建設失敗
                </span>
                <span class="event-message">資金が足りません。<br>必要金額: <strong>¥${roadCost}</strong> | 現在の資金: <strong>¥${funds.toLocaleString()}</strong></span>
            `;
            
            if (gameOutput.firstChild) {
                gameOutput.insertBefore(logEntry, gameOutput.firstChild);
            } else {
                gameOutput.appendChild(logEntry);
            }
            
            // 固定エリアにも追加
            const fixedEventsContainer = document.getElementById('fixed-events');
            const fixedEventItem = document.createElement('div');
            fixedEventItem.className = 'event-item event-danger';
            fixedEventItem.innerHTML = `
                <div class="event-icon"><i class="fas fa-exclamation-circle"></i></div>
                <div class="event-content">
                    <div class="event-title">建設失敗</div>
                    <div class="event-message">資金不足: ¥${funds.toLocaleString()}/¥${roadCost}</div>
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
        
        updateAllStatDisplays();
    }

    // 年進行機能
    function nextYear() {
        year++;
        const taxIncome = Math.floor(population * 10 * taxRate);
        const factoryIncome = factories * GAME_CONFIG.effects.factory.funds;
        const totalIncome = taxIncome + factoryIncome;
        
        funds += totalIncome;
        
        // ゲーム内の時刻を取得
        const formattedHour = gameHour.toString().padStart(2, '0');
        const formattedDay = gameDay.toString().padStart(2, '0');
        const formattedMonth = gameMonth.toString().padStart(2, '0');
        const timeString = `${formattedMonth}/${formattedDay} ${formattedHour}:00`;
        
        // ゲームログエントリの作成
        const logEntry = document.createElement('p');
        logEntry.className = 'event-info new-event';
        logEntry.innerHTML = `
            <span class="event-time"><i class="far fa-clock"></i> ${timeString}</span>
            <span class="event-title">
                <span class="event-icon"><i class="fas fa-calendar-alt"></i></span>
                ${year}年の新年を迎えました
            </span>
            <span class="event-message">
            収入内訳:<br>
            - 税収: <strong>¥${taxIncome.toLocaleString()}</strong><br>
            - 工場収入: <strong>¥${factoryIncome.toLocaleString()}</strong><br>
            合計: <strong>¥${totalIncome.toLocaleString()}</strong>
            </span>
        `;
        
        if (gameOutput.firstChild) {
            gameOutput.insertBefore(logEntry, gameOutput.firstChild);
        } else {
            gameOutput.appendChild(logEntry);
        }
        
        // 固定エリアにも追加
        const fixedEventsContainer = document.getElementById('fixed-events');
        const fixedEventItem = document.createElement('div');
        fixedEventItem.className = 'event-item event-info';
        fixedEventItem.innerHTML = `
            <div class="event-icon"><i class="fas fa-calendar-alt"></i></div>
            <div class="event-content">
                <div class="event-title">${year}年</div>
                <div class="event-message">収入: ¥${totalIncome.toLocaleString()}</div>
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
        
        // 年ごとの自然変動
        applyYearlyChanges();
        
        updateAllStatDisplays();
    }

    // 年ごとの変動を適用
    function applyYearlyChanges() {
        // 人口自然増加（住宅と幸福度に基づく）
        const populationGrowth = Math.floor(houses * (happiness / 100) * 5);
        if (populationGrowth > 0) {
            population += populationGrowth;
            
            const formattedHour = gameHour.toString().padStart(2, '0');
            const formattedDay = gameDay.toString().padStart(2, '0');
            const formattedMonth = gameMonth.toString().padStart(2, '0');
            const timeString = `${formattedMonth}/${formattedDay} ${formattedHour}:00`;
            
            const logEntry = document.createElement('p');
            logEntry.className = 'event-success new-event';
            logEntry.innerHTML = `
                <span class="event-time"><i class="far fa-clock"></i> ${timeString}</span>
                <span class="event-title">
                    <span class="event-icon"><i class="fas fa-users"></i></span>
                    人口増加
                </span>
                <span class="event-message">新しい市民が <strong>${populationGrowth}人</strong> 移住してきました。<br>
                現在の人口: <strong>${population}人</strong></span>
            `;
            
            if (gameOutput.firstChild) {
                gameOutput.insertBefore(logEntry, gameOutput.firstChild);
            } else {
                gameOutput.appendChild(logEntry);
            }
            
            setTimeout(() => {
                logEntry.classList.remove('new-event');
            }, 500);
        }
        
        // 環境の自然回復（工場数に反比例）
        if (factories === 0) {
            environment = Math.min(100, environment + 5);
        } else {
            const environmentRecovery = Math.max(0, 5 - Math.floor(factories / 2));
            environment = Math.min(100, environment + environmentRecovery);
        }
        
        // 税率に基づく幸福度変動
        const taxEffect = Math.floor((0.2 - taxRate) * 20); // 0.1（10%）で +2、0.2（20%）で 0、0.3（30%）で -2
        happiness = Math.min(100, Math.max(0, happiness + taxEffect));
        
        if (taxRate > 0.15 && taxEffect < 0) {
            const formattedHour = gameHour.toString().padStart(2, '0');
            const formattedDay = gameDay.toString().padStart(2, '0');
            const formattedMonth = gameMonth.toString().padStart(2, '0');
            const timeString = `${formattedMonth}/${formattedDay} ${formattedHour}:00`;
            
            const logEntry = document.createElement('p');
            logEntry.className = 'event-warning new-event';
            logEntry.innerHTML = `
                <span class="event-time"><i class="far fa-clock"></i> ${timeString}</span>
                <span class="event-title">
                    <span class="event-icon"><i class="fas fa-frown"></i></span>
                    高税率への不満
                </span>
                <span class="event-message">市民は現在の税率 <strong>${(taxRate * 100).toFixed(1)}%</strong> に不満を持っています。<br>
                幸福度が <strong>${Math.abs(taxEffect)}%</strong> 低下しました。</span>
            `;
            
            if (gameOutput.firstChild) {
                gameOutput.insertBefore(logEntry, gameOutput.firstChild);
            } else {
                gameOutput.appendChild(logEntry);
            }
            
            setTimeout(() => {
                logEntry.classList.remove('new-event');
            }, 500);
        }
    }

    // ユーザー入力ハンドリング
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
                // ゲーム終了（今は使用されていない）
                const formattedHour = gameHour.toString().padStart(2, '0');
                const formattedDay = gameDay.toString().padStart(2, '0');
                const formattedMonth = gameMonth.toString().padStart(2, '0');
                const timeString = `${formattedMonth}/${formattedDay} ${formattedHour}:00`;
                
                const logEntry = document.createElement('p');
                logEntry.className = 'event-system new-event';
                logEntry.innerHTML = `
                    <span class="event-time"><i class="far fa-clock"></i> ${timeString}</span>
                    <span class="event-title">
                        <span class="event-icon"><i class="fas fa-power-off"></i></span>
                        ゲーム終了
                    </span>
                    <span class="event-message">ゲームを終了します。ありがとうございました。</span>
                `;
                
                if (gameOutput.firstChild) {
                    gameOutput.insertBefore(logEntry, gameOutput.firstChild);
                } else {
                    gameOutput.appendChild(logEntry);
                }
                
                clearInterval(gameInterval);
                gamePaused = true;
                break;
            default:
                // ゲーム内の時刻を取得
                const fHour = gameHour.toString().padStart(2, '0');
                const fDay = gameDay.toString().padStart(2, '0');
                const fMonth = gameMonth.toString().padStart(2, '0');
                const tString = `${fMonth}/${fDay} ${fHour}:00`;
                
                const sysLogEntry = document.createElement('p');
                sysLogEntry.className = 'event-system new-event';
                sysLogEntry.innerHTML = `
                    <span class="event-time"><i class="far fa-clock"></i> ${tString}</span>
                    <span class="event-title">
                        <span class="event-icon"><i class="fas fa-terminal"></i></span>
                        システムメッセージ
                    </span>
                    <span class="event-message">有効なオプションを選択してください：<br>
                    1. 住宅建設 (¥${GAME_CONFIG.buildCosts.house})<br>
                    2. 工場建設 (¥${GAME_CONFIG.buildCosts.factory})<br>
                    3. 道路建設 (¥${GAME_CONFIG.buildCosts.road})<br>
                    4. 次の年へ<br>
                    5. 税率設定<br>
                    6. 都市詳細<br>
                    7. 終了</span>
                `;
                
                if (gameOutput.firstChild) {
                    gameOutput.insertBefore(sysLogEntry, gameOutput.firstChild);
                } else {
                    gameOutput.appendChild(sysLogEntry);
                }
                
                setTimeout(() => {
                    sysLogEntry.classList.remove('new-event');
                }, 500);
        }
    }

    // 税率設定機能
    function setTaxRate() {
        const newTaxRateStr = prompt('新しい税率を入力してください（パーセント）:', (taxRate * 100).toFixed(1));
        
        if (newTaxRateStr !== null) {
            const newTaxRateValue = parseFloat(newTaxRateStr) / 100;
            
            // 有効な数値かチェック
            if (isNaN(newTaxRateValue) || newTaxRateValue < 0 || newTaxRateValue > 0.5) {
                alert('税率は0%から50%の間で設定してください。');
                return;
            }
            
            taxRate = newTaxRateValue;
            
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
                <span class="event-message">税率が <strong>${newTaxRateStr}%</strong> に設定されました。<br>
                ${newTaxRateValue > 0.15 ? '<strong>警告:</strong> 高い税率は市民の幸福度に悪影響を与える可能性があります。' : ''}
                </span>
            `;
            
            if (gameOutput.firstChild) {
                gameOutput.insertBefore(logEntry, gameOutput.firstChild);
            } else {
                gameOutput.appendChild(logEntry);
            }
            
            // 固定エリアにも追加
            const fixedEventsContainer = document.getElementById('fixed-events');
            const fixedEventItem = document.createElement('div');
            fixedEventItem.className = 'event-item event-info';
            fixedEventItem.innerHTML = `
                <div class="event-icon"><i class="fas fa-percentage"></i></div>
                <div class="event-content">
                    <div class="event-title">税率変更</div>
                    <div class="event-message">新税率: ${newTaxRateStr}%</div>
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
            
            updateAllStatDisplays();
        }
    }

    // 都市詳細表示機能
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
        
        if (gameOutput.firstChild) {
            gameOutput.insertBefore(logEntry, gameOutput.firstChild);
        } else {
            gameOutput.appendChild(logEntry);
        }
        
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

    // ランダムイベント発生機能
    function triggerRandomEvent() {
        // 一定確率でイベント発生をスキップ
        if (Math.random() > GAME_CONFIG.eventChance) return;
        
        const events = [
            {
                title: '市内で火災発生！',
                message: '消防署が被害を最小限に抑えました。',
                effect: () => { 
                    population = Math.max(0, population - 10); 
                    happiness = Math.max(0, happiness - 5);
                },
                type: 'event-danger',
                icon: 'fire'
            },
            {
                title: '新工場がオープン！',
                message: '雇用が増加し、経済が活性化しました。',
                effect: () => { 
                    funds += 500; 
                    factories++; 
                    population += 15;
                    environment = Math.max(0, environment - 3);
                },
                type: 'event-success',
                icon: 'industry'
            },
            {
                title: '嵐による道路損傷',
                message: '修理作業が進行中です。',
                effect: () => { 
                    roads = Math.max(0, roads - 1); 
                    funds = Math.max(0, funds - 50);
                    happiness = Math.max(0, happiness - 2);
                },
                type: 'event-warning',
                icon: 'cloud-showers-heavy'
            },
            {
                title: '観光客が増加！',
                message: '地域経済が活性化しています。',
                effect: () => { 
                    funds += 300; 
                    population += 5; 
                    happiness = Math.min(100, happiness + 3);
                },
                type: 'event-success',
                icon: 'suitcase'
            },
            {
                title: '環境賞を受賞',
                message: '持続可能な都市開発が評価されました。',
                effect: () => { 
                    funds += 200; 
                    happiness = Math.min(100, happiness + 5);
                },
                type: 'event-success',
                icon: 'award'
            },
            {
                title: '地震発生！',
                message: '建物が被害を受けました。復旧作業を開始します。',
                effect: () => {
                    houses = Math.max(0, houses - 1);
                    population = Math.max(0, population - 15);
                    happiness = Math.max(0, happiness - 10);
                    funds = Math.max(0, funds - 100);
                },
                type: 'event-danger',
                icon: 'globe-asia'
            },
            {
                title: '停電発生！',
                message: '市内で停電が発生しています。',
                effect: () => { 
                    happiness = Math.max(0, happiness - 10); 
                    funds = Math.max(0, funds - 50);
                },
                type: 'event-danger',
                icon: 'bolt'
            },
            {
                title: '水不足！',
                message: '市内で水不足が発生しています。',
                effect: () => { 
                    happiness = Math.max(0, happiness - 5); 
                    environment = Math.max(0, environment - 3);
                },
                type: 'event-warning',
                icon: 'tint-slash'
            },
            {
                title: '新しい公園がオープン！',
                message: '市民の幸福度が上昇しました。',
                effect: () => { 
                    happiness = Math.min(100, happiness + 10); 
                    environment = Math.min(100, environment + 5);
                    funds = Math.max(0, funds - 150);
                },
                type: 'event-success',
                icon: 'tree'
            },
            {
                title: '新しい学校が完成！',
                message: '教育レベルが向上しました。',
                effect: () => { 
                    education = Math.min(100, education + 10); 
                    happiness = Math.min(100, happiness + 5);
                    funds = Math.max(0, funds - 200);
                },
                type: 'event-success',
                icon: 'graduation-cap'
            },
            {
                title: '新病院がオープン！',
                message: '市民の健康と幸福度が向上しました。',
                effect: () => { 
                    happiness = Math.min(100, happiness + 5); 
                    population += 10;
                    funds = Math.max(0, funds - 250);
                },
                type: 'event-success',
                icon: 'hospital'
            },
            {
                title: '工場からの環境汚染！',
                message: '環境への悪影響が報告されています。',
                effect: () => { 
                    environment = Math.max(0, environment - 10);
                    happiness = Math.max(0, happiness - 3);
                },
                type: 'event-warning',
                icon: 'smog'
            }
        ];
        
        // 工場がない場合、工場関連のイベントを除外
        const availableEvents = factories > 0 
            ? events 
            : events.filter(e => e.title !== '工場からの環境汚染！' && e.title !== '新工場がオープン！');
        
        const randomEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
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
        
        if (gameOutput.firstChild) {
            gameOutput.insertBefore(logEntry, gameOutput.firstChild);
        } else {
            gameOutput.appendChild(logEntry);
        }
        
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
        
        updateAllStatDisplays();
    }

    // プログレスバー更新
    function updateProgressBar() {
        timeProgressBar.style.width = '0%';
        setTimeout(() => {
            timeProgressBar.style.width = '100%';
        }, 100);
    }

    // 時間更新機能
    function updateClock() {
        if (gamePaused) return;
        
        // 時間を進める
        gameHour += GAME_CONFIG.timeScale;
        
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
            
            // 1日に1回ランダムイベントの発生チェック
            triggerRandomEvent();
        }

        // 時刻表示を更新
        const formattedHour = gameHour.toString().padStart(2, '0');
        const formattedDay = gameDay.toString().padStart(2, '0');
        const formattedMonth = gameMonth.toString().padStart(2, '0');
        clock.textContent = `${year}/${formattedMonth}/${formattedDay} ${formattedHour}:00`;
    }

    // 初期ゲームログを設定
    function initializeGame() {
        if (gameOutput) {
            gameOutput.innerHTML = '';
        }
        
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
            <span class="event-message">
            新しい都市の市長に就任しました。都市を発展させましょう。<br><br>
            <strong>使用可能なアクション:</strong><br>
            • <strong>建設タブ</strong>: 住宅、工場、道路を建設<br>
            • <strong>経済タブ</strong>: 税率設定、融資、貿易<br>
            • <strong>政策タブ</strong>: 年の進行、教育投資、環境政策<br><br>
            さあ、都市開発を始めましょう！
            </span>
        `;
        
        if (gameOutput) {
            gameOutput.appendChild(logEntry);
        }
        
        // 固定エリアに初期メッセージを追加
        const fixedEventsContainer = document.getElementById('fixed-events');
        if (fixedEventsContainer) {
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
    }

    // 初期化処理
    updateAllStatDisplays();
    initializeGame();

    // キーボード入力イベントリスナー
    document.addEventListener('keydown', (event) => {
        // 数字キーでアクション
        if (/^[1-7]$/.test(event.key)) {
            handleInput(event.key);
        }
        
        // スペースキーでゲーム一時停止/再開
        if (event.key === ' ') {
            gamePaused = !gamePaused;
            
            const formattedHour = gameHour.toString().padStart(2, '0');
            const formattedDay = gameDay.toString().padStart(2, '0');
            const formattedMonth = gameMonth.toString().padStart(2, '0');
            const timeString = `${formattedMonth}/${formattedDay} ${formattedHour}:00`;
            
            const logEntry = document.createElement('p');
            logEntry.className = 'event-system new-event';
            logEntry.innerHTML = `
                <span class="event-time"><i class="far fa-clock"></i> ${timeString}</span>
                <span class="event-title">
                    <span class="event-icon"><i class="fas fa-${gamePaused ? 'pause' : 'play'}-circle"></i></span>
                    ゲームを${gamePaused ? '一時停止' : '再開'}しました
                </span>
                <span class="event-message">スペースキーでゲームを${gamePaused ? '再開' : '一時停止'}できます。</span>
            `;
            
            if (gameOutput.firstChild) {
                gameOutput.insertBefore(logEntry, gameOutput.firstChild);
            } else {
                gameOutput.appendChild(logEntry);
            }
            
            setTimeout(() => {
                logEntry.classList.remove('new-event');
            }, 500);
        }
    });

    // 1秒ごとに時間を更新
    setInterval(updateClock, 1000);

    // 既存のsetIntervalを調整（1日に1回のペースでイベント発生）
    gameInterval = setInterval(() => {
        if (!gamePaused) {
            updateProgressBar();
        }
    }, 24000); // 24秒（1ゲーム日）ごとにイベント発生

    updateProgressBar();
    updateClock();
});