/**
 * events.js
 * Központi eseménykezelő.
 */

import { gameState, getAllSaves, deleteSave, loadSelectedGame, startNewGame, processMatchDayResult } from './state.js';
import { playNextMatch } from './match.js';
import {
    showScreen, showMainMenu, displaySaveSlots, initializeCharacterCreator,
    updateCarousel, generateContractOffers, showConfirmationModal, hideConfirmationModal,
    getConfirmCallback, showMainHub, showMatchResultUI
} from './ui.js';
import { NATIONALITIES } from './nationalities.js';

let selectedLeagueName = null;
let selectedNationality = 'hu';
let currentStep = 0;

export function initEventListeners() {
    // --- FŐ HUB ---
    // JAVÍTVA: A meccsindítás most már aszinkron
    document.getElementById('playMatchBtn')?.addEventListener('click', async () => {
        // 1. Lefuttatjuk a meccsszimulációt és megvárjuk az eredményt
        const result = await playNextMatch(gameState);
        
        // 2. Feldolgozzuk az eredményt és frissítjük a játékállapotot
        processMatchDayResult(result);
        
        // 3. Megjelenítjük a meccs végeredményét a UI-on
        if (result.playerMatch) {
            showMatchResultUI(result.playerMatch, gameState);
        } else {
            // Ha pihenőhét volt, egyből a fő hub-ot mutatjuk
            showMainHub(gameState);
        }
    });

    document.getElementById('matchResultContinueBtn')?.addEventListener('click', () => showMainHub(gameState));

    // --- FŐMENÜ ---
    document.getElementById('newGameBtn')?.addEventListener('click', initializeCharacterCreator);
    document.getElementById('saveSlotsContainer').addEventListener('click', (e) => {
        const slot = e.target.closest('.save-slot');
        if (!slot) return;
        const saveId = parseInt(slot.dataset.id, 10);

        if (e.target.closest('.delete-save-btn')) {
            showConfirmationModal(`Biztosan törlöd a mentést?`, () => {
                deleteSave(saveId);
                displaySaveSlots(getAllSaves());
                hideConfirmationModal();
            });
        } else {
            loadSelectedGame(saveId);
            showMainHub(gameState);
        }
    });

    // --- KARAKTERKÉSZÍTŐ ---
    document.getElementById('characterCreator').addEventListener('click', (e) => {
        if (e.target.closest('.accept-offer-btn')) {
            const team = JSON.parse(e.target.dataset.team);
            const playerName = document.getElementById('playerName').value;
            startNewGame(playerName, selectedNationality, selectedLeagueName, team);
            showMainHub(gameState);
        }
        // ... a többi karakterkészítő logika ...
    });

    // ... a többi eseményfigyelő (nav-btn, profileBtn, stb.) változatlan ...
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', () => showScreen(button.dataset.screen, gameState));
    });
    // ...
}

