// --- 1. ADATMODELL: Ligák, Csapatok, Játékosok és Taktika ---

const footballData = {
    premierLeague: {
        name: "Anglia",
        flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        difficulty: 5, // 5 csillag
        teams: ["Arsenal", "Liverpool", "Manchester City", "Manchester United", "Chelsea"]
    },
    laLiga: {
        name: "Spanyolország",
        flag: "🇪🇸",
        difficulty: 4, 
        teams: ["Real Madrid", "FC Barcelona", "Atlético Madrid"]
    },
    serieA: {
        name: "Olaszország",
        flag: "🇮🇹",
        difficulty: 4, 
        teams: ["Juventus", "Inter Milan", "AC Milan"]
    },
    bundesliga: {
        name: "Németország",
        flag: "🇩🇪",
        difficulty: 4, 
        teams: ["Bayern München", "Bayer Leverkusen", "Dortmund"]
    },
    ligue1: {
        name: "Franciaország",
        flag: "🇫🇷",
        difficulty: 3, 
        teams: ["PSG", "Monaco", "Marseille"]
    },
    saudi: {
        name: "Szaúd-Arábia",
        flag: "🇸🇦",
        difficulty: 3, 
        teams: ["Al-Nassr", "Al-Hilal", "Al-Ittihad"]
    },
    brazil: {
        name: "Brazília",
        flag: "🇧🇷",
        difficulty: 3, 
        teams: ["Flamengo", "Palmeiras"]
    },
    portugal: {
        name: "Portugália",
        flag: "🇵🇹",
        difficulty: 2, 
        teams: ["Porto", "Benfica"]
    }
};

// Példa játékos adatok (Készülünk a Drag and Drop-ra)
let squadPlayers = [
    // Kezdő 11 (Kiválasztva) - Alapértelmezett 4-4-2-höz elég 11
    { id: 1, name: "Kovács (K)", pos: "K", rating: 89, currentStatus: "start", slotId: "k-0" },
    { id: 2, name: "Nagy (V)", pos: "V", rating: 88, currentStatus: "start", slotId: "v-0" },
    { id: 3, name: "Tóth (V)", pos: "V", rating: 88, currentStatus: "start", slotId: "v-1" },
    { id: 4, name: "Kiss (V)", pos: "V", rating: 89, currentStatus: "start", slotId: "v-2" },
    { id: 5, name: "Szabó (V)", pos: "V", rating: 89, currentStatus: "start", slotId: "v-3" },
    { id: 6, name: "Varga (KP)", pos: "KP", rating: 91, currentStatus: "start", slotId: "kp-0" },
    { id: 7, name: "Molnár (KP)", pos: "KP", rating: 88, currentStatus: "start", slotId: "kp-1" },
    { id: 8, name: "Papp (KP)", pos: "KP", rating: 87, currentStatus: "start", slotId: "kp-2" },
    { id: 9, name: "Juhász (KP)", pos: "KP", rating: 82, currentStatus: "start", slotId: "kp-3" },
    { id: 10, name: "Fekete (CS)", pos: "CS", rating: 81, currentStatus: "start", slotId: "cs-0" },
    { id: 11, name: "Fehér (CS)", pos: "CS", rating: 89, currentStatus: "start", slotId: "cs-1" },
    
    // Cserék (Substitute)
    { id: 12, name: "Zöld (KP)", pos: "KP", rating: 81, currentStatus: "sub", slotId: null },
    { id: 13, name: "Piros (K)", pos: "K", rating: 82, currentStatus: "sub", slotId: null },
    { id: 14, name: "Sárga (V)", pos: "V", rating: 84, currentStatus: "sub", slotId: null },
    { id: 15, name: "Barna (V)", pos: "V", rating: 81, currentStatus: "sub", slotId: null },
    { id: 16, name: "Kék (V)", pos: "V", rating: 89, currentStatus: "sub", slotId: null },
    { id: 17, name: "Lila (KP)", pos: "KP", rating: 81, currentStatus: "sub", slotId: null },
    { id: 18, name: "Fűzöld (KP)", pos: "KP", rating: 85, currentStatus: "sub", slotId: null },

    // Tartalékok (Reserve)
    { id: 19, name: "Sötétkék (V)", pos: "V", rating: 83, currentStatus: "reserve", slotId: null },
    { id: 20, name: "Narancs (CS)", pos: "CS", rating: 81, currentStatus: "reserve", slotId: null },
    { id: 21, name: "Szürke (KP)", pos: "KP", rating: 72, currentStatus: "reserve", slotId: null },
    { id: 22, name: "Bézs (V)", pos: "V", rating: 84, currentStatus: "reserve", slotId: null },
];

// Formáció adatok (koordináták a 0-100% tartományban)
const formations = {
    '4-4-2': {
        name: '4-4-2',
        gk: [{ top: '90%', left: '50%' }],
        def: [{ top: '75%', left: '15%' }, { top: '75%', left: '35%' }, { top: '75%', left: '65%' }, { top: '75%', left: '85%' }],
        mid: [{ top: '50%', left: '15%' }, { top: '50%', left: '35%' }, { top: '50%', left: '65%' }, { top: '50%', left: '85%' }],
        att: [{ top: '20%', left: '40%' }, { top: '20%', left: '60%' }]
    },
    '4-3-3': {
        name: '4-3-3',
        gk: [{ top: '90%', left: '50%' }],
        def: [{ top: '75%', left: '15%' }, { top: '80%', left: '35%' }, { top: '80%', left: '65%' }, { top: '75%', left: '85%' }],
        mid: [{ top: '60%', left: '30%' }, { top: '65%', left: '50%' }, { top: '60%', left: '70%' }],
        att: [{ top: '20%', left: '20%' }, { top: '15%', left: '50%' }, { top: '20%', left: '80%' }]
    },
    '5-3-2': {
        name: '5-3-2',
        gk: [{ top: '90%', left: '50%' }],
        def: [{ top: '80%', left: '10%' }, { top: '85%', left: '30%' }, { top: '85%', left: '50%' }, { top: '85%', left: '70%' }, { top: '80%', left: '90%' }],
        mid: [{ top: '50%', left: '30%' }, { top: '55%', left: '50%' }, { top: '50%', left: '70%' }],
        att: [{ top: '25%', left: '40%' }, { top: '25%', left: '60%' }]
    },
    '3-4-3': {
        name: '3-4-3', 
        gk: [{ top: '90%', left: '50%' }],
        def: [{ top: '75%', left: '25%' }, { top: '70%', left: '50%' }, { top: '75%', left: '75%' }],
        mid: [{ top: '50%', left: '15%' }, { top: '55%', left: '35%' }, { top: '55%', left: '65%' }, { top: '50%', left: '85%' }],
        att: [{ top: '25%', left: '15%' }, { top: '15%', left: '40%' }, { top: '15%', left: '60%' }, { top: '25%', left: '85%' }]
    }
};

// --- PÉLDA ADATOK: Pénzügyek és Igazolások ---
let clubBalance = 50000000; // $50 millió
let transferBudget = 30000000; // $30 millió
let totalSalary = 1500000; // $1.5 millió
const salaryCap = 2000000; // $2 millió

// Egyszerűsített igazolási célpontok
const marketPlayers = [
    { name: "Új Tehetség 1", pos: "KP", rating: 70, price: 5000000, wage: 15000 },
    { name: "Rutinos Csapás", pos: "CS", rating: 88, price: 45000000, wage: 100000 },
    { name: "Fiatal Védő", pos: "V", rating: 65, price: 1000000, wage: 5000 }
];


// --- 2. ÁLLANDÓK ÉS KEZDŐ ÉRTÉKEK ---
const mainMenu = document.getElementById('main-menu');
const gameSelection = document.getElementById('game-selection');
const clubSelection = document.getElementById('club-selection');
const clubHub = document.getElementById('club-hub');
const matchScreen = document.getElementById('match-screen');
const squadScreen = document.getElementById('squad-screen');
const transferScreen = document.getElementById('transfer-screen');

const leagueList = document.getElementById('league-list');
const savedTeamDisplay = document.getElementById('saved-team-display');
const changeTeamBtn = document.getElementById('change-team-btn');

// SQUAD SCREEN
const tacticsPitch = document.getElementById('tactics-pitch');
const formationSelector = document.getElementById('formation-selector');
const substituteList = document.getElementById('substitute-list');
const reserveList = document.getElementById('reserve-list');

// TRANSFER SCREEN
const currentBalanceDisplay = document.getElementById('current-balance');
const transferBudgetDisplay = document.getElementById('transfer-budget');
const salaryCapDisplay = document.getElementById('salary-cap');
const scoutList = document.getElementById('scout-list');
const sellList = document.getElementById('sell-list');
const transferLogElement = document.getElementById('transfer-log');

let selectedTeam = localStorage.getItem('selectedTeam');

let homeScore = 0;
let awayScore = 0;
let matchTime = 0;
let isMatchActive = false;
const opponentTeam = "Amatőr FC"; 
let currentFormation = '4-4-2'; // Kezdő formáció

let draggedItem = null; // Drag and Drop változó


// --- 3. FÜGGVÉNYEK ---

// --- 3.1. Képernyő Navigáció és Betöltés ---

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
    squadScreen.classList.add('hidden');
    transferScreen.classList.add('hidden');
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
    squadScreen.classList.add('hidden');
    transferScreen.classList.add('hidden');
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
    squadScreen.classList.add('hidden');
    transferScreen.classList.add('hidden');

    // Betöltjük a csapat adatait a Hub-ba
    document.getElementById('club-name-title').textContent = selectedTeam;
    document.getElementById('next-match-details').textContent = `${selectedTeam} következő meccse ${opponentTeam} ellen. Készülj!`;
}

/**
 * Megjeleníti a Klubválasztó képernyőt.
 * Frissített WSC stílusú ligalista megjelenítéssel.
 */
function showClubSelection() {
    gameSelection.classList.add('hidden');
    clubSelection.classList.remove('hidden');
    clubHub.classList.add('hidden');
    matchScreen.classList.add('hidden');
    squadScreen.classList.add('hidden');
    transferScreen.classList.add('hidden');
    leagueList.innerHTML = ''; // Kiürítjük a listát

    for (const leagueKey in footballData) {
        const league = footballData[leagueKey];

        const leagueRow = document.createElement('div');
        leagueRow.className = 'league-row';
        leagueRow.setAttribute('data-league-key', leagueKey);
        
        // Zászló, Ország neve és Nehézségi csillagok
        const infoDiv = document.createElement('div');
        infoDiv.className = 'league-info';

        // Zászló
        const flagSpan = document.createElement('span');
        flagSpan.textContent = league.flag;
        infoDiv.appendChild(flagSpan);

        // Ország neve
        const nameSpan = document.createElement('span');
        nameSpan.className = 'country-name';
        nameSpan.textContent = league.name;
        infoDiv.appendChild(nameSpan);
        
        // Csillagok generálása
        const starsDiv = document.createElement('div');
        starsDiv.className = 'difficulty-stars';
        
        const maxStars = 5;
        for (let i = 1; i <= maxStars; i++) {
            const star = document.createElement('span');
            star.textContent = '⭐';
            star.classList.add(i <= league.difficulty ? 'star-filled' : 'star-empty');
            starsDiv.appendChild(star);
        }
        infoDiv.appendChild(starsDiv);
        
        leagueRow.appendChild(infoDiv);

        // JOBB OLDALI GOMB
        const selectButton = document.createElement('button');
        selectButton.className = 'select-league-btn';
        selectButton.textContent = '»'; 
        
        // Eseménykezelő a gombra
        selectButton.addEventListener('click', (e) => {
            e.stopPropagation(); 
             // Csapatválasztás a listában lévő első csapattal (Demó)
             const firstTeam = league.teams[0]; 
             selectTeam(firstTeam); 
        });

        leagueRow.appendChild(selectButton);

        // Eseménykezelő a sorra (ugyanaz, mint a gomb)
        leagueRow.addEventListener('click', () => {
             const firstTeam = league.teams[0]; 
             selectTeam(firstTeam); 
        });

        leagueList.appendChild(leagueRow);
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
    squadScreen.classList.add('hidden');
    transferScreen.classList.add('hidden');
    
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
    transferScreen.classList.add('hidden');
    
    // Kezdő formáció betöltése
    formationSelector.value = currentFormation;
    // renderFormation hívása, amely a formációt és a listákat is létrehozza
    renderFormation(currentFormation);
    
    // D&D eseménykezelők bekapcsolása (újra, ha megváltozott a tartalom)
    addDropListeners();
}

/**
 * Megjeleníti az Átigazolási Központ képernyőt.
 */
function showTransferScreen() {
    if (!selectedTeam) {
        showClubHub();
        return;
    }

    mainMenu.classList.add('hidden');
    gameSelection.classList.add('hidden');
    clubSelection.classList.add('hidden');
    clubHub.classList.add('hidden');
    matchScreen.classList.add('hidden');
    squadScreen.classList.add('hidden');
    transferScreen.classList.remove('hidden');
    
    updateFinanceDisplays();
    renderMarketList(marketPlayers); 
    renderSellList(); 
}


// --- 3.2. Meccs Szimuláció ---

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

// --- 3.3. Taktikai Képernyő (Squad) Logika és Drag and Drop ---

/**
 * Frissíti a pályát az adott formáció alapján, és a játékosokat a slotokba helyezi.
 * @param {string} formationKey - A formáció kulcsa.
 */
function renderFormation(formationKey) {
    const formation = formations[formationKey];
    if (!formation) return;

    currentFormation = formationKey;
    tacticsPitch.innerHTML = ''; 

    const positions = {
        'K': formation.gk,
        'V': formation.def,
        'KP': formation.mid,
        'CS': formation.att
    };
    
    // Dinamikusan hozzáadjuk a pozíciós SLOT-okat
    Object.keys(positions).forEach(posGroup => {
        const coords = positions[posGroup];
        if (coords) {
            coords.forEach((coord, index) => {
                const slotId = `${posGroup.toLowerCase()}-${index}`;
                
                const playerSlot = document.createElement('div');
                playerSlot.className = `player-slot dropzone`;
                playerSlot.setAttribute('data-slot-id', slotId);
                playerSlot.setAttribute('data-pos-type', posGroup);
                playerSlot.style.top = coord.top;
                playerSlot.style.left = coord.left;
                
                // Megkeressük a játékost, aki jelenleg ebben a slotban van
                const assignedPlayer = squadPlayers.find(p => p.slotId === slotId && p.currentStatus === 'start');

                if (assignedPlayer) {
                    playerSlot.appendChild(createPlayerCard(assignedPlayer));
                }
                
                tacticsPitch.appendChild(playerSlot);
            });
        }
    });

    renderPlayerLists(); // Frissítjük a cseréket és tartalékokat is
    addDropListeners(); // Új slotokhoz adjuk a drop eseményeket
}

/**
 * Létrehoz egy vizuális játékos kártyát.
 * @param {object} player - Játékos adat objektum.
 * @param {boolean} isSub - Ha a csere/tartalék listához készül.
 * @returns {HTMLElement} A létrehozott kártya elem.
 */
function createPlayerCard(player, isSub = false) {
    const card = document.createElement('div');
    card.className = isSub ? 'sub-player-card drag-item' : 'player-card-squad drag-item';
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-player-id', player.id);
    card.setAttribute('data-player-pos', player.pos);

    card.innerHTML = `
        <span class="player-pos-label">${player.pos}</span>
        <span class="player-rating">${player.rating}</span>
        <span class="player-name-squad">${player.name}</span>
    `;
    
    addDragListeners(card);

    return card;
}

/**
 * Betölti a Cserék és Tartalékok listáját.
 */
function renderPlayerLists() {
    substituteList.innerHTML = '';
    reserveList.innerHTML = '';

    // Filterezzük és rendereljük azokat, akik még nincsenek a pályán (slotId === null)
    const subs = squadPlayers.filter(p => p.currentStatus === 'sub');
    const reserves = squadPlayers.filter(p => p.currentStatus === 'reserve');

    subs.forEach(player => {
        substituteList.appendChild(createPlayerCard(player, true));
    });

    reserves.forEach(player => {
        reserveList.appendChild(createPlayerCard(player, true));
    });
}

/**
 * Hozzáadja az eseménykezelőket a húzható elemhez.
 * @param {HTMLElement} item - A játékos kártya elem.
 */
function addDragListeners(item) {
    item.addEventListener('dragstart', (e) => {
        draggedItem = e.target;
        setTimeout(() => e.target.classList.add('dragging'), 0);
    });

    item.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
        // A draggedItem-et NE nullázzuk itt, a drop fogja kezelni
    });
}

/**
 * Hozzáadja az eseménykezelőket az ejtési zónákhoz (slotokhoz és listákhoz).
 */
function addDropListeners() {
    // 1. Pálya slotok
    const pitchSlots = document.querySelectorAll('#tactics-pitch .player-slot');
    pitchSlots.forEach(slot => addDropEventHandlers(slot));

    // 2. Csere listák (ezek a konténerek is dropzone-ok)
    addDropEventHandlers(substituteList);
    addDropEventHandlers(reserveList);
}

/**
 * Hozzáadja a drop eseményeket a konténerhez/slot-hoz.
 */
function addDropEventHandlers(container) {
    // Először távolítsuk el az esetleges régi listenereket, hogy ne duplikálódjanak
    container.removeEventListener('dragover', preventDefault);
    container.removeEventListener('drop', handleDrop);

    // Adjunk hozzá újakat
    container.addEventListener('dragover', preventDefault);
    container.addEventListener('drop', handleDrop);
}

function preventDefault(e) {
     e.preventDefault(); 
     e.dataTransfer.dropEffect = 'move';
}

/**
 * Kezeli az ejtési eseményt.
 * @param {Event} e - Az ejtési esemény.
 */
function handleDrop(e) {
    e.preventDefault();
    if (!draggedItem) return;

    let targetSlot = e.target.closest('.dropzone');
    if (!targetSlot) return; // Nem dropzone-ra ejtettünk
    
    // Annak az elemnek, akire ejtettünk (ha volt rajta kártya)
    const existingCard = targetSlot.querySelector('.drag-item');
    
    const draggedPlayerId = parseInt(draggedItem.getAttribute('data-player-id'));
    const draggedPlayer = squadPlayers.find(p => p.id === draggedPlayerId);
    
    // Mentjük az eredeti helyzetet
    const originalStatus = draggedPlayer.currentStatus;
    const originalSlotId = draggedPlayer.slotId;
    
    // Frissítjük a húzott játékos helyzetét
    let newStatus, newSlotId;
    
    if (targetSlot.classList.contains('player-slot')) {
        // --- Ejtés a Pálya slotba (Kezdő 11-be) ---
        newStatus = 'start';
        newSlotId = targetSlot.getAttribute('data-slot-id');
    } else {
        // --- Ejtés a Csere/Tartalék listába ---
        newStatus = targetSlot.getAttribute('data-status-type'); // 'sub' vagy 'reserve'
        newSlotId = null; 
    }

    // 1. Frissítjük a húzott játékos (draggedPlayer) helyét
    draggedPlayer.currentStatus = newStatus;
    draggedPlayer.slotId = newSlotId;

    if (existingCard) {
        // 2. Cserélünk: Frissítjük az ejtési zónán lévő játékos (existingPlayer) helyét
        const existingPlayerId = parseInt(existingCard.getAttribute('data-player-id'));
        const existingPlayer = squadPlayers.find(p => p.id === existingPlayerId);
        
        // Az eredeti helyére kerül, ahonnan a húzott játékos jött
        existingPlayer.currentStatus = originalStatus;
        existingPlayer.slotId = originalSlotId;
    }
    
    // 3. Végül újrarajzoljuk az egészet
    renderFormation(currentFormation);
    addDropListeners(); // Új slotokhoz újra adjuk a listenereket

    draggedItem = null; // Befejeztük a műveletet
}


// --- 3.4. Átigazolási Központ Logika ---

/**
 * Frissíti a pénzügyi kijelzőket a tetején.
 */
function updateFinanceDisplays() {
    // Formázás: $X.XXX.XXX
    const formatMoney = (amount) => {
        return '$' + amount.toLocaleString('en-US');
    }

    currentBalanceDisplay.textContent = formatMoney(clubBalance);
    transferBudgetDisplay.textContent = formatMoney(transferBudget);
    salaryCapDisplay.textContent = `${formatMoney(totalSalary)} / ${formatMoney(salaryCap)}`;
    
    // Színkódolás a pénznek
    currentBalanceDisplay.classList.toggle('positive', clubBalance > 0);
    currentBalanceDisplay.classList.toggle('negative', clubBalance < 0);
}

/**
 * Megjeleníti az igazolási célpontokat a listában.
 */
function renderMarketList(players) {
    scoutList.innerHTML = '';

    if (players.length === 0) {
        scoutList.innerHTML = '<p class="placeholder-text">Jelenleg nincs játékos a piacon. Próbálja meg újra felkutatni a piacot.</p>';
        return;
    }

    players.forEach(player => {
        const card = document.createElement('div');
        card.className = 'transfer-player-card';
        card.innerHTML = `
            <strong>${player.name}</strong> (${player.pos}, Ért: ${player.rating})<br>
            Ár: <span class="money positive">${(player.price/1000000).toFixed(1)}M</span> | 
            Fizetés: <span class="money">${(player.wage/1000).toFixed(0)}k/hét</span>
        `;
        
        card.addEventListener('click', () => {
             alert(`Játékos ajánlattétel: ${player.name} - ${player.price} értékben. (Placeholder)`);
             // Később itt hívnánk meg a buyPlayer() logikát
        });

        scoutList.appendChild(card);
    });
}

/**
 * Megjeleníti a saját játékosainkat eladásra.
 */
function renderSellList() {
    sellList.innerHTML = '';
    
    if (squadPlayers.length === 0) {
        sellList.innerHTML = '<p class="placeholder-text">A kereted üres.</p>';
        return;
    }

    squadPlayers.forEach(player => {
        const estimatedValue = player.rating * 100000; // Egyszerű becslés
        
        const card = document.createElement('div');
        card.className = 'transfer-player-card';
        card.innerHTML = `
            <strong>${player.name}</strong> (${player.pos})<br>
            Becsült Eladási Ár: <span class="money positive">${(estimatedValue/1000000).toFixed(1)}M</span>
        `;
        
        card.addEventListener('click', () => {
             alert(`Játékos eladás felkínálása: ${player.name} - Becsült ár: ${estimatedValue}. (Placeholder)`);
             // Később itt hívnánk meg a sellPlayer() logikát
        });

        sellList.appendChild(card);
    });
}

/**
 * Keresés indítása a piacon (Placeholder).
 */
function searchMarket() {
    transferLogElement.innerHTML += `<p>${new Date().toLocaleTimeString()}: Piac felkutatása elindítva. (Később ez időbe telik)</p>`;
    alert("Új játékosok keresése a piacon...");
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

// Klub Választó Képernyő (WSC): Vissza a játék választóba
document.getElementById('back-to-selection-wsc').addEventListener('click', showGameSelection);

// Csapat Változtatása Gomb (a Játékválasztón)
changeTeamBtn.addEventListener('click', showClubSelection);

// --- KLUBKÖZPONT ESEMÉNYEK ---

// KLUBKÖZPONT: Vissza a játék választóba
document.getElementById('back-to-game-selection').addEventListener('click', showGameSelection);

// KLUBKÖZPONT: Meccs Kezdése gomb
document.getElementById('start-match-btn').addEventListener('click', showMatchScreen);

// KLUBKÖZPONT: Csapat Összeállítás gomb
document.querySelector('.squad-box button').addEventListener('click', showSquadScreen);

// KLUBKÖZPONT: Igazolások gomb
document.querySelector('.transfer-box.incoming').addEventListener('click', showTransferScreen);

// KLUBKÖZPONT: Távozók gomb
document.querySelector('.transfer-box.outgoing').addEventListener('click', showTransferScreen);

// --- MECCSKÉPERNYŐ ESEMÉNYEK ---

// MECCSKÉPERNYŐ: Következő Esemény gomb
document.getElementById('next-event-btn').addEventListener('click', simulateEvent);

// MECCSKÉPERNYŐ: Vissza a Klubközpontba gomb
document.getElementById('end-match-btn').addEventListener('click', showClubHub);


// --- CSAPAT ÖSSZEÁLLÍTÁS ESEMÉNYEK ---

// A VISSZA gomb a fejlécben van
document.getElementById('back-to-hub-from-squad-header').addEventListener('click', showClubHub);

// Formációváltó
formationSelector.addEventListener('change', (e) => {
    renderFormation(e.target.value);
    // addDropListeners automatikusan hívódik a renderFormation-ből
});

// --- ÁTIGAZOLÁSI KÖZPONT ESEMÉNYEK ---

// Piac Felkutatása gomb
document.getElementById('search-market-btn').addEventListener('click', searchMarket);

// Vissza a Hubba
document.getElementById('back-to-hub-from-transfer').addEventListener('click', showClubHub);

// Játékos Eladása gomb (Placeholder)
document.getElementById('sell-player-btn').addEventListener('click', () => {
    alert("Játékos eladás felkínálása elindult.");
});


// --- 5. INDÍTÁS ---

// Amikor az oldal betöltődik, megnézzük, hogy van-e mentett csapat.
if (selectedTeam) {
    showClubHub();
} else {
    showMainMenu();
}
