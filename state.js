// --- ÁLLAPOTKEZELÉS (SAVE/LOAD) ---
// Ez a modul felelős a játékállás mentéséért, betöltéséért és kezeléséért.

export let gameState = {};
export let allSaves = [];
export let currentSaveId = null;

const SAVE_KEY = 'footballCrazySaves';

/** Beállítja az aktuális játékállást és a mentési azonosítót */
export function setGameState(newState) {
    gameState = newState;
    currentSaveId = newState.id;
}

/** Frissíti a játékállás egy részletét */
export function updateGameState(updates) {
    gameState = { ...gameState, ...updates };
}

/** Betölti az összes mentést a localStorage-ből */
export function loadAllSaves() {
    const savedData = localStorage.getItem(SAVE_KEY);
    allSaves = savedData ? JSON.parse(savedData) : [];
    return allSaves;
}

/** Elmenti a jelenlegi játékállapotot a mentések listájába */
export function saveCurrentGame() {
    try {
        if (currentSaveId) {
            const gameIndex = allSaves.findIndex(save => save.id === currentSaveId);
            if (gameIndex !== -1) {
                allSaves[gameIndex] = gameState;
            } else {
                 allSaves.push(gameState);
            }
        }
        localStorage.setItem(SAVE_KEY, JSON.stringify(allSaves));
    } catch (e) {
        console.error("Hiba a játék mentésekor: ", e);
    }
}

/** Töröl egy mentést az azonosítója alapján */
export function deleteSave(saveId) {
    allSaves = allSaves.filter(save => save.id !== saveId);
    localStorage.setItem(SAVE_KEY, JSON.stringify(allSaves));
}

