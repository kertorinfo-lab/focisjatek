import * as DataModule from './data.js';
console.log("DataModule exports:", DataModule);




// --- JÁTÉKÁLLAPOT KEZELŐ MODUL (state.js) ---
import { generateSchedule, generateRosterForTeam, getLeagueData } from './data.js';

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
        if (gameIndex !== -1) allSaves[gameIndex] = gameState;
        else allSaves.push(gameState);
        localStorage.setItem(SAVE_KEY, JSON.stringify(allSaves));
    } catch (e) { console.error("Hiba a játék mentésekor: ", e); }
}

export function getAllSaves() { return allSaves; }

export function deleteSave(saveId) {
    allSaves = allSaves.filter(save => save.id !== saveId);
    localStorage.setItem(SAVE_KEY, JSON.stringify(allSaves));
}

// --- JÁTÉK LOGIKAI FÜGGVÉNYEK ---
export function loadSelectedGame(saveId) {
    const selectedSave = allSaves.find(save => save.id === saveId);
    if (!selectedSave) return;
    currentSaveId = saveId;
    gameState = selectedSave;
    
    // Keret és szezon generálása, ha szükséges
    if (!gameState.team.players || gameState.team.players.length === 0) {
        generateRosterForTeam(gameState.team.name, gameState);
    }
    if (!gameState.schedule || gameState.schedule.length === 0 || gameState.currentMatchday >= gameState.schedule.length) {
       createNewSeason(gameState);
    }
}

export function startNewGame(playerName, nationality, leagueName, chosenTeam) {
    const leagueData = getLeagueData(leagueName);
    const leagueTeams = leagueData.teams;

    gameState = {
        id: Date.now(),
        playerName: playerName || "Játékos",
        age: 17, nationality, rating: 60,
        team: chosenTeam, leagueName,
        money: 250000, salary: 15000,
        goals: 0, assists: 0, matchesPlayed: 0,
        trophies: [],
        clubHistory: [{ name: chosenTeam.name, year: `${new Date().getFullYear()}-` }],
        jerseyNumber: Math.floor(Math.random() * 98) + 1,
        transferOffers: [], coins: 10,
    };
    
    createNewSeason(gameState);
    generateRosterForTeam(chosenTeam.name, gameState);

    currentSaveId = gameState.id;
    allSaves.push(gameState);
    saveCurrentGame();
}

// ÚJ: Eredményfeldolgozó és állapotfrissítő függvény
export function processMatchDayResult(result) {
    if (result.isRestDay) {
        // Csak a többi meccs eredményét dolgozzuk fel
        result.otherResults.forEach(res => processSingleMatchResult(res));
    } else {
        // A játékos meccsének és a többi meccsnek az eredményét is feldolgozzuk
        processSingleMatchResult(result.playerMatch);
        result.otherResults.forEach(res => processSingleMatchResult(res));

        // Játékos statisztikák és pénz frissítése
        const playerResult = result.playerMatch;
        let bonus = 0;
        const playerTeamWon = (gameState.team.name === playerResult.homeName && playerResult.homeScore > playerResult.awayScore) ||
                              (gameState.team.name === playerResult.awayName && playerResult.awayScore > playerResult.homeScore);
        
        if (playerTeamWon) bonus += 20000;
        if (playerResult.homeScore === playerResult.awayScore) bonus += 5000;
        bonus += playerResult.playerGoals * 10000;
        bonus += playerResult.playerAssists * 5000;

        gameState.money += (gameState.salary || 0) + bonus;
        gameState.goals += playerResult.playerGoals;
        gameState.assists += playerResult.playerAssists;
        gameState.matchesPlayed++;
    }

    gameState.currentMatchday++;
    saveCurrentGame();
}

function processSingleMatchResult(result) {
    const homeTeam = gameState.league.find(t => t.name === result.homeName);
    const awayTeam = gameState.league.find(t => t.name === result.awayName);
    if (!homeTeam || !awayTeam) return;

    homeTeam.played++; awayTeam.played++;
    homeTeam.gf += result.homeScore; homeTeam.ga += result.awayScore;
    awayTeam.gf += result.awayScore; awayTeam.ga += result.homeScore;
    homeTeam.gd = homeTeam.gf - homeTeam.ga;
    awayTeam.gd = awayTeam.gf - awayTeam.ga;

    if (result.homeScore > result.awayScore) {
        homeTeam.wins++; awayTeam.losses++; homeTeam.points += 3;
    } else if (result.awayScore > result.homeScore) {
        awayTeam.wins++; homeTeam.losses++; awayTeam.points += 3;
    } else {
        homeTeam.draws++; awayTeam.draws++;
        homeTeam.points++; awayTeam.points++;
    }
}

function createNewSeason(gs) {
    const leagueTeams = getLeagueData(gs.leagueName).teams;
    gs.schedule = generateSchedule(leagueTeams.map(t => t.name));
    gs.currentMatchday = 0;
    gs.league = leagueTeams.map(t => ({
        name: t.name, played: 0, wins: 0, draws: 0, losses: 0,
        gf: 0, ga: 0, gd: 0, points: 0
    }));
}

