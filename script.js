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
const clubHub = document.getElementById('club-hub'); // ÚJ

const leagueList = document.getElementById('league-list');
const savedTeamDisplay = document.getElementById('saved-team-display');
const changeTeamBtn = document.getElementById('change-team-btn');

let selectedTeam = localStorage.getItem('selectedTeam'); // Betöltés a LocalStorage-ból

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

    // Betöltjük a csapat adatait a Hub-ba
    document.getElementById('club-name-title').textContent = selectedTeam;
    // (A logó betöltése és a meccs infó frissítése itt történne valós adatból)
    document.getElementById('next-match-details').textContent = `${selectedTeam} következő meccse a Liga ellen. Készülj!`;
}

/**
 * Generálja és megjeleníti a klubválasztó listát (Ligák és Csapatok).
 */
function showClubSelection() {
    gameSelection.classList.add('hidden');
    clubSelection.classList.remove('hidden');
    clubHub.classList.add('hidden');
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


// --- 4. ESEMÉNYKEZELŐK ---

// Főmenü: Kattintás a "Játék" boxra (a nagy zöldre)
document.querySelector('.main-game').addEventListener('click', () => {
    if (selectedTeam) {
        // Ha VAN mentett csapat, egyből a Hub-ba dobja
        showClubHub();
    } else {
        // Ha NINCS mentett csapat, játék/klub választásra dobja
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

// --- 5. INDÍTÁS ---

// Amikor az oldal betöltődik, megnézzük, hogy van-e mentett csapat.
if (selectedTeam) {
    showClubHub();
} else {
    showMainMenu();
}
