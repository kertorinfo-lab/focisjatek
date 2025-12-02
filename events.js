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
import { NATIONALITIES } from './nationalities.js'; // Így kell kinéznie

let selectedLeagueName = null;
let selectedNationality = 'hu'; // Kezdőérték
let currentStep = 0; // Ez a változó a Karakterkészítő aktuális lépését tárolja

export function initEventListeners() {
    // --- FŐ HUB ---
    document.getElementById('playMatchBtn')?.addEventListener('click', async () => {
        // 1. Lefuttatjuk a meccsszimulációt és megvárjuk az eredményt
        const result = await playNextMatch(gameState);
        
        // 2. Feldolgozzuk az eredményt és frissítjük a játékállapotot
        processMatchDayResult(result);
        
        // 3. Megjelenítjük a meccs végeredményét a UI-on
        if (result.playerMatch) {
            // Fontos: a showMatchResultUI-nak át kell adni az eredményt
            showMatchResultUI(result.playerMatch); 
        } else {
            // Ha pihenőhét volt, egyből a fő hub-ot mutatjuk
            showMainHub(gameState);
        }
    });

    document.getElementById('matchResultContinueBtn')?.addEventListener('click', () => showMainHub(gameState));

    // --- FŐMENÜ ---
    document.getElementById('newGameBtn')?.addEventListener('click', () => {
        currentStep = 0; // Új játék indításakor reseteljük a lépést
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

    // --- KARAKTERKÉSZÍTŐ (Ez a fő, javított eseménykezelő) ---
    document.getElementById('characterCreator')?.addEventListener('click', (e) => {
        
        // 1. LÉPÉSEK KÖZÖTTI NAVIGÁCIÓ (Javítás)
        
        // Tovább gomb (Next)
        if (e.target.closest('.next-btn')) {
            
            // Lépés: 0 -> 1 (Név és Pozíció ellenőrzése)
            if (currentStep === 0) {
                const playerName = document.getElementById('playerName').value.trim();
                const errorElement = document.getElementById('nameError'); // Feltételezzük, hogy van ilyen ID-jű elem
                
                if (playerName.length < 2) {
                    if (errorElement) errorElement.textContent = 'Kérjük, adja meg a nevét.';
                    return; // Megállítjuk a továbbhaladást, ha üres
                }
                if (errorElement) errorElement.textContent = ''; // Hibaüzenet törlése
            }
            
            // Lépés: 1 -> 2 (Liga kiválasztásának ellenőrzése)
            if (currentStep === 1 && !selectedLeagueName) {
                alert('Kérjük, válasszon egy induló ligát!'); // Egyszerű visszajelzés
                return;
            }

            currentStep++;
            updateCarousel(currentStep); // Frissíti a .form-carousel CSS transform értékét
            
            // Ha elértük a harmadik lépést (szerződés), generáljuk az ajánlatokat
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
        
        
        // 2. NEMZETISÉG VÁLASZTÁS
        if (e.target.closest('.option[data-value]')) {
            const value = e.target.closest('.option').dataset.value;
            selectedNationality = value;
            
            // Frissíti a kiválasztott értéket a .select-button-ban (ha van)
            const selectedNation = NATIONALITIES[value];
            const display = document.getElementById('selectedNationalityDisplay');
            if (display) {
                display.innerHTML = `<img src="${selectedNation.flag}" alt="${selectedNation.name} zászló"><span>${selectedNation.name}</span>`;
            }
                
            document.getElementById('nationalityOptions').classList.add('hidden'); // Visszarejtés
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
