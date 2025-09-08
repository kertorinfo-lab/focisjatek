import { loadAllSaves } from './state.js';
import { generateAllPlayers } from './data.js';
import { showMainMenu, initEventListeners } from './ui.js';

function main() {
    loadAllSaves();
    let progress = 0;
    const loadingBar = document.getElementById('loadingBar');
    const loadingScreen = document.getElementById('loadingScreen');

    // Generate players after a short delay to allow other scripts to load
    // This is part of the loading simulation
    setTimeout(() => {
        generateAllPlayers();
    }, 100);

    const loadingInterval = setInterval(() => {
        progress += 5; // Simulate loading progress
        loadingBar.style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(loadingInterval);
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                showMainMenu();
                initEventListeners(); // Initialize listeners AFTER everything is ready
            }, 500);
        }
    }, 50);
}

// JAVÍTVA: A 'load' eseményre cseréltük a figyelőt.
// Ez biztosítja, hogy minden (leagues.js, names.js stb.) betöltődjön,
// mielőtt a fő programlogika elindulna.
window.addEventListener('load', main);

