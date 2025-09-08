import { generateSchedule, generateRosterForTeam, getLeagueData } from './data.js';
import { showMainHub } from './ui.js';

// --- JÁTÉKÁLLAPOT KEZELÉSE ---

export let gameState = {};
let allSaves = [];
let currentSaveId = null;
const SAVE_KEY = 'footballCrazySaves';

export function loadAllSaves() {
    const savedData = localStorage.getItem(SAVE_KEY);
    allSaves = savedData ? JSON.parse(savedData) : [];
}

export function saveCurrentGame() {
    try {
        const gameIndex = allSaves.findIndex(save => save.id === currentSaveId);
        if (gameIndex !== -1) {
            allSaves[gameIndex] = gameState;
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
    saveCurrentGame(); // Mivel a current game nem változik, csak a teljes listát mentjük
    localStorage.setItem(SAVE_KEY, JSON.stringify(allSaves));
}

export function loadSelectedGame(saveId) {
    const selectedSave = allSaves.find(save => save.id === saveId);
    if (selectedSave) {
        currentSaveId = saveId;
        gameState = selectedSave;

        if (!gameState.team.players || gameState.team.players.length === 0) {
            generateRosterForTeam(gameState.team.name);
        }

        if (!gameState.schedule || gameState.schedule.length === 0 || gameState.currentMatchday >= gameState.schedule.length) {
            const leagueTeams = getLeagueData(gameState.leagueName).teams;
            gameState.schedule = generateSchedule(leagueTeams.map(t => t.name));
            gameState.currentMatchday = 0;
            gameState.league = leagueTeams.map(t => ({
                name: t.name,
                played: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                gf: 0,
                ga: 0,
                gd: 0,
                points: 0
            }));
            saveCurrentGame();
        }
        showMainHub();
    }
}

export function startNewGame(playerName, nationality, leagueName, chosenTeam) {
    const leagueData = getLeagueData(leagueName);
    const leagueTeams = leagueData.teams;

    gameState = {
        id: Date.now(),
        playerName: playerName || "Játékos",
        age: 17,
        nationality: nationality,
        leagueName: leagueName,
        rating: 60,
        team: chosenTeam,
        money: 250000,
        salary: 15000,
        goals: 0,
        assists: 0,
        matchesPlayed: 0,
        trophies: [],
        clubHistory: [{
            name: chosenTeam.name,
            year: new Date().getFullYear() + '-'
        }],
        league: leagueTeams.map(t => ({
            name: t.name,
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            gf: 0,
            ga: 0,
            gd: 0,
            points: 0
        })),
        currentMatchday: 0,
        jerseyNumber: Math.floor(Math.random() * 98) + 1,
        schedule: generateSchedule(leagueTeams.map(t => t.name)),
        transferOffers: [],
        coins: 10
    };

    generateRosterForTeam(chosenTeam.name);

    currentSaveId = gameState.id;
    allSaves.push(gameState);
    saveCurrentGame();

    showMainHub();
}

export function updateGameState(updates) {
    gameState = { ...gameState,
        ...updates
    };
}

