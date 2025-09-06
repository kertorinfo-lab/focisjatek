// leagues.js
// Ez a fájl tartalmazza az összes bajnokság és csapat adatait.
// A struktúra: Ország -> Bajnokság neve -> { tier, teams }
// A 'tier' a bajnokság szintjét jelöli (1 az első osztály, 2 a másodosztály, stb.)

const LEAGUES = {
    "England": {
        "Premier League": {
            tier: 1,
            teams: [
                { name: 'Manchester City', strength: 95, color: '#6CABDD', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/382.png' },
                { name: 'Arsenal', strength: 93, color: '#EF0107', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/359.png' },
                { name: 'Liverpool', strength: 92, color: '#C8102E', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/364.png' },
                { name: 'Chelsea', strength: 89, color: '#034694', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/363.png' },
                { name: 'Tottenham Hotspur', strength: 88, color: '#132257', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/367.png' },
                { name: 'Manchester Utd', strength: 87, color: '#DA291C', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/360.png' },
                { name: 'Newcastle Utd', strength: 86, color: '#241F20', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/361.png' },
                { name: 'Aston Villa', strength: 85, color: '#670E36', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/362.png' },
                { name: 'Brighton', strength: 83, color: '#0057B8', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/331.png' },
                { name: 'West Ham Utd', strength: 82, color: '#7A263A', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/371.png' },
                { name: 'Everton', strength: 81, color: '#003399', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/368.png' },
                { name: 'Wolverhampton', strength: 80, color: '#FDB913', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/380.png' },
                { name: 'Fulham', strength: 79, color: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/370.png' },
                { name: 'Crystal Palace', strength: 78, color: '#1B458F', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/384.png' },
                { name: 'Brentford', strength: 77, color: '#C70000', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/337.png' },
                { name: 'Bournemouth', strength: 76, color: '#B50024', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/346.png' },
                { name: 'Nottingham Forest', strength: 75, color: '#DD0000', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/349.png' },
                { name: 'Ipswich Town', strength: 73, color: '#003399', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/366.png' },
                { name: 'Leicester City', strength: 74, color: '#0053A0', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/375.png' },
                { name: 'Southampton', strength: 72, color: '#D71920', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/376.png' },
            ]
        },
        "Championship": {
            tier: 2,
            teams: [
                { name: 'Leeds United', strength: 78, color: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/3646.png'},
                { name: 'Burnley', strength: 77, color: '#6C1D45', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/379.png'},
                { name: 'Watford', strength: 76, color: '#FBEE23', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/394.png'},
                { name: 'Sheffield Utd', strength: 75, color: '#EE2737', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/350.png'},
                { name: 'Middlesbrough', strength: 74, color: '#E11B22', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/378.png'},
                { name: 'Norwich City', strength: 73, color: '#00A650', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/381.png'}
            ]
        }
    },
    "Spain": {
        "La Liga": {
            tier: 1,
            teams: [
                { name: 'Real Madrid', strength: 96, color: '#FEBE10', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png' },
                { name: 'FC Barcelona', strength: 90, color: '#A50044', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png' },
                { name: 'Atlético Madrid', strength: 88, color: '#CB3524', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/106.png' },
                { name: 'Sevilla', strength: 85, color: '#D31414', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/243.png' },
                { name: 'Villarreal', strength: 84, color: '#005995', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/257.png' },
                { name: 'Real Sociedad', strength: 83, color: '#0E73BC', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/244.png' },
                { name: 'Athletic Bilbao', strength: 82, color: '#E4002B', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/84.png' },
                { name: 'Valencia', strength: 80, color: '#F6872D', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/249.png' },
                { name: 'Real Betis', strength: 79, color: '#00A35B', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/242.png' },
                { name: 'Celta Vigo', strength: 78, color: '#88C0E7', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/247.png' },
                { name: 'Alavés', strength: 77, color: '#000000', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/250.png' },
                { name: 'Girona', strength: 76, color: '#E7002C', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/328.png' },
                { name: 'Getafe', strength: 75, color: '#004792', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/251.png' },
                { name: 'Osasuna', strength: 74, color: '#BA1626', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/245.png' },
                { name: 'Mallorca', strength: 73, color: '#BA001F', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/240.png' },
                { name: 'Rayo Vallecano', strength: 72, color: '#D92323', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/253.png' },
                { name: 'Leganés', strength: 70, color: '#0044A9', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/255.png' },
                { name: 'Espanyol', strength: 69, color: '#00A35B', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/246.png' },
                { name: 'Valladolid', strength: 68, color: '#5E206A', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/248.png' },
                { name: 'Las Palmas', strength: 71, color: '#FFCE00', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/256.png' },
            ]
        }
    },
    "Germany": {
        "Bundesliga": {
            tier: 1,
            teams: [
                { name: 'Bayern München', strength: 94, color: '#DC052D', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/132.png' },
                { name: 'Borussia Dortmund', strength: 90, color: '#FDE100', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/124.png' },
                { name: 'Bayer Leverkusen', strength: 92, color: '#E32221', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/129.png' },
                { name: 'RB Leipzig', strength: 87, color: '#001C46', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/127.png' },
                { name: 'Eintracht Frankfurt', strength: 85, color: '#D80000', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/130.png' },
                { name: 'SC Freiburg', strength: 84, color: '#000000', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/135.png' },
                { name: 'Wolfsburg', strength: 82, color: '#65B32E', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/134.png' },
                { name: 'Mainz 05', strength: 80, color: '#EB2D35', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/136.png' },
                { name: 'Hoffenheim', strength: 79, color: '#005187', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/137.png' },
                { name: 'Borussia Mönchengladbach', strength: 78, color: '#000000', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/133.png' },
                { name: 'Köln', strength: 77, color: '#E82431', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/125.png' },
                { name: 'Union Berlin', strength: 76, color: '#EE3344', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/138.png' },
                { name: 'Heidenheim', strength: 75, color: '#DC052D', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/6882.png' },
                { name: 'Stuttgart', strength: 73, color: '#FF0000', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/128.png' },
                { name: 'Werder Bremen', strength: 72, color: '#1B7330', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/131.png' },
                { name: 'VfL Bochum', strength: 70, color: '#004D9D', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/140.png' },
                { name: 'FC Augsburg', strength: 68, color: '#A00511', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/126.png' },
                { name: 'Holstein Kiel', strength: 67, color: '#0054A6', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/2179.png' },
            ]
        }
    },
    "Italy": {
        "Serie A": {
            tier: 1,
            teams: [
                { name: 'Juventus', strength: 91, color: '#FFFFFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/111.png' },
                { name: 'AC Milan', strength: 90, color: '#FB090B', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/103.png' },
                { name: 'Inter Milan', strength: 89, color: '#0055A0', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/110.png' },
                { name: 'Napoli', strength: 88, color: '#007FFF', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/120.png' },
                { name: 'Roma', strength: 86, color: '#8E0013', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/102.png' },
                { name: 'Lazio', strength: 84, color: '#0066CC', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/104.png' },
                { name: 'Fiorentina', strength: 82, color: '#50208D', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/113.png' },
                { name: 'Atalanta', strength: 81, color: '#003A89', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/117.png' },
                { name: 'Torino', strength: 79, color: '#88001E', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/116.png' },
                { name: 'Bologna', strength: 78, color: '#BD1F2D', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/118.png' },
                { name: 'Sassuolo', strength: 77, color: '#00994D', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/121.png' },
                { name: 'Monza', strength: 76, color: '#FF0000', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/122.png' },
                { name: 'Empoli', strength: 75, color: '#003E92', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/114.png' },
                { name: 'Lecce', strength: 74, color: '#E7C817', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/108.png' },
                { name: 'Udinese', strength: 73, color: '#001D4B', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/115.png' },
                { name: 'Verona', strength: 72, color: '#005E3D', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/107.png' },
                { name: 'Como', strength: 68, color: '#31448A', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/6900.png' },
                { name: 'Parma', strength: 69, color: '#FFFF00', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/112.png' },
                { name: 'Palermo', strength: 70, color: '#FFC800', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/105.png' },
                { name: 'Genoa', strength: 71, color: '#CC0000', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/109.png' },
            ]
        }
    },
    "France": {
        "Ligue 1": {
            tier: 1,
            teams: [
                { name: 'PSG', strength: 95, color: '#004171', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/144.png' },
                { name: 'Marseille', strength: 87, color: '#002F6C', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/142.png' },
                { name: 'Monaco', strength: 85, color: '#CE1126', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/145.png' },
                { name: 'Nice', strength: 83, color: '#CC0000', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/150.png' },
                { name: 'Lille', strength: 82, color: '#E2021A', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/143.png' },
                { name: 'Lyon', strength: 81, color: '#003893', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/146.png' },
                { name: 'Rennes', strength: 80, color: '#E51921', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/149.png' },
                { name: 'Strasbourg', strength: 79, color: '#0054A6', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/151.png' },
                { name: 'Reims', strength: 78, color: '#ED1B34', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/148.png' },
                { name: 'Toulouse', strength: 77, color: '#5F3977', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/152.png' },
                { name: 'Montpellier', strength: 76, color: '#002C5F', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/153.png' },
                { name: 'Lens', strength: 75, color: '#FFCD00', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/154.png' },
                { name: 'Brest', strength: 74, color: '#C00021', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/155.png' },
                { name: 'Le Havre', strength: 73, color: '#003882', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/162.png' },
                { name: 'Metz', strength: 72, color: '#00245E', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/161.png' },
                { name: 'Nantes', strength: 71, color: '#009B3E', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/158.png' },
                { name: 'Saint-Étienne', strength: 68, color: '#279D55', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/159.png' },
                { name: 'Auxerre', strength: 67, color: '#003366', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/147.png' },
            ]
        }
    },
    "Hungary": {
        "NB I": {
            tier: 1,
            teams: [
                { name: 'Ferencváros', strength: 75, color: '#006633', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/6902.png' },
                { name: 'Puskás Akadémia', strength: 72, color: '#1B3079', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/6854.png' },
                { name: 'Fehérvár FC', strength: 70, color: '#C8010C', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/3141.png' },
                { name: 'Debreceni VSC', strength: 68, color: '#880D11', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/6855.png' },
                { name: 'Diósgyőri VTK', strength: 67, color: '#A60000', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/6856.png' },
                { name: 'Zalaegerszegi TE', strength: 66, color: '#0054A6', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/6857.png' },
                { name: 'Újpest FC', strength: 65, color: '#562D7E', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/6858.png' },
                { name: 'Kecskeméti TE', strength: 64, color: '#4B0082', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/6859.png' },
                { name: 'Paks', strength: 63, color: '#009C4C', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/6860.png' },
                { name: 'Kisvárda', strength: 62, color: '#003366', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/6861.png' },
                { name: 'MTK Budapest', strength: 60, color: '#003366', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/6862.png' },
                { name: 'Nyíregyháza', strength: 58, color: '#D50032', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/82/Ny%C3%ADregyh%C3%A1za_Spartacus_FC_logo.svg/200px-Ny%C3%ADregyh%C3%A1za_Spartacus_FC_logo.svg.png' },
            ]
        }
    }
};

