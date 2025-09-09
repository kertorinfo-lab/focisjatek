// --- JÁTÉKÁLLAPOT KEZELŐ MODUL (state.js) ---
/**
 * Ez a modul felel a teljes játékállapot (gameState) kezeléséért.
 * Ide tartozik az új játék indítása, a mentések betöltése, mentése,
 * és törlése a böngésző localStorage-ából.
 */

// --- IMPORTÁLT FÜGGVÉNYEK ---
// Adatkezelő függvények a data.js-ből
import { generateSchedule, generateRosterForTeam, getLeagueData } from './data.js';
// Felhasználói felületet vezérlő függvények az ui.js-ből
import { showMainHub } from './ui.js';

// --- MODUL SZINTŰ VÁLTOZÓK ---

/**
 * A játék aktuális állapotát tároló központi objektum.
 * Ezt a változót más modulok is importálhatják és olvashatják.
 * @type {object}
 */
export let gameState = {};

// A böngészőben tárolt összes mentést tartalmazó tömb.
let allSaves = [];
// Az aktuálisan betöltött mentés egyedi azonosítója.
let currentSaveId = null;
// A localStorage-ban használt kulcs a mentések tárolásához.
const SAVE_KEY = 'footballCrazySaves';

// --- MENTÉSKEZELŐ FÜGGVÉNYEK ---

/**
 * Betölti az összes mentést a localStorage-ból az `allSaves` tömbbe.
 * Az alkalmazás indulásakor érdemes meghívni.
 */
export function loadAllSaves() {
    const savedData = localStorage.getItem(SAVE_KEY);
    allSaves = savedData ? JSON.parse(savedData) : [];
}

/**
 * Elmenti az aktuális `gameState`-et a localStorage-ba.
 * Ha már létezik a mentés, felülírja azt.
 */
export function saveCurrentGame() {
    try {
        if (!currentSaveId) {
            console.error("Nincs aktuális mentés kiválasztva (currentSaveId is null).");
            return;
        }
        const gameIndex = allSaves.findIndex(save => save.id === currentSaveId);

        if (gameIndex !== -1) {
            // Meglévő mentés frissítése
            allSaves[gameIndex] = gameState;
        } else {
            // Ez az ág elvileg nem futhat le, ha a logika helyes,
            // de biztonsági okokból hozzáadhatnánk az új mentést.
            allSaves.push(gameState);
        }
        localStorage.setItem(SAVE_KEY, JSON.stringify(allSaves));
    } catch (e) {
        console.error("Hiba a játék mentésekor: ", e);
    }
}

/**
 * Visszaadja az összes mentést tartalmazó tömböt.
 * @returns {Array<object>} Az összes mentés listája.
 */
export function getAllSaves() {
    return allSaves;
}

/**
 * Töröl egy mentést az azonosítója alapján.
 * @param {number} saveId - A törlendő mentés egyedi azonosítója.
 */
export function deleteSave(saveId) {
    allSaves = allSaves.filter(save => save.id !== saveId);
    localStorage.setItem(SAVE_KEY, JSON.stringify(allSaves));
}


// --- JÁTÉK LOGIKAI FÜGGVÉNYEK ---

/**
 * Betölt egy kiválasztott mentést és beállítja azt aktív játékállapotnak.
 * Ellenőrzi, hogy a betöltött mentés tartalmaz-e minden szükséges adatot
 * (csapatkeret, meccsnaptár), és ha nem, legenerálja azokat.
 * @param {number} saveId - A betöltendő mentés egyedi azonosítója.
 */
export function loadSelectedGame(saveId) {
    const selectedSave = allSaves.find(save => save.id === saveId);
    if (!selectedSave) {
        console.error(`A(z) ${saveId} azonosítójú mentés nem található.`);
        return;
    }

    currentSaveId = saveId;
    gameState = selectedSave;

    // Ha a mentés régi és nincs benne csapatkeret, generálunk egyet.
    if (!gameState.team.players || gameState.team.players.length === 0) {
        generateRosterForTeam(gameState.team.name, gameState);
    }

    // Ha nincs meccsnaptár, vagy a szezon végére ért, újat generálunk.
    if (!gameState.schedule || gameState.schedule.length === 0 || gameState.currentMatchday >= gameState.schedule.length) {
        const leagueData = getLeagueData(gameState.leagueName);
        if (leagueData && leagueData.teams) {
            const leagueTeams = leagueData.teams;
            gameState.schedule = generateSchedule(leagueTeams.map(t => t.name));
            gameState.currentMatchday = 0;
            // A bajnoki tabella nullázása az új szezonhoz
            gameState.league = leagueTeams.map(t => ({
                name: t.name, played: 0, wins: 0, draws: 0, losses: 0,
                gf: 0, ga: 0, gd: 0, points: 0
            }));
            saveCurrentGame();
        }
    }
    showMainHub();
}

/**
 * Létrehoz egy teljesen új játékállapotot a megadott paraméterek alapján,
 * elmenti, és elindítja a játékot.
 * @param {string} playerName - A játékos neve.
 * @param {string} nationality - A játékos nemzetisége.
 * @param {string} leagueName - A választott bajnokság neve.
 * @param {object} chosenTeam - A választott csapat objektuma.
 */
export function startNewGame(playerName, nationality, leagueName, chosenTeam) {
    const leagueData = getLeagueData(leagueName);
    if (!leagueData) {
        console.error(`A(z) ${leagueName} bajnokság adatai nem találhatóak.`);
        return;
    }
    const leagueTeams = leagueData.teams;

    gameState = {
        id: Date.now(),
        // Játékos adatok
        playerName: playerName || "Játékos",
        age: 17,
        nationality: nationality,
        rating: 60,
        goals: 0,
        assists: 0,
        matchesPlayed: 0,
        jerseyNumber: Math.floor(Math.random() * 98) + 1,
        // Klub és bajnokság adatok
        team: chosenTeam,
        leagueName: leagueName,
        clubHistory: [{ name: chosenTeam.name, year: `${new Date().getFullYear()}-` }],
        // Pénzügyek és egyéb
        money: 250000,
        salary: 15000,
        trophies: [],
        transferOffers: [],
        coins: 10,
        // Szezon adatok
        league: leagueTeams.map(t => ({
            name: t.name, played: 0, wins: 0, draws: 0, losses: 0,
            gf: 0, ga: 0, gd: 0, points: 0
        })),
        schedule: generateSchedule(leagueTeams.map(t => t.name)),
        currentMatchday: 0,
    };

    // Kezdeti csapatkeret generálása a játékos karakterével együtt
    generateRosterForTeam(chosenTeam.name, gameState);

    // Az új játék elmentése
    currentSaveId = gameState.id;
    allSaves.push(gameState);
    saveCurrentGame();

    // A játék főképernyőjének megjelenítése
    showMainHub();
}

/**
 * Lehetővé teszi a gameState objektum egy vagy több tulajdonságának
 * egyszerű frissítését.
 * @param {object} updates - Egy objektum, ami a frissítendő kulcs-érték párokat tartalmazza.
 */
export function updateGameState(updates) {
    gameState = { ...gameState, ...updates };
}
