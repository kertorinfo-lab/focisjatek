document.addEventListener('DOMContentLoaded', () => {
    const SAVE_KEY = 'footballLegendSave';
    let gameState = {};

    // --- UI ELEMENTS INITIALIZATION ---
    const matchSimulatorOverlay = document.getElementById('matchSimulatorOverlay');
    const matchGameOverlay = document.getElementById('matchGameOverlay');
    const matchResultOverlay = document.getElementById('matchResultOverlay');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // --- GAME STATE VARIABLES ---
    let gameLoop;
    let player, ball, opponents, teammates, keys, homeGoal;
    let currentMatchData;
    let simulationInterval;
    let miniGameActive = false;
    let isPaused = false;
    let opponentTeamColor = '#e74c3c';

    // --- TEAM DATA ---
    const TEAMS = [
        { name: 'Real Madrid', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png', strength: 90, color: '#FEBE10' },
        { name: 'FC Barcelona', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/1200px-FC_Barcelona_%28crest%29.svg.png', strength: 88, color: '#A50044' },
        { name: 'Manchester Utd', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/1200px-Manchester_United_FC_crest.svg.png', strength: 85, color: '#DA291C' },
        { name: 'Bayern München', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/1200px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png', strength: 92, color: '#DC052D' },
        { name: 'Liverpool', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png', strength: 87, color: '#C8102E' },
        { name: 'PSG', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/1200px-Paris_Saint-Germain_F.C..svg.png', strength: 89, color: '#004171' },
        { name: 'Juventus', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Juventus_FC_2017_logo.svg/1200px-Juventus_FC_2017_logo.svg.png', strength: 84, color: '#FFFFFF' },
        { name: 'AC Milan', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/1200px-Logo_of_AC_Milan.svg.png', strength: 86, color: '#FB090B' },
    ];

    // --- SAVE / LOAD ---
    function saveGame(data) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch (e) { console.error("Error saving game: ", e); } }
    function loadGame() {
        const savedData = localStorage.getItem(SAVE_KEY);
        if (savedData) { try { return JSON.parse(savedData); } catch (e) { return null; } }
        return null;
    }

    // --- MAIN INITIALIZATION ---
    function main() {
        const loadedData = loadGame();
        if (loadedData && loadedData.playerName) {
            const defaultState = { money: 0, diamonds: 0, goals: 0, assists: 0, matchesPlayed: 0, trophies: [], clubHistory: [], currentMatchday: 0, schedule: [], jerseyNumber: 10 };
            gameState = { ...defaultState, ...loadedData };
            if (!gameState.schedule || gameState.schedule.length === 0 || gameState.currentMatchday >= gameState.schedule.length) {
                gameState.schedule = generateSchedule(TEAMS.map(t => t.name));
                gameState.currentMatchday = 0;
                if(gameState.league) {
                    gameState.league.forEach(team => { Object.assign(team, { played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 }); });
                }
                saveGame(gameState);
            }
            showMainHub();
        } else {
            initializeCharacterCreator();
            document.getElementById('characterCreator').classList.remove('hidden');
        }
        setTimeout(() => { document.getElementById('loadingScreen').classList.add('fade-out'); }, 500);
    }

    // --- CHARACTER CREATOR ---
    function initializeCharacterCreator() {
        const formCarousel = document.getElementById('formCarousel');
        const totalSteps = formCarousel.children.length;
        let currentStep = 0;
        const playerNameInput = document.getElementById('playerName');
        function updateCarousel() { formCarousel.style.transform = `translateX(-${currentStep * 100}%)`; }
        document.querySelectorAll('.next-btn').forEach(btn => btn.addEventListener('click', () => {
            if (currentStep === 0 && playerNameInput.value.trim() === "") return;
            if (currentStep < totalSteps - 1) { currentStep++; updateCarousel(); }
        }));
        document.querySelectorAll('.prev-btn').forEach(btn => btn.addEventListener('click', () => {
            if (currentStep > 0) { currentStep--; updateCarousel(); }
        }));
        document.getElementById('startGameButton').addEventListener('click', startNewGame);
        
        const slider = document.getElementById('potentialSlider');
        slider.addEventListener('input', () => {
            document.getElementById('sliderValue').textContent = slider.value;
        });
    }

    function startNewGame() {
        const chosenTeam = TEAMS[Math.floor(Math.random() * TEAMS.length)];
        const leagueTeams = TEAMS.map(t => ({ name: t.name, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 }));
        gameState = {
            playerName: document.getElementById('playerName').value || "Player",
            nationality: "Magyar",
            rating: document.getElementById('potentialSlider').value,
            team: chosenTeam,
            money: 250000, salary: 15000, diamonds: 10, goals: 0, assists: 0, matchesPlayed: 0, trophies: [],
            clubHistory: [chosenTeam.name],
            league: leagueTeams,
            currentMatchday: 0,
            jerseyNumber: Math.floor(Math.random() * 98) + 1,
            schedule: generateSchedule(TEAMS.map(t => t.name))
        };
        saveGame(gameState);
        showMainHub();
    }

    // --- MATCH LOGIC ---
    function playNextMatch() {
        if (!gameState.schedule || !gameState.schedule[gameState.currentMatchday]) { return; }
        if (gameState.currentMatchday >= gameState.schedule.length) { startNewSeason(); return; }
        startMatchSimulator();
    }

    function startMatchSimulator() {
        const fixture = gameState.schedule[gameState.currentMatchday].find(f => f.home === gameState.team.name || f.away === gameState.team.name);
        if (!fixture) { return; }
        
        const homeTeam = TEAMS.find(t => t.name === fixture.home);
        const awayTeam = TEAMS.find(t => t.name === fixture.away);

        if (!currentMatchData || currentMatchData.fixture.home !== fixture.home) {
            currentMatchData = { fixture, time: 0, homeScore: 0, awayScore: 0, playerGoals: 0, events: [{time: 0, comment: "Kick-off!", icon: "fa-futbol"}] };
        }
        
        document.getElementById('simHomeName').textContent = homeTeam.name;
        document.getElementById('simAwayName').textContent = awayTeam.name;
        document.getElementById('bannerPlayerName').textContent = gameState.playerName;
        updateSimulatorUI();
        
        document.getElementById('mainHub').classList.add('hidden');
        matchSimulatorOverlay.classList.remove('hidden');
        
        isPaused = false;
        document.getElementById('sim-pause-btn').innerHTML = '<i class="fas fa-pause"></i>';
        runSimulation();
    }

    function runSimulation() {
        simulationInterval = setInterval(() => {
            if (isPaused) return;
            currentMatchData.time += 2;
            
            const homeTeam = TEAMS.find(t => t.name === currentMatchData.fixture.home);
            const awayTeam = TEAMS.find(t => t.name === currentMatchData.fixture.away);
            const playerTeamStrength = gameState.team.strength;
            const opponentStrength = (gameState.team.name === homeTeam.name) ? awayTeam.strength : homeTeam.strength;
            const chanceModifier = (playerTeamStrength - opponentStrength) / 250;

            if (Math.random() < 0.15 + chanceModifier) {
                clearInterval(simulationInterval);
                addMatchEvent("HELYZET! A csapatod támad, most rajtad a sor!", "fa-star");
                document.getElementById('pitch-enter-banner').classList.remove('hidden');
                setTimeout(() => {
                    matchSimulatorOverlay.classList.add('hidden');
                    document.getElementById('pitch-enter-banner').classList.add('hidden');
                    startMatchGame();
                }, 2500);
                return;
            } 
            
            const playerIsHome = gameState.team.name === homeTeam.name;
            if (Math.random() < 0.04 - chanceModifier) {
                 if(playerIsHome) currentMatchData.awayScore++; else currentMatchData.homeScore++;
                 addMatchEvent(`GÓL! Az ellenfél szerzett vezetést! (${awayTeam.name})`, "fa-futbol");
            } else if (Math.random() < 0.2) {
                addMatchEvent(getRandomCommentary(), "fa-running");
            }

            updateSimulatorUI();

            if (currentMatchData.time >= 90) {
                endMatchGame();
            }
        }, 1000);
    }
    
    function togglePause() {
        isPaused = !isPaused;
        const pauseBtn = document.getElementById('sim-pause-btn');
        pauseBtn.innerHTML = isPaused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
    }

    function updateSimulatorUI() {
        document.getElementById('simScore').textContent = `${currentMatchData.homeScore} - ${currentMatchData.awayScore}`;
        document.getElementById('simTime').textContent = `${String(Math.floor(currentMatchData.time)).padStart(2, '0')}:00`;
        const timeline = document.getElementById('commentary-timeline');
        timeline.innerHTML = '';
        currentMatchData.events.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.className = 'event-item';
            eventDiv.innerHTML = `<div class="event-icon"><i class="fas ${event.icon}"></i></div>
                                  <div class="event-text"><span class="time">${String(event.time).padStart(2, '0')}'</span> <span class="comment">${event.comment}</span></div>`;
            timeline.appendChild(eventDiv);
        });
    }

    function addMatchEvent(comment, icon) {
        currentMatchData.events.unshift({time: Math.floor(currentMatchData.time), comment, icon});
        updateSimulatorUI();
    }
    
    function getRandomCommentary() {
        const comments = ["A középpályán folyik a játék.", "Szép passz a szélen.", "Bedobás következik."];
        return comments[Math.floor(Math.random() * comments.length)];
    }

    function updateScoreboardUI() {
        document.getElementById('gameHomeName').textContent = TEAMS.find(t => t.name === currentMatchData.fixture.home).name.substring(0,3).toUpperCase();
        document.getElementById('gameAwayName').textContent = TEAMS.find(t => t.name === currentMatchData.fixture.away).name.substring(0,3).toUpperCase();
        document.getElementById('gameScore').textContent = `${currentMatchData.homeScore} - ${currentMatchData.awayScore}`;
        document.getElementById('gameTime').textContent = `${String(Math.floor(currentMatchData.time)).padStart(2, '0')}:00`;

        const homeP = document.getElementById('homeProgress');
        const awayP = document.getElementById('awayProgress');
        const homeScore = currentMatchData.homeScore;
        const awayScore = currentMatchData.awayScore;
        const totalScore = homeScore + awayScore;
        
        let homeFlex = 0.5;
        if (totalScore > 0) {
            homeFlex = homeScore / totalScore;
        }
        
        homeFlex = Math.max(0.05, Math.min(0.95, homeFlex));

        homeP.style.flex = homeFlex;
        awayP.style.flex = 1 - homeFlex;
    }

    function startMatchGame() {
        miniGameActive = true;
        matchGameOverlay.classList.remove('hidden');
        resizeCanvas();

        const homeTeam = TEAMS.find(t => t.name === currentMatchData.fixture.home);
        const awayTeam = TEAMS.find(t => t.name === currentMatchData.fixture.away);
        
        const playerIsHome = gameState.team.name === homeTeam.name;
        opponentTeamColor = playerIsHome ? awayTeam.color : homeTeam.color;

        updateScoreboardUI();

        keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, ' ': false, 'c': false };

        player = { x: canvas.width / 2, y: canvas.height / 2 + 100, speed: 4, isPlayer: true, radius: 15, possessionRadius: 25 };
        ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 8, speedX: 0, speedY: 0, friction: 0.98, controlledBy: null };
        homeGoal = { x: canvas.width / 2, y: 15, width: canvas.width * 0.3, height: 20 };
        
        teammates = [
            { x: canvas.width * 0.25, y: canvas.height * 0.45, speed: 2.8, radius: 15, jerseyNumber: 8, decisionTimeout: 0 },
            { x: canvas.width * 0.75, y: canvas.height * 0.45, speed: 2.8, radius: 15, jerseyNumber: 11, decisionTimeout: 0 }
        ];

        opponents = [
            { x: canvas.width / 2, y: 70, speed: 1.8, radius: 16, type: 'goalkeeper', jerseyNumber: 1 },
            { x: canvas.width * 0.35, y: 220, speed: 2.0, radius: 15, type: 'defender', jerseyNumber: 4 },
            { x: canvas.width * 0.65, y: 220, speed: 2.0, radius: 15, type: 'defender', jerseyNumber: 5 }
        ];
        
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        setupMobileControls();

        gameLoop = requestAnimationFrame(updateGame);
    }
    
    function endMatchAction(isGoal) {
        if (!miniGameActive) return;
        miniGameActive = false;

        cancelAnimationFrame(gameLoop);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
        removeMobileControls();

        const playerIsHome = gameState.team.name === currentMatchData.fixture.home;
        if (isGoal) {
            if(playerIsHome) currentMatchData.homeScore++; else currentMatchData.awayScore++;
            currentMatchData.playerGoals++;
            addMatchEvent(`GÓÓÓÓL! Fantasztikus befejezés! (${gameState.playerName})`, "fa-futbol");
        } else {
            addMatchEvent("Szereltek! Az ellenfélhez került a labda.", "fa-times-circle");
        }
        
        updateScoreboardUI();
        matchGameOverlay.classList.add('hidden');
        matchSimulatorOverlay.classList.remove('hidden');
        updateSimulatorUI();
        
        setTimeout(() => {
            if (currentMatchData.time < 90) {
                runSimulation();
            } else {
                endMatchGame();
            }
        }, 1500);
    }
    
    function resetBallAfterOutOfBounds(type = 'throw_in') {
        ball.speedX = 0;
        ball.speedY = 0;
        if (ball.controlledBy) {
            ball.controlledBy = null;
        }

        if (type === 'goalkick') {
            const keeper = opponents.find(o => o.type === 'goalkeeper');
            if (keeper) {
                ball.x = keeper.x;
                ball.y = keeper.y + 30;
            }
        } else {
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
        }
    }

    function endMatchGame() {
        clearInterval(simulationInterval);
        addMatchEvent("VÉGE A MÉRKŐZÉSNEK!", "fa-stopwatch");

        setTimeout(() => {
            matchSimulatorOverlay.classList.add('hidden');
            const finalResult = { ...currentMatchData, homeName: currentMatchData.fixture.home, awayName: currentMatchData.fixture.away };
            processMatchResult(finalResult);
            
            const allFixtures = gameState.schedule[gameState.currentMatchday];
            const otherFixtures = allFixtures.filter(f => f.home !== gameState.team.name && f.away !== gameState.team.name);
            otherFixtures.forEach(fixture => { processMatchResult(simulateOtherMatch(fixture.home, fixture.away)); });

            gameState.currentMatchday++;
            saveGame(gameState);
            showMatchResult(finalResult);
            currentMatchData = null;
        }, 2000);
    }

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
        document.getElementById('resultHomeLogo').src = TEAMS.find(t => t.name === result.homeName).logo;
        document.getElementById('resultHomeName').textContent = result.homeName;
        document.getElementById('resultAwayLogo').src = TEAMS.find(t => t.name === result.awayName).logo;
        document.getElementById('resultAwayName').textContent = result.awayName;
        document.getElementById('resultScore').textContent = `${result.homeScore} - ${result.awayScore}`;
        
        let bonus = 0;
        const playerTeamWon = (gameState.team.name === result.homeName && result.homeScore > result.awayScore) || (gameState.team.name === result.awayName && result.awayScore > result.homeScore);
        if (playerTeamWon) bonus += 20000;
        if (result.homeScore === result.awayScore) bonus += 5000;
        bonus += result.playerGoals * 10000;
        gameState.money += (gameState.salary || 0) + bonus;
        gameState.goals += result.playerGoals;
        gameState.matchesPlayed++;

        document.getElementById('resultPlayerPerformance').textContent = `Gólok: ${result.playerGoals}, Gólpasszok: 0`;
        document.getElementById('resultEarnings').textContent = `Fizetés: €${(gameState.salary || 0).toLocaleString()}, Bónusz: €${bonus.toLocaleString()}`;
        matchResultOverlay.classList.remove('hidden');
    }
    
    function simulateOtherMatch(homeName, awayName) {
        const homeTeam = TEAMS.find(t => t.name === homeName);
        const awayTeam = TEAMS.find(t => t.name === awayName);
        const homeScore = Math.floor(Math.random() * (homeTeam.strength / 28));
        const awayScore = Math.floor(Math.random() * (awayTeam.strength / 28));
        return { homeName, awayName, homeScore, awayScore, playerGoals: 0 };
    }

    function handleKeyDown(e) { keys[e.key] = true; }
    function handleKeyUp(e) { keys[e.key] = false; }

    function updateGame() {
        if(!miniGameActive) return;

        // Player movement
        if (keys.ArrowUp) player.y -= player.speed;
        if (keys.ArrowDown) player.y += player.speed;
        if (keys.ArrowLeft) player.x -= player.speed;
        if (keys.ArrowRight) player.x += player.speed;
        
        player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
        player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

        if (ball.controlledBy === null) {
            const distToPlayer = Math.hypot(player.x - ball.x, player.y - ball.y);
            if (distToPlayer < player.possessionRadius) { ball.controlledBy = player; }
            teammates.forEach(tm => {
                const distToTm = Math.hypot(tm.x - ball.x, tm.y - ball.y);
                if (distToTm < tm.radius + ball.radius + 5) { ball.controlledBy = tm; tm.decisionTimeout = 90; }
            });
        }
        
        if (ball.controlledBy === player) {
            let targetX = player.x;
            let targetY = player.y;
            const dribbleDistance = 35;
            let hasMovement = keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight;

            if (hasMovement) {
                let moveAngle = Math.atan2(
                    (keys.ArrowDown ? 1 : 0) - (keys.ArrowUp ? 1 : 0),
                    (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
                );
                targetX = player.x + Math.cos(moveAngle) * dribbleDistance;
                targetY = player.y + Math.sin(moveAngle) * dribbleDistance;
            }
            ball.x += (targetX - ball.x) * 0.2;
            ball.y += (targetY - ball.y) * 0.2;


            if (keys[' ']) { // SHOOT
                ball.controlledBy = null;
                const angle = Math.atan2((homeGoal.y + homeGoal.height / 2) - player.y, homeGoal.x - player.x);
                ball.speedX = Math.cos(angle) * 20;
                ball.speedY = Math.sin(angle) * 20;
                keys[' '] = false;
            } else if (keys['c']) { // PASS
                ball.controlledBy = null;
                let closestTm = null, minDist = Infinity;
                teammates.forEach(tm => {
                    const dist = Math.hypot(player.x - tm.x, player.y - tm.y);
                    if (dist < minDist) { minDist = dist; closestTm = tm; }
                });
                if (closestTm) {
                    const angle = Math.atan2(closestTm.y - player.y, closestTm.x - player.x);
                    ball.speedX = Math.cos(angle) * 15;
                    ball.speedY = Math.sin(angle) * 15;
                }
                keys['c'] = false;
            }
        } else if (ball.controlledBy && !ball.controlledBy.isPlayer) { // Teammate AI
            let tm = ball.controlledBy;
            tm.decisionTimeout--;
            const angleToGoal = Math.atan2(homeGoal.y - tm.y, homeGoal.x - tm.x);
            tm.x += Math.cos(angleToGoal) * (tm.speed * 0.8);
            tm.y += Math.sin(angleToGoal) * (tm.speed * 0.8);
            ball.x += (tm.x - ball.x) * 0.3; ball.y += (tm.y - ball.y) * 0.3;

            if (tm.decisionTimeout <= 0) {
                ball.controlledBy = null;
                if (tm.y < canvas.height / 2 && Math.random() < 0.5) { // Shoot
                    const angle = Math.atan2((homeGoal.y + homeGoal.height / 2) - tm.y, homeGoal.x - tm.x);
                    ball.speedX = Math.cos(angle) * 18;
                    ball.speedY = Math.sin(angle) * 18;
                } else { // Pass back
                    const angle = Math.atan2(player.y - tm.y, player.x - tm.x);
                    ball.speedX = Math.cos(angle) * 15;
                    ball.speedY = Math.sin(angle) * 15;
                }
            }
        }
        
        ball.x += ball.speedX; ball.y += ball.speedY;
        ball.speedX *= ball.friction; ball.speedY *= ball.friction;

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
            if(opp.type === 'goalkeeper') {
                opp.x += (ball.x - opp.x) * 0.08;
                opp.x = Math.max(homeGoal.x - homeGoal.width / 2, Math.min(homeGoal.x + homeGoal.width / 2, opp.x));
            } else {
                const target = ball.controlledBy === player || ball.controlledBy === null ? ball : player;
                const angle = Math.atan2(target.y - opp.y, target.x - opp.x);
                opp.x += Math.cos(angle) * opp.speed;
                opp.y += Math.sin(angle) * opp.speed;
            }
            const distToPlayer = Math.hypot(player.x - opp.x, player.y - opp.y);
            if (ball.controlledBy === player && distToPlayer < player.radius + opp.radius) { endMatchAction(false); }
        });
        
        // --- GOAL AND OUT OF BOUNDS ---
        if (ball.y < homeGoal.y + homeGoal.height && ball.y > homeGoal.y && ball.x > homeGoal.x - homeGoal.width / 2 && ball.x < homeGoal.x + homeGoal.width / 2) { 
            endMatchAction(true);
        }
        
        const sidelineMargin = 5;
        if (ball.x < sidelineMargin || ball.x > canvas.width - sidelineMargin || ball.y > canvas.height - sidelineMargin) {
            resetBallAfterOutOfBounds('throw_in');
        } else if (ball.y < 0 && (ball.x < homeGoal.x - homeGoal.width / 2 || ball.x > homeGoal.x + homeGoal.width / 2)) {
            resetBallAfterOutOfBounds('goalkick');
        }

        draw();
        gameLoop = requestAnimationFrame(updateGame);
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // --- Draw Field ---
        for(let i = 0; i < 12; i++) {
            ctx.fillStyle = i % 2 === 0 ? '#2e942e' : '#2a8c2a';
            ctx.fillRect(0, i * canvas.height / 12, canvas.width, canvas.height / 12);
        }
        
        // --- Draw Field Markings ---
        ctx.strokeStyle = 'rgba(255,255,255,0.7)'; 
        ctx.lineWidth = 2;

        // Sidelines (Záróvonalak)
        ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

        // Center Line & Circle
        ctx.beginPath();
        ctx.moveTo(5, canvas.height/2);
        ctx.lineTo(canvas.width - 5, canvas.height/2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height/2, 60, 0, 2*Math.PI);
        ctx.stroke();

        // Penalty area
        ctx.strokeRect(canvas.width/2 - 150, 5, 300, 120);

        // Goal
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3;
        ctx.strokeRect(homeGoal.x - homeGoal.width/2, homeGoal.y - 10, homeGoal.width, homeGoal.height);
        
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
            
            if(entity.isPlayer) {
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
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        if (homeGoal) { // HIBA JAVÍTÁSA: Csak akkor frissítjük, ha már létezik
            homeGoal.width = canvas.width * 0.3; 
            homeGoal.x = canvas.width / 2;
        }
    }
    
    // --- MOBILE CONTROLS ---
    const joystickZone = document.getElementById('joystick-zone');
    const joystickHandle = document.getElementById('joystick-handle');
    const shootBtn = document.getElementById('shoot-btn');
    const passBtn = document.getElementById('pass-btn');
    let joystickStart = {};

    function handleJoystickStart(e) { e.preventDefault(); const touch = e.changedTouches[0]; joystickStart = { x: touch.clientX, y: touch.clientY }; }
    function handleJoystickMove(e) { e.preventDefault(); const touch = e.changedTouches[0]; updateJoystick({ x: touch.clientX, y: touch.clientY }); }
    function handleJoystickEnd(e) { e.preventDefault(); keys.ArrowUp = keys.ArrowDown = keys.ArrowLeft = keys.ArrowRight = false; joystickHandle.style.transform = `translate(0px, 0px)`;}
    function updateJoystick(current) {
        const dx = current.x - joystickStart.x;
        const dy = current.y - joystickStart.y;
        const angle = Math.atan2(dy, dx);
        const distance = Math.min(32, Math.sqrt(dx * dx + dy * dy));
        const x = distance * Math.cos(angle);
        const y = distance * Math.sin(angle);
        joystickHandle.style.transform = `translate(${x}px, ${y}px)`;
        const deadZone = 10;
        keys.ArrowUp = dy < -deadZone; keys.ArrowDown = dy > deadZone;
        keys.ArrowLeft = dx < -deadZone; keys.ArrowRight = dx > deadZone;
    }
    const handleShoot = (e) => { e.preventDefault(); keys[' '] = true; setTimeout(() => keys[' '] = false, 100); };
    const handlePass = (e) => { e.preventDefault(); keys['c'] = true; setTimeout(() => keys['c'] = false, 100); };
    
    function setupMobileControls() {
        joystickZone.addEventListener('touchstart', handleJoystickStart, {passive: false});
        joystickZone.addEventListener('touchmove', handleJoystickMove, {passive: false});
        joystickZone.addEventListener('touchend', handleJoystickEnd, {passive: false});
        shootBtn.addEventListener('touchstart', handleShoot, {passive: false});
        passBtn.addEventListener('touchstart', handlePass, {passive: false});
    }

    function removeMobileControls() {
        joystickZone.removeEventListener('touchstart', handleJoystickStart);
        joystickZone.removeEventListener('touchmove', handleJoystickMove);
        joystickZone.removeEventListener('touchend', handleJoystickEnd);
        shootBtn.removeEventListener('touchstart', handleShoot);
        passBtn.removeEventListener('touchstart', handlePass);
    }
    
    // --- UI FUNCTIONS AND EVENT LISTENERS ---
    function showMainHub() {
        document.querySelectorAll('.overlay, .character-creator-container').forEach(o => o.classList.add('hidden'));
        document.getElementById('mainHub').classList.remove('hidden');
        updateUI();
    }
    
    const allScreens = document.querySelectorAll('.screen');
    const allNavButtons = document.querySelectorAll('.nav-btn');

    function showScreen(targetScreenId) {
        allScreens.forEach(screen => screen.classList.add('hidden'));
        document.getElementById(targetScreenId)?.classList.remove('hidden');
        updateNavButtons(targetScreenId);
    }
    function updateNavButtons(activeScreenId) { allNavButtons.forEach(btn => { btn.classList.toggle('active', btn.dataset.screen === activeScreenId); }); }
    
    function updateUI() {
        updateHeaderUI();
        updateDashboardUI();
        updateLeagueTable();
        updateProfileUI();
        updateNavButtons('dashboardScreen');
    }
    function updateHeaderUI() { document.getElementById('headerPlayerName').textContent = gameState.playerName; document.getElementById('headerPlayerBalance').textContent = (gameState.money || 0).toLocaleString(); }
    function updateDashboardUI() { document.getElementById('hubPlayerName').textContent = gameState.playerName; document.getElementById('hubPlayerTeamName').textContent = gameState.team.name; document.getElementById('hubPlayerTeamLogo').src = gameState.team.logo; document.getElementById('hubPlayerRating').textContent = gameState.rating; if (gameState.schedule && gameState.schedule[gameState.currentMatchday]) { const nextFixture = gameState.schedule[gameState.currentMatchday].find(f => f.home === gameState.team.name || f.away === gameState.team.name); if(nextFixture) { document.getElementById('hubNextOpponent').textContent = nextFixture.home === gameState.team.name ? nextFixture.away : nextFixture.home; } } document.getElementById('hubMatchday').textContent = `${gameState.currentMatchday} / ${gameState.schedule.length}`; }
    function updateLeagueTable() { const tableBody = document.getElementById('leagueTableBody'); if (!tableBody) return; tableBody.innerHTML = ''; const leagueClone = [...(gameState.league || [])]; leagueClone.sort((a, b) => b.points - a.points || (b.gd - a.gd)); leagueClone.forEach((team, index) => { const row = document.createElement('tr'); if(team.name === gameState.team.name) row.classList.add('player-team'); row.innerHTML = `<td>${index + 1}</td><td>${team.name}</td><td class="hide-on-mobile">${team.played}</td><td class="hide-on-mobile">${team.wins}</td><td class="hide-on-mobile">${team.draws}</td><td class="hide-on-mobile">${team.losses}</td><td>${team.gd}</td><td><strong>${team.points}</strong></td>`; tableBody.appendChild(row); });}
    function updateProfileUI() { document.getElementById('profilePlayerName').textContent = `${gameState.playerName} Profilja`; document.getElementById('profileGoals').textContent = gameState.goals || 0; document.getElementById('profileAssists').textContent = gameState.assists || 0; document.getElementById('profileMatches').textContent = gameState.matchesPlayed || 0; document.getElementById('profileTrophies').textContent = (gameState.trophies || []).length; }
    function generateSchedule(teamNames) {const schedule = [];const teams = [...teamNames];if (teams.length % 2 !== 0) { teams.push(null); }const numRounds = teams.length - 1;const numMatchesPerRound = teams.length / 2;for (let round = 0; round < numRounds; round++) {const roundMatches = [];for (let i = 0; i < numMatchesPerRound; i++) {const home = teams[i];const away = teams[teams.length - 1 - i];if (home && away) { roundMatches.push({ home, away }); }}schedule.push(roundMatches);const lastTeam = teams.pop();teams.splice(1, 0, lastTeam);}const secondHalf = schedule.map(round => round.map(({ home, away }) => ({ home: away, away: home })));return [...schedule, ...secondHalf];}
    
    allNavButtons.forEach(button => button.addEventListener('click', () => showScreen(button.dataset.screen)));
    document.getElementById('profileBtn').addEventListener('click', () => showScreen('profileScreen'));
    document.getElementById('playMatchBtn').addEventListener('click', playNextMatch);
    document.getElementById('matchResultContinueBtn').addEventListener('click', showMainHub);
    document.getElementById('sim-pause-btn').addEventListener('click', togglePause);

    window.addEventListener('resize', resizeCanvas);
    main();
});

