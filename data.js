// --- ADATKEZELŐ MODUL (data.js) ---
/**
 * Ez a modul felelős a játék összes adatának generálásáért,
 * lekérdezéséért és manipulálásáért. Nem tárolja a játékállapotot (gameState),
 * hanem paraméterként kapja meg, hogy elkerülje a körkörös függőségeket.
 * Függ a globálisan betöltött `window.NAMES`, `window.NATIONALITIES` és `window.LEAGUES` objektumoktól.
 */

// --- MODUL SZINTŰ VÁLTOZÓK ---

// Az összes, a játék indításakor generált játékost tárolja.
let allPlayers = [];

// --- BELSŐ SEGÉDFÜGGVÉNYEK ---

/**
 * Visszaad egy véletlenszerű egész számot a megadott tartományban (zárt intervallum).
 * @param {number} min - Az alsó határ.
 * @param {number} max - A felső határ.
 * @returns {number} A véletlen szám.
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Visszaad egy véletlenszerű elemet egy tömbből.
 * @param {Array<any>} arr - A tömb, amiből választani kell.
 * @returns {any|null} A tömb véletlenszerű eleme, vagy null, ha a tömb üres.
 */
function getRandomElement(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

// --- EXPORTÁLT FÜGGVÉNYEK ---

// --- Játékos generálás és kezelés ---

/**
 * Generál egy véletlenszerű játékosnevet a megadott nemzetiség alapján.
 * Ha a nemzetiséghez nincs névadat, az angolt használja alapértelmezettként.
 * @param {string} nationalityCode - A nemzetiség kódja (pl. 'hu', 'en').
 * @returns {string} A generált teljes név (Vezetéknév Keresztnév).
 */
export function generatePlayerName(nationalityCode) {
    const nameData = window.NAMES[nationalityCode] || window.NAMES['en'];
    const firstName = getRandomElement(nameData.firstNames);
    const lastName = getRandomElement(nameData.lastNames);
    return `${firstName} ${lastName}`;
}

/**
 * Legenerálja az összes játékost az összes ligában és csapatban.
 * Ezt a függvényt a játék kezdetekor kell meghívni.
 */
export function generateAllPlayers() {
    allPlayers = [];
    const positions = ['K', 'V', 'V', 'V', 'V', 'KP', 'KP', 'KP', 'CS', 'CS', 'CS'];

    if (!window.NATIONALITIES || !window.LEAGUES) {
        console.error("Hiányzó adatfájlok! Ellenőrizd, hogy a nationalities.js és leagues.js be van-e töltve a window objektumba.");
        return;
    }
    const natCodes = Object.keys(window.NATIONALITIES);

    for (const country in window.LEAGUES) {
        for (const leagueName in window.LEAGUES[country]) {
            window.LEAGUES[country][leagueName].teams.forEach(team => {
                // Minden csapathoz 22 játékost generálunk.
                for (let i = 0; i < 22; i++) {
                    const baseStrength = team.strength;
                    // A játékos erőssége a csapat átlagos erőssége körül szóródik.
                    const playerStrength = Math.max(40, Math.min(99, Math.round(baseStrength - 15 + Math.random() * 25)));
                    const age = getRandomInt(17, 36);
                    // Az érték exponenciálisan nő az erősséggel és csökken a korral.
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
            });
        }
    }
}

/**
 * Összeállítja egy adott csapat keretét a generált játékosokból, majd
 * beilleszti a felhasználó karakterét egy megfelelő poszton lévő játékos helyére.
 * @summary Fontos: Módosítja a paraméterként kapott `gameState` objektumot!
 * @param {string} teamName - A csapat neve, amelyhez a keretet generáljuk.
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

    // A keret feltöltése posztonként meghatározott számú játékossal.
    const roster = [
        ...positions['K'].slice(0, 2),
        ...positions['V'].slice(0, 5),
        ...positions['KP'].slice(0, 5),
        ...positions['CS'].slice(0, 4)
    ];
    gameState.team.players = roster;

    // A felhasználó játékosának objektuma
    const userPlayer = {
        id: 'user_player',
        name: gameState.playerName,
        position: 'CS',
        age: gameState.age,
        rating: gameState.rating,
        teamName: gameState.team.name,
        isUser: true
    };

    // A felhasználó beillesztése a keretbe: lecserél egy csatárt, vagy ha nincs, egy középpályást.
    const fwds = gameState.team.players.filter(p => p.position === 'CS');
    if (fwds.length > 0) {
        const playerToReplaceIndex = gameState.team.players.findIndex(p => p.id === fwds[0].id);
        gameState.team.players[playerToReplaceIndex] = userPlayer;
    } else {
        const mids = gameState.team.players.filter(p => p.position === 'KP');
        if (mids.length > 0) {
            const playerToReplaceIndex = gameState.team.players.findIndex(p => p.id === mids[0].id);
            gameState.team.players[playerToReplaceIndex] = userPlayer;
        } else {
            // Végső esetben, ha csatár és középpályás sincs, hozzáadjuk a kerethez.
            gameState.team.players.push(userPlayer);
        }
    }
}


// --- Adatlekérdező függvények ---

/**
 * Visszaadja a szűrt játékosok listáját az átigazolási piac számára.
 * @param {string} nameFilter - A névre alkalmazott szűrő (kis- és nagybetű érzéketlen).
 * @param {string} posFilter - A posztra alkalmazott szűrő (pl. 'CS').
 * @param {object} gameState - Az aktuális játékállapot, hogy a felhasználót kiszűrhessük.
 * @returns {Array<object>} A szűrési feltételeknek megfelelő játékosok listája.
 */
export function getFilteredPlayers(nameFilter, posFilter, gameState) {
    const lowerCaseNameFilter = nameFilter.toLowerCase();
    return allPlayers.filter(p => {
        if (!p || !p.name) return false;

        const nameMatch = p.name.toLowerCase().includes(lowerCaseNameFilter);
        const posMatch = posFilter ? p.position === posFilter : true;
        const isNotUserPlayer = p.id !== 'user_player'; // Biztosabb az ID alapú ellenőrzés

        return nameMatch && posMatch && isNotUserPlayer;
    });
}

/**
 * Visszaadja egy adott bajnokság összes adatát.
 * @param {string} leagueName - A keresett bajnokság neve.
 * @returns {object|null} A bajnokság adatai, vagy null, ha nem található.
 */
export function getLeagueData(leagueName) {
    for (const country in window.LEAGUES) {
        if (window.LEAGUES[country][leagueName]) {
            return { country, ...window.LEAGUES[country][leagueName] };
        }
    }
    return null;
}

/**
 * Visszaadja egy adott ország összes bajnokságának nevét.
 * @param {string} countryName - Az ország neve.
 * @returns {Array<string>} A bajnokságok neveit tartalmazó tömb.
 */
export function getCountryLeagues(countryName) {
    return window.LEAGUES[countryName] ? Object.keys(window.LEAGUES[countryName]) : [];
}

/**
 * Visszaadja egy adott csapat adatait.
 * @param {string} teamName - A keresett csapat neve.
 * @returns {object|null} A csapat adatai, vagy null, ha nem található.
 */
export function getTeamData(teamName) {
    for (const country in window.LEAGUES) {
        for (const leagueName in window.LEAGUES[country]) {
            const team = window.LEAGUES[country][leagueName].teams.find(t => t.name === teamName);
            if (team) return team;
        }
    }
    return null;
}

// --- Szimulációs és segédfüggvények ---

/**
 * Formáz egy számértéket pénznem formátumra (pl. 1.2M vagy 500K).
 * @param {number} value - A formázandó szám.
 * @returns {string} A formázott pénzérték.
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
 * Generál egy teljes szezonra szóló meccsnaptárat (oda-visszavágós rendszerben)
 * egy csapatnév listából. Round-robin algoritmust használ.
 * @param {Array<string>} teamNames - A bajnokságban szereplő csapatok nevei.
 * @returns {Array<Array<object>>} A teljes meccsnaptár, fordulókra bontva.
 */
export function generateSchedule(teamNames) {
    let teams = [...teamNames];
    // Páros számú csapat kell, ha páratlan, hozzáadunk egy "szabadnap" (null) elemet.
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
            if (home && away) { // Csak akkor adjuk hozzá, ha nem szabadnapos a meccs
                roundMatches.push({ home, away });
            }
        }
        schedule.push(roundMatches);
        // "Forgatjuk" a csapatokat, az első helyén marad, a többi csúszik.
        teams.splice(1, 0, teams.pop());
    }

    // A második félidő generálása (pályaválasztói jog felcserélése)
    const secondHalf = schedule.map(round =>
        round.map(({ home, away }) => ({ home: away, away: home }))
    );

    return [...schedule, ...secondHalf];
}

/**
 * Leszimulál egy meccset két csapat között a csapatok erőssége alapján.
 * @param {string} homeName - A hazai csapat neve.
 * @param {string} awayName - A vendég csapat neve.
 * @param {string} leagueName - A bajnokság neve, ahol a meccset játsszák.
 * @returns {object} A meccs eredménye { homeName, awayName, homeScore, awayScore, playerGoals: 0 }.
 */
export function simulateOtherMatch(homeName, awayName, leagueName) {
    const leagueData = getLeagueData(leagueName);
    const defaultResult = { homeName, awayName, homeScore: 0, awayScore: 0, playerGoals: 0 };

    if (!leagueData) return defaultResult;

    const homeTeam = leagueData.teams.find(t => t.name === homeName);
    const awayTeam = leagueData.teams.find(t => t.name === awayName);

    if (!homeTeam || !awayTeam) return defaultResult;

    const homeAdvantage = 5; // A hazai pálya előnye pontokban (0-100 skálán)
    const homeStrength = homeTeam.strength + homeAdvantage;
    const awayStrength = awayTeam.strength;

    // A gólok számát a csapatok erősségének aránya és egy véletlen faktor határozza meg.
    const homeScore = Math.floor(Math.random() * (homeStrength / 25));
    const awayScore = Math.floor(Math.random() * (awayStrength / 28)); // A vendég csapatnak kicsit nehezebb

    return { homeName, awayName, homeScore, awayScore, playerGoals: 0 };
}
