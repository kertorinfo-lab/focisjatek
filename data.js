// --- ADATKEZELŐ MODUL (data.js) ---
/**
 * Ez a modul felelős a játék összes adatának generálásáért,
 * lekérdezéséért és manipulálásáért. A szükséges adatokat (ligák, nemzetiségek)
 * most már modulként importálja.
 */

// --- IMPORTÁLT MODULOK ---
import { LEAGUES } from './leagues.js';
import { NATIONALITIES } from './nationalities.js';
import { REAL_PLAYERS } from './names.js';

// --- BELSŐ ADATOK ---

const NAMES = {
    'hu': {
        firstNames: ["Bence", "Máté", "Levente", "Dominik", "Ádám", "Dávid", "Péter", "Gergő"],
        lastNames: ["Nagy", "Kovács", "Tóth", "Szabó", "Horváth", "Varga", "Kiss", "Molnár"]
    },
    'en': {
        firstNames: ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Thomas"],
        lastNames: ["Smith", "Jones", "Taylor", "Brown", "Williams", "Wilson", "Johnson", "Walker"]
    }
    // ... további nemzetiségek adatai hozzáadhatóak ...
};

// --- MODUL SZINTŰ VÁLTOZÓK ---
let allPlayers = [];

// --- BELSŐ SEGÉDFÜGGVÉNYEK ---

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}


// --- EXPORTÁLT FÜGGVÉNYEK ---

export function generatePlayerName(nationalityCode) {
    const nameData = NAMES[nationalityCode] || NAMES['en'];
    const firstName = getRandomElement(nameData.firstNames);
    const lastName = getRandomElement(nameData.lastNames);
    return `${firstName} ${lastName}`;
}

/**
 * Legenerálja az összes játékost: először betölti a valós játékosokat,
 * majd a maradék helyeket feltölti véletlenszerűen generáltakkal.
 */
export function generateAllPlayers() {
    allPlayers = [];
    const positions = ['K', 'V', 'V', 'V', 'V', 'KP', 'KP', 'KP', 'CS', 'CS', 'CS'];
    const natCodes = Object.keys(NATIONALITIES);
    const playersPerTeam = 22;

    // ✅ JAVÍTÁS: Létrehozunk egy TeamName -> TeamData térképet a gyors és hibamentes kereséshez
    const teamMap = {};
    for (const country in LEAGUES) {
        for (const leagueName in LEAGUES[country]) {
            LEAGUES[country][leagueName].teams.forEach(team => {
                teamMap[team.name] = team;
            });
        }
    }

    // 1. Valós játékosok betöltése a REAL_PLAYERS objektumból
    for (const teamName in REAL_PLAYERS) {
        // Helyette: teamMap-ből kérjük le az adatot, elkerülve a getTeamData korai hívását
        const teamData = teamMap[teamName]; 
        
        if (teamData) {
            REAL_PLAYERS[teamName].forEach(player => {
                allPlayers.push({
                    ...player,
                    teamName: teamName,
                    teamLogo: teamData.logo // Logó hozzáadása
                });
            });
        }
    }

    // 2. A keretek feltöltése véletlenszerű játékosokkal
    for (const country in LEAGUES) {
        for (const leagueName in LEAGUES[country]) {
            LEAGUES[country][leagueName].teams.forEach(team => {
                const existingPlayerCount = allPlayers.filter(p => p.teamName === team.name).length;
                const playersToGenerate = playersPerTeam - existingPlayerCount;

                if (playersToGenerate > 0) {
                    for (let i = 0; i < playersToGenerate; i++) {
                        const baseStrength = team.strength;
                        const playerStrength = Math.max(40, Math.min(99, Math.round(baseStrength - 15 + Math.random() * 25)));
                        const age = getRandomInt(17, 36);
                        const value = Math.round(Math.pow(playerStrength / 10, 3) * Math.max(1, (40 - age)) * 1000);
                        const natCode = getRandomElement(natCodes);

                        allPlayers.push({
                            id: `player_${Date.now()}_${Math.random()}`,
                            name: generatePlayerName(natCode),
                            position: getRandomElement(positions),
                            age: age,
                            rating: playerStrength,
                            value: value,
                            nationality: natCode,
                            teamName: team.name,
                            teamLogo: team.logo
                        });
                    }
                }
            });
        }
    }
}

/**
 * Összeállítja egy csapat keretét és beilleszti a felhasználót.
 * @param {string} teamName - A csapat neve.
 * @param {object} gameState - A játék aktuális állapota.
 */
export function generateRosterForTeam(teamName, gameState) {
    const teamPlayers = allPlayers.filter(p => p.teamName === teamName);

    const positions = { 'K': [], 'V': [], 'KP': [], 'CS': [] };
    teamPlayers.forEach(p => {
        if (p && positions[p.position]) {
            positions[p.position].push(p);
        }
    });

    const roster = [
        ...positions['K'].slice(0, 2),
        ...positions['V'].slice(0, 5),
        ...positions['KP'].slice(0, 5),
        ...positions['CS'].slice(0, 4)
    ];
    gameState.team.players = roster;

    const userPlayer = {
        id: 'user_player', name: gameState.playerName, position: gameState.position, // A pozíciót is felhasználjuk
        age: gameState.age, rating: gameState.rating,
        teamName: gameState.team.name, isUser: true
    };
    
    // Annak a játékosnak a pozíciója, akit a felhasználó helyettesít
    const userPosKey = gameState.position; 
    
    let playerToReplace = gameState.team.players.find(p => p.position === userPosKey);

    if (playerToReplace) {
        const playerToReplaceIndex = gameState.team.players.findIndex(p => p.id === playerToReplace.id);
        gameState.team.players[playerToReplaceIndex] = userPlayer;
    } else {
        // Ha nincs a posztján játékos, felveszünk egy támadót vagy középpályást
        const backupPosKey = (userPosKey === 'V' || userPosKey === 'K') ? 'KP' : 'CS';
        playerToReplace = gameState.team.players.find(p => p.position === backupPosKey);

        if(playerToReplace) {
             const playerToReplaceIndex = gameState.team.players.findIndex(p => p.id === playerToReplace.id);
             gameState.team.players[playerToReplaceIndex] = userPlayer;
        } else {
             gameState.team.players.push(userPlayer); // Utolsó esély
        }
    }
}


/**
 * Visszaadja a szűrt játékosok listáját az átigazolási piac számára.
 * @param {string} nameFilter - Név szűrő.
 * @param {string} posFilter - Poszt szűrő.
 * @returns {Array<object>} A szűrt játékosok listája.
 */
export function getFilteredPlayers(nameFilter, posFilter) {
    const lowerCaseNameFilter = nameFilter.toLowerCase();
    return allPlayers.filter(p => {
        if (!p || !p.name) return false;
        const nameMatch = p.name.toLowerCase().includes(lowerCaseNameFilter);
        const posMatch = posFilter ? p.position === posFilter : true;
        const isNotUserPlayer = p.id !== 'user_player';
        return nameMatch && posMatch && isNotUserPlayer;
    });
}

/**
 * Visszaadja egy bajnokság adatait.
 * @param {string} leagueName - A bajnokság neve.
 * @returns {object|null} A bajnokság adatai.
 */
export function getLeagueData(leagueName) {
    for (const country in LEAGUES) {
        if (LEAGUES[country][leagueName]) {
            return { country, ...LEAGUES[country][leagueName] };
        }
    }
    return null;
}

/**
 * Visszaadja egy ország bajnokságainak neveit.
 * @param {string} countryName - Az ország neve.
 * @returns {Array<string>} A bajnokságok nevei.
 */
export function getCountryLeagues(countryName) {
    return LEAGUES[countryName] ? Object.keys(LEAGUES[countryName]) : [];
}

/**
 * Visszaadja egy csapat adatait.
 * @param {string} teamName - A csapat neve.
 * @returns {object|null} A csapat adatai.
 */
export function getTeamData(teamName) {
    for (const country in LEAGUES) {
        for (const leagueName in LEAGUES[country]) {
            const team = LEAGUES[country][leagueName].teams.find(t => t.name === teamName);
            if (team) return team;
        }
    }
    return null;
}

/**
 * Formáz egy számot pénznem formátumra.
 * @param {number} value - A szám.
 * @returns {string} A formázott érték.
 */
export function formatValue(value) {
    if (value >= 1000000) {
        return `€${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
        return `€${Math.round(value / 1000)}K`;
    }
    return `€${value}`;
}

/**
 * Generál egy teljes szezonra szóló meccsnaptárat.
 * @param {Array<string>} teamNames - A csapatok nevei.
 * @returns {Array<Array<object>>} A meccsnaptár.
 */
export function generateSchedule(teamNames) {
    let teams = [...teamNames];
    if (teams.length % 2 !== 0) {
        teams.push(null);
    }
    const schedule = [];
    const numRounds = teams.length - 1;
    for (let round = 0; round < numRounds; round++) {
        const roundMatches = [];
        for (let i = 0; i < teams.length / 2; i++) {
            const home = teams[i];
            const away = teams[teams.length - 1 - i];
            if (home && away) {
                // Az 50%-át felcseréljük, hogy kiegyenlítettebb legyen a hazai/vendég felosztás
                const isSwapped = Math.random() < 0.5; 
                roundMatches.push({ home: isSwapped ? away : home, away: isSwapped ? home : away });
            }
        }
        schedule.push(roundMatches);
        // Round-robin forgatás: a 0-t hagyjuk, az utolsót a 1. helyre tesszük
        teams.splice(1, 0, teams.pop()); 
    }
    
    // Második félév: minden meccs felcserélve (oda-vissza vágó)
    const secondHalf = schedule.map(round =>
        round.map(({ home, away }) => ({ home: away, away: home }))
    );
    
    return [...schedule, ...secondHalf];
}

/**
 * Leszimulál egy meccset két csapat között.
 * @param {string} homeName - Hazai csapat.
 * @param {string} awayName - Vendég csapat.
 * @param {string} leagueName - Bajnokság neve.
 * @returns {object} A meccs eredménye.
 */
export function simulateOtherMatch(homeName, awayName, leagueName) {
    const defaultResult = { homeName, awayName, homeScore: 0, awayScore: 0, playerGoals: 0 };
    const homeTeam = getTeamData(homeName);
    const awayTeam = getTeamData(awayName);

    if (!homeTeam || !awayTeam) return defaultResult;

    const homeAdvantage = 5;
    const homeStrength = homeTeam.strength + homeAdvantage;
    const awayStrength = awayTeam.strength;
    
    // A gólok generálása valószínűségi alapon, nem csak a puszta erő alapján
    const strengthDiff = homeStrength - awayStrength;
    
    // Enyhén favorizáljuk a hazai csapatot, különösen, ha az erőviszonyok kiegyenlítettek
    const baseGoals = 1;
    let homeScore = 0;
    let awayScore = 0;
    
    // Gólok generálása az erőviszonyok alapján
    for (let i = 0; i < 4; i++) { // 4 esély a gólra meccsenként
        const homeChance = 0.15 + strengthDiff / 250;
        const awayChance = 0.15 - strengthDiff / 250;
        
        if (Math.random() < homeChance) homeScore++;
        if (Math.random() < awayChance) awayScore++;
    }

    return { homeName, awayName, homeScore, awayScore, playerGoals: 0 };
}
