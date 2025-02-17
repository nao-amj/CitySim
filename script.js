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

    function updateCityDetails() {
        const logEntry = document.createElement('p');
        logEntry.textContent = `${year}年: 人口 ${population}人 | 資金 ¥${funds.toLocaleString()}`;
        gameOutput.insertBefore(logEntry, gameOutput.firstChild);

        document.querySelector('.year-value').textContent = `${year}年`;
        document.querySelector('.population-value').textContent = `${population}人`;
        document.querySelector('.funds-value').textContent = `¥${funds.toLocaleString()}`;
        document.querySelector('.houses-value').textContent = houses;
        document.querySelector('.factories-value').textContent = factories;
        document.querySelector('.roads-value').textContent = roads;
        document.querySelector('.happiness-value').textContent = `${happiness}%`;
        document.querySelector('.environment-value').textContent = `${environment}%`;
        document.querySelector('.education-value').textContent = `${education}%`;
        document.querySelector('.tax-value').textContent = `${(taxRate * 100).toFixed(2)}%`;
    }

    function buildHouse() {
        if (funds >= 100) {
            houses++;
            funds -= 100;
            gameOutput.textContent += '\n新しい家を建設しました。';
        } else {
            gameOutput.textContent += '\n資金が足りません。';
        }
        updateCityDetails();
    }

    function buildFactory() {
        if (funds >= 200) {
            factories++;
            funds -= 200;
            gameOutput.textContent += '\n新しい工場を建設しました。';
        } else {
            gameOutput.textContent += '\n資金が足りません。';
        }
        updateCityDetails();
    }

    function buildRoad() {
        if (funds >= 50) {
            roads++;
            funds -= 50;
            gameOutput.textContent += '\n新しい道路を建設しました。';
        } else {
            gameOutput.textContent += '\n資金が足りません。';
        }
        updateCityDetails();
    }

    function nextYear() {
        year++;
        funds += Math.floor(population * 10 * taxRate);
        gameOutput.textContent += `\n${year}年が始まりました。`;
        updateCityDetails();
    }

    function showMenu() {
        gameOutput.textContent += `
1. 家を建設
2. 工場を建設
3. 道路を建設
4. 次の年へ
5. 税率を設定
6. 都市の詳細を表示
7. 終了
        `;
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
                gameOutput.textContent += '\nInvalid option.';
        }
        showMenu();
    }

    function setTaxRate() {
        const newTaxRate = prompt('新しい税率を入力してください（パーセント）:');
        if (newTaxRate !== null) {
            taxRate = parseFloat(newTaxRate) / 100;
            gameOutput.textContent += `\n税率を${newTaxRate}%に設定しました。`;
            updateCityDetails();
        }
    }

    function viewCityDetails() {
        gameOutput.textContent += `
都市の詳細:
年: ${year}年
人口: ${population}人
資金: ¥${funds.toLocaleString()}
住宅数: ${houses}
工場数: ${factories}
道路数: ${roads}
幸福度: ${happiness}%
環境: ${environment}%
教育: ${education}%
税率: ${(taxRate * 100).toFixed(2)}%
        `;
    }

    function triggerRandomEvent() {
        const events = [
            {
                title: '市内で火災発生！',
                message: '消防署が被害を最小限に抑えました。',
                effect: () => { population = Math.max(0, population - 10); }
            },
            {
                title: '新工場がオープン！',
                message: '雇用が増加し、経済が活性化しました。',
                effect: () => { funds += 500; factories++; }
            },
            {
                title: '嵐による道路損傷',
                message: '修理作業が進行中です。',
                effect: () => { roads = Math.max(0, roads - 1); }
            },
            {
                title: '観光客が増加！',
                message: '地域経済が活性化しています。',
                effect: () => { funds += 300; population += 5; }
            },
            {
                title: '環境賞を受賞',
                message: '持続可能な都市開発が評価されました。',
                effect: () => { funds += 200; }
            },
            {
                title: '地震発生！',
                message: '建物が被害を受けました。復旧作業を開始します。',
                effect: () => {
                    houses = Math.max(0, houses - 1);
                    population = Math.max(0, population - 15);
                }
            },
            {
                title: '停電発生！',
                message: '市内で停電が発生しています。',
                effect: () => { happiness = Math.max(0, happiness - 10); }
            },
            {
                title: '水不足！',
                message: '市内で水不足が発生しています。',
                effect: () => { happiness = Math.max(0, happiness - 5); }
            },
            {
                title: '新しい公園がオープン！',
                message: '市民の幸福度が上昇しました。',
                effect: () => { happiness = Math.min(100, happiness + 10); }
            },
            {
                title: '新しい学校が完成！',
                message: '教育レベルが向上しました。',
                effect: () => { education = Math.min(100, education + 10); }
            },
            {
                title: '新病院がオープン！',
                message: '市民の健康と幸福度が向上しました。',
                effect: () => { happiness = Math.min(100, happiness + 5); }
            },
            {
                title: '工場からの環境汚染！',
                message: '環境への悪影響が報告されています。',
                effect: () => { environment = Math.max(0, environment - 10); }
            }
        ];
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        randomEvent.effect();
    
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
    
        const logEntry = document.createElement('p');
        logEntry.innerHTML = `<strong>${randomEvent.title}</strong>: ${randomEvent.message}`;
        gameOutput.insertBefore(logEntry, gameOutput.firstChild);
        
        updateCityDetails();
    }

    function updateProgressBar() {
        timeProgressBar.style.width = '0%';
        setTimeout(() => {
            timeProgressBar.style.width = '100%';
        }, 100);
    }

    function updateClock() {
        const now = new Date();
        clock.textContent = now.toLocaleTimeString();
    }

    updateCityDetails();
    showMenu();

    document.addEventListener('keydown', (event) => {
        handleInput(event.key);
    });

    gameInterval = setInterval(() => {
        triggerRandomEvent();
        updateProgressBar();
    }, 10000);

    setInterval(updateClock, 1000);

    updateProgressBar();
    updateClock();
});