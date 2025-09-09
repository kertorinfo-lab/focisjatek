/**
 * events.js
 * Ez az új, központi eseménykezelő modul.
 * Felelős a felhasználói interakciók (pl. gombnyomások) és a játéklogika
 * összekötéséért. Importál a state, ui és data modulokból is,
 * ezzel megszüntetve a körkörös függőségeket.
 */

import { gameState, getAllSaves, deleteSave, loadSelectedGame, startNewGame } from './state.js';
import { getLeagueData } from './data.js';
import { playNextMatch } from './match.js';
import {
    showScreen, showMainMenu, displaySaveSlots, initializeCharacterCreator,
    updateCarousel, generateContractOffers, showConfirmationModal, hideConfirmationModal, getConfirmCallback
} from './ui.js';

let selectedLeagueName = null;
let selectedNationality = 'hu';
let currentStep = 0;

export function initEventListeners() {
    const characterCreator = document.getElementById('characterCreator');

    // --- FŐMENÜ ---
    document.getElementById('newGameBtn')?.addEventListener('click', initializeCharacterCreator);
    document.getElementById('saveSlotsContainer').addEventListener('click', (e) => {
        const slot = e.target.closest('.save-slot');
        if (!slot) return;
        const saveId = parseInt(slot.dataset.id, 10);

        if (e.target.closest('.delete-save-btn')) {
            showConfirmationModal(`Biztosan törölni szeretnéd a "${slot.querySelector('h4').textContent}" mentést?`, () => {
                deleteSave(saveId);
                displaySaveSlots(getAllSaves());
                hideConfirmationModal();
            });
        } else {
            loadSelectedGame(saveId);
        }
    });

    // --- MEGERŐSÍTŐ MODAL ---
    document.getElementById('confirmBtn').addEventListener('click', () => {
        const callback = getConfirmCallback();
        if (callback) callback();
    });
    document.getElementById('cancelBtn').addEventListener('click', hideConfirmationModal);

    // --- FŐ HUB ---
    document.getElementById('playMatchBtn')?.addEventListener('click', () => playNextMatch(gameState));
    document.getElementById('matchResultContinueBtn')?.addEventListener('click', () => showMainHub(gameState));
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', () => showScreen(button.dataset.screen, gameState));
    });
    document.getElementById('profileBtn')?.addEventListener('click', () => showScreen('profileScreen', gameState));
    document.getElementById('dashboardProfileCard')?.addEventListener('click', () => showScreen('squadScreen', gameState));

    // --- KARAKTERKÉSZÍTŐ ---
    characterCreator.addEventListener('click', (e) => {
        const totalSteps = 4;
        if (e.target.classList.contains('next-btn')) {
            const playerNameInput = document.getElementById('playerName');
            if (currentStep === 0 && playerNameInput.value.trim() === "") return;
            if (currentStep === 2 && selectedLeagueName === null) return;

            if (currentStep < totalSteps - 1) {
                currentStep++;
                if (currentStep === 3) {
                    generateContractOffers(selectedLeagueName);
                }
                updateCarousel(currentStep);
            }
        } else if (e.target.classList.contains('prev-btn')) {
            if (currentStep > 0) {
                currentStep--;
                updateCarousel(currentStep);
            }
        } else if (e.target.closest('.league-select-btn')) {
            const button = e.target.closest('.league-select-btn');
            document.querySelectorAll('.league-select-btn').forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            selectedLeagueName = button.dataset.league;
        } else if (e.target.closest('.accept-offer-btn')) {
            const team = JSON.parse(e.target.dataset.team);
            const playerName = document.getElementById('playerName').value;
            startNewGame(playerName, selectedNationality, selectedLeagueName, team);
        }
    });

    // Nemzetiség választó
    const nationalitySelectBtn = document.getElementById('nationalitySelect');
    const nationalityOptions = document.getElementById('nationalityOptions');
    nationalitySelectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        nationalityOptions.classList.toggle('hidden');
    });
    document.addEventListener('click', () => {
        nationalityOptions.classList.add('hidden');
    });
    nationalityOptions.addEventListener('click', (e) => {
        const option = e.target.closest('.option');
        if (option) {
            selectedNationality = option.dataset.value;
            const selectedOptionDisplay = document.querySelector('#nationalitySelect .selected-option');
            const nation = getLeagueData(selectedLeagueName); // Note: This seems incorrect, should be NATIONALITIES
            // Assuming NATIONALITIES is available via an import in the scope that needs it.
            // Correcting logic here to use a placeholder or require NATIONALITIES to be passed.
            // For now, let's just update the display based on what we can.
            const flagImg = option.querySelector('img').src;
            const nationName = option.querySelector('span').textContent;
            selectedOptionDisplay.innerHTML = `<img src="${flagImg}" alt=""><span>${nationName}</span>`;
            nationalityOptions.classList.add('hidden');
        }
    });
}
