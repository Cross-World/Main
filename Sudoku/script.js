/* === script.js - KOMPLETNÍ FINÁLNÍ VERZE === */

const BOARD_SIZE = 9;
const EMPTY = 0;

let board = [];
let solution = [];
let startTime;
let timerInterval;
let isNotesMode = false; // Nový stav pro přepínání poznámek

// Reference na HTML elementy
const boardElement = document.getElementById('sudoku-board');
const timerElement = document.getElementById('timer');
const newGameButton = document.getElementById('new-game-btn');
const notesModeButton = document.getElementById('notes-mode-btn');

// Pole pro uložení poznámek pro každou buňku
let notes = Array(BOARD_SIZE).fill(0).map(() => 
    Array(BOARD_SIZE).fill(0).map(() => new Set())
);

// --- Generování a Řešení Sudoku (s kontrolou unikátnosti) ---

// Funkce pro vytvoření plně platného řešení Sudoku
function generateFullSolution() {
    let tempBoard = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(EMPTY));
    solve(tempBoard);
    return tempBoard;
}

// Rekurzivní řešič Sudoku (Backtracking)
function solve(currentBoard) {
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (currentBoard[r][c] === EMPTY) {
                // Náhodné pořadí čísel pro generování různých hádanek
                let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
                
                for (let num of numbers) {
                    if (isValid(currentBoard, r, c, num)) {
                        currentBoard[r][c] = num;
                        if (solve(currentBoard)) {
                            return true;
                        }
                        currentBoard[r][c] = EMPTY; // Backtrack
                    }
                }
                return false;
            }
        }
    }
    return true;
}

// Kontrola platnosti umístění čísla
function isValid(currentBoard, row, col, num) {
    // Kontrola řádku a sloupce
    for (let i = 0; i < BOARD_SIZE; i++) {
        // Kontrolujeme i sebe sama, ale to je OK, pokud je aktuální hodnota EMPTY
        if (currentBoard[row][i] === num && i !== col) return false;
        if (currentBoard[i][col] === num && i !== row) return false;
    }

    // Kontrola 3x3 boxu
    let boxRowStart = Math.floor(row / 3) * 3;
    let boxColStart = Math.floor(col / 3) * 3;
    
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (currentBoard[boxRowStart + r][boxColStart + c] === num && (boxRowStart + r) !== row && (boxColStart + c) !== col) {
                return false;
            }
        }
    }
    return true;
}

// Pomocná funkce: Počítá, kolik řešení má daná mřížka (0, 1 nebo 2+)
function countSolutions(board) {
    let count = 0;
    const tempBoard = board.map(row => [...row]); 

    function recursiveSolve() {
        if (count >= 2) return; 

        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (tempBoard[r][c] === EMPTY) {
                    for (let num = 1; num <= BOARD_SIZE; num++) {
                        // Použijeme isValid s kontrolou, zda je pole prázdné
                        if (isValid(tempBoard, r, c, num)) { 
                            tempBoard[r][c] = num;
                            recursiveSolve();
                            tempBoard[r][c] = EMPTY; // Backtrack
                        }
                    }
                    return; 
                }
            }
        }
        count++; 
    }
    
    recursiveSolve();
    return count;
}


// Hlavní funkce pro generování Sudoku (ROBUSTNÍ VERZE)
function generateSudoku(difficulty = 40) { // difficulty = cílový počet prázdných polí
    // 1. Vytvořit plné a platné řešení
    solution = generateFullSolution();
    board = solution.map(row => [...row]);
    
    // 2. Náhodně vygenerovat seznam všech 81 pozic
    let allCells = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            allCells.push({ r, c });
        }
    }
    allCells.sort(() => Math.random() - 0.5); // Zamíchat

    let cellsRemoved = 0;
    
    // 3. Postupně odstraňovat čísla a kontrolovat unikátnost
    for (const cell of allCells) {
        const { r, c } = cell;
        
        if (board[r][c] === EMPTY) continue; 
        
        const backup = board[r][c];
        board[r][c] = EMPTY; // Pokusit se odstranit číslo
        
        // Kontrola: Musí mít právě jedno řešení
        if (countSolutions(board) !== 1) {
            board[r][c] = backup; // Vrátíme zpět, hádanka by nebyla unikátní
        } else {
            cellsRemoved++;
        }
        
        if (cellsRemoved >= difficulty) {
             break;
        }
    }
    
    // 4. Reset a UI
    notes = Array(BOARD_SIZE).fill(0).map(() => 
        Array(BOARD_SIZE).fill(0).map(() => new Set())
    );
    renderBoard();
    startTimer();
}

// --- Renderování a Interakce ---

// Vykreslení hrací plochy do HTML
function renderBoard() {
    boardElement.innerHTML = '';
    
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            
            // Třídy pro silnější ohraničení 3x3 boxů
            if (r % 3 === 2 && r !== 8) cell.classList.add('border-bottom');
            if (c % 3 === 2 && c !== 8) cell.classList.add('border-right');
            
            const value = board[r][c];
            
            if (value !== EMPTY) {
                cell.textContent = value;
                cell.classList.add('initial-value'); // Počáteční hodnoty nelze měnit
            } else {
                // Poznámky
                const notesDiv = document.createElement('div');
                notesDiv.classList.add('notes');
                
                for (let i = 1; i <= 9; i++) {
                    const noteSpan = document.createElement('span');
                    noteSpan.classList.add('note');
                    noteSpan.textContent = i;
                    // Nastavení viditelnosti z uložených poznámek
                    if (!notes[r][c].has(i)) {
                        noteSpan.style.visibility = 'hidden';
                    }
                    notesDiv.appendChild(noteSpan);
                }
                cell.appendChild(notesDiv);
                
                // Hlavní vstupní pole
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.classList.add('main-input');
                // Nastavení aktuální hodnoty (pokud byla zadána)
                if (board[r][c] !== EMPTY) {
                    input.value = board[r][c];
                }
                cell.appendChild(input);
            }
            
            boardElement.appendChild(cell);
        }
    }
    
    // Přidání posluchačů událostí
    boardElement.querySelectorAll('.cell:not(.initial-value) .main-input').forEach(input => {
        input.addEventListener('keydown', handleCellKeyDown); // Nový handler pro logiku
        input.addEventListener('input', handleCellInput);     // Pro ošetření vložení (paste)
        input.addEventListener('click', handleCellClick);     // Pro aktivaci buňky
    });
}

// Obsluha kliknutí na buňku (pro nastavení aktivní buňky)
let activeCell = null;
function handleCellClick(event) {
    const input = event.target;
    const cell = input.closest('.cell');
    
    // Odstranění třídy 'active' ze všech buněk
    boardElement.querySelectorAll('.cell').forEach(c => c.classList.remove('active'));
    
    // Nastavení nové aktivní buňky
    cell.classList.add('active');
    activeCell = cell;
}

// Hlavní obsluha stisku klávesy (pro přepínání mezi hlavním číslem a poznámkami)
function handleCellKeyDown(event) {
    if (!activeCell) return; // Zajistí, že pracujeme jen s aktivní buňkou

    const key = event.key;
    const input = activeCell.querySelector('.main-input');
    if (!input) return; // Nemělo by se stát, ale pro jistotu

    const r = parseInt(activeCell.dataset.row);
    const c = parseInt(activeCell.dataset.col);

    // Zpracování pouze číslic 1-9
    if (key >= '1' && key <= '9') {
        event.preventDefault(); 
        const num = parseInt(key);
        
        if (isNotesMode) {
            // REŽIM POZNÁMEK
            if (notes[r][c].has(num)) {
                notes[r][c].delete(num);
            } else {
                notes[r][c].add(num);
            }
            
            // Aktualizace UI a vyčištění hlavního inputu
            const noteSpan = activeCell.querySelector(`.notes .note:nth-child(${num})`);
            if (noteSpan) {
                noteSpan.style.visibility = notes[r][c].has(num) ? 'visible' : 'hidden';
            }
            
            input.value = '';
            board[r][c] = EMPTY;
            activeCell.classList.remove('error');
            
        } else {
            // REŽIM HLAVNÍHO ČÍSLA
            input.value = num;
            handleCellInput({ target: input });
        }
    } else if (key === 'Backspace' || key === 'Delete') {
        // Povolit smazání v obou režimech
        input.value = '';
        handleCellInput({ target: input });
    } else if (key.length === 1 && !event.metaKey && !event.ctrlKey) {
        // Zablokovat jakýkoli jiný nečíselný znak
        event.preventDefault();
    }
}

// Obsluha vstupu (hlavní číslo - voláno z keydown a input eventů)
function handleCellInput(event) {
    const input = event.target;
    const cell = input.closest('.cell');
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);
    
    // Povolit pouze jednu číslici 1-9
    let value = input.value.replace(/[^1-9]/g, '');
    input.value = value.slice(0, 1);
    
    const num = value ? parseInt(value) : EMPTY;

    // Pokud jsme v režimu poznámek, ale nějak se dostalo číslo do inputu, vyčistíme jej.
    if (isNotesMode && num !== EMPTY) {
        input.value = '';
        return;
    }
    
    // Aktualizace herní mřížky
    board[r][c] = num;

    // Pokud je číslo zadáno, vymažte poznámky pro buňku (protože se nyní zobrazí hlavní číslo)
    if (num !== EMPTY) {
        notes[r][c].clear(); 
    }
    
    // Obarvení čísla, pokud je špatné
    if (num !== EMPTY) {
        if (num !== solution[r][c]) {
            cell.classList.add('error');
        } else {
            cell.classList.remove('error');
        }
    } else {
        cell.classList.remove('error');
    }

    // Kontrola vítězství
    if (checkWin()) {
        stopTimer();
        // Malá prodleva pro vizuální kontrolu poslední zadané číslice
        setTimeout(() => {
            alert(`Gratulujeme! Sudoku vyřešeno za ${timerElement.textContent}!`);
        }, 100);
    }
}

// --- Obsluha tlačítek a Časoměr ---

notesModeButton.addEventListener('click', toggleNotesMode);

function toggleNotesMode() {
    isNotesMode = !isNotesMode;
    if (isNotesMode) {
        notesModeButton.textContent = 'Poznámky: ZAPNUTO';
        notesModeButton.classList.add('active-mode');
        // Odebrání fokusu z inputu na mobilu
        if (document.activeElement && document.activeElement.tagName === 'INPUT') {
             document.activeElement.blur();
        }
    } else {
        notesModeButton.textContent = 'Poznámky: VYPNUTO';
        notesModeButton.classList.remove('active-mode');
    }
}

newGameButton.addEventListener('click', () => generateSudoku(45));

function startTimer() {
    clearInterval(timerInterval);
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function updateTimer() {
    const elapsed = Date.now() - startTime;
    const totalSeconds = Math.floor(elapsed / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    timerElement.textContent = `${minutes}:${seconds}`;
}

function checkWin() {
    // Kontrola, zda jsou všechny buňky vyplněny a shodují se s řešením
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] !== solution[r][c] || board[r][c] === EMPTY) {
                return false;
            }
        }
    }
    return true;
}

// --- Spuštění hry ---
generateSudoku(); // Spustit hru při načtení