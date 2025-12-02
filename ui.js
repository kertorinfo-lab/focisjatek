/**
 * ui.js
 * Ez a modul felelős a teljes felhasználói felület (UI) megjelenítéséért és frissítéséért.
 * NEM TARTALMAZ játéklogikát vagy eseménykezelést. Csak adatokat kap, és azokat jeleníti meg.
 * A körkörös függőség elkerülése érdekében NEM IMPORTÁL a state.js fájlból.
 */

// --- IMPORTÁLT MODULOK ---
import { getLeagueData, getTeamData, getFilteredPlayers } from './data.js';
import { LEAGUES } from './leagues.js';
import { NATIONALITIES } from './nationalities.js';

// --- MODUL SZINTŰ VÁLTOZÓK ---
let mainMenu, characterCreator, mainHub;
let allScreens, allNavButtons;
let currentStep = 0;
let displayedCountry = null;
let displayedLeagueName = null;

// Ezt a függvényt a main.js hívja meg az induláskor
export function initUIElements() {
    mainMenu = document.getElementById('mainMenu');
    characterCreator = document.getElementById('characterCreator');
    mainHub = document.getElementById('mainHub');
    allScreens = document.querySelectorAll('.screen');
    allNavButtons = document.querySelectorAll('.nav-btn');
}

// --- FŐ KÉPERNYŐK KEZELÉSE ---

export function showScreen(targetScreenId, gameState) {
    allScreens.forEach(screen => screen.classList.add('hidden'));
    const targetScreen = document.getElementById(targetScreenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
    }
    updateNavButtons(targetScreenId);

    // Képernyő-specifikus frissítések, ha szükséges
    if (gameState) {
        if (targetScreenId === 'globalTransferScreen') {
            populateTransferMarket(gameState);
        }
        if (targetScreenId === 'squadScreen') {
            updateSquadScreen(gameState);
        }
        if (targetScreenId === 'profileScreen') {
            updateProfileUI(gameState);
        }
    }
}

export function showMainMenu() {
    mainMenu.classList.remove('hidden');
    characterCreator.classList.add('hidden');
    mainHub.classList.add('hidden');
}

export function showMainHub(gameState) {
    document.querySelectorAll('.overlay, .character-creator-container, .main-menu-container').forEach(o => o.classList.add('hidden'));
    mainHub.classList.remove('hidden');

    const leagueData = getLeagueData(gameState.leagueName);
    displayedCountry = leagueData.country;
    displayedLeagueName = gameState.leagueName;

    updateUI(gameState);
}

// --- KARAKTERKÉSZÍTŐ ---

export function initializeCharacterCreator() {
    mainMenu.classList.add('hidden');
    characterCreator.classList.remove('hidden');
    currentStep = 0;
    updateCarousel();

    const nationalityOptions = document.getElementById('nationalityOptions');
    nationalityOptions.innerHTML = '';
    for (const code in NATIONALITIES) {
        const nation = NATIONALITIES[code];
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.dataset.value = code;
        optionDiv.innerHTML = `<img src="${nation.flag}" alt="${nation.name} zászló"><span>${nation.name}</span>`;
        nationalityOptions.appendChild(optionDiv);
    }

    const leagueSelectGrid = document.getElementById('leagueSelectGrid');
    leagueSelectGrid.innerHTML = '';
    for (const country in LEAGUES) {
        for (const leagueName in LEAGUES[country]) {
            if (LEAGUES[country][leagueName].tier === 1) {
                const button = document.createElement('button');
                button.className = 'league-select-btn';
                button.textContent = leagueName;
                button.dataset.league = leagueName;
                leagueSelectGrid.appendChild(button);
            }
        }
    }
}

export function updateCarousel(step) {
    currentStep = step;
    const formCarousel = document.getElementById('formCarousel');
    formCarousel.style.transform = `translateX(-${currentStep * 100}%)`;
}

export function generateContractOffers(selectedLeagueName) {
    const offersContainer = document.getElementById('contractOffersContainer');
    offersContainer.innerHTML = '';

    const leagueData = getLeagueData(selectedLeagueName);
    if (!leagueData) return;

    const leagueTeams = leagueData.teams;
    const smallTeams = leagueTeams.filter(t => t.strength <= 75);
    const teamPool = smallTeams.length >= 2 ? smallTeams : leagueTeams;

    const offers = new Set();
    while (offers.size < 2 && offers.size < teamPool.length) {
        const team = teamPool[Math.floor(Math.random() * teamPool.length)];
        offers.add(team);
    }

    showOffers(Array.from(offers));
}

function showOffers(offers) {
    const offersContainer = document.getElementById('contractOffersContainer');
    offers.forEach(team => {
        const teamOfferCard = document.createElement('div');
        teamOfferCard.className = 'contract-offer-card';
        teamOfferCard.innerHTML = `
            <img src="${team.logo}" alt="${team.name} logó">
            <h3>${team.name}</h3>
            <p><strong>Fizetés:</strong> €15.000 /hét</p>
            <button class="button submit-btn accept-offer-btn" data-team='${JSON.stringify(team)}'>Szerződés aláírása</button>
        `;
        offersContainer.appendChild(teamOfferCard);
    });
}

// --- UI FRISSÍTŐ FÜGGVÉNYEK ---

function updateUI(gameState) {
    if (!gameState || Object.keys(gameState).length === 0) return;
    updateHeaderUI(gameState);
    updateDashboardUI(gameState);
    updateLeagueTable(gameState);
    // A többi képernyő frissítése akkor történik, amikor aktívvá válnak
}

/**
 * Frissíti a meccs eredményét a UI-n. Ezt hívja meg az events.js a meccs lejátszása után.
 * @param {object} matchResult - A lejátszott mérkőzés eredményadatait tartalmazó objektum.
 */
export function showMatchResultUI(matchResult) { // <-- IDE KERÜLT AZ EXPORTÁLT FÜGGVÉNY!
    // Ezt a részt ki kell egészítened a tényleges HTML manipulációval, 
    // hogy megjelenítsd a meccs eredményeit (pl. egy felugró ablakban).
    
    console.log("Mérkőzés eredménye megjelenítve:", matchResult); // Konzol log a teszteléshez

    // Példa: Ha van egy modálod az eredményekhez:
    const resultModal = document.getElementById('matchResultModal');
    const resultText = document.getElementById('matchResultText');

    if (resultText) {
        resultText.innerHTML = `
            <h2>${matchResult.homeTeam} ${matchResult.homeScore} - ${matchResult.awayScore} ${matchResult.awayTeam}</h2>
            <p>A mérkőzés lejátszva!</p>
        `;
    }
    if (resultModal) {
        // resultModal.classList.remove('hidden'); // Modál megjelenítése
    }
}


function updateNavButtons(activeScreenId) {
    allNavButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.screen === activeScreenId);
    });
}

export function displaySaveSlots(allSaves) {
    const container = document.getElementById('saveSlotsContainer');
    container.innerHTML = allSaves.length === 0 ? '<p style="text-align: center; color: var(--text-muted);">Nincsenek mentett játékok.</p>' : '';

    allSaves.forEach(save => {
        const slot = document.createElement('div');
        slot.className = 'save-slot';
        slot.dataset.id = save.id;
        const teamData = getTeamData(save.team.name);
        const teamLogo = teamData ? teamData.logo : 'https://placehold.co/40x40/cccccc/000000?text=?';

        slot.innerHTML = `
            <div class="save-slot-content">
                <img src="${teamLogo}" alt="${save.team.name}">
                <div class="save-slot-info">
                    <h4>${save.playerName}</h4>
                    <p>${save.team.name} - ${save.leagueName}</p>
                </div>
            </div>
            <button class="delete-save-btn" data-id="${save.id}">&times;</button>
        `;
        container.appendChild(slot);
    });
}

function updateHeaderUI(gameState) {
    document.getElementById('headerPlayerName').textContent = gameState.playerName;
    document.getElementById('headerPlayerMoney').textContent = (gameState.money || 0).toLocaleString();
    document.getElementById('headerPlayerCoins').textContent = (gameState.coins || 0).toLocaleString();
}

function updateDashboardUI(gameState) {
    document.getElementById('hubPlayerName').textContent = gameState.playerName;
    document.getElementById('hubPlayerTeamName').textContent = gameState.team.name;
    document.getElementById('hubPlayerTeamLogo').src = gameState.team.logo;
    document.getElementById('hubPlayerRating').textContent = gameState.rating;
    document.getElementById('hubPlayerAge').textContent = gameState.age;

    if (gameState.schedule && gameState.schedule[gameState.currentMatchday]) {
        const nextFixture = gameState.schedule[gameState.currentMatchday].find(f => f.home === gameState.team.name || f.away === gameState.team.name);
        document.getElementById('hubNextOpponent').textContent = nextFixture ? (nextFixture.home === gameState.team.name ? nextFixture.away : nextFixture.home) : "Pihenőhét";
    }

    const playerTeamRow = [...gameState.league].sort((a, b) => b.points - a.points || (b.gd - a.gd)).findIndex(t => t.name === gameState.team.name) + 1;
    document.getElementById('hubLeaguePosition').textContent = playerTeamRow > 0 ? `${playerTeamRow}.` : '-';
    document.getElementById('hubMatchday').textContent = `Forduló: ${gameState.currentMatchday} / ${gameState.schedule.length}`;
}

function updateSquadScreen(gameState) {
    if (!gameState.team.players) return;
    document.getElementById('squadTeamName').textContent = `${gameState.team.name} - Felállás`;
    const formation = {
        goalkeeper: document.getElementById('formation-goalkeeper'),
        defenders: document.getElementById('formation-defenders'),
        midfielders: document.getElementById('formation-midfielders'),
        forwards: document.getElementById('formation-forwards'),
    };
    Object.values(formation).forEach(el => el.innerHTML = '');

    gameState.team.players.forEach(player => {
        let container;
        if (player.position === 'K') container = formation.goalkeeper;
        else if (player.position === 'V') container = formation.defenders;
        else if (player.position === 'KP') container = formation.midfielders;
        else if (player.position === 'CS') container = formation.forwards;

        if (container) {
            const playerDiv = document.createElement('div');
            playerDiv.className = `squad-player ${player.isUser ? 'user-player' : ''}`;
            playerDiv.innerHTML = `
                <div class="squad-player-jersey">
                    <i class="fas fa-tshirt"></i>
                    <span class="squad-player-rating">${player.rating}</span>
                </div>
                <div class="squad-player-name">${player.name.split(' ').pop()}</div>`;
            container.appendChild(playerDiv);
        }
    });
}

function updateLeagueTable(gameState) {
    const tableBody = document.getElementById('leagueTableBody');
    document.getElementById('leagueTitle').textContent = displayedLeagueName;
    const leagueData = getLeagueData(displayedLeagueName);
    if (!tableBody || !leagueData) return;

    const leagueTeams = leagueData.teams;
    const sortedLeague = [...(gameState.league || [])].sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
    tableBody.innerHTML = '';

    sortedLeague.forEach((team, index) => {
        const teamData = leagueTeams.find(t => t.name === team.name);
        const row = tableBody.insertRow();
        row.className = team.name === gameState.team.name ? 'player-team' : '';
        
        let posClass = '';
        if (index < 4) posClass = 'pos-cl';
        else if (index === 4) posClass = 'pos-el';
        else if (index >= sortedLeague.length - 3) posClass = 'pos-rel';

        row.innerHTML = `
            <td><span class="position-indicator ${posClass}"></span>${index + 1}</td>
            <td class="team-name-cell"><img src="${teamData?.logo || ''}" class="team-logo-small">${team.name}</td>
            <td class="hide-on-mobile">${team.played}</td>
            <td class="hide-on-mobile">${team.wins}</td>
            <td class="hide-on-mobile">${team.draws}</td>
            <td class="hide-on-mobile">${team.losses}</td>
            <td>${team.gd}</td>
            <td><strong>${team.points}</strong></td>`;
    });
}

function updateProfileUI(gameState) {
    document.getElementById('profilePlayerName').textContent = `${gameState.playerName} Profilja`;
    document.getElementById('profileGoals').textContent = gameState.goals || 0;
    document.getElementById('profileAssists').textContent = gameState.assists || 0;
    document.getElementById('profileMatches').textContent = gameState.matchesPlayed || 0;
    document.getElementById('profileTrophies').textContent = (gameState.trophies || []).length;
}

function populateTransferMarket() {
    const resultsContainer = document.getElementById('transferMarketResults');
    const nameFilter = document.getElementById('playerNameSearch').value;
    const posFilter = document.getElementById('positionFilter').value;
    const players = getFilteredPlayers(nameFilter, posFilter);

    resultsContainer.innerHTML = '';
    if (players.length === 0) {
        resultsContainer.innerHTML = '<p class="text-muted">Nincs a keresésnek megfelelő játékos.</p>';
        return;
    }

    players.slice(0, 50).forEach(player => { // Limit to 50 results for performance
        const playerCard = document.createElement('div');
        playerCard.className = 'transfer-player-card';
        // ... Implement player card HTML ...
        resultsContainer.appendChild(playerCard);
    });
}

// --- MODAL DIALOG ---
let confirmCallback = null;
export function showConfirmationModal(text, onConfirm) {
    const modal = document.getElementById('confirmationModalOverlay');
    document.getElementById('confirmationModalText').textContent = text;
    confirmCallback = onConfirm;
    modal.classList.remove('hidden');
}

export function hideConfirmationModal() {
    document.getElementById('confirmationModalOverlay').classList.add('hidden');
    confirmCallback = null;
}

export function getConfirmCallback() {
    return confirmCallback;
}
