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
        // Update game log with formatted text
        const logEntry = document.createElement('p');
        logEntry.textContent = `Year ${year}: Population ${population} | Funds $${funds}`;
        gameOutput.insertBefore(logEntry, gameOutput.firstChild);

        // Update all stat values
        document.querySelector('.year-value').textContent = year;
        document.querySelector('.population-value').textContent = population;
        document.querySelector('.funds-value').textContent = `$${funds}`;
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
            gameOutput.textContent += '\nBuilt a new house.';
        } else {
            gameOutput.textContent += '\nNot enough funds to build a house.';
        }
        updateCityDetails();
    }

    function buildFactory() {
        if (funds >= 200) {
            factories++;
            funds -= 200;
            gameOutput.textContent += '\nBuilt a new factory.';
        } else {
            gameOutput.textContent += '\nNot enough funds to build a factory.';
        }
        updateCityDetails();
    }

    function buildRoad() {
        if (funds >= 50) {
            roads++;
            funds -= 50;
            gameOutput.textContent += '\nBuilt a new road.';
        } else {
            gameOutput.textContent += '\nNot enough funds to build a road.';
        }
        updateCityDetails();
    }

    function nextYear() {
        year++;
        funds += Math.floor(population * 10 * taxRate);
        gameOutput.textContent += `\nYear ${year} has started.`;
        updateCityDetails();
    }

    function showMenu() {
        gameOutput.textContent += `
1. Build House
2. Build Factory
3. Build Road
4. Next Year
5. Set Tax Rate
6. View City Details
7. Exit
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
        const newTaxRate = prompt('Enter new tax rate (as a percentage):');
        if (newTaxRate !== null) {
            taxRate = parseFloat(newTaxRate) / 100;
            gameOutput.textContent += `\nTax rate set to ${newTaxRate}%.`;
            updateCityDetails();
        }
    }

    function viewCityDetails() {
        gameOutput.textContent += `
City Details:
Year: ${year}
Population: ${population}
Funds: $${funds}
Houses: ${houses}
Factories: ${factories}
Roads: ${roads}
Happiness: ${happiness}%
Environment: ${environment}%
Education: ${education}%
Tax Rate: ${(taxRate * 100).toFixed(2)}%
        `;
    }

    function triggerRandomEvent() {
        const events = [
            {
                title: 'Fire in the city!',
                message: 'The fire department has minimized the damage.',
                effect: () => { population = Math.max(0, population - 10); }
            },
            {
                title: 'New factory opened!',
                message: 'Employment has increased, boosting the economy.',
                effect: () => { funds += 500; factories++; }
            },
            {
                title: 'Road damaged by storm',
                message: 'Repair work is underway.',
                effect: () => { roads = Math.max(0, roads - 1); }
            },
            {
                title: 'Tourist influx!',
                message: 'The local economy is booming.',
                effect: () => { funds += 300; population += 5; }
            },
            {
                title: 'Environmental award',
                message: 'Sustainable city development has been recognized.',
                effect: () => { funds += 200; }
            },
            {
                title: 'Earthquake!',
                message: 'Buildings have been damaged. Recovery efforts are starting.',
                effect: () => {
                    houses = Math.max(0, houses - 1);
                    population = Math.max(0, population - 15);
                }
            },
            {
                title: 'Power outage!',
                message: 'A power outage has affected the city.',
                effect: () => { happiness = Math.max(0, happiness - 10); }
            },
            {
                title: 'Water shortage!',
                message: 'A water shortage has affected the city.',
                effect: () => { happiness = Math.max(0, happiness - 5); }
            },
            {
                title: 'New park opened!',
                message: 'A new park has been opened, increasing happiness.',
                effect: () => { happiness = Math.min(100, happiness + 10); }
            },
            {
                title: 'School built!',
                message: 'A new school has been built, increasing education.',
                effect: () => { education = Math.min(100, education + 10); }
            },
            {
                title: 'Hospital built!',
                message: 'A new hospital has been built, increasing happiness.',
                effect: () => { happiness = Math.min(100, happiness + 5); }
            },
            {
                title: 'Factory pollution!',
                message: 'A factory is causing pollution, decreasing environment.',
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