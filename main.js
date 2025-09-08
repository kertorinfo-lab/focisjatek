import { initEventListeners, showMainMenu } from './ui.js';
import { loadAllSaves } from './state.js';
import { generateAllPlayers } from './data.js';

// --- A JÁTÉK FŐ BELÉPÉSI PONTJA ---

// Globális DOM elemek
const loadingScreen = document.getElementById('loadingScreen');
const loadingBar = document.getElementById('loadingBar');

/**
 * A játék fő inicializáló függvénye.
 * Lefut, miután a HTML DOM teljesen betöltődött.
 */
function main() {
    // Korábbi mentések betöltése a local storage-ből
    loadAllSaves();
    
    // Minden UI eseményfigyelő (gombnyomás, stb.) beállítása
    initEventListeners();

    // A játékvilág összes játékosának generálása a háttérben
    setTimeout(() => {
        generateAllPlayers();
    }, 100);

    // Betöltőképernyő animációja és elrejtése
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += 5;
        loadingBar.style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(loadingInterval);
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                // A betöltés után a főmenü megjelenítése
                showMainMenu();
            }, 500);
        }
    }, 50);
}

// Az alkalmazás indítása
document.addEventListener('DOMContentLoaded', main);

