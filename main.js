// --- FŐ BELÉPÉSI PONT (main.js) ---
/**
 * Ez a modul a játék belépési pontja. Amint betöltődik, elindítja
 * az inicializálási folyamatot: betölti a mentéseket, legenerálja a játékosokat,
 * majd a betöltőképernyő után megjeleníti a főmenüt.
 */

// --- IMPORTÁLÁS ---
// A szükséges modulokat importáljuk. A böngésző gondoskodik a helyes betöltési sorrendről.
import { loadAllSaves } from './state.js';
import { generateAllPlayers } from './data.js';
import { showMainMenu, initEventListeners } from './ui.js';

// --- INICIALIZÁLÁS ---
// Mivel ez egy modul, a kód azonnal lefut, amint a HTML feldolgozása befejeződött
// és az összes importált modul betöltődött. Nincs szükség 'load' vagy 'DOMContentLoaded' eseményfigyelőre.

// 1. Betöltjük a mentéseket a háttértárolóból.
loadAllSaves();

// 2. Legeneráljuk az összes játékost a játékhoz.
// A `setTimeout` felesleges, mert a data.js már importálta a szükséges adatokat (leagues, names, stb.).
generateAllPlayers();

// 3. Kezeljük a betöltőképernyő animációját és logikáját.
const loadingBar = document.getElementById('loadingBar');
const loadingScreen = document.getElementById('loadingScreen');
let progress = 0;

const loadingInterval = setInterval(() => {
    progress += 5; // Szimuláljuk a betöltési folyamatot.
    loadingBar.style.width = `${progress}%`;
    
    if (progress >= 100) {
        clearInterval(loadingInterval);
        loadingScreen.classList.add('fade-out');
        
        // Az animáció után elrejtjük a betöltőt, megmutatjuk a főmenüt, és inicializáljuk az eseményfigyelőket.
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            showMainMenu();
            initEventListeners();
        }, 500); // Ennek az időzítésnek meg kell egyeznie a CSS fade-out animáció idejével.
    }
}, 50);
