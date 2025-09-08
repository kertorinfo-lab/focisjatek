import { gameState, saveCurrentGame, updateGameState } from './state.js';
import { getLeagueData, getTeamData, simulateOtherMatch } from './data.js';
import { showMainHub } from './ui.js';

// --- MECCS SZIMULÁCIÓ ÉS 2D JÁTÉK LOGIKA ---

// Modul szintű változók
let currentMatchData, simulationInterval, gameLoop;
let player, ball, opponents, teammates, keys, homeGoal;
let isPaused = false,
    miniGameActive = false;
let opponentTeamColor = '#e74c3c';
let currentOpponentStrength = 70;

// Konstansok a 2D játékhoz
const PLAYER_BASE_SPEED = 3.5;
const BALL_FRICTION = 0.98;

// DOM Elemek
let matchSimulatorOverlay, matchResultOverlay, matchGameOverlay, canvas, ctx;
let simPauseBtn, commentaryTimeline, simScoreEl, simTimeEl, simHomeNameEl, simAwayNameEl;
let pitchEnterBanner, bannerPlayerNameEl, halfTimeBanner;
let gameHomeNameEl, gameAwayNameEl, gameScoreEl, homeProgressEl, awayProgressEl;
let joystickZone, joystickHandle, shootBtn, passBtn;

// Ezt a függvényt a main.js hívja meg, miután minden betöltődött
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
    gameHomeNameEl = document.getElementById('gameHomeName');
    gameAwayNameEl = document.getElementById('gameAwayName');
    gameScoreEl = document.getElementById('gameScore');
    homeProgressEl = document.getElementById('homeProgress');
    awayProgressEl = document.getElementById('awayProgress');
    joystickZone = document.getElementById('joystick-zone');
    joystickHandle = document.getElementById('joystick-handle');
    shootBtn = document.getElementById('shoot-btn');
    passBtn = document.getElementById('pass-btn');

    simPauseBtn?.addEventListener('click', togglePause);
    window.addEventListener('resize', resizeCanvas);
}

function processMatchResult(result) {
    const homeTeam = gameState.league.find(t => t.name === result.homeName);
    const awayTeam = gameState.league.find(t => t.name === result.awayName);
    if (!homeTeam || !awayTeam) return;
    homeTeam.played++;
    awayTeam.played++;
    homeTeam.gf += result.homeScore;
    homeTeam.ga += result.awayScore;
    awayTeam.gf += result.awayScore;
    awayTeam.ga += result.homeScore;
    homeTeam.gd = homeTeam.gf - homeTeam.ga;
    awayTeam.gd = awayTeam.gf - awayTeam.ga;
    if (result.homeScore > result.awayScore) {
        homeTeam.wins++;
        awayTeam.losses++;
        homeTeam.points += 3;
    } else if (result.awayScore > result.homeScore) {
        awayTeam.wins++;
        homeTeam.losses++;
        awayTeam.points += 3;
    } else {
        homeTeam.draws++;
        awayTeam.draws++;
        homeTeam.points++;
        awayTeam.points++;
    }
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
        const finalResult = { ...currentMatchData,
            homeName: currentMatchData.fixture.home,
            awayName: currentMatchData.fixture.away
        };
        processMatchResult(finalResult);
        const otherFixtures = gameState.schedule[gameState.currentMatchday].filter(f => f.home !== gameState.team.name && f.away !== gameState.team.name);
        otherFixtures.forEach(fixture => {
            processMatchResult(simulateOtherMatch(fixture.home, fixture.away, gameState.leagueName));
        });
        updateGameState({
            currentMatchday: gameState.currentMatchday + 1
        });
        saveCurrentGame();
        showMatchResult(finalResult);
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
        eventDiv.className = `event-item ${event.icon.replace('fa-', '')}`;
        eventDiv.innerHTML = `<div class="event-icon"><i class="fas ${event.icon}"></i></div><div class="event-text"><span class="time">${String(event.time).padStart(2, '0')}'</span> <span class="comment">${event.comment}</span></div>`;
        commentaryTimeline.appendChild(eventDiv);
    });
    commentaryTimeline.scrollTop = 0;
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
            addMatchEvent("FÉLIDŐ! Rövid szünet után folytatódik a mérkőzés.", "fa-coffee");
            halfTimeBanner.classList.remove('hidden');
            setTimeout(() => {
                halfTimeBanner.classList.add('hidden');
                runSimulation();
            }, 4000);
            return;
        }

        const homeTeam = getTeamData(currentMatchData.fixture.home);
        const awayTeam = getTeamData(currentMatchData.fixture.away);
        const playerIsHome = gameState.team.name === homeTeam.name;
        const opponentTeam = playerIsHome ? awayTeam : homeTeam;
        const chanceModifier = (gameState.team.strength - opponentTeam.strength) / 250;

        if (Math.random() < 0.15 + chanceModifier) {
            clearInterval(simulationInterval);
            addMatchEvent("HELYZET! A csapatod támad, most rajtad a sor!", "fa-star");
            pitchEnterBanner.classList.remove('hidden');
            setTimeout(() => {
                matchSimulatorOverlay.classList.add('hidden');
                pitchEnterBanner.classList.add('hidden');
                startMatchGame(opponentTeam.strength);
            }, 2500);
            return;
        }

        if (Math.random() < 0.04 - chanceModifier) {
            if (playerIsHome) currentMatchData.awayScore++;
            else currentMatchData.homeScore++;
            addMatchEvent(`GÓL! Az ellenfél szerzett vezetést! (${opponentTeam.name})`, "fa-futbol");
        } else if (Math.random() < 0.2) {
            const comments = ["A középpályán folyik a játék.", "Szép passz a szélen.", "Bedobás következik.", "Az ellenfél birtokolja a labdát."];
            addMatchEvent(comments[Math.floor(Math.random() * comments.length)], "fa-running");
        }

        updateSimulatorUI();
    }, 1000);
}

function startMatchSimulator() {
    const fixture = gameState.schedule[gameState.currentMatchday].find(f => f.home === gameState.team.name || f.away === gameState.team.name);
    if (!fixture) {
        gameState.schedule[gameState.currentMatchday].forEach(f => processMatchResult(simulateOtherMatch(f.home, f.away, gameState.leagueName)));
        updateGameState({
            currentMatchday: gameState.currentMatchday + 1
        });
        saveCurrentGame();
        showMainHub(); // Ez frissíti az UI-t
        return;
    }
    const homeTeam = getTeamData(fixture.home);
    const awayTeam = getTeamData(fixture.away);
    currentMatchData = {
        fixture,
        time: 0,
        homeScore: 0,
        awayScore: 0,
        playerGoals: 0,
        playerAssists: 0,
        events: [{
            time: 0,
            comment: "Kezdőrúgás!",
            icon: "fa-futbol"
        }],
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

export function playNextMatch() {
    if (!gameState.schedule || gameState.currentMatchday >= gameState.schedule.length) {
        alert("A szezon véget ért!"); // Ideiglenes, később szezon végi logikával cserélendő
        return;
    }
    startMatchSimulator();
}

function togglePause() {
    isPaused = !isPaused;
    simPauseBtn.innerHTML = isPaused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
}

// --- 2D JÁTÉK ---

function handleKeyDown(e) {
    keys[e.key] = true;
}

function handleKeyUp(e) {
    keys[e.key] = false;
}

function updateGame() {
    if (!miniGameActive) return;
    let moveX = 0,
        moveY = 0;
    if (keys.ArrowUp) moveY -= 1;
    if (keys.ArrowDown) moveY += 1;
    if (keys.ArrowLeft) moveX -= 1;
    if (keys.ArrowRight) moveX += 1;
    if (moveX !== 0 || moveY !== 0) {
        const angle = Math.atan2(moveY, moveX);
        player.x += Math.cos(angle) * player.speed;
        player.y += Math.sin(angle) * player.speed;
    }
    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
    if (ball.controlledBy === null) {
        const distToPlayer = Math.hypot(player.x - ball.x, player.y - ball.y);
        if (distToPlayer < player.possessionRadius) {
            ball.controlledBy = player;
        }
        teammates.forEach(tm => {
            const distToTm = Math.hypot(tm.x - ball.x, tm.y - ball.y);
            if (distToTm < tm.radius + ball.radius + 5) {
                ball.controlledBy = tm;
                tm.decisionTimeout = 90;
            }
        });
    }
    if (ball.controlledBy === player) {
        let targetX = player.x;
        let targetY = player.y;
        const dribbleDistance = 35;
        let hasMovement = keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight;
        if (hasMovement) {
            let moveAngle = Math.atan2((keys.ArrowDown ? 1 : 0) - (keys.ArrowUp ? 1 : 0), (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0));
            targetX = player.x + Math.cos(moveAngle) * dribbleDistance;
            targetY = player.y + Math.sin(moveAngle) * dribbleDistance;
        }
        ball.x += (targetX - ball.x) * 0.2;
        ball.y += (targetY - ball.y) * 0.2;
        if (keys[' ']) {
            ball.controlledBy = null;
            ball.shotBy = player;
            ball.passedBy = null;
            const angle = Math.atan2((homeGoal.y + homeGoal.height / 2) - player.y, homeGoal.x - player.x);
            ball.speedX = Math.cos(angle) * 20;
            ball.speedY = Math.sin(angle) * 20;
            keys[' '] = false;
        } else if (keys['c']) {
            ball.controlledBy = null;
            ball.passedBy = player;
            let closestTm = null,
                minDist = Infinity;
            teammates.forEach(tm => {
                const dist = Math.hypot(player.x - tm.x, player.y - tm.y);
                if (dist < minDist) {
                    minDist = dist;
                    closestTm = tm;
                }
            });
            if (closestTm) {
                const angle = Math.atan2(closestTm.y - player.y, closestTm.x - player.x);
                ball.speedX = Math.cos(angle) * 15;
                ball.speedY = Math.sin(angle) * 15;
            }
            keys['c'] = false;
        }
    } else if (ball.controlledBy && !ball.controlledBy.isPlayer) {
        let tm = ball.controlledBy;
        tm.decisionTimeout--;
        const angleToGoal = Math.atan2(homeGoal.y - tm.y, homeGoal.x - tm.x);
        tm.x += Math.cos(angleToGoal) * (tm.speed * 0.8);
        tm.y += Math.sin(angleToGoal) * (tm.speed * 0.8);
        ball.x += (tm.x - ball.x) * 0.3;
        ball.y += (tm.y - ball.y) * 0.3;
        if (tm.decisionTimeout <= 0) {
            ball.controlledBy = null;
            if (tm.y < canvas.height / 2 && Math.random() < 0.5) {
                ball.shotBy = tm;
                const angle = Math.atan2((homeGoal.y + homeGoal.height / 2) - tm.y, homeGoal.x - tm.x);
                ball.speedX = Math.cos(angle) * 18;
                ball.speedY = Math.sin(angle) * 18;
            } else {
                ball.passedBy = tm;
                const angle = Math.atan2(player.y - tm.y, player.x - tm.x);
                ball.speedX = Math.cos(angle) * 15;
                ball.speedY = Math.sin(angle) * 15;
            }
        }
    }
    ball.x += ball.speedX;
    ball.y += ball.speedY;
    ball.speedX *= BALL_FRICTION;
    ball.speedY *= BALL_FRICTION;
    teammates.forEach(tm => {
        if (ball.controlledBy !== tm) {
            const idealX = player.x + (tm.jerseyNumber === 8 ? -120 : 120);
            const idealY = player.y - 90;
            const angle = Math.atan2(idealY - tm.y, idealX - tm.x);
            tm.x += Math.cos(angle) * (tm.speed * 0.3);
            tm.y += Math.sin(angle) * (tm.speed * 0.3);
        }
    });
    opponents.forEach(opp => {
        if (!opp.isActive) return;
        if (opp.type === 'defender') {
            const target = ball.controlledBy ? ball.controlledBy : ball;
            const angleToTarget = Math.atan2(target.y - opp.y, target.x - opp.x);
            opp.x += Math.cos(angleToTarget) * opp.speed;
            opp.y += Math.sin(angleToTarget) * opp.speed;
        }
    });
    const keeper = opponents.find(o => o.type === 'goalkeeper');
    if (keeper && keeper.isActive) {
        const keeperAgility = 0.08 + ((currentOpponentStrength - 60) / 40) * 0.06;
        const idealY = homeGoal.y + homeGoal.height + keeper.radius;
        keeper.x += (ball.x - keeper.x) * keeperAgility;
        keeper.x = Math.max(homeGoal.x - homeGoal.width / 2, Math.min(homeGoal.x + homeGoal.width / 2, keeper.x));
        keeper.y += (idealY - keeper.y) * 0.1;
        const distToBall = Math.hypot(ball.x - keeper.x, ball.y - keeper.y);
        const ballSpeed = Math.hypot(ball.speedX, ball.speedY);
        if (distToBall < keeper.radius + ball.radius && ballSpeed > 5) {
            const saveChance = 0.5 + ((currentOpponentStrength - 50) / 50) * 0.45;
            if (Math.random() < saveChance) {
                ball.speedY *= -0.5;
                ball.speedX *= 0.5;
                ball.shotBy = null;
            }
        }
    }
    opponents.forEach(opp => {
        const distToPlayer = Math.hypot(player.x - opp.x, player.y - opp.y);
        if (ball.controlledBy === player && distToPlayer < player.radius + opp.radius) {
            endMatchAction(false, 'tackle_animation');
        }
    });
    if (ball.y < homeGoal.y + homeGoal.height && ball.y > homeGoal.y && ball.x > homeGoal.x - homeGoal.width / 2 && ball.x < homeGoal.x + homeGoal.width / 2) {
        endMatchAction(true, 'goal');
    }
    const sidelineMargin = 5;
    if (ball.x < sidelineMargin || ball.x > canvas.width - sidelineMargin || ball.y > canvas.height - sidelineMargin || ball.y < 0) {
        endMatchAction(false, 'out_of_bounds');
    }
    draw();
    gameLoop = requestAnimationFrame(updateGame);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const grassStripes = 12;
    for (let i = 0; i < grassStripes; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#1a511a' : '#1e5e1e';
        ctx.fillRect(0, i * canvas.height / grassStripes, canvas.width, canvas.height / grassStripes);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    ctx.beginPath();
    ctx.moveTo(5, canvas.height / 2);
    ctx.lineTo(canvas.width - 5, canvas.height / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 60, 0, 2 * Math.PI);
    ctx.stroke();
    const penaltyBoxWidth = Math.min(400, canvas.width * 0.8);
    ctx.strokeRect((canvas.width - penaltyBoxWidth) / 2, 5, penaltyBoxWidth, 120);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(homeGoal.x - homeGoal.width / 2 - 5, homeGoal.y - 15, 5, 25);
    ctx.fillRect(homeGoal.x + homeGoal.width / 2, homeGoal.y - 15, 5, 25);
    ctx.fillRect(homeGoal.x - homeGoal.width / 2 - 5, homeGoal.y - 15, homeGoal.width + 10, 5);
    const netSpacing = 5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 20; i += netSpacing) {
        ctx.beginPath();
        ctx.moveTo(homeGoal.x - homeGoal.width / 2, homeGoal.y + i);
        ctx.lineTo(homeGoal.x + homeGoal.width / 2, homeGoal.y + i);
        ctx.stroke();
    }
    for (let i = -homeGoal.width / 2; i <= homeGoal.width / 2; i += netSpacing) {
        ctx.beginPath();
        ctx.moveTo(homeGoal.x + i, homeGoal.y);
        ctx.lineTo(homeGoal.x + i, homeGoal.y + 20);
        ctx.stroke();
    }
    drawBall(ball);
    opponents.forEach(drawPlayer);
    teammates.forEach(tm => drawPlayer(tm));
    drawPlayer(player);
}

function drawWithShadow(drawFunction) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    drawFunction();
    ctx.restore();
}

function drawBall(b) {
    drawWithShadow(() => {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.stroke();
    });
}

function drawPlayer(entity) {
    drawWithShadow(() => {
        let teamColor = opponentTeamColor;
        if (entity.isPlayer || teammates.includes(entity)) {
            teamColor = gameState.team.color || '#3498db';
        } else if (entity.type === 'goalkeeper') {
            teamColor = '#333333';
        }
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(entity.x, entity.y, entity.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = teamColor;
        ctx.beginPath();
        ctx.arc(entity.x, entity.y, entity.radius * 0.75, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = teamColor.toLowerCase() === '#ffffff' ? 'black' : 'white';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const number = entity.isPlayer ? gameState.jerseyNumber : entity.jerseyNumber;
        ctx.fillText(number, entity.x, entity.y);
        if (entity.isPlayer) {
            if (ball.controlledBy !== player) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(entity.x, entity.y, entity.possessionRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.beginPath();
            ctx.moveTo(entity.x, entity.y - entity.radius - 6);
            ctx.lineTo(entity.x - 7, entity.y - entity.radius - 14);
            ctx.lineTo(entity.x + 7, entity.y - entity.radius - 14);
            ctx.closePath();
            ctx.fillStyle = '#f1c40f';
            ctx.fill();
        }
    });
}

function resizeCanvas() {
    const parent = matchGameOverlay;
    if (!parent) return;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    if (homeGoal) {
        homeGoal.width = canvas.width * 0.4;
        homeGoal.x = canvas.width / 2;
    }
}

function handleJoystickStart(e) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    joystickStart = {
        x: touch.clientX,
        y: touch.clientY
    };
}

function handleJoystickMove(e) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const dx = touch.clientX - joystickStart.x;
    const dy = touch.clientY - joystickStart.y;
    const angle = Math.atan2(dy, dx);
    const distance = Math.min(32, Math.sqrt(dx * dx + dy * dy));
    const x = distance * Math.cos(angle);
    const y = distance * Math.sin(angle);
    joystickHandle.style.transform = `translate(${x}px, ${y}px)`;
    const deadZone = 10;
    keys.ArrowUp = dy < -deadZone;
    keys.ArrowDown = dy > deadZone;
    keys.ArrowLeft = dx < -deadZone;
    keys.ArrowRight = dx > deadZone;
}

function handleJoystickEnd(e) {
    e.preventDefault();
    keys.ArrowUp = keys.ArrowDown = keys.ArrowLeft = keys.ArrowRight = false;
    joystickHandle.style.transform = `translate(0px, 0px)`;
}
const handleShoot = (e) => {
    e.preventDefault();
    keys[' '] = true;
    setTimeout(() => keys[' '] = false, 100);
};
const handlePass = (e) => {
    e.preventDefault();
    keys['c'] = true;
    setTimeout(() => keys['c'] = false, 100);
};

function setupMobileControls() {
    joystickZone.addEventListener('touchstart', handleJoystickStart, {
        passive: false
    });
    joystickZone.addEventListener('touchmove', handleJoystickMove, {
        passive: false
    });
    joystickZone.addEventListener('touchend', handleJoystickEnd, {
        passive: false
    });
    shootBtn.addEventListener('touchstart', handleShoot, {
        passive: false
    });
    passBtn.addEventListener('touchstart', handlePass, {
        passive: false
    });
}

function removeMobileControls() {
    joystickZone.removeEventListener('touchstart', handleJoystickStart);
    joystickZone.removeEventListener('touchmove', handleJoystickMove);
    joystickZone.removeEventListener('touchend', handleJoystickEnd);
    shootBtn.removeEventListener('touchstart', handleShoot);
    passBtn.removeEventListener('touchstart', handlePass);
}


function startMatchGame(opponentStrength) {
    miniGameActive = true;
    currentOpponentStrength = opponentStrength;
    matchGameOverlay.classList.remove('hidden');
    resizeCanvas();

    const homeTeam = getTeamData(currentMatchData.fixture.home);
    const awayTeam = getTeamData(currentMatchData.fixture.away);
    const playerIsHome = gameState.team.name === homeTeam.name;
    opponentTeamColor = playerIsHome ? awayTeam.color : homeTeam.color;

    gameHomeNameEl.textContent = homeTeam.name.substring(0, 3).toUpperCase();
    gameAwayNameEl.textContent = awayTeam.name.substring(0, 3).toUpperCase();
    gameScoreEl.textContent = `${currentMatchData.homeScore} - ${currentMatchData.awayScore}`;

    keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        ' ': false,
        'c': false
    };

    const startX = canvas.width * (0.25 + Math.random() * 0.5);
    player = {
        x: startX,
        y: canvas.height * 0.85,
        speed: PLAYER_BASE_SPEED,
        isPlayer: true,
        radius: 15,
        possessionRadius: 25
    };
    ball = {
        x: startX,
        y: canvas.height * 0.65,
        radius: 8,
        speedX: 0,
        speedY: 0,
        friction: BALL_FRICTION,
        controlledBy: null,
        shotBy: null,
        passedBy: null
    };
    homeGoal = {
        x: canvas.width / 2,
        y: 15,
        width: canvas.width * 0.3,
        height: 20
    };
    teammates = [{
        x: canvas.width * 0.25,
        y: canvas.height * 0.45,
        speed: 2.8,
        radius: 15,
        jerseyNumber: 8,
        decisionTimeout: 0
    }, {
        x: canvas.width * 0.75,
        y: canvas.height * 0.45,
        speed: 2.8,
        radius: 15,
        jerseyNumber: 11,
        decisionTimeout: 0
    }, ];

    const defenderSpeed = 1.6 + ((opponentStrength - 60) / 40) * 1.0;
    const keeperSpeed = 1.5 + ((opponentStrength - 60) / 40) * 0.8;

    opponents = [{
        x: canvas.width / 2,
        y: 70,
        speed: keeperSpeed,
        radius: 16,
        type: 'goalkeeper',
        jerseyNumber: 1,
        isActive: false
    }, {
        x: canvas.width * 0.35,
        y: 220,
        speed: defenderSpeed,
        radius: 15,
        type: 'defender',
        jerseyNumber: 4,
        isActive: false
    }, {
        x: canvas.width * 0.65,
        y: 220,
        speed: defenderSpeed,
        radius: 15,
        type: 'defender',
        jerseyNumber: 5,
        isActive: false
    }, ];

    setTimeout(() => {
        if (opponents) {
            opponents.forEach(o => o.isActive = true);
        }
    }, 1200);

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    setupMobileControls();

    gameLoop = requestAnimationFrame(updateGame);
}

function handleTackleAndEnd() {
    let tackler = opponents[0];
    let minDist = Infinity;
    opponents.forEach(opp => {
        const dist = Math.hypot(opp.x - ball.x, opp.y - ball.y);
        if (dist < minDist) {
            minDist = dist;
            tackler = opp;
        }
    });
    ball.controlledBy = null;
    const angleAwayFromGoal = Math.atan2(canvas.height - tackler.y, (canvas.width / 2) - tackler.x);
    ball.speedX = Math.cos(angleAwayFromGoal) * 15;
    ball.speedY = Math.sin(angleAwayFromGoal) * 15;
    setTimeout(() => {
        endMatchAction(false, 'tackle');
    }, 1200);
}

function endMatchAction(isGoal, reason = 'tackle') {
    if (!miniGameActive) return;
    if (reason === 'tackle_animation') {
        handleTackleAndEnd();
        return;
    }
    miniGameActive = false;
    cancelAnimationFrame(gameLoop);
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    removeMobileControls();
    const playerIsHome = gameState.team.name === currentMatchData.fixture.home;
    let eventMessage = "";
    let eventIcon = "fa-times-circle";
    if (isGoal) {
        if (playerIsHome) currentMatchData.homeScore++;
        else currentMatchData.awayScore++;
        if (ball.shotBy && ball.shotBy.isPlayer) {
            currentMatchData.playerGoals++;
            eventMessage = `GÓÓÓÓL! Fantasztikus befejezés! (${gameState.playerName})`;
        } else {
            const scorer = ball.shotBy;
            eventMessage = `GÓL! Szép csapatmunka! (${scorer ? `${scorer.jerseyNumber} szerezte a gólt!` : 'A csapatod betalált!'})`;
            if (ball.passedBy && ball.passedBy.isPlayer) {
                currentMatchData.playerAssists++;
            }
        }
        eventIcon = "fa-futbol";
    } else {
        switch (reason) {
            case 'out_of_bounds':
                eventMessage = "A labda elhagyta a játékteret. Elhibázott támadás.";
                break;
            case 'tackle':
            default:
                eventMessage = "Szereltek! Az ellenfélhez került a labda.";
                break;
        }
    }
    ball.shotBy = null;
    ball.passedBy = null;
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

