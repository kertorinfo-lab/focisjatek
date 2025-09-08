import { gameState, saveCurrentGame, updateGameState } from './state.js';
import { getLeagueData, simulateOtherMatch } from './data.js';
import { showMainHub } from './ui.js';

// --- MECCS SZIMULÁCIÓ ÉS 2D JÁTÉK LOGIKA ---

let currentMatchData, simulationInterval, gameLoop;
let player, ball, opponents, teammates, keys, homeGoal;
let isPaused = false, miniGameActive = false;

const matchSimulatorOverlay = document.getElementById('matchSimulatorOverlay');
const matchResultOverlay = document.getElementById('matchResultOverlay');
const matchGameOverlay = document.getElementById('matchGameOverlay');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function processMatchResult(result) {
    const homeTeam = gameState.league.find(t => t.name === result.homeName);
    const awayTeam = gameState.league.find(t => t.name === result.awayName);
    if (!homeTeam || !awayTeam) return;
    homeTeam.played++; awayTeam.played++;
    homeTeam.gf += result.homeScore; homeTeam.ga += result.awayScore;
    awayTeam.gf += result.awayScore; awayTeam.ga += result.homeScore;
    homeTeam.gd = homeTeam.gf - homeTeam.ga;
    awayTeam.gd = awayTeam.gf - awayTeam.ga;
    if (result.homeScore > result.awayScore) { homeTeam.wins++; awayTeam.losses++; homeTeam.points += 3; }
    else if (result.awayScore > result.homeScore) { awayTeam.wins++; homeTeam.losses++; awayTeam.points += 3; }
    else { homeTeam.draws++; awayTeam.draws++; homeTeam.points++; awayTeam.points++; }
}

function showMatchResult(result) {
    const leagueTeams = getLeagueData(gameState.leagueName).teams;
    document.getElementById('resultHomeLogo').src = leagueTeams.find(t => t.name === result.homeName)?.logo || '';
    document.getElementById('resultHomeName').textContent = result.homeName;
    document.getElementById('resultAwayLogo').src = leagueTeams.find(t => t.name === result.awayName)?.logo || '';
    document.getElementById('resultAwayName').textContent = result.awayName;
    document.getElementById('resultScore').textContent = `${result.homeScore} - ${result.awayScore}`;
    let bonus = 0;
    const playerTeamWon = (gameState.team.name === result.homeName && result.homeScore > result.awayScore) || (gameState.team.name === result.awayName && result.awayScore > result.homeScore);
    if (playerTeamWon) bonus += 20000;
    if (result.homeScore === result.awayScore) bonus += 5000;
    bonus += result.playerGoals * 10000;
    bonus += result.playerAssists * 5000;
    updateGameState({
        money: gameState.money + (gameState.salary || 0) + bonus,
        goals: gameState.goals + result.playerGoals,
        assists: gameState.assists + result.playerAssists,
        matchesPlayed: gameState.matchesPlayed + 1,
    });
    document.getElementById('resultPlayerPerformance').textContent = `Gólok: ${result.playerGoals}, Gólpasszok: ${result.playerAssists}`;
    document.getElementById('resultEarnings').textContent = `Fizetés: €${(gameState.salary || 0).toLocaleString()}, Bónusz: €${bonus.toLocaleString()}`;
    matchResultOverlay.classList.remove('hidden');
}

function endMatch() {
    clearInterval(simulationInterval);
    addMatchEvent("VÉGE A MÉRKŐZÉSNEK!", "fa-stopwatch");
    setTimeout(() => {
        matchSimulatorOverlay.classList.add('hidden');
        const finalResult = { ...currentMatchData, homeName: currentMatchData.fixture.home, awayName: currentMatchData.fixture.away };
        processMatchResult(finalResult);
        const otherFixtures = gameState.schedule[gameState.currentMatchday].filter(f => f.home !== gameState.team.name && f.away !== gameState.team.name);
        otherFixtures.forEach(fixture => { processMatchResult(simulateOtherMatch(fixture.home, fixture.away, gameState.leagueName)); });
        updateGameState({ currentMatchday: gameState.currentMatchday + 1 });
        saveCurrentGame();
        showMatchResult(finalResult);
        currentMatchData = null;
    }, 2000);
}

function addMatchEvent(comment, icon) {
    if (!currentMatchData) return;
    currentMatchData.events.unshift({ time: Math.floor(currentMatchData.time), comment, icon });
    updateSimulatorUI();
}

function updateSimulatorUI() {
    if (!currentMatchData) return;
    document.getElementById('simScore').textContent = `${currentMatchData.homeScore} - ${currentMatchData.awayScore}`;
    document.getElementById('simTime').textContent = `${String(Math.floor(currentMatchData.time)).padStart(2, '0')}:00`;
    const timeline = document.getElementById('commentary-timeline');
    timeline.innerHTML = '';
    currentMatchData.events.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = `event-item ${event.icon.replace('fa-', '')}`;
        eventDiv.innerHTML = `<div class="event-icon"><i class="fas ${event.icon}"></i></div><div class="event-text"><span class="time">${String(event.time).padStart(2, '0')}'</span> <span class="comment">${event.comment}</span></div>`;
        timeline.appendChild(eventDiv);
    });
    timeline.scrollTop = 0;
}

function runSimulation() {
    simulationInterval = setInterval(() => {
        if (isPaused || !currentMatchData) return;
        currentMatchData.time += 2;
        if (currentMatchData.time >= 90) { endMatch(); return; }
        // ... a szimuláció többi logikája (gólok, helyzetek, stb.) ...
        updateSimulatorUI();
    }, 1000);
}

function startMatchSimulator() {
    const fixture = gameState.schedule[gameState.currentMatchday].find(f => f.home === gameState.team.name || f.away === gameState.team.name);
    if (!fixture) {
        // Pihenőhét, csak a többi meccset szimuláljuk
        gameState.schedule[gameState.currentMatchday].forEach(f => processMatchResult(simulateOtherMatch(f.home, f.away, gameState.leagueName)));
        updateGameState({ currentMatchday: gameState.currentMatchday + 1 });
        saveCurrentGame();
        showMainHub();
        return;
    }
    const homeTeam = getTeamData(fixture.home);
    const awayTeam = getTeamData(fixture.away);
    currentMatchData = {
        fixture, time: 0, homeScore: 0, awayScore: 0, playerGoals: 0, playerAssists: 0,
        events: [{ time: 0, comment: "Kezdőrúgás!", icon: "fa-futbol" }], halfTimeReached: false
    };
    document.getElementById('simHomeName').textContent = homeTeam.name;
    document.getElementById('simAwayName').textContent = awayTeam.name;
    updateSimulatorUI();
    document.getElementById('mainHub').classList.add('hidden');
    matchSimulatorOverlay.classList.remove('hidden');
    isPaused = false;
    document.getElementById('sim-pause-btn').innerHTML = '<i class="fas fa-pause"></i>';
    runSimulation();
}

export function playNextMatch() {
    if (!gameState.schedule || gameState.currentMatchday >= gameState.schedule.length) {
        alert("A szezon véget ért!"); // TODO: Szezon végi logika
        return;
    }
    startMatchSimulator();
}

// --- 2D JÁTÉK ---
// Ide kerül a teljes 2D-s játék logikája:
// function startMatchGame(...)
// function updateGame() { ... }
// function draw() { ... }
// function handleKeyDown(e) { ... }, stb.

