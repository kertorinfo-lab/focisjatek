/**
 * match.js
 * Ez a modul KIZÁRÓLAG a meccs szimulációjáért és a 2D-s minijátékért felel.
 * Nem módosítja a globális játékállapotot, és nem hív UI függvényeket.
 * A meccs végén egy Promise-ban visszaadja a végeredményt.
 */

import { getTeamData, simulateOtherMatch } from './data.js';

// DOM elemek és állapotváltozók a modulon belül maradnak
let matchSimulatorOverlay, matchResultOverlay, matchGameOverlay, canvas, ctx;
let simPauseBtn, commentaryTimeline, simScoreEl, simTimeEl, simHomeNameEl, simAwayNameEl;
let pitchEnterBanner, bannerPlayerNameEl, halfTimeBanner;
let joystickZone, joystickHandle, shootBtn, passBtn;

let currentMatchData, simulationInterval, gameLoop, keys = {}; 
let isPaused = false,
    miniGameActive = false;
let resolveMatchPromise; // A Promise-t tároló változó

// --- MECCS SZIMULÁTOR INICIALIZÁLÁSA ---

// Ezt a függvényt a main.js hívja meg
export function initMatchElements() {
    matchSimulatorOverlay = document.getElementById('matchSimulatorOverlay');
    matchResultOverlay = document.getElementById('matchResultOverlay');
    matchGameOverlay = document.getElementById('matchGameOverlay');
    canvas = document.getElementById('gameCanvas');
    ctx = canvas?.getContext('2d'); 
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

        const fixture = gameState.schedule?.[gameState.currentMatchday]?.find(f => f.home === gameState.team.name || f.away === gameState.team.name);
        
        // Hiba kezelése, ha nincs sorsolás (szezon vége, pihenőhét)
        if (!fixture) {
            const fixturesToday = gameState.schedule?.[gameState.currentMatchday] || [];
            const otherResults = fixturesToday
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


// --- MECCS SZIMULÁTOR LOGIKA ---

function startMatchSimulator(fixture, gameState) {
    const homeTeam = getTeamData(fixture.home);
    const awayTeam = getTeamData(fixture.away);

    // Csapatadat ellenőrzés
    if (!homeTeam || !awayTeam) {
        console.error("Hiba a meccs indításakor: Hiányzó csapatadatok!", fixture.home, awayTeam);
        if (resolveMatchPromise) {
            resolveMatchPromise({ playerMatch: null, otherResults: [], isRestDay: true, error: "Hiányzó csapatadat" });
        }
        return;
    }

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

    // DOM elemek frissítése biztonsági ellenőrzéssel
    if (simHomeNameEl) {
        simHomeNameEl.textContent = homeTeam.name;
    } else {
         console.warn("Hiányzó DOM elem: simHomeNameEl");
    }
    
    if (simAwayNameEl) {
        simAwayNameEl.textContent = awayTeam.name;
    } else {
         console.warn("Hiányzó DOM elem: simAwayNameEl");
    }
    
    if (bannerPlayerNameEl) {
        bannerPlayerNameEl.textContent = gameState.playerName;
    }
    
    updateSimulatorUI();

    document.getElementById('mainHub')?.classList.add('hidden');
    matchSimulatorOverlay?.classList.remove('hidden');
    isPaused = false;
    
    // ✅ KRITIKUS BIZTONSÁGI ELLENŐRZÉS: simPauseBtn
    if (simPauseBtn) { 
        simPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        // Ha a simPauseBtn hiányzik, a kód itt elkerüli az összeomlást (Type Error)
        console.warn("Hiányzó DOM elem: simPauseBtn. Kérlek, ellenőrizd az index.html-ben lévő 'sim-pause-btn' ID-t!");
    }

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
            halfTimeBanner?.classList.remove('hidden');
            setTimeout(() => {
                halfTimeBanner?.classList.add('hidden');
                runSimulation();
            }, 4000);
            return;
        }

        const { fixture, gameState } = currentMatchData;
        const homeTeam = getTeamData(fixture.home);
        const awayTeam = getTeamData(fixture.away);
        
        if (!homeTeam || !awayTeam) return endMatch();

        const playerIsHome = gameState.team.name === homeTeam.name;
        const opponentTeam = playerIsHome ? awayTeam : homeTeam;
        const chanceModifier = (gameState.team.strength - opponentTeam.strength) / 250;
        
        // Esély a minijátékra
        if (Math.random() < 0.15 + chanceModifier) {
            clearInterval(simulationInterval);
            addMatchEvent("HELYZET! A te csapatod támad!", "fa-star");
            pitchEnterBanner?.classList.remove('hidden');
            setTimeout(() => {
                matchSimulatorOverlay?.classList.add('hidden');
                pitchEnterBanner?.classList.add('hidden');
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
        matchSimulatorOverlay?.classList.add('hidden');
        
        const finalResult = {
            homeName: currentMatchData.fixture.home,
            awayName: currentMatchData.fixture.away,
            homeScore: currentMatchData.homeScore,
            awayScore: currentMatchData.awayScore,
            playerGoals: currentMatchData.playerGoals,
            playerAssists: currentMatchData.playerAssists,
        };

        const currentMatchdayFixtures = currentMatchData.gameState.schedule[currentMatchData.gameState.currentMatchday] || [];

        const otherFixtures = currentMatchdayFixtures
            .filter(f => f.home !== finalResult.homeName || f.away !== finalResult.awayName);

        const otherResults = otherFixtures.map(fixture =>
            simulateOtherMatch(fixture.home, fixture.away, currentMatchData.gameState.leagueName)
        );

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
    if (simScoreEl) simScoreEl.textContent = `${currentMatchData.homeScore} - ${currentMatchData.awayScore}`;
    if (simTimeEl) simTimeEl.textContent = `${String(Math.floor(currentMatchData.time)).padStart(2, '0')}:00`;
    
    if (commentaryTimeline) {
        commentaryTimeline.innerHTML = '';
        currentMatchData.events.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.className = `event-item`;
            eventDiv.innerHTML = `<div class="event-icon"><i class="fas ${event.icon}"></i></div><div class="event-text"><span class="time">${String(event.time).padStart(2, '0')}'</span> <span class="comment">${event.comment}</span></div>`;
            commentaryTimeline.appendChild(eventDiv);
        });
    }
}

function togglePause() {
    isPaused = !isPaused;
    if (simPauseBtn) simPauseBtn.innerHTML = isPaused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
}

// --- 2D MINI-JÁTÉK HELYETTESÍTŐ FÜGGVÉNYEK ---

function resizeCanvas() { 
    if (canvas) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }
}

function startMatchGame(opponentStrength) { 
    miniGameActive = true;
    
    console.log(`Mini-játék indul: Ellenfél erőssége ${opponentStrength}`);
    
    setTimeout(() => {
        const isGoal = Math.random() < 0.5;
        keys.shotByPlayer = true; 
        endMatchAction(isGoal, isGoal ? 'shot' : 'tackle');
    }, 3000); 
}

function endMatchAction(isGoal, reason = 'tackle') {
    if (!miniGameActive) return;
    miniGameActive = false;
    cancelAnimationFrame(gameLoop);

    const playerIsHome = currentMatchData.gameState.team.name === currentMatchData.fixture.home;
    let eventMessage = "";
    let eventIcon = "fa-times-circle";

    if (isGoal) {
        if (playerIsHome) currentMatchData.homeScore++;
        else currentMatchData.awayScore++;

        if (keys.shotByPlayer) { 
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
    matchGameOverlay?.classList.add('hidden');
    matchSimulatorOverlay?.classList.remove('hidden');
    updateSimulatorUI();

    keys = {}; 

    setTimeout(() => {
        if (currentMatchData.time < 90) {
            runSimulation();
        } else {
            endMatch();
        }
    }, 1500);
}
