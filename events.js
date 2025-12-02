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
        
        // 1. feldolgozzuk az eredményt (ez frissíti a gameState-et és léptet fordulót)
        processMatchDayResult(result);
        
        // 2. Kiírjuk a képernyőre a megfelelő felületet
        
        if (result.isRestDay) {
            // Ha pihenőnap volt, csak visszatérünk a fő Hub-ra
            console.log("Pihenőnap. Vissza a fő Hub-ra.");
            showMainHub(gameState); 
        } else if (result.playerMatch) {
            // Ha volt meccs, megjelenítjük az eredményt
            console.log("Meccs befejezve. Eredmény kijelzése.");
            // Az eredmény behelyezése az UI kártyára:
            showMatchResultUI(result.playerMatch, result.otherResults); 
            
        } else {
             // Ez elméletileg nem fordulhat elő, ha a sorsolás jó
             console.error("Hiba: A forduló nem fejeződött be megfelelően.");
             showMainHub(gameState);
        }
    });

    // 💡 JAVÍTÁS UTÁN: Ez a gomb viszi tovább a játékot a fő hubra az eredmény kártyáról
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
                // A 'nameError' elem ID-je nincs a HTML-ben, feltételezzük, hogy egy alert-et használsz helyette
                
                if (playerName.length < 2) {
                    alert('Kérjük, adja meg a nevét (minimum 2 karakter)!');
                    return; 
                }
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
            
            // Frissíti a UI-t - ID KORRIGÁLVA (a HTML alapján a select-button-t kell frissíteni)
            const selectedNation = NATIONALITIES[value];
            const display = document.querySelector('#nationalitySelect .selected-option'); // Lecserélve a selectedNationalityDisplay-t a tényleges display elemre
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
