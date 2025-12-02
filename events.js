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
    document.getElementById('playMatchBtn')?.addEventListener('click', async () => {
        const result = await playNextMatch(gameState);
        processMatchDayResult(result);
        
        if (result.playerMatch) {
            showMatchResultUI(result.playerMatch); 
        } else {
            showMainHub(gameState);
        }
    });

    document.getElementById('matchResultContinueBtn')?.addEventListener('click', () => showMainHub(gameState));

    // --- FŐMENÜ ---
    document.getElementById('newGameBtn')?.addEventListener('click', () => {
        currentStep = 0; 
        initializeCharacterCreator();
    });
    
    document.getElementById('saveSlotsContainer')?.addEventListener('click', (e) => {
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

    // --- KARAKTERKÉSZÍTŐ ESEMÉNYEK ---
    document.getElementById('characterCreator')?.addEventListener('click', (e) => {
        
        // 0. NEMZETISÉG LENYITÓ GOMB KEZELÉSE
        const optionsContainer = document.getElementById('nationalityOptions');

        // Ha a felhasználó a fő választó gombra (select-button) kattint, lenyitjuk/becsukjuk a listát.
        if (e.target.closest('.select-button') && optionsContainer) {
            // Megakadályozzuk, hogy a Nemzetiség választás is lefusson egyszerre
            if (e.target.closest('.option[data-value]')) return; 
            optionsContainer.classList.toggle('hidden'); 
        }
        
        // 1. LÉPÉSEK KÖZÖTTI NAVIGÁCIÓ
        
        // Tovább gomb (Next)
        if (e.target.closest('.next-btn')) {
            
            // Lépés: 0 -> 1 (Név és Pozíció ellenőrzése)
            if (currentStep === 0) {
                const playerName = document.getElementById('playerName').value.trim();
                const errorElement = document.getElementById('nameError'); 
                
                if (playerName.length < 2) {
                    if (errorElement) errorElement.textContent = 'Kérjük, adja meg a nevét.';
                    return; 
                }
                if (errorElement) errorElement.textContent = ''; 
            }
            
            // Lépés: 1 -> 2 (Liga kiválasztásának ellenőrzése)
            if (currentStep === 1 && !selectedLeagueName) {
                alert('Kérjük, válasszon egy induló ligát!'); 
                return;
            }

            currentStep++;
            updateCarousel(currentStep); 
            
            // Ha elértük a harmadik lépést (szerződés)
            if (currentStep === 2) { 
                generateContractOffers(selectedLeagueName);
            }
        }
        
        // Vissza gomb (Previous)
        if (e.target.closest('.prev-btn')) {
            if (currentStep > 0) {
                currentStep--;
                updateCarousel(currentStep);
            }
        }
        
        
        // 2. NEMZETISÉG VÁLASZTÁS (Kattintás az opcióra - KORRIGÁLVA)
        const selectedOption = e.target.closest('.option[data-value]');

        if (selectedOption) {
            const value = selectedOption.dataset.value;
            selectedNationality = value;
            
            // Frissíti a UI-t
            const selectedNation = NATIONALITIES[value];
            const display = document.getElementById('selectedNationalityDisplay');
            if (display) {
                display.innerHTML = `<img src="${selectedNation.flag}" alt="${selectedNation.name} zászló"><span>${selectedNation.name}</span>`;
            }
                
            // Visszarejti a listát a választás után
            document.getElementById('nationalityOptions')?.classList.add('hidden'); 
        }

        // 3. LIGA VÁLASZTÁS
        if (e.target.closest('.league-select-btn')) {
            document.querySelectorAll('.league-select-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            selectedLeagueName = e.target.dataset.league;
        }
        
        
        // 4. SZERZŐDÉS ELFOGADÁSA (Játék indítása)
        if (e.target.closest('.accept-offer-btn')) {
            const team = JSON.parse(e.target.dataset.team);
            const playerName = document.getElementById('playerName').value;
            startNewGame(playerName, selectedNationality, selectedLeagueName, team);
            showMainHub(gameState);
        }
    });
    
    // --- EGYÉB NAVIGÁCIÓ ---
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', () => showScreen(button.dataset.screen, gameState));
    });

    // --- MODAL KEZELÉS ---
    document.getElementById('confirmationModalConfirmBtn')?.addEventListener('click', () => {
        const callback = getConfirmCallback();
        if (callback) callback();
    });

    document.getElementById('confirmationModalCancelBtn')?.addEventListener('click', hideConfirmationModal);
}
