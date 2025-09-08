// --- ADATKEZELŐ ÉS GENERÁLÓ FÜGGVÉNYEK ---
// Ez a modul a "nyers" adatokkal (leagues.js, names.js) dolgozik és segédfüggvényeket biztosít.

let allPlayers = [];

// Ez a fájl feltételezi, hogy a LEAGUES, NATIONALITIES, és NAMES globálisan elérhetőek a beillesztett szkriptekből

export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomElement(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

function generatePlayerName(nationalityCode) {
    // JAVÍTVA: window.NAMES használata
    const nameData = window.NAMES[nationalityCode] || window.NAMES['en'];
    const firstName = getRandomElement(nameData.firstNames);
    const lastName = getRandomElement(nameData.lastNames);
    return `${firstName} ${lastName}`;
}

export function formatValue(value) {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `€${Math.round(value / 1000)}K`;
    return `€${value}`;
}

export function generateAllPlayers() {
    allPlayers = [];
    const positions = ['K', 'V', 'V', 'V', 'V', 'KP', 'KP', 'KP', 'CS', 'CS', 'CS'];
    // JAVÍTVA: window.NATIONALITIES és window.LEAGUES használata
    const natCodes = Object.keys(window.NATIONALITIES);
    for (const country in window.LEAGUES) {
        for (const leagueName in window.LEAGUES[country]) {
            window.LEAGUES[country][leagueName].teams.forEach(team => {
                for (let i = 0; i < 22; i++) {
                    const baseStrength = team.strength;
                    const rating = Math.max(40, Math.min(99, Math.round(baseStrength - 15 + Math.random() * 25)));
                    const age = getRandomInt(17, 36);
                    const value = Math.round(Math.pow(rating / 10, 3) * Math.max(1, (40 - age)) * 1000);
                    allPlayers.push({
                        id: `player_${Date.now()}_${Math.random()}`,
                        name: generatePlayerName(getRandomElement(natCodes)),
                        position: getRandomElement(positions), age, rating, value,
                        nationality: getRandomElement(natCodes), teamName: team.name, teamLogo: team.logo
                    });
                }
            });
        }
    }
}

export function getAllPlayers() { return allPlayers; }

export function getLeagueData(leagueName) {
    // JAVÍTVA: window.LEAGUES használata
    for (const country in window.LEAGUES) {
        if (window.LEAGUES[country][leagueName]) return { country, ...window.LEAGUES[country][leagueName] };
    }
    return null;
}

export function getCountryLeagues(countryName) {
    // JAVÍTVA: window.LEAGUES használata
    return window.LEAGUES[countryName] ? Object.keys(window.LEAGUES[countryName]) : [];
}

export function getTeamData(teamName) {
    // JAVÍTVA: window.LEAGUES használata
    for (const country in window.LEAGUES) {
        for (const leagueName in window.LEAGUES[country]) {
            const team = window.LEAGUES[country][leagueName].teams.find(t => t.name === teamName);
            if (team) return team;
        }
    }
    return null;
}

export function generateRosterForTeam(teamName) {
    const teamPlayers = allPlayers.filter(p => p.teamName === teamName);
    const positions = { 'K': [], 'V': [], 'KP': [], 'CS': [] };
    teamPlayers.forEach(p => p && positions[p.position]?.push(p));
    return [ ...positions['K'].slice(0, 2), ...positions['V'].slice(0, 5), ...positions['KP'].slice(0, 5), ...positions['CS'].slice(0, 4) ];
}

export function generateSchedule(teamNames) {
    let teams = [...teamNames];
    if (teams.length % 2 !== 0) teams.push(null);
    const schedule = [];
    const numRounds = teams.length - 1;
    for (let round = 0; round < numRounds; round++) {
        const roundMatches = [];
        for (let i = 0; i < teams.length / 2; i++) {
            const home = teams[i], away = teams[teams.length - 1 - i];
            if (home && away) roundMatches.push({ home, away });
        }
        schedule.push(roundMatches);
        teams.splice(1, 0, teams.pop());
    }
    const secondHalf = schedule.map(round => round.map(({ home, away }) => ({ home: away, away: home })));
    return [...schedule, ...secondHalf];
}

export function simulateOtherMatch(homeName, awayName, leagueName) {
    const leagueData = getLeagueData(leagueName);
    if (!leagueData) return { homeName, awayName, homeScore: 0, awayScore: 0 };
    const homeTeam = leagueData.teams.find(t => t.name === homeName);
    const awayTeam = leagueData.teams.find(t => t.name === awayName);
    if (!homeTeam || !awayTeam) {
        return { homeName, awayName, homeScore: 0, awayScore: 0 };
    }
    const homeAdvantage = 0.15;
    const homeScore = Math.floor(Math.random() * (homeTeam.strength / 28 + homeAdvantage));
    const awayScore = Math.floor(Math.random() * (awayTeam.strength / 28));
    return { homeName, awayName, homeScore, awayScore };
}

