/* === script.js - OPRAVENÁ VERZE === */

const BOARD_SIZE = 9;
const EMPTY = 0;

let board = [];
let solution = [];
let startTime;
let timerInterval;
let pausedTime = 0;
let isPaused = false;
let isNotesMode = false;
let errorCount = 0;

// Reference na HTML elementy
const boardElement = document.getElementById('sudoku-board');
const timerElement = document.getElementById('timer');
const errorsDisplay = document.getElementById('errors-display');
const newGameButton = document.getElementById('new-game-btn');
const notesModeButton = document.getElementById('notes-mode-btn');
const pauseButton = document.getElementById('pause-btn');
const gameContainer = document.getElementById('game-container');

// Pole pro uložení poznámek
let notes = Array(BOARD_SIZE).fill(0).map(() => 
    Array(BOARD_SIZE).fill(0).map(() => new Set())
);

// --- Logika Sudoku ---

function isValid(currentBoard, row, col, num) {
    for (let i = 0; i < BOARD_SIZE; i++) {
        if (currentBoard[row][i] === num && i !== col) return false;
        if (currentBoard[i][col] === num && i !== row) return false;
    }
    let boxRowStart = Math.floor(row / 3) * 3;
    let boxColStart = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (currentBoard[boxRowStart + r][boxColStart + c] === num && 
               (boxRowStart + r !== row || boxColStart + c !== col)) {
                return false;
            }
        }
    }
    return true;
}

function solve(currentBoard) {
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (currentBoard[r][c] === EMPTY) {
                let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
                for (let num of numbers) {
                    if (isValid(currentBoard, r, c, num)) {
                        currentBoard[r][c] = num;
                        if (solve(currentBoard)) return true;
                        currentBoard[r][c] = EMPTY;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function countSolutions(grid) {
    let count = 0;
    const tempBoard = grid.map(row => [...row]);
    function recursiveSolve() {
        if (count >= 2) return;
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (tempBoard[r][c] === EMPTY) {
                    for (let n = 1; n <= 9; n++) {
                        if (isValid(tempBoard, r, c, n)) {
                            tempBoard[r][c] = n;
                            recursiveSolve();
                            tempBoard[r][c] = EMPTY;
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

function generateSudoku(difficulty = 40) {
    solution = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(EMPTY));
    solve(solution);
    
    board = solution.map(row => [...row]);
    let allCells = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) allCells.push({ r, c });
    }
    allCells.sort(() => Math.random() - 0.5);

    let removed = 0;
    for (const cell of allCells) {
        const { r, c } = cell;
        const backup = board[r][c];
        board[r][c] = EMPTY;
        if (countSolutions(board) !== 1) {
            board[r][c] = backup;
        } else {
            removed++;
        }
        if (removed >= difficulty) break;
    }

    errorCount = 0;
    if (errorsDisplay) errorsDisplay.textContent = "0";
    notes = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0).map(() => new Set()));
    isPaused = false;
    if (gameContainer) gameContainer.classList.remove('paused');
    renderBoard();
    startTimer();
}

// --- Renderování a Interakce ---

function renderBoard() {
    boardElement.innerHTML = '';
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            
            if (r % 3 === 2 && r !== 8) cell.classList.add('border-bottom');
            if (c % 3 === 2 && c !== 8) cell.classList.add('border-right');
            
            if (board[r][c] !== EMPTY) {
                cell.textContent = board[r][c];
                cell.classList.add('initial-value');
            } else {
                const notesDiv = document.createElement('div');
                notesDiv.classList.add('notes-grid'); // Sjednoceno s CSS
                for (let i = 1; i <= 9; i++) {
                    const s = document.createElement('div');
                    s.classList.add('note-num');
                    s.dataset.n = i;
                    notesDiv.appendChild(s);
                }
                cell.appendChild(notesDiv);
                
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.classList.add('main-input');
                cell.appendChild(input);
            }
            boardElement.appendChild(cell);
        }
    }

    boardElement.querySelectorAll('.main-input').forEach(input => {
        input.addEventListener('keydown', handleCellKeyDown);
        input.addEventListener('click', (e) => {
            boardElement.querySelectorAll('.cell').forEach(c => c.classList.remove('active'));
            e.target.closest('.cell').classList.add('active');
        });
    });
}

function handleCellKeyDown(event) {
    const input = event.target;
    const cell = input.closest('.cell');
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);
    const key = event.key;

    if (key >= '1' && key <= '9') {
        event.preventDefault();
        const num = parseInt(key);

        if (isNotesMode) {
            const noteDiv = cell.querySelector(`.note-num[data-n="${num}"]`);
            if (notes[r][c].has(num)) {
                notes[r][c].delete(num);
                noteDiv.textContent = "";
            } else {
                notes[r][c].add(num);
                noteDiv.textContent = num;
            }
            input.value = "";
            board[r][c] = EMPTY;
        } else {
            input.value = num;
            board[r][c] = num;
            notes[r][c].clear();
            cell.querySelectorAll('.note-num').forEach(n => n.textContent = "");
            
            if (num !== solution[r][c]) {
                cell.classList.add('error');
                errorCount++;
                if (errorsDisplay) errorsDisplay.textContent = errorCount;
                if (errorCount >= 3) {
                    setTimeout(() => { alert("Konec hry! Příliš mnoho chyb."); generateSudoku(); }, 100);
                }
            } else {
                cell.classList.remove('error');
                checkCompletions(r, c);
                if (checkWin()) {
                    stopTimer();
                    setTimeout(() => alert("Gratulujeme!"), 100);
                }
            }
        }
    } else if (key === 'Backspace' || key === 'Delete') {
        board[r][c] = EMPTY;
        cell.classList.remove('error');
    } else if (key.length === 1) {
        event.preventDefault();
    }
}

function checkCompletions(r, c) {
    const animate = (condition) => {
        document.querySelectorAll('.cell').forEach(cell => {
            if (condition(cell)) {
                cell.classList.remove('success-pulse');
                void cell.offsetWidth;
                cell.classList.add('success-pulse');
            }
        });
    };

    if (board[r].every(v => v !== EMPTY)) animate(cl => cl.dataset.row == r);
    if (board.map(row => row[c]).every(v => v !== EMPTY)) animate(cl => cl.dataset.col == c);
    
    let sr = Math.floor(r/3)*3, sc = Math.floor(c/3)*3;
    let boxFull = true;
    for(let i=0; i<3; i++) for(let j=0; j<3; j++) if(board[sr+i][sc+j] === EMPTY) boxFull = false;
    if (boxFull) animate(cl => cl.dataset.row >= sr && cl.dataset.row < sr+3 && cl.dataset.col >= sc && cl.dataset.col < sc+3);
}

// --- Časomíra a tlačítka ---

function startTimer() {
    clearInterval(timerInterval);
    startTime = Date.now() - pausedTime;
    timerInterval = setInterval(() => {
        const diff = Math.floor((Date.now() - startTime) / 1000);
        const m = String(Math.floor(diff / 60)).padStart(2, '0');
        const s = String(diff % 60).padStart(2, '0');
        timerElement.textContent = `${m}:${s}`;
    }, 1000);
}

function stopTimer() { clearInterval(timerInterval); }

if (notesModeButton) {
    notesModeButton.addEventListener('click', () => {
        isNotesMode = !isNotesMode;
        notesModeButton.classList.toggle('active-mode');
        notesModeButton.textContent = isNotesMode ? 'Poznámky: ZAPNUTO' : 'Poznámky: VYPNUTO';
    });
}

if (pauseButton) {
    pauseButton.addEventListener('click', () => {
        isPaused = !isPaused;
        if (isPaused) {
            stopTimer();
            pausedTime = Date.now() - startTime;
            gameContainer.classList.add('paused');
            pauseButton.textContent = "Pokračovat";
        } else {
            startTimer();
            gameContainer.classList.remove('paused');
            pauseButton.textContent = "Pauza";
        }
    });
}

if (newGameButton) {
    newGameButton.addEventListener('click', () => {
        pausedTime = 0;
        generateSudoku();
    });
}

function checkWin() {
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] !== solution[r][c]) return false;
        }
    }
    return true;
}

// Spuštění
generateSudoku();
