import { gameState, allSaves, setGameState, deleteSave, saveCurrentGame } from './state.js';
import { getTeamData, getLeagueData, getCountryLeagues, generateRosterForTeam, generateSchedule, getRandomElement, getRandomInt, formatValue, getAllPlayers } from './data.js';
import { playNextMatch } from './match.js';

// --- FELHASZNÁLÓI FELÜLET (UI) LOGIKÁJA ---

let selectedLeagueName = null, selectedNationality = 'hu', displayedCountry = null, displayedLeagueName = null;

// DOM Elemek
const mainMenu = document.getElementById('mainMenu'), characterCreator = document.getElementById('characterCreator'), mainHub = document.getElementById('mainHub');
const allScreens = document.querySelectorAll('.screen'), allNavButtons = document.querySelectorAll('.nav-btn');

export function showScreen(targetScreenId) {
    allScreens.forEach(screen => screen.classList.add('hidden'));
    document.getElementById(targetScreenId)?.classList.remove('hidden');
    updateNavButtons(targetScreenId);
    if (targetScreenId === 'globalTransferScreen') populateTransferMarket();
    if (targetScreenId === 'squadScreen') updateSquadScreen();
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
    updateFullUI();
}

function updateNavButtons(activeScreenId) { allNavButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.screen === activeScreenId)); }

export function updateFullUI() {
    if (!gameState || Object.keys(gameState).length === 0) return;
    updateHeaderUI(); updateDashboardUI(); updateLeagueTable(); updateProfileUI(); updateTransferUI(); updateSquadScreen();
    if (!document.getElementById('globalTransferScreen').classList.contains('hidden')) {
        populateTransferMarket();
    }
}

function displaySaveSlots() {
    const container = document.getElementById('saveSlotsContainer');
    container.innerHTML = allSaves.length === 0 ? '<p style="text-align: center; color: var(--text-muted);">Nincsenek mentett játékok.</p>' : '';
    allSaves.forEach(save => {
        const slot = document.createElement('div'), teamData = getTeamData(save.team.name);
        slot.className = 'save-slot'; slot.dataset.id = save.id;
        slot.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem; text-align: left;">
                <img src="${teamData?.logo || ''}" alt="${save.team.name}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: contain;">
                <div class="save-slot-info"><h4>${save.playerName}</h4><p>${save.team.name} - ${save.leagueName}</p></div>
            </div>
            <button class="delete-save-btn" data-id="${save.id}">&times;</button>`;
        container.appendChild(slot);
    });
}

function handleLoadGame(saveId) {
    const loadedState = allSaves.find(s => s.id === saveId);
    if (loadedState) {
        setGameState(loadedState);
        if (!gameState.team.players || gameState.team.players.length === 0) {
            gameState.team.players = generateRosterForTeam(gameState.team.name);
            const userPlayer = { id: 'user_player', name: gameState.playerName, position: 'CS', age: gameState.age, rating: gameState.rating, isUser: true };
            const fwds = gameState.team.players.filter(p => p.position === 'CS');
            const idx = gameState.team.players.findIndex(p => p.id === (fwds.length > 0 ? fwds[0].id : -1));
            if (idx !== -1) gameState.team.players[idx] = userPlayer; else gameState.team.players.push(userPlayer);
            saveCurrentGame();
        }
        showMainHub();
    }
}

function handleDeleteSave(saveId) {
    const save = allSaves.find(s => s.id === saveId);
    if (save && confirm(`Biztosan törlöd a "${save.playerName}" mentést?`)) {
        deleteSave(saveId);
        displaySaveSlots();
    }
}

function initializeCharacterCreator() {
    mainMenu.classList.add('hidden'); characterCreator.classList.remove('hidden');
    let currentStep = 0;
    const formCarousel = document.getElementById('formCarousel'), totalSteps = formCarousel.children.length;
    const updateCarousel = () => formCarousel.style.transform = `translateX(-${currentStep * 100}%)`;
    
    document.querySelectorAll('#characterCreator .next-btn').forEach(btn => btn.onclick = () => {
        if (currentStep === 0 && document.getElementById('playerName').value.trim() === "") return;
        if (currentStep === 2 && selectedLeagueName === null) return;
        if (currentStep < totalSteps - 1) { currentStep++; if (currentStep === 3) generateContractOffers(); updateCarousel(); }
    });
    document.querySelectorAll('#characterCreator .prev-btn').forEach(btn => btn.onclick = () => { if (currentStep > 0) { currentStep--; updateCarousel(); } });

    const nationalityOptions = document.getElementById('nationalityOptions'); nationalityOptions.innerHTML = '';
    Object.entries(window.NATIONALITIES).forEach(([code, nation]) => {
        const optionDiv = document.createElement('div'); optionDiv.className = 'option'; optionDiv.dataset.value = code;
        optionDiv.innerHTML = `<img src="${nation.flag}" alt="${nation.name} zászló"><span>${nation.name}</span>`;
        optionDiv.onclick = () => {
            selectedNationality = code;
            document.querySelector('#nationalitySelect .selected-option').innerHTML = `<img src="${nation.flag}" alt="${nation.name} zászló"><span>${nation.name}</span>`;
            nationalityOptions.classList.add('hidden');
        };
        nationalityOptions.appendChild(optionDiv);
    });
    document.getElementById('nationalitySelect').onclick = (e) => { e.stopPropagation(); nationalityOptions.classList.toggle('hidden'); };
    document.addEventListener('click', () => nationalityOptions.classList.add('hidden'));

    const leagueSelectGrid = document.getElementById('leagueSelectGrid'); leagueSelectGrid.innerHTML = '';
    Object.values(window.LEAGUES).forEach(country => Object.keys(country).forEach(leagueName => {
        if (country[leagueName].tier === 1) {
            const btn = document.createElement('button'); btn.className = 'league-select-btn'; btn.textContent = leagueName;
            btn.onclick = () => { document.querySelectorAll('.league-select-btn.active').forEach(b => b.classList.remove('active')); btn.classList.add('active'); selectedLeagueName = leagueName; };
            leagueSelectGrid.appendChild(btn);
        }
    }));
}

function generateContractOffers() {
    const offersContainer = document.getElementById('contractOffersContainer');
    const leagueData = getLeagueData(selectedLeagueName);
    offersContainer.innerHTML = ''; 
    if (!leagueData) return;

    const smallTeams = leagueData.teams.filter(t => t.strength <= 75);
    const offers = [];
    const chosenTeams = new Set();
    while (offers.length < 2 && chosenTeams.size < leagueData.teams.length) {
        const team = getRandomElement(smallTeams.length >= 2 ? smallTeams : leagueData.teams);
        if (team && !chosenTeams.has(team.name)) { 
            chosenTeams.add(team.name); 
            offers.push(team); 
        }
    }

    offers.forEach(team => {
        const card = document.createElement('div'); 
        card.className = 'contract-offer-card';
        // JAVÍTVA: data-team attribútum hozzáadva a gombhoz
        card.innerHTML = `<img src="${team.logo}" alt="${team.name} logó"><h3>${team.name}</h3><p><strong>Fizetés:</strong> €15.000 /hét</p><button class="button submit-btn accept-offer-btn" data-team='${JSON.stringify(team)}'>Szerződés aláírása</button>`;
        offersContainer.appendChild(card);
    });
}

function startNewGame(chosenTeam) {
    const leagueData = getLeagueData(selectedLeagueName);
    const newGameState = {
        id: Date.now(), playerName: document.getElementById('playerName').value || "Játékos", age: 17, nationality: selectedNationality,
        leagueName: selectedLeagueName, rating: 60,
        team: { name: chosenTeam.name, logo: chosenTeam.logo, strength: chosenTeam.strength, players: [] },
        money: 250000, salary: 15000, goals: 0, assists: 0, matchesPlayed: 0, trophies: [],
        league: leagueData.teams.map(t => ({ name: t.name, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 })),
        currentMatchday: 0, jerseyNumber: getRandomInt(1, 99), schedule: generateSchedule(leagueData.teams.map(t => t.name)),
        transferOffers: [], coins: 10
    };
    newGameState.team.players = generateRosterForTeam(chosenTeam.name);
    const userPlayer = { id: 'user_player', name: newGameState.playerName, position: 'CS', age: newGameState.age, rating: newGameState.rating, isUser: true };
    const fwds = newGameState.team.players.filter(p => p.position === 'CS');
    const idx = newGameState.team.players.findIndex(p => p.id === (fwds.length > 0 ? fwds[0]?.id : -1));
    if (idx !== -1) newGameState.team.players[idx] = userPlayer; else newGameState.team.players.push(userPlayer);
    setGameState(newGameState); 
    saveCurrentGame();
    characterCreator.classList.add('hidden'); 
    showMainHub();
}

// --- UI FRISSÍTŐ FÜGGVÉNYEK ---

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
    const nextFixture = gameState.schedule[gameState.currentMatchday]?.find(f => f.home === gameState.team.name || f.away === gameState.team.name);
    document.getElementById('hubNextOpponent').textContent = nextFixture ? (nextFixture.home === gameState.team.name ? nextFixture.away : nextFixture.home) : "Pihenőhét";
    const playerTeamRow = [...gameState.league].sort((a, b) => b.points - a.points || (b.gd - a.gd)).findIndex(t => t.name === gameState.team.name) + 1;
    document.getElementById('hubLeaguePosition').textContent = playerTeamRow > 0 ? `${playerTeamRow}.` : '-';
    document.getElementById('hubMatchday').textContent = `Forduló: ${gameState.currentMatchday} / ${gameState.schedule.length}`;
}

function updateSquadScreen() {
    if (!gameState.team?.players) return;
    document.getElementById('squadTeamName').textContent = `${gameState.team.name} - Felállás`;
    const formation = { K: 'goalkeeper', V: 'defenders', KP: 'midfielders', CS: 'forwards' };
    Object.values(formation).forEach(el => document.getElementById(`formation-${el}`).innerHTML = '');
    gameState.team.players.forEach(player => {
        if (!player) return;
        const container = document.getElementById(`formation-${formation[player.position]}`);
        const playerDiv = document.createElement('div');
        playerDiv.className = `squad-player ${player.isUser ? 'user-player' : ''}`;
        playerDiv.innerHTML = `<div class="squad-player-jersey"><i class="fas fa-tshirt"></i><span class="squad-player-rating">${player.rating}</span></div><div class="squad-player-name">${player.name.split(' ').pop()}</div>`;
        if (container) container.appendChild(playerDiv);
    });
}

function updateLeagueTable() {
    const tableBody = document.getElementById('leagueTableBody');
    const leagueTitle = document.getElementById('leagueTitle');
    if (!tableBody || !displayedLeagueName) return;
    leagueTitle.textContent = displayedLeagueName;
    const leagueData = getLeagueData(displayedLeagueName);
    if (!leagueData) return;
    tableBody.innerHTML = '';
    const leagueClone = [...(gameState.league || [])].sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
    leagueClone.forEach((team, index) => {
        const teamData = leagueData.teams.find(t => t.name === team.name);
        const row = document.createElement('tr');
        row.className = team.name === gameState.team.name ? 'player-team' : '';
        let posClass = index < 4 ? 'pos-cl' : (index === 4 ? 'pos-el' : (index >= leagueClone.length - 3 ? 'pos-rel' : ''));
        row.innerHTML = `<td><span class="position-indicator ${posClass}"></span>${index + 1}</td>
            <td class="team-name-cell"><img src="${teamData?.logo || ''}" class="team-logo-small">${team.name}</td>
            <td class="hide-on-mobile">${team.played}</td><td class="hide-on-mobile">${team.wins}</td>
            <td class="hide-on-mobile">${team.draws}</td><td class="hide-on-mobile">${team.losses}</td>
            <td>${team.gd}</td><td><strong>${team.points}</strong></td>`;
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

function updateTransferUI() { /* TODO */ }
function populateTransferMarket() { /* TODO */ }

export function initEventListeners() {
    document.getElementById('newGameBtn')?.addEventListener('click', initializeCharacterCreator);
    
    document.getElementById('saveSlotsContainer').addEventListener('click', (e) => {
        const slot = e.target.closest('.save-slot');
        if (!slot) return;
        const saveId = parseInt(slot.dataset.id, 10);
        if (e.target.closest('.delete-save-btn')) {
            handleDeleteSave(saveId);
        } else {
            handleLoadGame(saveId);
        }
    });

    // JAVÍTVA: Eseményfigyelő a szerződési ajánlatokra
    document.getElementById('contractOffersContainer').addEventListener('click', (e) => {
        const button = e.target.closest('.accept-offer-btn');
        if (button) {
            const team = JSON.parse(button.dataset.team);
            startNewGame(team);
        }
    });

    allNavButtons.forEach(button => button.addEventListener('click', () => showScreen(button.dataset.screen)));
    document.getElementById('profileBtn')?.addEventListener('click', () => showScreen('profileScreen'));
    document.getElementById('dashboardProfileCard')?.addEventListener('click', () => showScreen('squadScreen'));
    document.getElementById('playMatchBtn')?.addEventListener('click', playNextMatch);
    document.getElementById('matchResultContinueBtn')?.addEventListener('click', showMainHub);
}

