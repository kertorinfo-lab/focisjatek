// --- JÁTÉKÁLLAPOT KEZELŐ MODUL (state.js) ---
/**
 * Ez a modul felel a teljes játékállapot (gameState) kezeléséért.
 * A körkörös függőség elkerülése érdekében ez a modul már nem hivatkozik
 * egyetlen UI-függvényre sem.
 */

// --- IMPORTÁLT MODULOK ---
import { generateSchedule, generateRosterForTeam, getLeagueData } from './data.js';

// --- MODUL SZINTŰ VÁLTOZÓK ---
export let gameState = {};
let allSaves = [];
let currentSaveId = null;
const SAVE_KEY = 'footballCrazySaves';

// --- MENTÉSKEZELŐ FÜGGVÉNYEK ---

export function loadAllSaves() {
    const savedData = localStorage.getItem(SAVE_KEY);
    allSaves = savedData ? JSON.parse(savedData) : [];
}

export function saveCurrentGame() {
    try {
        if (!currentSaveId) return;
        const gameIndex = allSaves.findIndex(save => save.id === currentSaveId);
        if (gameIndex !== -1) {
            allSaves[gameIndex] = gameState;
        } else {
            allSaves.push(gameState);
        }
        localStorage.setItem(SAVE_KEY, JSON.stringify(allSaves));
    } catch (e) {
        console.error("Hiba a játék mentésekor: ", e);
    }
}

export function getAllSaves() {
    return allSaves;
}

export function deleteSave(saveId) {
    allSaves = allSaves.filter(save => save.id !== saveId);
    localStorage.setItem(SAVE_KEY, JSON.stringify(allSaves));
}

// --- JÁTÉK LOGIKAI FÜGGVÉNYEK ---

export function loadSelectedGame(saveId) {
    const selectedSave = allSaves.find(save => save.id === saveId);
    if (!selectedSave) {
        console.error(`A(z) ${saveId} azonosítójú mentés nem található.`);
        return;
    }

    currentSaveId = saveId;
    gameState = selectedSave;

    if (!gameState.team.players || gameState.team.players.length === 0) {
        generateRosterForTeam(gameState.team.name, gameState);
    }

    if (!gameState.schedule || gameState.schedule.length === 0 || gameState.currentMatchday >= gameState.schedule.length) {
        const leagueData = getLeagueData(gameState.leagueName);
        if (leagueData && leagueData.teams) {
            const leagueTeams = leagueData.teams;
            gameState.schedule = generateSchedule(leagueTeams.map(t => t.name));
            gameState.currentMatchday = 0;
            gameState.league = leagueTeams.map(t => ({
                name: t.name, played: 0, wins: 0, draws: 0, losses: 0,
                gf: 0, ga: 0, gd: 0, points: 0
            }));
            saveCurrentGame();
        }
    }
    // JAVÍTVA: A UI frissítési hívást eltávolítottuk, ezt már az events.js végzi.
}

export function startNewGame(playerName, nationality, leagueName, chosenTeam) {
    const leagueData = getLeagueData(leagueName);
    if (!leagueData) {
        console.error(`A(z) ${leagueName} bajnokság adatai nem találhatóak.`);
        return;
    }
    const leagueTeams = leagueData.teams;

    gameState = {
        id: Date.now(),
        playerName: playerName || "Játékos",
        age: 17,
        nationality: nationality,
        rating: 60,
        team: chosenTeam,
        money: 250000,
        salary: 15000,
        goals: 0,
        assists: 0,
        matchesPlayed: 0,
        trophies: [],
        clubHistory: [{ name: chosenTeam.name, year: `${new Date().getFullYear()}-` }],
        league: leagueTeams.map(t => ({
            name: t.name, played: 0, wins: 0, draws: 0, losses: 0,
            gf: 0, ga: 0, gd: 0, points: 0
        })),
        schedule: generateSchedule(leagueTeams.map(t => t.name)),
        currentMatchday: 0,
        jerseyNumber: Math.floor(Math.random() * 98) + 1,
        transferOffers: [],
        coins: 10,
    };

    generateRosterForTeam(chosenTeam.name, gameState);

    currentSaveId = gameState.id;
    allSaves.push(gameState);
    saveCurrentGame();

    // JAVÍTVA: A UI frissítési hívást eltávolítottuk, ezt már az events.js végzi.
}

export function updateGameState(updates) {
    gameState = { ...gameState, ...updates };
}
