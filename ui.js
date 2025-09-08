import { gameState, getAllSaves, deleteSave, loadSelectedGame, startNewGame, updateGameState, saveCurrentGame } from './state.js';
import { getLeagueData, getTeamData, formatValue, getFilteredPlayers, getCountryLeagues } from './data.js';
import { playNextMatch } from './match.js';

// --- UI LOGIKA ---

// Modul szintű változók
let mainMenu, characterCreator, mainHub;
let allScreens, allNavButtons;
let selectedLeagueName = null;
let selectedNationality = 'hu';
let displayedCountry = null;
let displayedLeagueName = null;
let currentStep = 0;

// Ezt a függvényt a main.js hívja meg, miután minden betöltődött
export function initUIElements() {
    mainMenu = document.getElementById('mainMenu');
    characterCreator = document.getElementById('characterCreator');
    mainHub = document.getElementById('mainHub');
    allScreens = document.querySelectorAll('.screen');
    allNavButtons = document.querySelectorAll('.nav-btn');

    initEventListeners();
}

function showScreen(targetScreenId) {
    allScreens.forEach(screen => screen.classList.add('hidden'));
    const targetScreen = document.getElementById(targetScreenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
    }
    updateNavButtons(targetScreenId);

    if (targetScreenId === 'globalTransferScreen') {
        populateTransferMarket();
    }
    if (targetScreenId === 'squadScreen') {
        updateSquadScreen();
    }
}

export function showMainMenu() {
    mainMenu.classList.remove('hidden');
    characterCreator.classList.add('hidden');
    mainHub.classList.add('hidden');
    displaySaveSlots();
}

export function showMainHub() {
    document.querySelectorAll('.overlay, .character-creator-container, .main-menu-container').forEach(o => o.classList.add('hidden'));
    mainHub.classList.remove('hidden');

    const leagueData = getLeagueData(gameState.leagueName);
    displayedCountry = leagueData.country;
    displayedLeagueName = gameState.leagueName;

    updateUI();
}

function updateUI() {
    if (!gameState || Object.keys(gameState).length === 0) return;
    updateHeaderUI();
    updateDashboardUI();
    updateLeagueTable();
    updateProfileUI();
    updateTransferUI();
    updateSquadScreen();
    if (!document.getElementById('globalTransferScreen').classList.contains('hidden')) {
        populateTransferMarket();
    }
}

function updateNavButtons(activeScreenId) {
    allNavButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.screen === activeScreenId);
    });
}

// Karakterkészítő és menük logikája
function initializeCharacterCreator() {
    mainMenu.classList.add('hidden');
    characterCreator.classList.remove('hidden');
    currentStep = 0;
    updateCarousel();

    const nationalityOptions = document.getElementById('nationalityOptions');
    nationalityOptions.innerHTML = '';
    for (const code in window.NATIONALITIES) {
        const nation = window.NATIONALITIES[code];
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.dataset.value = code;
        optionDiv.innerHTML = `<img src="${nation.flag}" alt="${nation.name} zászló"><span>${nation.name}</span>`;
        nationalityOptions.appendChild(optionDiv);
    }

    const leagueSelectGrid = document.getElementById('leagueSelectGrid');
    leagueSelectGrid.innerHTML = '';
    for (const country in window.LEAGUES) {
        for (const leagueName in window.LEAGUES[country]) {
            if (window.LEAGUES[country][leagueName].tier === 1) {
                const button = document.createElement('button');
                button.className = 'league-select-btn';
                button.textContent = leagueName;
                button.dataset.league = leagueName;
                leagueSelectGrid.appendChild(button);
            }
        }
    }
}

function updateCarousel() {
    const formCarousel = document.getElementById('formCarousel');
    formCarousel.style.transform = `translateX(-${currentStep * 100}%)`;
}

function generateContractOffers() {
    const offersContainer = document.getElementById('contractOffersContainer');
    offersContainer.innerHTML = '';

    const leagueData = getLeagueData(selectedLeagueName);
    if (!leagueData) return;
    const leagueTeams = leagueData.teams;
    const smallTeams = leagueTeams.filter(t => t.strength <= 75);

    const offers = [];
    const chosenTeams = new Set();
    while (offers.length < 2 && chosenTeams.size < leagueTeams.length) {
        const teamPool = smallTeams.length >= 2 ? smallTeams : leagueTeams;
        const team = teamPool[Math.floor(Math.random() * teamPool.length)];
        if (!chosenTeams.has(team.name)) {
            chosenTeams.add(team.name);
            offers.push(team);
        }
    }
    showOffers(offers);
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


function displaySaveSlots() {
    const container = document.getElementById('saveSlotsContainer');
    const allSaves = getAllSaves();
    container.innerHTML = allSaves.length === 0 ? '<p style="text-align: center; color: var(--text-muted);">Nincsenek mentett játékok.</p>' : '';

    allSaves.forEach(save => {
        const slot = document.createElement('div');
        slot.className = 'save-slot';
        slot.dataset.id = save.id;

        const teamData = getTeamData(save.team.name);
        const teamLogo = teamData ? teamData.logo : 'https://placehold.co/40x40/cccccc/000000?text=?';

        slot.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem; text-align: left;">
                <img src="${teamLogo}" alt="${save.team.name}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: contain;">
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

// ... a többi UI frissítő függvény (updateHeaderUI, updateDashboardUI, stb.) ...
function updateHeaderUI() {
    document.getElementById('headerPlayerName').textContent = gameState.playerName;
    document.getElementById('headerPlayerMoney').textContent = (gameState.money || 0).toLocaleString();
    document.getElementById('headerPlayerCoins').textContent = (gameState.coins || 0).toLocaleString();
}

function updateDashboardUI() {
    document.getElementById('hubPlayerName').textContent = gameState.playerName;
    document.getElementById('hubPlayerTeamName').textContent = gameState.team.name;
    document.getElementById('hubPlayerTeamLogo').src = gameState.team.logo;
    document.getElementById('hubPlayerRating').textContent = gameState.rating;
    document.getElementById('hubPlayerAge').textContent = gameState.age;

    if (gameState.schedule && gameState.schedule[gameState.currentMatchday]) {
        const nextFixture = gameState.schedule[gameState.currentMatchday].find(f => f.home === gameState.team.name || f.away === gameState.team.name);
        if (nextFixture) {
            document.getElementById('hubNextOpponent').textContent = nextFixture.home === gameState.team.name ? nextFixture.away : nextFixture.home;
        } else {
            document.getElementById('hubNextOpponent').textContent = "Pihenőhét";
        }
    }

    const playerTeamRow = [...gameState.league].sort((a, b) => b.points - a.points || (b.gd - a.gd)).findIndex(t => t.name === gameState.team.name) + 1;
    document.getElementById('hubLeaguePosition').textContent = playerTeamRow > 0 ? `${playerTeamRow}.` : '-';
    document.getElementById('hubMatchday').textContent = `Forduló: ${gameState.currentMatchday} / ${gameState.schedule.length}`;
}

function updateSquadScreen() {
    if (!gameState || !gameState.team || !gameState.team.players) return;

    document.getElementById('squadTeamName').textContent = `${gameState.team.name} - Felállás`;

    const formation = {
        'goalkeeper': document.getElementById('formation-goalkeeper'),
        'defenders': document.getElementById('formation-defenders'),
        'midfielders': document.getElementById('formation-midfielders'),
        'forwards': document.getElementById('formation-forwards'),
    };

    Object.values(formation).forEach(el => el.innerHTML = '');

    const playersByPos = {
        'K': [],
        'V': [],
        'KP': [],
        'CS': []
    };
    gameState.team.players.forEach(p => {
        if (p && playersByPos[p.position]) {
            playersByPos[p.position].push(p);
        }
    });

    const appendPlayer = (player, container) => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'squad-player';
        if (player.isUser) {
            playerDiv.classList.add('user-player');
        }
        playerDiv.innerHTML = `
            <div class="squad-player-jersey">
                <i class="fas fa-tshirt"></i>
                <span class="squad-player-rating">${player.rating}</span>
            </div>
            <div class="squad-player-name">${player.name.split(' ').pop()}</div>
        `;
        container.appendChild(playerDiv);
    };

    playersByPos['K'].forEach(p => appendPlayer(p, formation.goalkeeper));
    playersByPos['V'].forEach(p => appendPlayer(p, formation.defenders));
    playersByPos['KP'].forEach(p => appendPlayer(p, formation.midfielders));
    playersByPos['CS'].forEach(p => appendPlayer(p, formation.forwards));
}

function updateLeagueTable() {
    const tableBody = document.getElementById('leagueTableBody');
    const leagueTitle = document.getElementById('leagueTitle');
    if (!tableBody || !displayedLeagueName) return;

    leagueTitle.textContent = displayedLeagueName;

    const leagueData = getLeagueData(displayedLeagueName);
    if (!leagueData) return;
    const leagueTeams = leagueData.teams;

    tableBody.innerHTML = '';
    const leagueClone = [...(gameState.league || [])];
    leagueClone.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);

    leagueClone.forEach((team, index) => {
        const teamData = leagueTeams.find(t => t.name === team.name);
        const row = document.createElement('tr');
        row.className = 'league-table-row';
        if (team.name === gameState.team.name) row.classList.add('player-team');

        let posClass = '';
        if (index < 4) posClass = 'pos-cl';
        else if (index === 4) posClass = 'pos-el';
        else if (index >= leagueClone.length - 3) posClass = 'pos-rel';

        row.innerHTML = `
            <td><span class="position-indicator ${posClass}"></span>${index + 1}</td>
            <td class="team-name-cell"><img src="${teamData?.logo || ''}" class="team-logo-small">${team.name}</td>
            <td class="hide-on-mobile">${team.played}</td>
            <td class="hide-on-mobile">${team.wins}</td>
            <td class="hide-on-mobile">${team.draws}</td>
            <td class="hide-on-mobile">${team.losses}</td>
            <td>${team.gd}</td>
            <td><strong>${team.points}</strong></td>
        `;
        tableBody.appendChild(row);
    });
}

function updateProfileUI() {
    document.getElementById('profilePlayerName').textContent = `${gameState.playerName} Profilja`;
    document.getElementById('profileGoals').textContent = gameState.goals || 0;
    document.getElementById('profileAssists').textContent = gameState.assists || 0;
    document.getElementById('profileMatches').textContent = gameState.matchesPlayed || 0;
    document.getElementById('profileTrophies').textContent = (gameState.trophies || []).length;
}

function updateTransferUI() {
    // Implementáció később...
}

function populateTransferMarket() {
    // Implementáció később...
}


// --- ESEMÉNYFIGYELŐK ---
function initEventListeners() {
    document.getElementById('newGameBtn')?.addEventListener('click', initializeCharacterCreator);
    document.getElementById('playMatchBtn')?.addEventListener('click', playNextMatch);
    document.getElementById('matchResultContinueBtn')?.addEventListener('click', showMainHub);

    // Navigációs gombok (oldalsó és alsó sáv)
    allNavButtons.forEach(button => button.addEventListener('click', () => showScreen(button.dataset.screen)));

    // Felső sáv gombjai
    document.getElementById('profileBtn')?.addEventListener('click', () => showScreen('profileScreen'));
    document.getElementById('dashboardProfileCard')?.addEventListener('click', () => showScreen('squadScreen'));

    // Mentések kezelése (event delegation)
    document.getElementById('saveSlotsContainer').addEventListener('click', (e) => {
        const slot = e.target.closest('.save-slot');
        if (!slot) return;

        const saveId = parseInt(slot.dataset.id, 10);
        if (e.target.classList.contains('delete-save-btn')) {
            if (confirm(`Biztosan törölni szeretnéd a mentést?`)) {
                deleteSave(saveId);
                displaySaveSlots();
            }
        } else {
            loadSelectedGame(saveId);
        }
    });

    // Karakterkészítő (event delegation)
    characterCreator.addEventListener('click', (e) => {
        const totalSteps = 4;
        if (e.target.classList.contains('next-btn')) {
            const playerNameInput = document.getElementById('playerName');
            if (currentStep === 0 && playerNameInput.value.trim() === "") return;
            if (currentStep === 2 && selectedLeagueName === null) return;

            if (currentStep < totalSteps - 1) {
                currentStep++;
                if (currentStep === 3) {
                    generateContractOffers();
                }
                updateCarousel();
            }
        } else if (e.target.classList.contains('prev-btn')) {
            if (currentStep > 0) {
                currentStep--;
                updateCarousel();
            }
        } else if (e.target.closest('.league-select-btn')) {
            const button = e.target.closest('.league-select-btn');
            document.querySelectorAll('.league-select-btn').forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            selectedLeagueName = button.dataset.league;
        } else if (e.target.closest('.accept-offer-btn')) {
            const team = JSON.parse(e.target.dataset.team);
            startNewGame(document.getElementById('playerName').value, selectedNationality, selectedLeagueName, team);
        }
    });

    // Nemzetiség választó
    const nationalitySelectBtn = document.getElementById('nationalitySelect');
    const nationalityOptions = document.getElementById('nationalityOptions');
    nationalitySelectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        nationalityOptions.classList.toggle('hidden');
    });
    document.addEventListener('click', () => {
        nationalityOptions.classList.add('hidden');
    });
    nationalityOptions.addEventListener('click', (e) => {
        const option = e.target.closest('.option');
        if (option) {
            selectedNationality = option.dataset.value;
            const selectedOptionDisplay = document.querySelector('#nationalitySelect .selected-option');
            selectedOptionDisplay.innerHTML = `<img src="${window.NATIONALITIES[selectedNationality].flag}" alt=""><span>${window.NATIONALITIES[selectedNationality].name}</span>`;
            nationalityOptions.classList.add('hidden');
        }
    });
}

