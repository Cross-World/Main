const board = document.getElementById('game-board');
const logList = document.getElementById('log-list');
const scoreDisplay = document.getElementById('score-display');
const suits = [{s:'♠',c:'black',t:'spade'},{s:'♥',c:'red',t:'heart'},{s:'♣',c:'black',t:'club'},{s:'♦',c:'red',t:'diamond'}];
const vals = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const valMap = {'A':1,'J':11,'Q':12,'K':13};

let draggedStack = [], originalPos = [], startX, startY, score = 0, sourceLoc = '';

// --- LOGOVACÍ SYSTÉM ---
function addLog(msg, type = '') {
    const div = document.createElement('div');
    div.className = `log-entry ${type ? 'log-' + type : ''}`;
    const time = new Date().toLocaleTimeString('cs-CZ', { hour12: false });
    div.innerHTML = `<span style="color: #888;">[${time}]</span> ${msg}`;
    logList.prepend(div);
    if (type === 'error') console.error(`[GAME ERROR] ${msg}`);
}

// --- INICIALIZACE HRY ---
function initGame() {
    board.querySelectorAll('.card').forEach(c => c.remove());
    board.querySelectorAll('.tableau-slot').forEach(s => s.remove());
    logList.innerHTML = ""; score = 0; updateUI();
    
    // Sloupce (0-6)
    for(let i=0; i<7; i++) {
        const slot = document.createElement('div');
        slot.className = 'slot tableau-slot';
        slot.style.left = (40 + i * 130) + 'px';
        slot.style.top = '230px';
        slot.dataset.slotIdx = i;
        board.appendChild(slot);
    }

    let deck = [];
    suits.forEach(s => vals.forEach(v => deck.push({s,v,val:valMap[v]||parseInt(v)})));
    deck.sort(() => Math.random() - 0.5);

    let idx = 0;
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j <= i; j++) {
            const c = createCard(deck[idx++]);
            c.style.left = (40 + i * 130) + 'px';
            c.style.top = (230 + j * 25) + 'px';
            c.style.zIndex = j;
            c.dataset.loc = 'tableau';
            c.dataset.currentSlot = i;
            if (j < i) c.classList.add('back');
            board.appendChild(c);
        }
    }
    while (idx < deck.length) {
        const c = createCard(deck[idx++]);
        c.classList.add('back'); c.style.left = '40px'; c.style.top = '40px';
        c.dataset.loc = 'stock'; board.appendChild(c);
    }
    addLog("Hra připravena (v14 - Stabilní)", "success");
}

function createCard(data) {
    const el = document.createElement('div');
    el.className = `card ${data.s.c}`;
    el.dataset.val = data.val; el.dataset.suit = data.s.t;
    el.dataset.col = data.s.c; el.dataset.valstr = data.v;
    el.innerHTML = `<div>${data.v}${data.s.s}</div><div style="font-size:3rem; pointer-events:none">${data.s.s}</div>`;
    el.addEventListener('mousedown', onMouseDown);
    return el;
}

// --- LOGIKA TAHŮ ---
function onMouseDown(e) {
    const card = e.currentTarget;
    if (card.dataset.loc === 'stock') {
        revealFromStock(card);
        return;
    }
    if (card.classList.contains('back')) return;

    sourceLoc = card.dataset.loc;
    const oldSlot = card.dataset.currentSlot;

    if (sourceLoc === 'tableau') {
        draggedStack = Array.from(board.querySelectorAll(`.card[data-current-slot="${oldSlot}"]`))
            .filter(c => !c.classList.contains('back') && parseInt(c.style.top) >= parseInt(card.style.top))
            .sort((a,b) => parseInt(a.style.top) - parseInt(b.style.top));
    } else {
        draggedStack = [card];
    }

    const rect = card.getBoundingClientRect();
    startX = e.clientX - rect.left; startY = e.clientY - rect.top;
    originalPos = draggedStack.map(c => ({ x: c.style.left, y: c.style.top, z: c.style.zIndex, loc: c.dataset.loc, slot: c.dataset.currentSlot }));
    
    draggedStack.forEach((c, i) => c.style.zIndex = 5000 + i);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(e) {
    if (!draggedStack.length) return;
    const b = board.getBoundingClientRect();
    draggedStack.forEach((c, i) => {
        c.style.left = (e.clientX - b.left - startX) + 'px';
        c.style.top = (e.clientY - b.top - startY + (i * 30)) + 'px';
    });
}

function onMouseUp() {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    if (!draggedStack.length) return;

    const first = draggedStack[0];
    let placed = false;

    // 1. DOMEČKY
    const foundations = document.querySelectorAll('.foundation-slot');
    for (let f of foundations) {
        if (isOver(first, f)) {
            const cardsInF = Array.from(board.querySelectorAll('.card[data-loc="foundation"]')).filter(c => Math.abs(c.offsetLeft - f.offsetLeft) < 15);
            const top = cardsInF.sort((a,b) => parseInt(b.style.zIndex) - parseInt(a.style.zIndex))[0];
            const tVal = top ? parseInt(top.dataset.val) : 0;

            if (!top && parseInt(first.dataset.val) === 1 && draggedStack.length === 1) {
                snap(f.offsetLeft, f.offsetTop, 10, 'foundation', null);
                addLog(`Eso ${first.dataset.suit} do domečku`, "success"); placed = true; score += 50; 
                checkWin(); break;
            } else if (top && first.dataset.suit === top.dataset.suit && parseInt(first.dataset.val) === tVal + 1 && draggedStack.length === 1) {
                snap(f.offsetLeft, f.offsetTop, tVal + 10, 'foundation', null);
                addLog(`${first.dataset.valstr} na domeček`, "success"); placed = true; score += 20; 
                checkWin(); break;
            }
        }
    }

    // 2. SLOUPCE
    if (!placed) {
        const slots = document.querySelectorAll('.tableau-slot');
        for (let s of slots) {
            const targetSlotIdx = s.dataset.slotIdx;
            const r1 = first.getBoundingClientRect();
            const r2 = s.getBoundingClientRect();
            const overlapX = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));

            if (overlapX > 40) {
                const cardsInT = Array.from(board.querySelectorAll(`.card[data-current-slot="${targetSlotIdx}"]`));
                const top = cardsInT.filter(c => !draggedStack.includes(c)).sort((a,b) => parseInt(b.style.zIndex) - parseInt(a.style.zIndex))[0];

                if (!top) {
                    if (parseInt(first.dataset.val) === 13) {
                        snap(parseInt(s.style.left), 230, 1, 'tableau', targetSlotIdx);
                        addLog(`Král na volný sloupec ${targetSlotIdx}`, "success"); placed = true; break;
                    }
                } else {
                    if (first.dataset.col !== top.dataset.col && parseInt(first.dataset.val) === parseInt(top.dataset.val) - 1) {
                        snap(parseInt(top.style.left), parseInt(top.style.top) + 30, parseInt(top.style.zIndex) + 1, 'tableau', targetSlotIdx);
                        addLog(`${first.dataset.valstr} na ${top.dataset.valstr}`, "success"); placed = true; break;
                    }
                }
            }
        }
    }

    if (!placed) {
        draggedStack.forEach((c, i) => {
            c.style.left = originalPos[i].x; c.style.top = originalPos[i].y; 
            c.style.zIndex = originalPos[i].z; c.dataset.loc = originalPos[i].loc;
            c.dataset.currentSlot = originalPos[i].slot;
        });
    } else {
        autoRevealProcess();
        updateUI();
    }
    draggedStack = [];
}

// --- POMOCNÉ FUNKCE ---
function autoRevealProcess() {
    for (let i = 0; i < 7; i++) {
        const colCards = Array.from(board.querySelectorAll(`.card[data-current-slot="${i}"]`));
        const faceUp = colCards.filter(c => !c.classList.contains('back'));
        const faceDown = colCards.filter(c => c.classList.contains('back'));
        if (faceUp.length === 0 && faceDown.length > 0) {
            const toReveal = faceDown.sort((a,b) => parseInt(b.style.zIndex) - parseInt(a.style.zIndex))[0];
            toReveal.classList.remove('back');
            score += 10;
            addLog(`Odkryta karta ve sloupci ${i}`, "success");
        }
    }
}

function checkWin() {
    const count = board.querySelectorAll('.card[data-loc="foundation"]').length;
    if (count === 52) {
        addLog("VÍTĚZSTVÍ! Všechny karty jsou v domečcích!", "success");
        setTimeout(() => {
            const name = prompt("Gratulujeme! Zadej své jméno:", "Hráč");
            saveWin(name || "Anonym", score);
        }, 500);
    }
}

function saveWin(name, finalScore) {
    const stats = JSON.parse(localStorage.getItem('solitaire_scores') || "[]");
    stats.push({ name, score: finalScore, date: new Date().toLocaleDateString('cs-CZ') });
    stats.sort((a, b) => b.score - a.score);
    localStorage.setItem('solitaire_scores', JSON.stringify(stats.slice(0, 5)));
    alert(`Výsledek uložen do síně slávy! Skóre: ${finalScore}`);
    location.reload();
}

function revealFromStock(card) {
    card.classList.remove('back'); card.dataset.loc = 'waste';
    card.style.left = '170px'; card.style.top = '40px';
    card.style.zIndex = board.querySelectorAll('.card[data-loc="waste"]').length + 100;
    addLog("Balíček: Karta líznuta");
}

document.getElementById('stock-slot').onclick = () => {
    const stock = Array.from(board.querySelectorAll('.card[data-loc="stock"]'));
    if (stock.length === 0) {
        const waste = Array.from(board.querySelectorAll('.card[data-loc="waste"]'));
        if (waste.length) {
            waste.reverse().forEach((c, i) => {
                c.classList.add('back'); c.dataset.loc = 'stock';
                c.style.left = '40px'; c.style.top = '40px'; c.style.zIndex = i;
            });
            addLog("Balíček: Karty vráceny");
        }
    }
};

function isOver(c, t) {
    const r1 = c.getBoundingClientRect(), r2 = t.getBoundingClientRect();
    return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
}

function snap(x, y, z, loc, slotIdx) {
    draggedStack.forEach((c, i) => {
        c.style.left = x + 'px';
        c.style.top = (loc === 'tableau' ? y + (i * 30) : y) + 'px';
        c.style.zIndex = z + i; 
        c.dataset.loc = loc;
        c.dataset.currentSlot = slotIdx;
    });
}

function updateUI() { scoreDisplay.innerText = `Skóre: ${score}`; }

document.getElementById('new-game-btn').onclick = initGame;
window.onload = initGame;