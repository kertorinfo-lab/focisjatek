// 1. ELEM REFERENCIÁK
// Ez a szekció felelős a HTML elemek azonosításáért.
// Ellenőrizzük, hogy minden ID pontosan egyezik.
const mainMenu = document.getElementById('main-menu');
const gameSelection = document.getElementById('game-selection');
const difficultySelection = document.getElementById('difficulty-selection');
const clubSelection = document.getElementById('club-selection');
const clubHub = document.getElementById('club-hub');

const savedTeamDisplay = document.getElementById('saved-team-display');
const savedTeamNameSpan = document.getElementById('saved-team-name');
const continueBtn = document.getElementById('continue-btn');
const changeTeamBtn = document.getElementById('change-team-btn');
const leagueList = document.getElementById('league-list');

// A HIBÁT OKOZÓ ELEMEK VIZSGÁLATA (Hub)
const currentClubName = document.getElementById('current-club-name'); // Helyes ID
const clubLogo = document.getElementById('club-logo'); // Helyes ID

// Elemek a Játék Választóhoz (Karrier lista)
const savedCareersList = document.getElementById('saved-careers-list');
const newCareerButton = document.getElementById('new-career-button');

// Elemek a Hub almenükhöz
const hubNavButtons = document.querySelectorAll('.hub-nav-button');
const hubSubScreens = document.querySelectorAll('.hub-sub-screen');


// 2. ÁLLANDÓK ÉS KEZDŐ ÉRTÉKEK
let selectedTeam = localStorage.getItem('selectedTeam');
let selectedLeague = null;

// Mentett Karrierek (Demó adatok, a képek alapján)
let savedCareers = [
    { id: 101, teamName: "Real Madrid", type: "Club", year: 2, season: '26/27', week: 27, flag: '🇪🇸', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/800px-Real_Madrid_CF.svg.png' },
    { id: 102, teamName: "Marseille", type: "Club", year: 7, season: '31/32', week: 1, flag: '🇫🇷', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/43/Olympique_de_Marseille_logo.svg/800px-Olympique_de_Marseille_logo.svg.png' },
    { id: 103, teamName: "Bayer Leverkusen", type: "Club", year: 2, season: '26/27', week: 27, flag: '🇩🇪', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f7/Bayer_04_Leverkusen_logo.svg/800px-Bayer_04_Leverkusen_logo.svg.png' },
    { id: 104, teamName: "Portugália", type: "National", year: 6, season: '30/31', week: 51, flag: '🇵🇹', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Flag_of_Portugal.svg/800px-Flag_of_Portugal.svg.png' }
];

const leagues = [
    { name: "Anglia", flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', rating: 5, teams: ["Manchester City", "Liverpool", "Arsenal"] },
    { name: "Spanyolország", flag: '🇪🇸', rating: 4, teams: ["Real Madrid", "Barcelona", "Atletico Madrid"] },
    { name: "Olaszország", flag: '🇮🇹', rating: 4, teams: ["Inter Milan", "AC Milan", "Juventus"] },
    { name: "Németország", flag: '🇩🇪', rating: 4, teams: ["Bayern München", "Bayer Leverkusen", "Dortmund"] },
    { name: "Franciaország", flag: '🇫🇷', rating: 3, teams: ["Paris SG", "Monaco", "Marseille"] },
    { name: "Szaúd-Arábia", flag: '🇸🇦', rating: 3, teams: ["Al-Nassr", "Al-Hilal", "Al-Ittihad"] },
    { name: "Brazília", flag: '🇧🇷', rating: 3, teams: ["Flamengo", "Palmeiras", "Atlético Mineiro"] },
    { name: "Portugália", flag: '🇵🇹', rating: 3, teams: ["Porto", "Benfica", "Sporting CP"] }
];


// 3. FÜGGVÉNYEK

/**
 * Frissíti a Főmenüben látható mentett csapat kijelzőt.
 */
function updateSavedTeamDisplay() {
    if (selectedTeam) {
        // Ellenőrizzük, hogy az elem létezik-e mielőtt hozzáférnénk
        if(savedTeamNameSpan) savedTeamNameSpan.textContent = selectedTeam;
        if(savedTeamDisplay) savedTeamDisplay.classList.remove('hidden');
    } else {
        if(savedTeamDisplay) savedTeamDisplay.classList.add('hidden');
    }
}

/**
 * Megjeleníti a főmenüt és elrejti a többit.
 */
function showMainMenu() {
    if(mainMenu) mainMenu.classList.remove('hidden');
    if(gameSelection) gameSelection.classList.add('hidden');
    if(difficultySelection) difficultySelection.classList.add('hidden'); 
    if(clubSelection) clubSelection.classList.add('hidden');
    if(clubHub) clubHub.classList.add('hidden');
    
    updateSavedTeamDisplay();
}

/**
 * Megjeleníti a játékválasztó (karrier választó) képernyőt.
 */
function showGameSelection() {
    showMainMenu(); 
    if(mainMenu) mainMenu.classList.add('hidden');
    if(gameSelection) gameSelection.classList.remove('hidden');
    
    renderSavedCareers();
}

/**
 * Dinamikusan megjeleníti a mentett karriereket a képernyőn.
 */
function renderSavedCareers() {
    const listContainer = document.getElementById('saved-careers-list');
    if (!listContainer) return;

    // Megtartjuk az Új karrier gombot
    while (listContainer.children.length > 1) {
        listContainer.removeChild(listContainer.lastChild);
    }
    
    savedCareers.forEach(career => {
        const row = document.createElement('div');
        row.className = 'career-row';
        row.setAttribute('data-career-id', career.id);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'career-info';
        
        infoDiv.innerHTML = `
            <span class="next-arrow">»</span>
            <span class="career-name">${career.teamName} ${career.flag}</span>
            <span class="career-details">
                ÉV ${career.year} (${career.season}) | HÉT ${career.week}
            </span>
        `;
        
        row.appendChild(infoDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'career-actions';
        
        actionsDiv.innerHTML = `
            <button class="action-button-small cloud-button">☁️</button>
            <button class="action-button-small delete-button">❌</button>
        `;
        
        actionsDiv.querySelector('.delete-button').addEventListener('click', (e) => {
            e.stopPropagation(); 
            deleteCareer(career.id, career.teamName);
        });

        row.appendChild(actionsDiv);

        row.addEventListener('click', () => {
            loadCareer(career.teamName, career.logo);
        });

        listContainer.appendChild(row);
    });
}

/**
 * Megjeleníti a Nehézségi Szint választó képernyőt. (Új Karrier indítása)
 */
function showDifficultySelection() {
    if(gameSelection) gameSelection.classList.add('hidden');
    if(difficultySelection) difficultySelection.classList.remove('hidden'); 
    if(clubSelection) clubSelection.classList.add('hidden');
    if(clubHub) clubHub.classList.add('hidden');
}


/**
 * Megjeleníti a Klubválasztó képernyőt (Liga Választó).
 */
function showClubSelection() {
    if(difficultySelection) difficultySelection.classList.add('hidden'); 
    if(clubSelection) clubSelection.classList.remove('hidden');
    if(clubHub) clubHub.classList.add('hidden');
    
    if (!leagueList) return; 

    // Liga lista generálása
    leagueList.innerHTML = `
        <tr>
            <th>Ország</th>
            <th>Top 7 Csapat</th>
        </tr>
    `;
    
    leagues.forEach(league => {
        const row = document.createElement('tr');
        row.className = 'league-row';
        row.setAttribute('data-league', league.name);
        
        const ratingStars = '★'.repeat(league.rating) + '☆'.repeat(5 - league.rating);
        
        row.innerHTML = `
            <td><span class="flag-icon">${league.flag}</span>${league.name}</td>
            <td class="star-rating">${ratingStars}</td>
        `;
        
        row.addEventListener('click', () => selectLeague(league.name));
        leagueList.appendChild(row);
    });

    selectedLeague = null;
    const continueBtn = document.getElementById('continue-club-selection');
    if(continueBtn) continueBtn.classList.add('hidden');
}

/**
 * Kiválaszt egy ligát.
 * @param {string} name - A kiválasztott liga neve.
 */
function selectLeague(name) {
    selectedLeague = name;
    
    document.querySelectorAll('.league-row').forEach(row => {
        row.classList.remove('selected');
    });
    
    const selectedRow = document.querySelector(`[data-league="${name}"]`);
    if (selectedRow) {
        selectedRow.classList.add('selected');
    }
    
    const continueBtn = document.getElementById('continue-club-selection');
    if(continueBtn) continueBtn.classList.remove('hidden');
}


/**
 * Betölt egy mentett karriert és átvált a Klubközpontba.
 * @param {string} teamName - A betöltendő csapat neve.
 * @param {string} teamLogo - A betöltendő csapat logója.
 */
function loadCareer(teamName, teamLogo) {
    selectedTeam = teamName;
    localStorage.setItem('selectedTeam', teamName);
    localStorage.setItem('selectedTeamLogo', teamLogo); 
    
    showClubHub(); 
}

/**
 * Törli a mentett karriert.
 */
function deleteCareer(id, teamName) {
    if (confirm(`Biztosan törölni akarod a(z) ${teamName} karriert?`)) {
        savedCareers = savedCareers.filter(c => c.id !== id);
        if (selectedTeam === teamName) {
            selectedTeam = null;
            localStorage.removeItem('selectedTeam');
            localStorage.removeItem('selectedTeamLogo');
        }
        alert(`${teamName} karrier törölve.`);
        renderSavedCareers();
        updateSavedTeamDisplay();
    }
}

/**
 * Megjeleníti a Klub Központot (Club Hub).
 */
function showClubHub() {
    if(clubSelection) clubSelection.classList.add('hidden');
    if(gameSelection) gameSelection.classList.add('hidden');
    if(difficultySelection) difficultySelection.classList.add('hidden');
    if(clubHub) clubHub.classList.remove('hidden');
    
    const teamLogoUrl = localStorage.getItem('selectedTeamLogo') || 'default_logo.png';
    
    // BIZTONSÁGI ELLENŐRZÉS: Csak akkor állítjuk be, ha az elem létezik
    if (currentClubName) currentClubName.textContent = selectedTeam;
    if (clubLogo) clubLogo.src = teamLogoUrl;

    // Alapértelmezett nézet a keret (squad)
    showHubSubScreen('squad');
}

/**
 * Megjeleníti a Klub Hub egyik almenüjét.
 * @param {string} screenId - A megjelenítendő almenü ID-ja (pl. 'squad', 'transfer').
 */
function showHubSubScreen(screenId) {
    hubSubScreens.forEach(screen => {
        screen.classList.add('hidden');
    });
    hubNavButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    const activeScreen = document.getElementById(`${screenId}-screen`);
    const activeNavButton = document.querySelector(`.hub-nav-button[data-screen="${screenId}"]`);
    
    if (activeScreen) {
        activeScreen.classList.remove('hidden');
    }
    if (activeNavButton) {
        activeNavButton.classList.add('active');
    }
}


// 4. ESEMÉNYKEZELŐK

// A kód csak akkor fut le, ha a DOM teljesen betöltődött, így az elemek null hiba esélye minimálisra csökken.
document.addEventListener('DOMContentLoaded', () => {
    
    // Kezdeti állapot beállítása
    updateSavedTeamDisplay();
    showMainMenu();

    // Főmenü: Kattintás a "Játék" boxra
    const mainGameBox = document.querySelector('.main-game');
    if (mainGameBox) mainGameBox.addEventListener('click', showGameSelection);

    // Főmenü: "Folytatás" gomb
    if (continueBtn) continueBtn.addEventListener('click', () => {
        const teamLogo = localStorage.getItem('selectedTeamLogo') || 'default_logo.png';
        if (selectedTeam) {
            loadCareer(selectedTeam, teamLogo);
        }
    });

    // Főmenü: "Csapat változtatása" gomb
    if (changeTeamBtn) changeTeamBtn.addEventListener('click', showGameSelection);

    // Játék Választó Képernyő: Vissza a főmenübe
    const backToMenuWsc = document.getElementById('back-to-menu-wsc');
    if (backToMenuWsc) backToMenuWsc.addEventListener('click', showMainMenu);

    // Játék Választó Képernyő: Új karrier opció
    if (newCareerButton) newCareerButton.addEventListener('click', showDifficultySelection);

    // --- NEHÉZSÉGI SZINT KÉPERNYŐ ESEMÉNYEK ---

    // Vissza a Karrier Választóhoz
    const backToCareerWsc = document.getElementById('back-to-career-wsc');
    if (backToCareerWsc) backToCareerWsc.addEventListener('click', showGameSelection);

    // Nehézségi szint kiválasztása
    document.querySelectorAll('.difficulty-box').forEach(box => {
        box.addEventListener('click', (e) => {
            const difficulty = e.currentTarget.getAttribute('data-level');
            // localStorage.setItem('newGameDifficulty', difficulty);
            showClubSelection(); 
        });
    });

    // --- KLUB VÁLASZTÓ KÉPERNYŐ ESEMÉNYEK ---

    // Vissza a Nehézségi Választóhoz
    const backToSelectionWsc = document.getElementById('back-to-selection-wsc');
    if (backToSelectionWsc) backToSelectionWsc.addEventListener('click', showDifficultySelection);

    // Folytatás (Liga Kiválasztva) 
    const continueClubSelection = document.getElementById('continue-club-selection');
    if (continueClubSelection) continueClubSelection.addEventListener('click', () => {
        if (selectedLeague) {
            alert(`Kiválasztott liga: ${selectedLeague}. Itt jönne a csapataid kiválasztása!`);
        }
    });

    // --- KLUB KÖZPONT (HUB) ESEMÉNYEK ---

    // Hub Navigáció (CSAPATOM, ÁTIGAZOLÁSOK, stb.)
    hubNavButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            showHubSubScreen(e.currentTarget.getAttribute('data-screen'));
        });
    });

    // Vissza a Főmenübe a Hub-ról
    const backToMainMenuHub = document.getElementById('back-to-main-menu-hub');
    if (backToMainMenuHub) backToMainMenuHub.addEventListener('click', showMainMenu);
});
