document.addEventListener('DOMContentLoaded', () => {
    const SAVE_KEY = 'footballLegendSave';
    let gameState = {};

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
                { text: "A nyomás egy kiválág. Alig várom, hogy bizonyítsak.", trait: 'arrogant' },
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

    // --- MENTÉS ÉS BETÖLTÉS (LocalStorage) ---
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

    // --- FŐ INICIALIZÁLÁS ---
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
                gameState.league.forEach(team => {
                    team.played = 0; team.wins = 0; team.draws = 0; team.losses = 0;
                    team.gf = 0; team.ga = 0; team.gd = 0; team.points = 0;
                });
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
    
    // --- KARAKTERKÉSZÍTŐ ---
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

    // --- SORSOLÁS ÉS MECCS LOGIKA ---
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
    
    function playNextMatch() {
        if (gameState.currentMatchday >= gameState.schedule.length) {
             startNewSeason();
             return;
        }

        const roundFixtures = gameState.schedule[gameState.currentMatchday];
        const playerMatchFixture = roundFixtures.find(f => f.home === gameState.team.name || f.away === gameState.team.name);
        
        startMatchGame(playerMatchFixture);
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

    function simulateMatch(homeName, awayName, isPlayerMatch, playerGoals) {
        const homeTeamDetails = TEAMS.find(t => t.name === homeName);
        const awayTeamDetails = TEAMS.find(t => t.name === awayName);
        let homeStrength = homeTeamDetails.strength;
        let awayStrength = awayTeamDetails.strength;
        
        let homeScore = 0;
        let awayScore = 0;

        if (isPlayerMatch) {
            // A játékos csapata a játékos góljaival indul
            if (gameState.team.name === homeName) {
                homeScore = playerGoals;
                awayScore = Math.floor(Math.random() * (awayStrength / 25));
            } else {
                awayScore = playerGoals;
                homeScore = Math.floor(Math.random() * (homeStrength / 25));
            }
        } else {
            // NPC vs NPC meccs szimuláció
            homeScore = Math.floor(Math.random() * (homeStrength / 20));
            awayScore = Math.floor(Math.random() * (awayStrength / 20));
        }

        return { homeName, awayName, homeScore, awayScore, playerGoals: playerGoals, playerAssists: 0 }; // Gólpassz most nincs a minijátékban
    }

    function processMatchResult(result) {
        const homeTeam = gameState.league.find(t => t.name === result.homeName);
        const awayTeam = gameState.league.find(t => t.name === result.awayName);
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
            homeTeam.points += 1; awayTeam.points += 1;
        }
    }
    
    function showMatchResult(result) {
        const homeTeamDetails = TEAMS.find(t => t.name === result.homeName);
        const awayTeamDetails = TEAMS.find(t => t.name === result.awayName);
        document.getElementById('resultHomeLogo').src = homeTeamDetails.logo;
        document.getElementById('resultHomeName').textContent = homeTeamDetails.name;
        document.getElementById('resultAwayLogo').src = awayTeamDetails.logo;
        document.getElementById('resultAwayName').textContent = awayTeamDetails.name;
        document.getElementById('resultScore').textContent = `${result.homeScore} - ${result.awayScore}`;
        let bonus = 0;
        const playerTeamWon = (gameState.team.name === result.homeName && result.homeScore > result.awayScore) || (gameState.team.name === result.awayName && result.awayScore > result.homeScore);
        const isDraw = result.homeScore === result.awayScore;
        if (playerTeamWon) bonus += 20000;
        if (isDraw) bonus += 5000;
        bonus += result.playerGoals * 10000;
        bonus += result.playerAssists * 5000;
        gameState.money += gameState.salary + bonus;
        gameState.goals += result.playerGoals;
        gameState.assists += result.playerAssists;
        gameState.matchesPlayed++;
        document.getElementById('resultPlayerPerformance').textContent = `Gólok: ${result.playerGoals}, Gólpasszok: ${result.playerAssists}`;
        document.getElementById('resultEarnings').textContent = `Fizetés: €${gameState.salary.toLocaleString()}, Bónusz: €${bonus.toLocaleString()}`;
        document.getElementById('matchResultOverlay').classList.add('active');
    }

    // --- CINEMATIKUS JELENETEK ---
    function triggerCinematics() {
        const animationOverlay = document.getElementById('animationOverlay');
        const pressConferenceOverlay = document.getElementById('pressConferenceOverlay');
        document.getElementById('characterCreator').classList.add('hidden');
        animationOverlay.classList.add('active');
        const animationSvg = document.getElementById('animation-svg');
        animationSvg.innerHTML = `
            <rect width="800" height="450" fill="#1a1a1a"/>
            <g id="desk">
                <rect x="150" y="300" width="500" height="150" fill="#4a3f35"/>
                <rect x="150" y="295" width="500" height="10" fill="#6b5b4f"/>
                <text x="400" y="350" font-family="Roboto" font-size="20" fill="#fff" text-anchor="middle" id="team-name-on-desk"></text>
            </g>
            <g id="character-signing-group">
                 <path d="M 400 310 L 420 235 L 380 235 Z" fill="#34495e" />
                <circle cx="400" cy="200" r="35" fill="#f0c2a2"/>
                <circle cx="390" cy="195" r="3" fill="black"/>
                <circle cx="410" cy="195" r="3" fill="black"/>
                <path d="M 390 210 Q 400 215 410 210" stroke="black" stroke-width="2" fill="none"/>
                <path d="M 380 180 A 40 40 0 0 1 420 180" fill="#4a3f35"/>
                <path d="M 400 275 L 435 300 L 400 300 Z" fill="#34495e"/>
                <path d="M 400 275 L 365 300 L 400 300 Z" fill="#34495e"/>
                <circle cx="380" cy="280" r="10" fill="#f0c2a2" />
            </g>
            <g id="contract-group">
                <rect x="325" y="270" width="150" height="30" fill="white" transform="rotate(-5 400 285)"/>
                <path id="signature-path" d="M 350 285 C 375 270, 385 290, 410 280" stroke="black" stroke-width="2" fill="none"/>
            </g>
            <g id="jersey-group">
                <rect x="325" y="150" width="150" height="150" fill="red" id="jersey-color" rx="10"/>
                <image id="jersey-logo" x="362.5" y="160" width="75" height="75" href=""/>
                <text id="jersey-name" x="400" y="265" font-family="Roboto" font-weight="900" font-size="24" fill="white" text-anchor="middle"></text>
            </g>`;

        document.getElementById('team-name-on-desk').textContent = gameState.team.name;
        document.getElementById('jersey-color').style.fill = gameState.team.color;
        document.getElementById('jersey-logo').setAttribute('href', gameState.team.logo);
        document.getElementById('jersey-name').textContent = gameState.playerName.split(' ').pop().toUpperCase();
        document.getElementById('final-team-name').textContent = gameState.team.name;
        
        const desk = document.getElementById('desk'), character = document.getElementById('character-signing-group'), contract = document.getElementById('contract-group'), signaturePath = document.getElementById('signature-path'), jerseyGroup = document.getElementById('jersey-group');
        setTimeout(() => { desk.style.opacity = 1; character.style.opacity = 1; character.style.transform = 'translateY(0)'; }, 500);
        setTimeout(() => { signaturePath.style.transition = 'stroke-dashoffset 1.5s ease-out'; signaturePath.style.strokeDashoffset = 0; }, 1500);
        setTimeout(() => {
            contract.style.transition = 'opacity 0.5s'; contract.style.opacity = 0;
            character.style.transform = 'translateY(-20px)';
            jerseyGroup.style.opacity = 1; jerseyGroup.style.transform = 'translateY(0)';
        }, 3500);
        setTimeout(() => { document.getElementById('flash-overlay').classList.add('flashing'); }, 4500);
        setTimeout(() => { document.getElementById('finalMessage').classList.add('active'); }, 5000);
        setTimeout(() => {
            animationOverlay.classList.remove('active');
            pressConferenceOverlay.classList.add('active');
            startPressConference();
        }, 6500);
    }
    function startPressConference() {
        const pressConferenceSvg = document.getElementById('press-conference-svg');
        pressConferenceSvg.innerHTML = `
             <g id="press-backdrop">
                 <rect x="50" y="50" width="700" height="300" fill="#2c3e50" rx="10" />
                 <rect x="50" y="50" width="700" height="300" id="backdrop-color" fill-opacity="0.8" rx="10"/>
                 <image id="backdrop-logo" x="350" y="100" width="100" height="100" href=""/>
             </g>
             <g id="press-table">
                 <rect x="0" y="350" width="800" height="100" fill="#4a3f35" />
                 <rect x="0" y="345" width="800" height="10" fill="#6b5b4f"/>
                 <circle cx="280" cy="340" r="10" fill="#111"/> <rect x="278" y="310" width="4" height="30" fill="#555"/>
                 <circle cx="400" cy="340" r="10" fill="#111"/> <rect x="398" y="310" width="4" height="30" fill="#555"/>
                 <circle cx="520" cy="340" r="10" fill="#111"/> <rect x="518" y="310" width="4" height="30" fill="#555"/>
             </g>
             <g id="manager-character">
                 <path d="M 200 350 L 220 270 L 180 270 Z" fill="#2c3e50" />
                 <circle cx="200" cy="240" r="30" fill="#e0b395"/>
                 <path d="M 180 225 A 30 30 0 0 1 220 225" fill="#333333"/>
             </g>
             <g id="coach-character">
                  <path d="M 600 350 L 620 270 L 580 270 Z" id="coach-tracksuit" fill="#DA291C" />
                 <circle cx="600" cy="240" r="30" fill="#f0c2a2"/>
                  <path d="M 580 225 A 30 30 0 0 1 620 225" fill="#a9a9a9"/>
             </g>
             <g id="player-character-press">
                 <path d="M 400 350 L 420 270 L 380 270 Z" fill="#34495e" />
                 <circle cx="400" cy="240" r="30" fill="#f0c2a2"/>
                 <path d="M 380 225 A 30 30 0 0 1 420 225" fill="#4a3f35"/>
             </g>
        `;
        questionEl.style.display = 'block';
        answersGridEl.style.display = 'grid';
        pressSummaryEl.style.display = 'none';
        const existingSummary = pressSummaryEl.querySelector('p');
        if (existingSummary) existingSummary.remove();
        document.getElementById('continueBtn').onclick = showMainHub;
        document.getElementById('backdrop-logo').setAttribute('href', gameState.team.logo);
        document.getElementById('backdrop-color').style.fill = gameState.team.color;
        document.getElementById('coach-tracksuit').style.fill = gameState.team.color;
        setTimeout(() => { document.getElementById('press-backdrop').style.opacity = 1; document.getElementById('press-table').style.opacity = 1; }, 200);
        setTimeout(() => { document.getElementById('manager-character').style.opacity = 1; document.getElementById('coach-character').style.opacity = 1; }, 600);
        setTimeout(() => {
            const player = document.getElementById('player-character-press');
            player.style.opacity = 1; player.style.transform = 'translateY(0)';
        }, 1000);
        setTimeout(() => { 
            document.getElementById('pressConferenceUI').classList.add('visible');
            displayQuestion();
        }, 1500);
    }
    
    function displayQuestion() {
        if (currentQuestionIndex >= questions.length) { showSummary(); return; }
        const qData = questions[currentQuestionIndex];
        questionEl.textContent = qData.question.replace('{teamName}', gameState.team.name);
        answersGridEl.innerHTML = '';
        qData.answers.forEach(answer => {
            const button = document.createElement('button');
            button.classList.add('button', 'answer-btn');
            button.textContent = answer.text;
            button.onclick = () => selectAnswer(answer.trait);
            answersGridEl.appendChild(button);
        });
    }
    function selectAnswer(trait) { reputation[trait]++; currentQuestionIndex++; displayQuestion(); }
    function showSummary() {
        questionEl.style.display = 'none';
        answersGridEl.style.display = 'none';
        pressSummaryEl.style.display = 'block';
        let summaryText = "";
        const maxRep = Object.keys(reputation).reduce((a, b) => reputation[a] > reputation[b] ? a : b);
        if(maxRep === 'humble') { summaryText = "A szurkolók értékelik a szerénységedet!"; }
        else if (maxRep === 'arrogant') { summaryText = "A magabiztos szavaid felkapták a sajtó figyelmét!"; }
        else { summaryText = "A profi válaszaid pozitív benyomást tettek a klub vezetésére."; }
        const summaryP = document.createElement('p');
        summaryP.textContent = summaryText;
        pressSummaryEl.prepend(summaryP);
        currentQuestionIndex = 0; reputation.humble = 0; reputation.arrogant = 0; reputation.professional = 0;
    }

    // --- UI FRISSÍTÉS ---
    function showMainHub() {
        document.getElementById('characterCreator').classList.add('hidden');
        document.getElementById('animationOverlay').classList.remove('active');
        document.getElementById('pressConferenceOverlay').classList.remove('active');
        document.getElementById('mainHub').classList.remove('hidden');
        updateUI();
    }
    
    function updateUI() {
        updateHeaderUI();
        updateDashboardUI();
        updateLeagueTable();
        updateProfileUI();
    }
    function updateHeaderUI() {
        document.getElementById('headerPlayerName').textContent = gameState.playerName;
        document.getElementById('headerPlayerBalance').textContent = (gameState.money || 0).toLocaleString();
        document.getElementById('headerPlayerDiamonds').textContent = (gameState.diamonds || 0).toLocaleString();
    }
    function updateDashboardUI() {
        document.getElementById('hubPlayerName').textContent = gameState.playerName;
        document.getElementById('hubPlayerTeamName').textContent = gameState.team.name;
        document.getElementById('hubPlayerTeamLogo').src = gameState.team.logo;
        document.getElementById('hubPlayerRating').textContent = gameState.rating;
        document.getElementById('hubPlayerNationality').textContent = gameState.nationality;
        const balanceSpan = document.querySelector('#dashboardScreen #hubPlayerBalance');
        if (balanceSpan) balanceSpan.textContent = (gameState.money || 0).toLocaleString();
        const salarySpan = document.querySelector('#dashboardScreen #hubPlayerSalary');
        if(salarySpan) salarySpan.textContent = (gameState.salary || 0).toLocaleString();
        
        if(gameState.schedule && gameState.currentMatchday < gameState.schedule.length){
            const nextFixture = gameState.schedule[gameState.currentMatchday].find(f => f.home === gameState.team.name || f.away === gameState.team.name);
            const opponentName = nextFixture.home === gameState.team.name ? nextFixture.away : nextFixture.home;
            document.getElementById('hubNextOpponent').textContent = opponentName;
            document.getElementById('playMatchBtn').disabled = false;
        } else {
            document.getElementById('hubNextOpponent').textContent = "Szezon vége";
            document.getElementById('playMatchBtn').disabled = false; 
        }

        const leagueClone = [...(gameState.league || [])];
        const position = leagueClone.sort((a, b) => b.points - a.points || (b.gd - a.gd)).findIndex(t => t.name === gameState.team.name) + 1;
        document.getElementById('hubLeaguePosition').textContent = `${position > 0 ? position : '-'}.`;
        document.getElementById('hubMatchday').textContent = `${gameState.currentMatchday} / ${gameState.schedule.length}`;
    }
    function updateLeagueTable() {
        const tableBody = document.getElementById('leagueTableBody');
        if(!tableBody) return;
        tableBody.innerHTML = '';
        const leagueClone = [...(gameState.league || [])];
        leagueClone.sort((a, b) => b.points - a.points || (b.gd - a.gd));
        leagueClone.forEach((team, index) => {
            const row = document.createElement('tr');
            if(team.name === gameState.team.name) row.classList.add('player-team');
            row.innerHTML = `<td>${index + 1}</td><td>${team.name}</td><td>${team.played}</td><td>${team.wins}</td><td>${team.draws}</td><td>${team.losses}</td><td>${team.gd}</td><td><strong>${team.points}</strong></td>`;
            tableBody.appendChild(row);
        });
    }
    function updateProfileUI() {
        document.getElementById('profilePlayerName').textContent = `${gameState.playerName} Profilja`;
        document.getElementById('profileGoals').textContent = gameState.goals || 0;
        document.getElementById('profileAssists').textContent = gameState.assists || 0;
        document.getElementById('profileMatches').textContent = gameState.matchesPlayed || 0;
        document.getElementById('profileTrophies').textContent = (gameState.trophies || []).length;
    }
    
    // --- NAVIGÁCIÓ ---
    const allScreens = document.querySelectorAll('.screen');
    const navButtons = document.querySelectorAll('.nav-btn');
    function showScreen(targetScreenId) {
        allScreens.forEach(screen => screen.classList.add('hidden'));
        document.getElementById(targetScreenId)?.classList.remove('hidden');
        navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.screen === targetScreenId));
    }
    navButtons.forEach(button => button.addEventListener('click', () => showScreen(button.dataset.screen)));
    document.getElementById('profileBtn').addEventListener('click', () => showScreen('profileScreen'));
    document.getElementById('coinStoreBtn').addEventListener('click', () => showScreen('coinStoreScreen'));
    document.getElementById('diamondStoreBtn').addEventListener('click', () => showScreen('diamondStoreScreen'));
    document.getElementById('playMatchBtn').addEventListener('click', playNextMatch);
    document.getElementById('matchResultContinueBtn').addEventListener('click', () => {
        document.getElementById('matchResultOverlay').classList.remove('active');
        updateUI();
    });
    
    // --- CANVAS JÁTÉK LOGIKA ---
    const matchGameOverlay = document.getElementById('matchGameOverlay');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    let gameLoop;
    let player, ball, opponents, keys, homeGoal, awayGoal, homeScore, awayScore;

    function startMatchGame(fixture) {
        matchGameOverlay.classList.add('active');
        resizeCanvas();
        
        const homeTeamDetails = TEAMS.find(t => t.name === fixture.home);
        const awayTeamDetails = TEAMS.find(t => t.name === fixture.away);
        const playerIsHome = gameState.team.name === homeTeamDetails.name;
        
        document.getElementById('gameHomeInfo').textContent = `${fixture.home} 0`;
        document.getElementById('gameAwayInfo').textContent = `${fixture.away} 0`;

        homeScore = 0;
        awayScore = 0;

        keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, Space: false };
        
        const playerColor = playerIsHome ? homeTeamDetails.color : awayTeamDetails.color;
        const opponentColor = playerIsHome ? awayTeamDetails.color : homeTeamDetails.color;

        player = { x: canvas.width / 4, y: canvas.height / 2, radius: 10, speed: 3, color: playerColor, hasBall: true };
        ball = { x: player.x, y: player.y, radius: 5, speedX: 0, speedY: 0, friction: 0.98 };
        
        opponents = [
            { x: canvas.width * 0.75, y: canvas.height * 0.3, radius: 10, speed: 1.5, color: opponentColor },
            { x: canvas.width * 0.75, y: canvas.height * 0.7, radius: 10, speed: 1.5, color: opponentColor }
        ];

        homeGoal = { x: canvas.width - 20, y: canvas.height / 2, width: 20, height: 100 };
        awayGoal = { x: 0, y: canvas.height / 2, width: 20, height: 100 };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        
        let gameTime = 90 * 60; // 90 perc másodpercben
        const timerInterval = setInterval(() => {
            gameTime -= 60;
            const minutes = Math.floor(gameTime / 60);
            const seconds = gameTime % 60;
            document.getElementById('gameTimer').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            if(gameTime <= 0){
                clearInterval(timerInterval);
                endMatchGame();
            }
        }, 1000);

        gameLoop = requestAnimationFrame(updateGame);
    }
    
    function endMatchGame() {
        cancelAnimationFrame(gameLoop);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
        matchGameOverlay.classList.remove('active');
        
        // Eredmények feldolgozása
        const roundFixtures = gameState.schedule[gameState.currentMatchday];
        const playerMatchFixture = roundFixtures.find(f => f.home === gameState.team.name || f.away === gameState.team.name);
        const playerIsHome = gameState.team.name === playerMatchFixture.home;
        
        const playerGoals = playerIsHome ? homeScore : awayScore;
        const playerResult = simulateMatch(playerMatchFixture.home, playerMatchFixture.away, true, playerGoals);

        processMatchResult(playerResult);
        
        // NPC meccsek szimulációja
        const otherFixtures = roundFixtures.filter(f => f.home !== gameState.team.name && f.away !== gameState.team.name);
        otherFixtures.forEach(fixture => {
            const otherResult = simulateMatch(fixture.home, fixture.away, false, 0);
            processMatchResult(otherResult);
        });

        gameState.currentMatchday++;
        saveGame(gameState);
        showMatchResult(playerResult);
    }
    
    function handleKeyDown(e) { keys[e.key] = true; }
    function handleKeyUp(e) { keys[e.key] = false; }

    function updateGame() {
        // Játékos mozgása
        if (keys.ArrowUp) player.y -= player.speed;
        if (keys.ArrowDown) player.y += player.speed;
        if (keys.ArrowLeft) player.x -= player.speed;
        if (keys.ArrowRight) player.x += player.speed;
        
        // Határok
        player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
        player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

        // Labda követi a játékost, ha nála van
        if (player.hasBall) {
            ball.x = player.x + 12;
            ball.y = player.y;
            if (keys.Space) {
                player.hasBall = false;
                ball.speedX = 15;
                ball.speedY = (Math.random() - 0.5) * 5;
                keys.Space = false;
            }
        } else {
            // Labda mozgása
            ball.x += ball.speedX;
            ball.y += ball.speedY;
            ball.speedX *= ball.friction;
            ball.speedY *= ball.friction;
        }

        // Ellenfél logikája
        opponents.forEach(opp => {
            const dx = ball.x - opp.x;
            const dy = ball.y - opp.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            opp.x += (dx / dist) * opp.speed;
            opp.y += (dy / dist) * opp.speed;

            // Ütközés a játékosokkal
            const playerDist = Math.sqrt(Math.pow(player.x - opp.x, 2) + Math.pow(player.y - opp.y, 2));
            if (playerDist < player.radius + opp.radius) {
                if(player.hasBall) {
                    player.hasBall = false;
                    ball.speedX = (Math.random() - 0.5) * 10;
                    ball.speedY = (Math.random() - 0.5) * 10;
                }
            }
        });
        
        // Labda megszerzése
        const distToBall = Math.sqrt(Math.pow(player.x - ball.x, 2) + Math.pow(player.y - ball.y, 2));
        if (!player.hasBall && distToBall < player.radius + ball.radius) {
            player.hasBall = true;
        }

        // Gól ellenőrzés
        if (ball.x > homeGoal.x && ball.y > homeGoal.y - homeGoal.height/2 && ball.y < homeGoal.y + homeGoal.height/2) {
            homeScore++;
            document.getElementById('gameHomeInfo').textContent = `${gameState.schedule[gameState.currentMatchday].find(f => f.home === gameState.team.name || f.away === gameState.team.name).home} ${homeScore}`;
            resetPositions();
        }
        if (ball.x < awayGoal.x + awayGoal.width && ball.y > awayGoal.y - awayGoal.height/2 && ball.y < awayGoal.y + awayGoal.height/2) {
            awayScore++;
            document.getElementById('gameAwayInfo').textContent = `${gameState.schedule[gameState.currentMatchday].find(f => f.home === gameState.team.name || f.away === gameState.team.name).away} ${awayScore}`;
            resetPositions();
        }

        draw();
        gameLoop = requestAnimationFrame(updateGame);
    }
    
    function resetPositions() {
        player.x = canvas.width / 4;
        player.y = canvas.height / 2;
        player.hasBall = true;
        ball.speedX = 0;
        ball.speedY = 0;
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Pálya rajzolása
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 3;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20); // Oldalvonalak
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 10);
        ctx.lineTo(canvas.width / 2, canvas.height - 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
        ctx.stroke();

        // Kapuk
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(homeGoal.x, homeGoal.y - homeGoal.height / 2, homeGoal.width, homeGoal.height);
        ctx.fillRect(awayGoal.x, awayGoal.y - awayGoal.height / 2, awayGoal.width, awayGoal.height);


        // Játékosok és labda
        drawPlayerSprite(ctx, player.x, player.y, player.color, true);
        opponents.forEach(opp => drawPlayerSprite(ctx, opp.x, opp.y, opp.color, false));

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    function drawPlayerSprite(ctx, x, y, color, isPlayer) {
        // Test
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y + 15);
        ctx.lineTo(x - 7, y - 10);
        ctx.lineTo(x + 7, y - 10);
        ctx.closePath();
        ctx.fill();

        // Fej
        ctx.fillStyle = '#f0c2a2'; // Bőrszín
        ctx.beginPath();
        ctx.arc(x, y - 15, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Jelző a játékos felett
        if (isPlayer) {
            ctx.fillStyle = 'yellow';
            ctx.beginPath();
            ctx.moveTo(x, y - 30);
            ctx.lineTo(x - 5, y - 25);
            ctx.lineTo(x + 5, y - 25);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    function resizeCanvas() {
        const aspectRatio = 16 / 9;
        const parentWidth = matchGameOverlay.clientWidth * 0.9;
        const parentHeight = matchGameOverlay.clientHeight * 0.8;
        
        let newWidth = parentWidth;
        let newHeight = parentWidth / aspectRatio;

        if (newHeight > parentHeight) {
            newHeight = parentHeight;
            newWidth = parentHeight * aspectRatio;
        }

        canvas.width = 800; // Belső felbontás
        canvas.height = 450;
        canvas.style.width = `${newWidth}px`;
        canvas.style.height = `${newHeight}px`;
    }

    window.addEventListener('resize', resizeCanvas);
    
    main();
});
