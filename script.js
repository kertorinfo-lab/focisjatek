// --- 1. ADATMODELL: Ligák és Csapatok ---
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

// --- 2. ÁLLANDÓK ÉS KEZDŐ ÉRTÉKEK ---
const mainMenu = document.getElementById('main-menu');
const gameSelection = document.getElementById('game-selection');
const clubSelection = document.getElementById('club-selection');
const clubHub = document.getElementById('club-hub');
const matchScreen = document.getElementById('match-screen'); // ÚJ

const leagueList = document.getElementById('league-list');
const savedTeamDisplay = document.getElementById('saved-team-display');
const changeTeamBtn = document.getElementById('change-team-btn');

let selectedTeam = localStorage.getItem('selectedTeam');

let homeScore = 0;
let awayScore = 0;
let matchTime = 0;
let isMatchActive = false;
const opponentTeam = "Amatőr FC"; // Egyszerű ellenfél placeholder


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
    matchScreen.classList.add('hidden'); // ÚJ
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
    matchScreen.classList.add('hidden'); // ÚJ
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
    matchScreen.classList.add('hidden'); // ÚJ

    // Betöltjük a csapat adatait a Hub-ba
    document.getElementById('club-name-title').textContent = selectedTeam;
    document.getElementById('next-match-details').textContent = `${selectedTeam} következő meccse ${opponentTeam} ellen. Készülj!`;
}

/**
 * Generálja és megjeleníti a klubválasztó listát (Ligák és Csapatok).
 */
function showClubSelection() {
    gameSelection.classList.add('hidden');
    clubSelection.classList.remove('hidden');
    clubHub.classList.add('hidden');
    matchScreen.classList.add('hidden'); // ÚJ
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
    localStorage.setItem('selectedTeam', teamName); // Mentés a LocalStorage-ba
    alert(`${teamName} sikeresen kiválasztva!`);
    showClubHub(); // Vissza a Klubközpontba
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
 * Szimulál egy eseményt (gól, félidő, befejezés).
 */
function simulateEvent() {
    if (!isMatchActive) return;

    // Minden eseménynél növeljük az időt.
    matchTime += 10;
    
    let message = '';
    let eventType = 'event-message';
    const log = document.getElementById('match-log');

    if (matchTime <= 90) {
        // --- Eseménygenerálás (Egyszerű Random Logika) ---
        const eventChance = Math.random();

        if (eventChance < 0.2) { // 20% esély a gólra
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

        } else if (matchTime === 40 || matchTime === 80) {
            // Módosítottam 40 és 80 percre, hogy elkerüljük a 45 és 90 perces ütközést.
             message = `${matchTime}'. perc: Játékvezetői döntés. Csere!`;
        } else if (matchTime === 50) { // A szimuláció félideje 50-nél van, a 90-es mező a vége.
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
        // Ha túlléptük a 90 percet (ha valaki mégis kattint), vége.
        endMatch();
        return;
    }

    // Üzenet hozzáadása a loghoz
    const p = document.createElement('p');
    p.className = `event-message ${eventType}`;
    p.textContent = message;
    log.appendChild(p);

    // Görgetés az aljára
    log.scrollTop = log.scrollHeight;
}

/**
 * Befejezi a meccset és mutatja a Vissza gombot.
 */
function endMatch() {
    isMatchActive = false;
    document.getElementById('next-event-btn').classList.add('hidden');
    document.getElementById('end-match-btn').classList.remove('hidden');
}


// --- 4. ESEMÉNYKEZELŐK ---

// Főmenü: Kattintás a "Játék" boxra (a nagy zöldre)
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

// Klubközpont: Vissza a játék választóba
document.getElementById('back-to-game-selection').addEventListener('click', showGameSelection);

// Csapat Változtatása Gomb (a Játékválasztón)
changeTeamBtn.addEventListener('click', showClubSelection);

// KLUBKÖZPONT: Meccs Kezdése gomb
document.getElementById('start-match-btn').addEventListener('click', showMatchScreen);

// MECCSKÉPERNYŐ: Következő Esemény gomb
document.getElementById('next-event-btn').addEventListener('click', simulateEvent);

// MECCSKÉPERNYŐ: Vissza a Klubközpontba gomb
document.getElementById('end-match-btn').addEventListener('click', showClubHub);


// --- 5. INDÍTÁS ---

// Amikor az oldal betöltődik, megnézzük, hogy van-e mentett csapat.
if (selectedTeam) {
    showClubHub();
} else {
    showMainMenu();
}
