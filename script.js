// --- 1. ADATMODELL: Ligák, Csapatok és Taktika ---

const footballData = {
    premierLeague: {
        name: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League",
        teams: ["Arsenal", "Liverpool", "Manchester City", "Manchester United", "Chelsea"]
    },
    laLiga: {
        name: "🇪🇸 La Liga",
        teams: ["Real Madrid", "FC Barcelona", "Atlético Madrid"]
    },
    serieA: {
        name: "🇮🇹 Serie A",
        teams: ["Juventus", "Inter Milan", "AC Milan"]
    }
};

// Példa játékos adatok (Egyszerűsített)
const squadPlayers = [
    { name: "Kovács", pos: "K", rating: 85 },
    { name: "Nagy", pos: "V", rating: 78 },
    { name: "Tóth", pos: "V", rating: 80 },
    { name: "Kiss", pos: "V", rating: 75 },
    { name: "Szabó", pos: "V", rating: 82 },
    { name: "Varga", pos: "KP", rating: 88 },
    { name: "Molnár", pos: "KP", rating: 79 },
    { name: "Papp", pos: "KP", rating: 84 },
    { name: "Juhász", pos: "KP", rating: 76 },
    { name: "Fekete", pos: "CS", rating: 90 },
    { name: "Fehér", pos: "CS", rating: 85 },
    { name: "Zöld", pos: "V", rating: 70 },
    { name: "Piros", pos: "KP", rating: 65 },
];

// Formáció adatok (egyszerűsített pozíció koordináták)
const formations = {
    '4-4-2': {
        name: '4-4-2 Klasszikus',
        gk: [{ top: '90%', left: '50%' }],
        def: [{ top: '75%', left: '15%' }, { top: '80%', left: '35%' }, { top: '80%', left: '65%' }, { top: '75%', left: '85%' }],
        mid: [{ top: '50%', left: '15%' }, { top: '55%', left: '35%' }, { top: '55%', left: '65%' }, { top: '50%', left: '85%' }],
        att: [{ top: '20%', left: '40%' }, { top: '20%', left: '60%' }]
    },
    '4-3-3': {
        name: '4-3-3 Támadó',
        gk: [{ top: '90%', left: '50%' }],
        def: [{ top: '75%', left: '15%' }, { top: '80%', left: '35%' }, { top: '80%', left: '65%' }, { top: '75%', left: '85%' }],
        mid: [{ top: '60%', left: '30%' }, { top: '65%', left: '50%' }, { top: '60%', left: '70%' }],
        att: [{ top: '20%', left: '20%' }, { top: '15%', left: '50%' }, { top: '20%', left: '80%' }]
    },
    '5-3-2': {
        name: '5-3-2 Védekező',
        gk: [{ top: '90%', left: '50%' }],
        def: [{ top: '80%', left: '10%' }, { top: '85%', left: '30%' }, { top: '85%', left: '50%' }, { top: '85%', left: '70%' }, { top: '80%', left: '90%' }],
        mid: [{ top: '50%', left: '30%' }, { top: '55%', left: '50%' }, { top: '50%', left: '70%' }],
        att: [{ top: '25%', left: '40%' }, { top: '25%', left: '60%' }]
    }
};


// --- 2. ÁLLANDÓK ÉS KEZDŐ ÉRTÉKEK ---
const mainMenu = document.getElementById('main-menu');
const gameSelection = document.getElementById('game-selection');
const clubSelection = document.getElementById('club-selection');
const clubHub = document.getElementById('club-hub');
const matchScreen = document.getElementById('match-screen');
const squadScreen = document.getElementById('squad-screen'); // ÚJ

const leagueList = document.getElementById('league-list');
const savedTeamDisplay = document.getElementById('saved-team-display');
const changeTeamBtn = document.getElementById('change-team-btn');

// ÚJ ELEMEK A SQUAD SCREEN-hez
const formationSelector = document.getElementById('formation-selector');
const currentFormationDisplay = document.getElementById('current-formation');
const tacticsPitch = document.getElementById('tactics-pitch');
const playerListElement = document.getElementById('player-list');

let selectedTeam = localStorage.getItem('selectedTeam');

let homeScore = 0;
let awayScore = 0;
let matchTime = 0;
let isMatchActive = false;
const opponentTeam = "Amatőr FC"; 
let currentFormation = '4-4-2'; // Kezdő formáció


// --- 3. FÜGGVÉNYEK ---

/**
 * Frissíti a mentett csapat megjelenítését a Játék Képernyőn.
 */
function updateSavedTeamDisplay() {
    if (selectedTeam) {
        savedTeamDisplay.textContent = selectedTeam;
        changeTeamBtn.classList.remove('hidden');
    } else {
        savedTeamDisplay.textContent = "Nincs kiválasztva. Válassz Klub Csapatot!";
        changeTeamBtn.classList.add('hidden');
    }
}

/**
 * Megjeleníti a főmenüt és elrejti a többit.
 */
function showMainMenu() {
    mainMenu.classList.remove('hidden');
    gameSelection.classList.add('hidden');
    clubSelection.classList.add('hidden');
    clubHub.classList.add('hidden');
    matchScreen.classList.add('hidden');
    squadScreen.classList.add('hidden'); // ÚJ
    updateSavedTeamDisplay();
}

/**
 * Megjeleníti a játékválasztó (klub/válogatott) képernyőt.
 */
function showGameSelection() {
    mainMenu.classList.add('hidden');
    gameSelection.classList.remove('hidden');
    clubSelection.classList.add('hidden');
    clubHub.classList.add('hidden');
    matchScreen.classList.add('hidden');
    squadScreen.classList.add('hidden'); // ÚJ
    updateSavedTeamDisplay();
}

/**
 * Megjeleníti a Klubközpontot és elrejti a többit.
 */
function showClubHub() {
    if (!selectedTeam) {
        showGameSelection();
        return; 
    }
    
    mainMenu.classList.add('hidden');
    gameSelection.classList.add('hidden');
    clubSelection.classList.add('hidden');
    clubHub.classList.remove('hidden');
    matchScreen.classList.add('hidden');
    squadScreen.classList.add('hidden'); // ÚJ

    // Betöltjük a csapat adatait a Hub-ba
    document.getElementById('club-name-title').textContent = selectedTeam;
    document.getElementById('next-match-details').textContent = `${selectedTeam} következő meccse ${opponentTeam} ellen. Készülj!`;
}

/**
 * Megjeleníti a Klubválasztó képernyőt.
 */
function showClubSelection() {
    gameSelection.classList.add('hidden');
    clubSelection.classList.remove('hidden');
    clubHub.classList.add('hidden');
    matchScreen.classList.add('hidden');
    squadScreen.classList.add('hidden'); // ÚJ
    leagueList.innerHTML = '';

    for (const leagueKey in footballData) {
        const league = footballData[leagueKey];

        const title = document.createElement('h3');
        title.className = 'league-title';
        title.textContent = league.name;
        leagueList.appendChild(title);

        const teamsContainer = document.createElement('div');
        teamsContainer.style.display = 'flex';
        teamsContainer.style.flexWrap = 'wrap';

        league.teams.forEach(teamName => {
            const teamButton = document.createElement('button');
            teamButton.className = 'team-button';
            teamButton.textContent = teamName;
            teamButton.addEventListener('click', () => {
                selectTeam(teamName);
            });
            teamsContainer.appendChild(teamButton);
        });

        leagueList.appendChild(teamsContainer);
    }
}

/**
 * Csapat kiválasztása, mentése és visszatérés a Klubközpontba.
 * @param {string} teamName - A kiválasztott csapat neve.
 */
function selectTeam(teamName) {
    selectedTeam = teamName;
    localStorage.setItem('selectedTeam', teamName); 
    alert(`${teamName} sikeresen kiválasztva!`);
    showClubHub(); 
}


/**
 * Megjeleníti a Meccs Szimulációs Képernyőt.
 */
function showMatchScreen() {
    if (!selectedTeam) {
        showClubHub();
        return;
    }

    mainMenu.classList.add('hidden');
    gameSelection.classList.add('hidden');
    clubSelection.classList.add('hidden');
    clubHub.classList.add('hidden');
    matchScreen.classList.remove('hidden');
    squadScreen.classList.add('hidden'); // ÚJ
    
    // Meccs előkészítése:
    document.getElementById('match-title').textContent = `${selectedTeam} vs. ${opponentTeam}`;
    document.getElementById('home-team-score').textContent = '0';
    document.getElementById('away-team-score').textContent = '0';
    document.getElementById('match-log').innerHTML = '<p class="event-message">A meccs mindjárt kezdődik...</p>';
    document.getElementById('end-match-btn').classList.add('hidden');
    document.getElementById('next-event-btn').classList.remove('hidden');

    homeScore = 0;
    awayScore = 0;
    matchTime = 0;
    isMatchActive = true;
}

/**
 * Szimulál egy eseményt.
 */
function simulateEvent() {
    if (!isMatchActive) return;

    matchTime += 10;
    
    let message = '';
    let eventType = 'event-message';
    const log = document.getElementById('match-log');

    if (matchTime <= 90) {
        const eventChance = Math.random();

        if (eventChance < 0.2) { 
            const scoringTeam = Math.random() < 0.5 ? selectedTeam : opponentTeam;
            
            if (scoringTeam === selectedTeam) {
                homeScore++;
                document.getElementById('home-team-score').textContent = homeScore;
                message = `${matchTime}'. perc: GÓL! ${selectedTeam} lőtt! 🎉`;
            } else {
                awayScore++;
                document.getElementById('away-team-score').textContent = awayScore;
                message = `${matchTime}'. perc: GÓL! ${opponentTeam} egyenlített/vezet. 😱`;
            }
            eventType = 'event-goal';

        } else if (matchTime === 50) { 
            message = "FÉLIDŐ! Eredmény: " + homeScore + " - " + awayScore;
            eventType = 'event-whistle';
        } else if (matchTime === 90) {
            message = "VÉGE! A meccs befejeződött. Eredmény: " + homeScore + " - " + awayScore;
            eventType = 'event-whistle';
            endMatch();
        } else {
            message = `${matchTime}'. perc: A labda a középpályán pattog. Lövés fölé!`;
        }
        
    } else {
        endMatch();
        return;
    }

    const p = document.createElement('p');
    p.className = `event-message ${eventType}`;
    p.textContent = message;
    log.appendChild(p);

    log.scrollTop = log.scrollHeight;
}

/**
 * Befejezi a meccset.
 */
function endMatch() {
    isMatchActive = false;
    document.getElementById('next-event-btn').classList.add('hidden');
    document.getElementById('end-match-btn').classList.remove('hidden');
}


/**
 * Megjeleníti a Csapat Összeállítás képernyőt.
 */
function showSquadScreen() {
    if (!selectedTeam) {
        showClubHub();
        return;
    }

    mainMenu.classList.add('hidden');
    gameSelection.classList.add('hidden');
    clubSelection.classList.add('hidden');
    clubHub.classList.add('hidden');
    matchScreen.classList.add('hidden');
    squadScreen.classList.remove('hidden');
    
    // Betöltjük a jelenlegi formációt és a játékosokat
    formationSelector.value = currentFormation;
    renderFormation(currentFormation);
    renderPlayerList();
}

/**
 * Frissíti a pályát az adott formáció alapján.
 * @param {string} formationKey - A formáció kulcsa.
 */
function renderFormation(formationKey) {
    const formation = formations[formationKey];
    if (!formation) return;

    currentFormation = formationKey;
    currentFormationDisplay.textContent = formationKey;
    tacticsPitch.innerHTML = ''; 

    // Összevonjuk a pozíciókat egy könnyebben kezelhető objektumba
    const positions = {
        'K': formation.gk,
        'V': formation.def,
        'KP': formation.mid,
        'CS': formation.att
    };
    
    // Poszt nevek a pozíciókhoz
    const posNames = { 'K': 'K', 'V': 'V', 'KP': 'KP', 'CS': 'CS' };

    // Dinamikusan hozzáadjuk a pozíciós boxokat
    Object.keys(positions).forEach(posGroup => {
        const coords = positions[posGroup];
        if (coords) {
            coords.forEach((coord, index) => {
                const playerPos = document.createElement('div');
                playerPos.className = `player-position ${posGroup.toLowerCase()}`;
                playerPos.textContent = posNames[posGroup]; // Pl.: K, V, KP, CS
                playerPos.style.top = coord.top;
                playerPos.style.left = coord.left;
                playerPos.style.transform = 'translate(-50%, -50%)'; 
                playerPos.setAttribute('data-pos-key', `${posGroup}-${index}`); // Egyedi azonosító
                
                tacticsPitch.appendChild(playerPos);
            });
        }
    });
}

/**
 * Betölti az összes játékost a listába.
 */
function renderPlayerList() {
    playerListElement.innerHTML = '';
    squadPlayers.sort((a, b) => b.rating - a.rating);

    squadPlayers.forEach(player => {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.setAttribute('data-player-name', player.name);
        card.setAttribute('data-player-pos', player.pos);
        card.innerHTML = `
            <strong>${player.name}</strong> 
            (${player.pos}) Ért: ${player.rating}
        `;
        
        card.addEventListener('click', () => {
             alert(`${player.name} kiválasztva! (Később itt tudod behúzni a pályára)`);
        });

        playerListElement.appendChild(card);
    });
}


// --- 4. ESEMÉNYKEZELŐK ---

// Főmenü: Kattintás a "Játék" boxra
document.querySelector('.main-game').addEventListener('click', () => {
    if (selectedTeam) {
        showClubHub();
    } else {
        showGameSelection();
    }
});

// Játék Választó Képernyő: Vissza a főmenübe
document.getElementById('back-to-menu').addEventListener('click', showMainMenu);

// Játék Választó Képernyő: Klub Csapat opció
document.querySelector('[data-mode="club"]').addEventListener('click', showClubSelection);

// Játék Választó Képernyő: Válogatott opció (tesztelés)
document.querySelector('[data-mode="national"]').addEventListener('click', () => {
    alert("Válogatott mód fejlesztés alatt. Menjünk inkább a klubválasztóra!");
    showClubSelection();
});

// Klub Választó Képernyő: Vissza a játék választóba
document.getElementById('back-to-selection').addEventListener('click', showGameSelection);

// Csapat Változtatása Gomb (a Játékválasztón)
changeTeamBtn.addEventListener('click', showClubSelection);

// --- KLUBKÖZPONT ESEMÉNYEK ---

// KLUBKÖZPONT: Vissza a játék választóba
document.getElementById('back-to-game-selection').addEventListener('click', showGameSelection);

// KLUBKÖZPONT: Meccs Kezdése gomb
document.getElementById('start-match-btn').addEventListener('click', showMatchScreen);

// KLUBKÖZPONT: Csapat Összeállítás gomb
document.querySelector('.squad-box button').addEventListener('click', showSquadScreen);

// --- MECCSKÉPERNYŐ ESEMÉNYEK ---

// MECCSKÉPERNYŐ: Következő Esemény gomb
document.getElementById('next-event-btn').addEventListener('click', simulateEvent);

// MECCSKÉPERNYŐ: Vissza a Klubközpontba gomb
document.getElementById('end-match-btn').addEventListener('click', showClubHub);


// --- CSAPAT ÖSSZEÁLLÍTÁS ESEMÉNYEK ---

// CSAPAT ÖSSZEÁLLÍTÁS: Formációváltó
formationSelector.addEventListener('change', (e) => {
    renderFormation(e.target.value);
});

// CSAPAT ÖSSZEÁLLÍTÁS: Mentés és Vissza
document.getElementById('save-squad-btn').addEventListener('click', () => {
    alert("Formáció mentve!");
    showClubHub();
});

// CSAPAT ÖSSZEÁLLÍTÁS: Vissza a Hubba
document.getElementById('back-to-hub-from-squad').addEventListener('click', showClubHub);


// --- 5. INDÍTÁS ---

// Amikor az oldal betöltődik, megnézzük, hogy van-e mentett csapat.
if (selectedTeam) {
    showClubHub();
} else {
    showMainMenu();
}
