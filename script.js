// 1. ELEM REFERENCIÁK
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

const currentClubName = document.getElementById('current-club-name');
const clubLogo = document.getElementById('club-logo');

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
        savedTeamNameSpan.textContent = selectedTeam;
        savedTeamDisplay.classList.remove('hidden');
    } else {
        savedTeamDisplay.classList.add('hidden');
    }
}

/**
 * Megjeleníti a főmenüt és elrejti a többit.
 */
function showMainMenu() {
    mainMenu.classList.remove('hidden');
    gameSelection.classList.add('hidden');
    difficultySelection.classList.add('hidden'); 
    clubSelection.classList.add('hidden');
    clubHub.classList.add('hidden');
    // ... (további képernyők is hidden maradnak)
    updateSavedTeamDisplay();
}

/**
 * Megjeleníti a játékválasztó (karrier választó) képernyőt.
 */
function showGameSelection() {
    showMainMenu(); // Elrejti az összes többit
    mainMenu.classList.add('hidden');
    gameSelection.classList.remove('hidden');
    
    // Frissítjük a karrier listát
    renderSavedCareers();
}

/**
 * Dinamikusan megjeleníti a mentett karriereket a képernyőn.
 */
function renderSavedCareers() {
    // Töröljük a korábbi listát, kivéve az 'Új karrier' gombot
    const listContainer = document.getElementById('saved-careers-list');
    
    // Megtartjuk az Új karrier gombot, és utána kezdjük a mentéseket
    while (listContainer.children.length > 1) {
        listContainer.removeChild(listContainer.lastChild);
    }
    
    // Rendezés a legújabb mentés szerint (opcionális)
    savedCareers.forEach(career => {
        const row = document.createElement('div');
        row.className = 'career-row';
        row.setAttribute('data-career-id', career.id);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'career-info';
        
        // Zászló (vagy ikon) és Név
        infoDiv.innerHTML = `
            <span class="next-arrow">»</span>
            <span class="career-name">${career.teamName} ${career.flag}</span>
            <span class="career-details">
                ÉV ${career.year} (${career.season}) | HÉT ${career.week}
            </span>
        `;
        
        row.appendChild(infoDiv);

        // JOBB OLDALI GOMBOK (Felhő és Törlés)
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'career-actions';
        
        // Csak a mentett elemekhez kell a Felhő és Törlés, az "Új karrierhez" nem!
        actionsDiv.innerHTML = `
            <button class="action-button-small cloud-button">☁️</button>
            <button class="action-button-small delete-button">❌</button>
        `;
        
        // Törlés gomb logika
        actionsDiv.querySelector('.delete-button').addEventListener('click', (e) => {
            e.stopPropagation(); 
            deleteCareer(career.id, career.teamName);
        });

        row.appendChild(actionsDiv);

        // Karrier betöltése, ha a sorra kattintunk
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
    gameSelection.classList.add('hidden');
    difficultySelection.classList.remove('hidden'); 
    clubSelection.classList.add('hidden');
    clubHub.classList.add('hidden');
}


/**
 * Megjeleníti a Klubválasztó képernyőt (Liga Választó).
 */
function showClubSelection() {
    difficultySelection.classList.add('hidden'); 
    clubSelection.classList.remove('hidden');
    clubHub.classList.add('hidden');
    
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
    document.getElementById('continue-club-selection').classList.add('hidden');
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
    
    document.getElementById('continue-club-selection').classList.remove('hidden');
}


/**
 * Betölt egy mentett karriert és átvált a Klubközpontba.
 * @param {string} teamName - A betöltendő csapat neve.
 * @param {string} teamLogo - A betöltendő csapat logója.
 */
function loadCareer(teamName, teamLogo) {
    selectedTeam = teamName;
    localStorage.setItem('selectedTeam', teamName);
    localStorage.setItem('selectedTeamLogo', teamLogo); // Mentjük a logót is
    // alert(`${teamName} karrier betöltve!`);
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
    clubSelection.classList.add('hidden');
    gameSelection.classList.add('hidden');
    difficultySelection.classList.add('hidden');
    clubHub.classList.remove('hidden');
    
    const teamLogoUrl = localStorage.getItem('selectedTeamLogo') || 'default_logo.png';
    
    currentClubName.textContent = selectedTeam;
    clubLogo.src = teamLogoUrl;

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

// Kezdeti állapot beállítása
updateSavedTeamDisplay();
showMainMenu();


// Főmenü: Kattintás a "Játék" boxra
document.querySelector('.main-game').addEventListener('click', showGameSelection);

// Főmenü: "Folytatás" gomb
continueBtn.addEventListener('click', () => {
    // Feltételezve, hogy a logó URL is mentve van
    const teamLogo = localStorage.getItem('selectedTeamLogo') || 'default_logo.png';
    if (selectedTeam) {
        loadCareer(selectedTeam, teamLogo);
    }
});


// Főmenü: "Csapat változtatása" gomb
changeTeamBtn.addEventListener('click', showGameSelection);


// Játék Választó Képernyő: Vissza a főmenübe
document.getElementById('back-to-menu-wsc').addEventListener('click', showMainMenu);

// Játék Választó Képernyő: Új karrier opció (Ez hívja meg a Nehézségi Választót)
document.getElementById('new-career-button').addEventListener('click', showDifficultySelection);

// --- NEHÉZSÉGI SZINT KÉPERNYŐ ESEMÉNYEK ---

// Vissza a Karrier Választóhoz
document.getElementById('back-to-career-wsc').addEventListener('click', showGameSelection);

// Nehézségi szint kiválasztása
document.querySelectorAll('.difficulty-box').forEach(box => {
    box.addEventListener('click', (e) => {
        const difficulty = e.currentTarget.getAttribute('data-level');
        // Itt mentheted el a nehézségi szintet a localStorage-ba vagy egy globális változóba
        // localStorage.setItem('newGameDifficulty', difficulty);
        
        // Ezt követi a Liga Választó
        showClubSelection(); 
    });
});


// --- KLUB VÁLASZTÓ KÉPERNYŐ ESEMÉNYEK ---

// Vissza a Nehézségi Választóhoz
document.getElementById('back-to-selection-wsc').addEventListener('click', showDifficultySelection);

// Folytatás (Liga Kiválasztva) - Ez majd elvisz a csapatlistához, de most egy placeholder
document.getElementById('continue-club-selection').addEventListener('click', () => {
    if (selectedLeague) {
        alert(`Kiválasztott liga: ${selectedLeague}. Itt jönne a csapataid kiválasztása!`);
        // Ez csak egy placeholder. Később ide jön a Csapatlista képernyő: showTeamSelection(selectedLeague);
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
document.getElementById('back-to-main-menu-hub').addEventListener('click', showMainMenu);
