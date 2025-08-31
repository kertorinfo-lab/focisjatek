document.addEventListener('DOMContentLoaded', () => {
    const SAVE_KEY = 'footballLegendSave';
    let gameState = {};

    // --- KARAKTERGRAFIKA BETÖLTÉSE ---
    const playerSpriteSheet = new Image();
    playerSpriteSheet.src = 'https://i.ibb.co/hR9HB11h/modern-footballer.png'; 
    let spriteSheetLoaded = false;
    playerSpriteSheet.onload = () => {
        spriteSheetLoaded = true;
    };
    
    // --- ÁLTALÁNOS UI ELEMEK ---
    const matchSimulatorOverlay = document.getElementById('matchSimulatorOverlay');
    const matchGameOverlay = document.getElementById('matchGameOverlay');
    const matchResultOverlay = document.getElementById('matchResultOverlay');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // --- JÁTÉK VÁLTOZÓK ---
    let gameLoop;
    let player, ball, opponents, keys, homeGoal, awayGoal, currentMatchData;
    let simulationInterval;

    // --- SAJTÓTÁJÉKOZTATÓ VÁLTOZÓK ---
    const pressConferenceUI = document.getElementById('pressConferenceUI');
    const questionEl = document.getElementById('journalist-question');
    const answersGridEl = document.getElementById('answersGrid');
    const pressSummaryEl = document.getElementById('pressSummary');
    const questions = [
        {
            question: `Üdv a {teamName}-nél! Mik a közvetlen céljaid a klubnál?`,
            answers: [
                { text: "Keményen dolgozni, tanulni és segíteni a csapatot, ahol csak tudom.", trait: 'humble' },
                { text: "Minden trófeát megnyerni. Ezért jöttem.", trait: 'arrogant' },
                { text: "A legjobbamat nyújtani minden edzésen és meccsen.", trait: 'professional' }
            ]
        },
        {
            question: "Sokan kételkednek benned. Érzed a nyomást?",
            answers: [
                { text: "A nyomás egy kiváltság. Alig várom, hogy bizonyítsak.", trait: 'arrogant' },
                { text: "Csak a játékomra koncentrálok, a külső zaj nem érdekel.", trait: 'professional' },
                { text: "Természetes, hogy van rajtam nyomás, de bízom a képességeimben.", trait: 'humble' }
            ]
        }
    ];
    let currentQuestionIndex = 0;
    const reputation = { humble: 0, arrogant: 0, professional: 0 };

    const TEAMS = [
        { name: 'Real Madrid', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png', color: '#FEBE10', strength: 90 },
        { name: 'FC Barcelona', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/1200px-FC_Barcelona_%28crest%29.svg.png', color: '#A50044', strength: 88 },
        { name: 'Manchester Utd', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/1200px-Manchester_United_FC_crest.svg.png', color: '#DA291C', strength: 85 },
        { name: 'Bayern München', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/1200px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png', color: '#DC052D', strength: 92 },
        { name: 'Liverpool', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png', color: '#C8102E', strength: 87 },
        { name: 'PSG', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/1200px-Paris_Saint-Germain_F.C..svg.png', color: '#004171', strength: 89 },
        { name: 'Juventus', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Juventus_FC_2017_logo.svg/1200px-Juventus_FC_2017_logo.svg.png', color: '#000000', strength: 84 },
        { name: 'AC Milan', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/1200px-Logo_of_AC_Milan.svg.png', color: '#FB090B', strength: 86 },
    ];

    function saveGame(data) {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error("Hiba a mentés során: ", e);
        }
    }

    function loadGame() {
        const savedData = localStorage.getItem(SAVE_KEY);
        if (savedData) {
            try {
                return JSON.parse(savedData);
            } catch (e) {
                console.error("Hiba a betöltés során, sérült mentés? ", e);
                return null;
            }
        }
        return null;
    }

    function main() {
        const loadedData = loadGame();
        if (loadedData && loadedData.playerName) {
            const defaultState = {
                money: 0, diamonds: 0, goals: 0, assists: 0,
                matchesPlayed: 0, trophies: [], clubHistory: [], currentMatchday: 0, schedule: []
            };
            gameState = { ...defaultState, ...loadedData };
            
            if (!gameState.schedule || gameState.schedule.length === 0 || gameState.currentMatchday >= gameState.schedule.length) {
                gameState.schedule = generateSchedule(TEAMS.map(t => t.name));
                gameState.currentMatchday = 0;
                if(gameState.league) {
                    gameState.league.forEach(team => {
                        team.played = 0; team.wins = 0; team.draws = 0; team.losses = 0;
                        team.gf = 0; team.ga = 0; team.gd = 0; team.points = 0;
                    });
                }
                saveGame(gameState);
            }
            showMainHub();
        } else {
            initializeCharacterCreator();
            document.getElementById('characterCreator').classList.remove('hidden');
        }
        setTimeout(() => {
             document.getElementById('loadingScreen').classList.add('fade-out');
        }, 500);
    }
    
    function initializeCharacterCreator() {
        const formCarousel = document.getElementById('formCarousel');
        const totalSteps = formCarousel.children.length;
        let currentStep = 0;
        const playerNameInput = document.getElementById('playerName');

        function updateCarousel() { formCarousel.style.transform = `translateX(-${currentStep * 100}%)`; }
        document.querySelectorAll('.next-btn').forEach(btn => btn.addEventListener('click', () => {
            if (currentStep === 0 && playerNameInput.value.trim() === "") {
                playerNameInput.classList.add('invalid');
                setTimeout(() => playerNameInput.classList.remove('invalid'), 300);
                return;
            }
            if (currentStep < totalSteps - 1) { currentStep++; updateCarousel(); }
        }));
        document.querySelectorAll('.prev-btn').forEach(btn => btn.addEventListener('click', () => {
            if (currentStep > 0) { currentStep--; updateCarousel(); }
        }));

        const selectButton = document.getElementById('nationalitySelect');
        const selectOptions = document.querySelector('.select-options');
        selectButton.addEventListener('click', () => selectOptions.classList.toggle('active'));
        document.addEventListener('click', (e) => { if (selectButton && !selectButton.contains(e.target)) { selectOptions.classList.remove('active'); } });
        selectOptions.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', () => {
                selectButton.querySelector('.selected-option').innerHTML = option.innerHTML;
                selectButton.querySelector('.selected-option').dataset.value = option.dataset.name;
                selectOptions.classList.remove('active');
            });
        });
        document.getElementById('potentialSlider').addEventListener('input', (e) => { document.getElementById('sliderValue').textContent = e.target.value; });
        document.querySelectorAll('.formation-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelector('.formation-card.selected')?.classList.remove('selected');
                card.classList.add('selected');
            });
        });

        document.getElementById('startGameButton').addEventListener('click', startNewGame);
    }

    function startNewGame() {
        const chosenTeam = TEAMS[Math.floor(Math.random() * TEAMS.length)];
        const leagueTeams = TEAMS.map(t => ({ name: t.name, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 }));

        gameState = {
            playerName: document.getElementById('playerName').value,
            nationality: document.querySelector('.selected-option').dataset.value || 'Magyar',
            rating: document.getElementById('potentialSlider').value,
            team: chosenTeam,
            money: 250000,
            salary: 15000,
            diamonds: 10,
            goals: 0,
            assists: 0,
            matchesPlayed: 0,
            trophies: [],
            clubHistory: [chosenTeam.name],
            league: leagueTeams,
            currentMatchday: 0,
            schedule: generateSchedule(TEAMS.map(t => t.name))
        };
        
        saveGame(gameState);
        triggerCinematics();
    }

    function generateSchedule(teamNames) {
        const schedule = [];
        const teams = [...teamNames];
        if (teams.length % 2 !== 0) { teams.push(null); }
        const numRounds = teams.length - 1;
        const numMatchesPerRound = teams.length / 2;
        for (let round = 0; round < numRounds; round++) {
            const roundMatches = [];
            for (let i = 0; i < numMatchesPerRound; i++) {
                const home = teams[i];
                const away = teams[teams.length - 1 - i];
                if (home && away) { roundMatches.push({ home, away }); }
            }
            schedule.push(roundMatches);
            const lastTeam = teams.pop();
            teams.splice(1, 0, lastTeam);
        }
        const secondHalf = schedule.map(round => round.map(({ home, away }) => ({ home: away, away: home })));
        return [...schedule, ...secondHalf];
    }
    
    function startNewSeason() {
        alert("A szezon véget ért! Új szezon kezdődik.");
        gameState.schedule = generateSchedule(TEAMS.map(t => t.name));
        gameState.currentMatchday = 0;
        gameState.league.forEach(team => {
            team.played = 0; team.wins = 0; team.draws = 0; team.losses = 0;
            team.gf = 0; team.ga = 0; team.gd = 0; team.points = 0;
        });
        saveGame(gameState);
        updateUI();
    }
    
    function triggerCinematics() {
        const animationOverlay = document.getElementById('animationOverlay');
        animationOverlay.classList.add('active');
        // ... a többi cinematikus logika ...
        setTimeout(() => {
            animationOverlay.classList.remove('active');
            document.getElementById('pressConferenceOverlay').classList.add('active');
            startPressConference();
        }, 6500);
    }
    
    function startPressConference() {
        // ... sajtótájékoztató logika ...
        document.getElementById('continueBtn').onclick = showMainHub;
    }
    
    // ... a többi UI és logikai függvény itt változatlanul marad ...
    // pl. displayQuestion, selectAnswer, showSummary, showMainHub, updateUI, stb.

    // --- ÚJ MECCS LOGIKA KEZDETE ---

    function playNextMatch() {
        if (gameState.currentMatchday >= gameState.schedule.length) {
            startNewSeason();
            return;
        }
        startMatchSimulator();
    }

    function startMatchSimulator() {
        const roundFixtures = gameState.schedule[gameState.currentMatchday];
        const playerMatchFixture = roundFixtures.find(f => f.home === gameState.team.name || f.away === gameState.team.name);
        const homeTeam = TEAMS.find(t => t.name === playerMatchFixture.home);
        const awayTeam = TEAMS.find(t => t.name === playerMatchFixture.away);

        currentMatchData = {
            fixture: playerMatchFixture,
            time: 0,
            homeScore: 0,
            awayScore: 0,
            playerGoals: 0,
            playerAssists: 0
        };

        document.getElementById('simHomeLogo').src = homeTeam.logo;
        document.getElementById('simHomeName').textContent = homeTeam.name;
        document.getElementById('simAwayLogo').src = awayTeam.logo;
        document.getElementById('simAwayName').textContent = awayTeam.name;
        document.getElementById('simScore').textContent = `0 - 0`;
        document.getElementById('simTime').textContent = `00:00`;
        document.getElementById('commentaryBox').innerHTML = `<p>A csapatok kivonulnak a pályára. Hamarosan kezdődik a mérkőzés!</p>`;
        
        matchSimulatorOverlay.classList.add('active');
        
        simulationInterval = setInterval(() => {
            currentMatchData.time += 2; // 2 percet ugrunk előre
            const minutes = Math.floor(currentMatchData.time).toString().padStart(2, '0');
            document.getElementById('simTime').textContent = `${minutes}:00`;

            const playerTeamStrength = gameState.team.strength;
            const opponentStrength = (gameState.team.name === homeTeam.name) ? awayTeam.strength : homeTeam.strength;
            const chanceModifier = (playerTeamStrength - opponentStrength) / 200; 

            if (Math.random() < 0.1 + chanceModifier) {
                addCommentary("HELYZET! A csapatod támad, most rajtad a sor!");
                clearInterval(simulationInterval);
                setTimeout(() => {
                    matchSimulatorOverlay.classList.remove('active');
                    startMatchGame();
                }, 2000);
            } else if (Math.random() < 0.05 - chanceModifier) {
                currentMatchData.awayScore++;
                document.getElementById('simScore').textContent = `${currentMatchData.homeScore} - ${currentMatchData.awayScore}`;
                addCommentary(`${minutes}' GÓL! Az ellenfél szerzett vezetést!`);
            } else {
                addCommentary(getRandomCommentary(minutes));
            }

            if (currentMatchData.time >= 90) {
                endMatchGame(false); // false, mert nem a minijátékból érkezik
            }
        }, 1000);
    }

    function addCommentary(text) {
        const commentaryBox = document.getElementById('commentaryBox');
        const p = document.createElement('p');
        p.textContent = text;
        commentaryBox.prepend(p);
    }

    function getRandomCommentary(minutes) {
        const comments = [`${minutes}' A középpályán folyik a játék.`, `${minutes}' Szép passz a szélen.`, `${minutes}' Bedobás következik.`, `${minutes}' Szabadrúgáshoz jut az ellenfél.`, `${minutes}' A kapus magabiztosan fogja a labdát.`];
        return comments[Math.floor(Math.random() * comments.length)];
    }

    function startMatchGame() {
        matchGameOverlay.classList.add('active');
        resizeCanvas();

        document.getElementById('gameHomeInfo').textContent = `${currentMatchData.fixture.home} ${currentMatchData.homeScore}`;
        document.getElementById('gameAwayInfo').textContent = `${currentMatchData.fixture.away} ${currentMatchData.awayScore}`;
        document.getElementById('gameTimer').textContent = `${String(Math.floor(currentMatchData.time)).padStart(2, '0')}:00`;

        keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, Space: false };
        
        const spriteConfig = {
            width: 256, height: 256, frameCount: 6, frameSpeed: 8
        };

        player = {
            x: canvas.width / 2, y: canvas.height * 0.7,
            speed: 4, hasBall: true, isPlayer: true,
            ...spriteConfig, frameX: 0, gameFrame: 0, moving: false,
        };
        ball = { x: player.x, y: player.y + 20, radius: 8, speedX: 0, speedY: 0, friction: 0.98 };
        
        opponents = [
            { x: canvas.width * 0.5, y: canvas.height * 0.3, speed: 1.8, ...spriteConfig, frameX: 0, gameFrame: 0, moving: true }
        ];

        homeGoal = { x: canvas.width / 2, y: 0, width: 150, height: 30 };
        
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        
        gameLoop = requestAnimationFrame(updateGame);
    }
    
    function endMatchAction(isGoal) {
        cancelAnimationFrame(gameLoop);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);

        if (isGoal) {
            currentMatchData.homeScore++;
            currentMatchData.playerGoals++;
            addCommentary(`${String(Math.floor(currentMatchData.time)).padStart(2, '0')}' GÓÓÓÓL! Fantasztikus befejezés!`);
        } else {
            addCommentary(`${String(Math.floor(currentMatchData.time)).padStart(2, '0')}' Hatalmas helyzet maradt ki!`);
        }

        document.getElementById('simScore').textContent = `${currentMatchData.homeScore} - ${currentMatchData.awayScore}`;
        matchGameOverlay.classList.remove('active');
        
        setTimeout(() => {
            if (currentMatchData.time < 90) {
                matchSimulatorOverlay.classList.add('active');
                startMatchSimulator(); // Folytatjuk a szimulációt
            } else {
                endMatchGame(false);
            }
        }, 2000);
    }

    function endMatchGame(fromMiniGame) {
        if(fromMiniGame) {
             // Ha minijátékból jövünk, a szimulátor már leállt
        } else {
            clearInterval(simulationInterval);
        }

        addCommentary("VÉGE A MÉRKŐZÉSNEK!");

        setTimeout(() => {
            matchSimulatorOverlay.classList.remove('active');

            const playerIsHome = gameState.team.name === currentMatchData.fixture.home;
            const finalResult = {
                homeName: currentMatchData.fixture.home,
                awayName: currentMatchData.fixture.away,
                homeScore: playerIsHome ? currentMatchData.homeScore : currentMatchData.awayScore,
                awayScore: playerIsHome ? currentMatchData.awayScore : currentMatchData.homeScore,
                playerGoals: currentMatchData.playerGoals,
                playerAssists: currentMatchData.playerAssists
            };
            
            processMatchResult(finalResult);
            
            const allFixtures = gameState.schedule[gameState.currentMatchday];
            const otherFixtures = allFixtures.filter(f => f.home !== gameState.team.name && f.away !== gameState.team.name);
            otherFixtures.forEach(fixture => {
                const otherResult = simulateOtherMatch(fixture.home, fixture.away);
                processMatchResult(otherResult);
            });

            gameState.currentMatchday++;
            saveGame(gameState);
            showMatchResult(finalResult);
        }, 2000);
    }
    
    function simulateOtherMatch(homeName, awayName) {
        const homeTeam = TEAMS.find(t => t.name === homeName);
        const awayTeam = TEAMS.find(t => t.name === awayName);
        const homeScore = Math.floor(Math.random() * (homeTeam.strength / 25));
        const awayScore = Math.floor(Math.random() * (awayTeam.strength / 25));
        return { homeName, awayName, homeScore, awayScore, playerGoals: 0, playerAssists: 0 };
    }

    function handleKeyDown(e) { keys[e.key] = true; }
    function handleKeyUp(e) { keys[e.key] = false; }

    function updateGame() {
        player.moving = (keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight);
        if (keys.ArrowUp) player.y -= player.speed;
        if (keys.ArrowDown) player.y += player.speed;
        if (keys.ArrowLeft) player.x -= player.speed;
        if (keys.ArrowRight) player.x += player.speed;
        
        player.x = Math.max(0, Math.min(canvas.width, player.x));
        player.y = Math.max(0, Math.min(canvas.height, player.y));

        if (player.hasBall) {
            ball.x = player.x;
            ball.y = player.y + 20;
            if (keys[' ']) { // Space lenyomására
                player.hasBall = false;
                const angle = Math.atan2((homeGoal.y + homeGoal.height / 2) - player.y, homeGoal.x - player.x);
                ball.speedX = Math.cos(angle) * 15;
                ball.speedY = Math.sin(angle) * 15;
                keys[' '] = false;
            }
        } else {
            ball.x += ball.speedX;
            ball.y += ball.speedY;
            ball.speedX *= ball.friction;
            ball.speedY *= ball.friction;
        }

        opponents.forEach(opp => {
             // ... ellenfél AI ...
        });
        
        if (ball.y < homeGoal.y + homeGoal.height && ball.x > homeGoal.x - homeGoal.width / 2 && ball.x < homeGoal.x + homeGoal.width / 2) {
            endMatchAction(true);
        }

        if (ball.y < 0 || ball.y > canvas.height || ball.x < 0 || ball.x > canvas.width) {
            endMatchAction(false);
        }

        draw();
        gameLoop = requestAnimationFrame(updateGame);
    }
    
    function draw() {
        ctx.fillStyle = '#2a8c2a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height, 100, Math.PI, 2 * Math.PI);
        ctx.stroke();
        ctx.strokeRect(canvas.width/2 - 200, 0, 400, 150);

        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(homeGoal.x - homeGoal.width / 2, homeGoal.y, homeGoal.width, homeGoal.height);
        
        drawPlayerSprite(player);
        opponents.forEach(opp => drawPlayerSprite(opp));
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    function drawPlayerSprite(entity) {
        if (!spriteSheetLoaded) return;
        if (entity.moving) {
            if (entity.gameFrame % entity.frameSpeed === 0) {
                entity.frameX = (entity.frameX + 1) % entity.frameCount;
            }
        } else {
            entity.frameX = 0;
        }
        entity.gameFrame++;
        const scale = 0.45;
        const scaledWidth = entity.width * scale;
        const scaledHeight = entity.height * scale;
        ctx.drawImage(playerSpriteSheet, entity.frameX * entity.width, 0, entity.width, entity.height, entity.x - scaledWidth / 2, entity.y - scaledHeight / 2, scaledWidth, scaledHeight);
    }
    
    function resizeCanvas() {
        const aspectRatio = 9 / 16;
        const parent = matchGameOverlay;
        let newWidth = parent.clientWidth * 0.9;
        let newHeight = parent.clientHeight * 0.8;

        if (newWidth / newHeight > aspectRatio) {
            newWidth = newHeight * aspectRatio;
        } else {
            newHeight = newWidth / aspectRatio;
        }

        canvas.width = 450;
        canvas.height = 800;
        canvas.style.width = `${newWidth}px`;
        canvas.style.height = `${newHeight}px`;
    }

    window.addEventListener('resize', resizeCanvas);
    
    main();

    // A régi, már nem használt függvényeket innen ki lehet törölni,
    // de az egyszerűség kedvéért most benne hagytam, hogy a meglévő UI működjön.
});
