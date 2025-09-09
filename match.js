/**
 * match.js
 * Ez a modul KIZÁRÓLAG a meccs szimulációjáért és a 2D-s minijátékért felel.
 * Nem módosítja a globális játékállapotot, és nem hív UI függvényeket.
 * A meccs végén egy Promise-ban visszaadja a végeredményt.
 */

import { getLeagueData, getTeamData, simulateOtherMatch } from './data.js';

// DOM elemek és állapotváltozók a modulon belül maradnak
let matchSimulatorOverlay, matchResultOverlay, matchGameOverlay, canvas, ctx;
let simPauseBtn, commentaryTimeline, simScoreEl, simTimeEl, simHomeNameEl, simAwayNameEl;
let pitchEnterBanner, bannerPlayerNameEl, halfTimeBanner;
let joystickZone, joystickHandle, shootBtn, passBtn;

let currentMatchData, simulationInterval, gameLoop, keys;
let isPaused = false,
    miniGameActive = false;
let resolveMatchPromise; // A Promise-t tároló változó

// Ezt a függvényt a main.js hívja meg
export function initMatchElements() {
    matchSimulatorOverlay = document.getElementById('matchSimulatorOverlay');
    matchResultOverlay = document.getElementById('matchResultOverlay');
    matchGameOverlay = document.getElementById('matchGameOverlay');
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    simPauseBtn = document.getElementById('sim-pause-btn');
    commentaryTimeline = document.getElementById('commentary-timeline');
    simScoreEl = document.getElementById('simScore');
    simTimeEl = document.getElementById('simTime');
    simHomeNameEl = document.getElementById('simHomeName');
    simAwayNameEl = document.getElementById('simAwayName');
    pitchEnterBanner = document.getElementById('pitch-enter-banner');
    bannerPlayerNameEl = document.getElementById('bannerPlayerName');
    halfTimeBanner = document.getElementById('half-time-banner');
    joystickZone = document.getElementById('joystick-zone');
    joystickHandle = document.getElementById('joystick-handle');
    shootBtn = document.getElementById('shoot-btn');
    passBtn = document.getElementById('pass-btn');

    simPauseBtn?.addEventListener('click', togglePause);
    window.addEventListener('resize', resizeCanvas);
}


// A FŐ EXPORTÁLT FÜGGVÉNY, EZT HÍVJA AZ EVENTS.JS
export function playNextMatch(gameState) {
    return new Promise((resolve) => {
        resolveMatchPromise = resolve; // Elmentjük a resolve függvényt, hogy a meccs végén hívhassuk meg

        const fixture = gameState.schedule[gameState.currentMatchday].find(f => f.home === gameState.team.name || f.away === gameState.team.name);

        if (!fixture) {
            // Pihenőhét logikája
            const otherResults = gameState.schedule[gameState.currentMatchday]
                .map(f => simulateOtherMatch(f.home, f.away, gameState.leagueName));
            
            resolve({
                playerMatch: null,
                otherResults: otherResults,
                isRestDay: true
            });
            return;
        }

        startMatchSimulator(fixture, gameState);
    });
}


function startMatchSimulator(fixture, gameState) {
    const homeTeam = getTeamData(fixture.home);
    const awayTeam = getTeamData(fixture.away);

    currentMatchData = {
        fixture,
        gameState,
        time: 0,
        homeScore: 0,
        awayScore: 0,
        playerGoals: 0,
        playerAssists: 0,
        events: [{ time: 0, comment: "Kezdőrúgás!", icon: "fa-futbol" }],
        halfTimeReached: false
    };

    simHomeNameEl.textContent = homeTeam.name;
    simAwayNameEl.textContent = awayTeam.name;
    bannerPlayerNameEl.textContent = gameState.playerName;
    updateSimulatorUI();

    document.getElementById('mainHub').classList.add('hidden');
    matchSimulatorOverlay.classList.remove('hidden');
    isPaused = false;
    simPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';

    runSimulation();
}

function runSimulation() {
    simulationInterval = setInterval(() => {
        if (isPaused || !currentMatchData) return;
        currentMatchData.time += 2;

        if (currentMatchData.time >= 90) {
            endMatch();
            return;
        }

        if (currentMatchData.time >= 45 && !currentMatchData.halfTimeReached) {
            currentMatchData.halfTimeReached = true;
            clearInterval(simulationInterval);
            addMatchEvent("FÉLIDŐ!", "fa-coffee");
            halfTimeBanner.classList.remove('hidden');
            setTimeout(() => {
                halfTimeBanner.classList.add('hidden');
                runSimulation();
            }, 4000);
            return;
        }

        const { fixture, gameState } = currentMatchData;
        const homeTeam = getTeamData(fixture.home);
        const awayTeam = getTeamData(fixture.away);
        const playerIsHome = gameState.team.name === homeTeam.name;
        const opponentTeam = playerIsHome ? awayTeam : homeTeam;
        const chanceModifier = (gameState.team.strength - opponentTeam.strength) / 250;
        
        // Esély a minijátékra
        if (Math.random() < 0.15 + chanceModifier) {
            clearInterval(simulationInterval);
            addMatchEvent("HELYZET! A te csapatod támad!", "fa-star");
            pitchEnterBanner.classList.remove('hidden');
            setTimeout(() => {
                matchSimulatorOverlay.classList.add('hidden');
                pitchEnterBanner.classList.add('hidden');
                startMatchGame(opponentTeam.strength);
            }, 2500);
            return;
        }

        // Esély az ellenfél góljára
        if (Math.random() < 0.04 - chanceModifier) {
            if (playerIsHome) currentMatchData.awayScore++;
            else currentMatchData.homeScore++;
            addMatchEvent(`GÓL! Az ellenfél szerzett gólt! (${opponentTeam.name})`, "fa-futbol");
        }
        
        updateSimulatorUI();
    }, 1000);
}

function endMatch() {
    clearInterval(simulationInterval);
    addMatchEvent("VÉGE A MÉRKŐZÉSNEK!", "fa-stopwatch");

    setTimeout(() => {
        matchSimulatorOverlay.classList.add('hidden');
        
        const finalResult = {
            homeName: currentMatchData.fixture.home,
            awayName: currentMatchData.fixture.away,
            homeScore: currentMatchData.homeScore,
            awayScore: currentMatchData.awayScore,
            playerGoals: currentMatchData.playerGoals,
            playerAssists: currentMatchData.playerAssists,
        };

        const otherFixtures = currentMatchData.gameState.schedule[currentMatchData.gameState.currentMatchday]
            .filter(f => f.home !== finalResult.homeName);

        const otherResults = otherFixtures.map(fixture =>
            simulateOtherMatch(fixture.home, fixture.away, currentMatchData.gameState.leagueName)
        );

        // Visszaadjuk az eredményt a Promise-on keresztül
        if (resolveMatchPromise) {
            resolveMatchPromise({
                playerMatch: finalResult,
                otherResults: otherResults,
                isRestDay: false
            });
        }
        currentMatchData = null;
    }, 2000);
}

function addMatchEvent(comment, icon) {
    if (!currentMatchData) return;
    currentMatchData.events.unshift({
        time: Math.floor(currentMatchData.time),
        comment,
        icon
    });
    updateSimulatorUI();
}

function updateSimulatorUI() {
    if (!currentMatchData) return;
    simScoreEl.textContent = `${currentMatchData.homeScore} - ${currentMatchData.awayScore}`;
    simTimeEl.textContent = `${String(Math.floor(currentMatchData.time)).padStart(2, '0')}:00`;
    
    commentaryTimeline.innerHTML = '';
    currentMatchData.events.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = `event-item`;
        eventDiv.innerHTML = `<div class="event-icon"><i class="fas ${event.icon}"></i></div><div class="event-text"><span class="time">${String(event.time).padStart(2, '0')}'</span> <span class="comment">${event.comment}</span></div>`;
        commentaryTimeline.appendChild(eventDiv);
    });
}

function togglePause() {
    isPaused = !isPaused;
    simPauseBtn.innerHTML = isPaused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
}

// ... A 2D-s játék függvényei (startMatchGame, updateGame, draw, stb.) változatlanok maradnak ...
// A endMatchAction függvényt kell módosítani:

function endMatchAction(isGoal, reason = 'tackle') {
    if (!miniGameActive) return;
    miniGameActive = false;
    cancelAnimationFrame(gameLoop);
    // ... event listener-ek eltávolítása ...

    const playerIsHome = currentMatchData.gameState.team.name === currentMatchData.fixture.home;
    let eventMessage = "";
    let eventIcon = "fa-times-circle";

    if (isGoal) {
        if (playerIsHome) currentMatchData.homeScore++;
        else currentMatchData.awayScore++;

        if (keys.shotByPlayer) { // feltételezve, hogy ezt valahol beállítod lövéskor
            currentMatchData.playerGoals++;
            eventMessage = `GÓÓÓÓL! Te szerezted a gólt!`;
        } else if (keys.passedByPlayer) {
             currentMatchData.playerAssists++;
             eventMessage = `GÓLPASSZ! Remek előkészítés!`;
        } else {
            eventMessage = `GÓL! Szép csapatmunka!`;
        }
        eventIcon = "fa-futbol";
    } else {
        eventMessage = "Elhibázott lehetőség.";
    }

    addMatchEvent(eventMessage, eventIcon);
    matchGameOverlay.classList.add('hidden');
    matchSimulatorOverlay.classList.remove('hidden');
    updateSimulatorUI();

    setTimeout(() => {
        if (currentMatchData.time < 90) {
            runSimulation();
        } else {
            endMatch();
        }
    }, 1500);
}
// Itt következne a 2D játék teljes logikája (startMatchGame, resizeCanvas, stb.)
// A lényeg, hogy a végén az endMatchAction fusson le.
function resizeCanvas() { /* ... */ }
function startMatchGame(opponentStrength) { /* ... */ }
