/**
 * leagues.js
 * Ez a modul tartalmazza a játékban szereplő összes bajnokság és csapat adatait.
 * Az adatokat a LEAGUES nevű konstansban exportálja.
 */

export const LEAGUES = {
    "England": {
        "Premier League": {
            tier: 1,
            teams: [
                { name: "Manchester City", strength: 88, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/z44l-a0W1v5FmgPnemV6Xw_96x96.png" },
                { name: "Arsenal", strength: 86, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/4us2nCgl6kgZc0t3hpW75Q_96x96.png" },
                { name: "Manchester United", strength: 84, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/udQ6ns69DZGDXpYxkWUuZQ_96x96.png" },
                { name: "Liverpool", strength: 85, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/0iShHhASp5q1SL4JhtwJiw_96x96.png" },
                { name: "Chelsea", strength: 82, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/fhBITrIlbQxhVB6IjxUO6Q_96x96.png" },
                { name: "Tottenham Hotspur", strength: 83, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/k3Q_m6eDRF-MImI-k2H2Ig_96x96.png" },
                { name: "Newcastle United", strength: 81, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/96S77nAF0M_rYn1vkB2f_w_96x96.png" },
                { name: "Aston Villa", strength: 80, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/V8L5h5GzBqsmKsfii-_2Bw_96x96.png" },
                { name: "West Ham United", strength: 78, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/bXkiyIzsbDtYS-D-_pTRVg_96x96.png" },
                { name: "Everton", strength: 76, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/C3J48tFF-BedH5Gnz227OA_96x96.png" },
                { name: "Wolverhampton", strength: 77, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/h-3_Wkl0-Dl_Q2EAXumcGA_96x96.png" },
                { name: "Fulham", strength: 75, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/dI5EX5ALi43z2msc0gxt3A_96x96.png" },
                { name: "Crystal Palace", strength: 74, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/8piQOz-DP2-sX2CmesX0yg_96x96.png" },
                { name: "Bournemouth", strength: 73, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/IcJ-eL4hTY3rR1s-3Q2aCQ_96x96.png" },
            ]
        }
    },
    "Spain": {
        "La Liga": {
            tier: 1,
            teams: [
                { name: "Real Madrid", strength: 89, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/Th4fAVAZeCJWRcKoLW7koA_96x96.png" },
                { name: "FC Barcelona", strength: 87, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/paYnEE8hcrP96neHRNofhQ_96x96.png" },
                { name: "Atlético Madrid", strength: 85, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/srAAE0bOnA-TD-tO2-1hHw_96x96.png" },
                { name: "Sevilla FC", strength: 82, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/6O8PSFQ1e25e1XvI0h3j2Q_96x96.png" },
                { name: "Real Sociedad", strength: 81, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/a07NgoaHPy3GsfB_1ws3SA_96x96.png" },
                { name: "Villarreal CF", strength: 80, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/nIdbR6qgSjJStnh8Se356g_96x96.png" },
                { name: "Real Betis", strength: 79, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/S0fDZjYYytbZaUt0f3cIhg_96x96.png" },
                { name: "Athletic Bilbao", strength: 78, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/JZ-itJZc2qQToHkSce-5PQ_96x96.png" },
                { name: "Valencia CF", strength: 77, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/QOUce0WQBYqreK3CVvuoYg_96x96.png" },
                { name: "Celta Vigo", strength: 76, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/a19LCx1nZ2jeoYy22yfnxg_96x96.png" },
                { name: "RCD Mallorca", strength: 74, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/An21F0wm6Bw21Tz6t0w1vA_96x96.png" },
                { name: "Girona FC", strength: 75, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/sNac-i1M2vXwTDohzR0D2w_96x96.png" },
                { name: "Getafe CF", strength: 73, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/T0k5T1Q5xH1YR-Sg9f3D-w_96x96.png" },
                { name: "UD Almería", strength: 72, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/Iu1SSpm303PKbp0xiSjW9g_96x96.png" },
            ]
        }
    },
    "Germany": {
        "Bundesliga": {
            tier: 1,
            teams: [
                { name: "Bayern Munich", strength: 89, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/0iIaLPmlsk1BaGzsttr_2A_96x96.png" },
                { name: "Borussia Dortmund", strength: 85, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/cQk4-rTMYgrKFovIs3cOPg_96x96.png" },
                { name: "RB Leipzig", strength: 84, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/c1a2dD-4xG6UuH5-0Abzgg_96x96.png" },
                { name: "Bayer Leverkusen", strength: 83, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/0zR8fl-29dDRP2v4lrVw2g_96x96.png" },
                { name: "Eintracht Frankfurt", strength: 81, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/a2plo2PgpVSsEVUHmyz71A_96x96.png" },
                { name: "VfL Wolfsburg", strength: 79, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/2DmLUla-igERFkFv19o25w_96x96.png" },
                { name: "SC Freiburg", strength: 78, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/n7wmgvNBwgBgQQr2LN2c_g_96x96.png" },
                { name: "Bor. M'gladbach", strength: 77, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/P43b1dKS-LwIZM22o2dM3A_96x96.png" },
                { name: "1. FC Union Berlin", strength: 80, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/oPlg0shz05s40rs70Oa_5w_96x96.png" },
                { name: "TSG Hoffenheim", strength: 76, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/lPDRR04KllkMg6PfnxPo5g_96x96.png" },
                { name: "1. FC Köln", strength: 75, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/L661T-9L5P0-xGj3E8k4RQ_96x96.png" },
                { name: "VfB Stuttgart", strength: 74, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/5acI5-KY2sE-aV9fOQJzxg_96x96.png" },
                { name: "FC Augsburg", strength: 72, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/LV8u7sR4d-8Gv3_t0yC5jA_96x96.png" },
                { name: "VfL Bochum", strength: 71, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/W3J2-4A51k2iS2LND4eWng_96x96.png" },
            ]
        }
    },
    "Italy": {
        "Serie A": {
            tier: 1,
            teams: [
                { name: "Inter Milan", strength: 86, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/l2-d2L-8gIzOkrHc210oRA_96x96.png" },
                { name: "AC Milan", strength: 84, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/mCjS_8aYcJGwKJePX-a9Qw_96x96.png" },
                { name: "Juventus", strength: 83, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/Lv6xmBlUIa3wvl2C-8o5xQ_96x96.png" },
                { name: "Napoli", strength: 85, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/Q1N5kn2d49y24va7fBedJQ_96x96.png" },
                { name: "AS Roma", strength: 82, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/Q-A3cy6-Kk2v2l2k2s8w_Q_96x96.png" },
                { name: "Lazio", strength: 81, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/kk-8v1z2eC4Z9vX9_J5A7A_96x96.png" },
                { name: "Atalanta", strength: 80, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/01PIu3_N0gO3Jz-5n1i-iQ_96x96.png" },
                { name: "Fiorentina", strength: 79, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/idofV82-4Br3w4v6x2BODg_96x96.png" },
                { name: "Torino", strength: 77, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/JTE85v2nSS2P-oPEn0uSjA_96x96.png" },
                { name: "Bologna", strength: 76, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/1P55QQHSPdCRb-2oI2P21A_96x96.png" },
                { name: "Udinese", strength: 75, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/36AlWJ1_3-_aKDBxGk0vAw_96x96.png" },
                { name: "Monza", strength: 74, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/20P6tnI5ybcR5eYj2NcKbw_96x96.png" },
                { name: "Sassuolo", strength: 73, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/GdLw3-29fL_GqIt34D5pDA_96x96.png" },
                { name: "Hellas Verona", strength: 72, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/nLjnH-pW1Y26kC3iG0v3Aw_96x96.png" },
            ]
        }
    },
    "Hungary": {
        "NB I": {
            tier: 1,
            teams: [
                { name: "Ferencvárosi TC", strength: 74, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/5s1AARla2Y2K6e3iG0v3Aw_96x96.png" },
                { name: "Puskás Akadémia FC", strength: 68, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/e5gt3w3gjP5z283mDnlqBA_96x96.png" },
                { name: "Fehérvár FC", strength: 69, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/YQYVyvJ0ce1pvea_3053NQ_96x96.png" },
                { name: "Debreceni VSC", strength: 67, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/eoWv9-zI4y3qL1S2T-s9xA_96x96.png" },
                { name: "Paksi FC", strength: 66, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/3v-d1p20aCI471KMvwF8_g_96x96.png" },
                { name: "Zalaegerszegi TE", strength: 65, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/415QjS8s32gQYx52s8MmYg_96x96.png" },
                { name: "Újpest FC", strength: 67, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/0AbmMPNxI68S3YJajae34A_96x96.png" },
                { name: "Diósgyőri VTK", strength: 64, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/jMvI1fD5W3S-H-t-K-q_Jw_96x96.png" },
                { name: "MTK Budapest", strength: 65, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/5v2z-m7q_11XlRA0kCt2hA_96x96.png" },
                { name: "Kecskeméti TE", strength: 66, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/yZlSgD0s1fJuhp2rqy-3-g_96x96.png" },
                { name: "Kisvárda FC", strength: 63, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/cAvPvsJdYqGZkE45C49Tmw_96x96.png" },
                { name: "Mezőkövesd Zsóry", strength: 62, logo: "https://ssl.gstatic.com/onebox/media/sports/logos/XmXb50PvhNsF2SBU07e-KA_96x96.png" },
            ]
        }
    }
};
