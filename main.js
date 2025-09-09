/**
 * main.js
 * Ez a játék belépési pontja.
 * Felelős az alapvető modulok inicializálásáért és az eseményfigyelők
 * beállításáért, miután az oldal teljesen betöltődött.
 */

import { loadAllSaves } from './state.js';
import { generateAllPlayers } from './data.js';
import { showMainMenu, initUIElements } from './ui.js';
import { initEventListeners } from './events.js'; // <-- MÓDOSÍTVA: Az új events.js-ből importálunk

function main() {
    // 1. Betöltjük a mentéseket a háttértárból
    loadAllSaves();

    // 2. Legeneráljuk az összes játékost a játékhoz
    generateAllPlayers();

    // 3. Előkészítjük a UI elemeket
    initUIElements();

    // 4. Beállítjuk az eseményfigyelőket (gombnyomások, stb.)
    initEventListeners();

    // 5. Szimulálunk egy rövid betöltést és megjelenítjük a főmenüt
    const loadingBar = document.getElementById('loadingBar');
    const loadingScreen = document.getElementById('loadingScreen');
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += 10;
        loadingBar.style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(loadingInterval);
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                showMainMenu(); // Megjelenítjük a főmenüt a mentésekkel
            }, 500);
        }
    }, 50);
}

// A program futtatása, amint a DOM betöltődött.
// A 'type="module"' garantálja, hogy a szkript a HTML elemzés után fut le.
main();

