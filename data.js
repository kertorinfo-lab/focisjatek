import { gameState } from './state.js';

let allPlayers = [];

// --- SEGÉDFÜGGVÉNYEK ---
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

export function generatePlayerName(nationalityCode) {
    const nameData = window.NAMES[nationalityCode] || window.NAMES['en'];
    const firstName = getRandomElement(nameData.firstNames);
    const lastName = getRandomElement(nameData.lastNames);
    return `${firstName} ${lastName}`;
}

export function formatValue(value) {
    if (value >= 1000000) {
        return `€${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
        return `€${Math.round(value / 1000)}K`;
    }
    return `€${value}`;
}

export function generateAllPlayers() {
    allPlayers = [];
    const positions = ['K', 'V', 'V', 'V', 'V', 'KP', 'KP', 'KP', 'CS', 'CS', 'CS'];
    if (!window.NATIONALITIES) {
        console.error("NATIONALITIES is not defined. Make sure nationalities.js is loaded.");
        return;
    }
    const natCodes = Object.keys(window.NATIONALITIES);

    if (!window.LEAGUES) {
        console.error("LEAGUES is not defined. Make sure leagues.js is loaded.");
        return;
    }
    for (const country in window.LEAGUES) {
        for (const leagueName in window.LEAGUES[country]) {
            window.LEAGUES[country][leagueName].teams.forEach(team => {
                for (let i = 0; i < 22; i++) {
                    const baseStrength = team.strength;
                    const playerStrength = Math.max(40, Math.min(99, Math.round(baseStrength - 15 + Math.random() * 25)));
                    const age = getRandomInt(17, 36);
                    const value = Math.round(Math.pow(playerStrength / 10, 3) * Math.max(1, (40 - age)) * 1000);
                    const natCode = getRandomElement(natCodes);

                    allPlayers.push({
                        id: `player_${Date.now()}_${Math.random()}`,
                        name: generatePlayerName(natCode),
                        position: getRandomElement(positions),
                        age: age,
                        rating: playerStrength,
                        value: value,
                        nationality: natCode,
                        teamName: team.name,
                        teamLogo: team.logo
                    });
                }
            });
        }
    }
}

export function generateRosterForTeam(teamName) {
    const teamPlayers = allPlayers.filter(p => p.teamName === teamName);

    const positions = {
        'K': [],
        'V': [],
        'KP': [],
        'CS': []
    };
    teamPlayers.forEach(p => {
        if (p && positions[p.position]) {
            positions[p.position].push(p);
        }
    });

    const roster = [
        ...positions['K'].slice(0, 2),
        ...positions['V'].slice(0, 5),
        ...positions['KP'].slice(0, 5),
        ...positions['CS'].slice(0, 4)
    ];

    gameState.team.players = roster;

    const userPlayer = {
        id: 'user_player',
        name: gameState.playerName,
        position: 'CS',
        age: gameState.age,
        rating: gameState.rating,
        teamName: gameState.team.name,
        isUser: true
    };

    const fwds = gameState.team.players.filter(p => p.position === 'CS');
    if (fwds.length > 0) {
        const playerToReplaceIndex = gameState.team.players.findIndex(p => p.id === fwds[0].id);
        gameState.team.players[playerToReplaceIndex] = userPlayer;
    } else {
        const mids = gameState.team.players.filter(p => p.position === 'KP');
        if (mids.length > 0) {
            const playerToReplaceIndex = gameState.team.players.findIndex(p => p.id === mids[0].id);
            gameState.team.players[playerToReplaceIndex] = userPlayer;
        } else {
            gameState.team.players.push(userPlayer);
        }
    }
}


export function getFilteredPlayers(nameFilter, posFilter) {
    return allPlayers.filter(p => {
        if (!p || !p.name) return false;
        const nameMatch = p.name.toLowerCase().includes(nameFilter);
        const posMatch = posFilter ? p.position === posFilter : true;
        const isNotUserPlayer = !gameState.playerName || p.name !== gameState.playerName;
        return nameMatch && posMatch && isNotUserPlayer;
    });
}

export function getLeagueData(leagueName) {
    for (const country in window.LEAGUES) {
        if (window.LEAGUES[country][leagueName]) {
            return {
                country, ...window.LEAGUES[country][leagueName]
            };
        }
    }
    return null;
}

export function getCountryLeagues(countryName) {
    return window.LEAGUES[countryName] ? Object.keys(window.LEAGUES[countryName]) : [];
}

export function getTeamData(teamName) {
    for (const country in window.LEAGUES) {
        for (const leagueName in window.LEAGUES[country]) {
            const team = window.LEAGUES[country][leagueName].teams.find(t => t.name === teamName);
            if (team) return team;
        }
    }
    return null;
}

export function generateSchedule(teamNames) {
    let teams = [...teamNames];
    if (teams.length % 2 !== 0) {
        teams.push(null);
    }
    const schedule = [];
    const numRounds = teams.length - 1;
    const numMatchesPerRound = teams.length / 2;

    for (let round = 0; round < numRounds; round++) {
        const roundMatches = [];
        for (let i = 0; i < numMatchesPerRound; i++) {
            const home = teams[i];
            const away = teams[teams.length - 1 - i];
            if (home && away) {
                roundMatches.push({
                    home,
                    away
                });
            }
        }
        schedule.push(roundMatches);
        teams.splice(1, 0, teams.pop());
    }

    const secondHalf = schedule.map(round =>
        round.map(({
            home,
            away
        }) => ({
            home: away,
            away: home
        }))
    );
    return [...schedule, ...secondHalf];
}

export function simulateOtherMatch(homeName, awayName, leagueName) {
    const leagueData = getLeagueData(leagueName);
    if (!leagueData) return {
        homeName,
        awayName,
        homeScore: 0,
        awayScore: 0
    };

    const homeTeam = leagueData.teams.find(t => t.name === homeName);
    const awayTeam = leagueData.teams.find(t => t.name === awayName);

    if (!homeTeam || !awayTeam) {
        return {
            homeName,
            awayName,
            homeScore: 0,
            awayScore: 0,
            playerGoals: 0
        };
    }
    const homeAdvantage = 0.15;
    const homeScore = Math.floor(Math.random() * (homeTeam.strength / 28 + homeAdvantage));
    const awayScore = Math.floor(Math.random() * (awayTeam.strength / 28));
    return {
        homeName,
        awayName,
        homeScore,
        awayScore,
        playerGoals: 0
    };
}

