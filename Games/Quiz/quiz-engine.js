let currentQuiz = null;
let currentIdx = 0;
let score = 0;
let userAnswers = [];
let startTime;
let timerInterval;

const mount = document.getElementById('app-mount');

function renderCategoryMenu() {
    if (timerInterval) clearInterval(timerInterval);
    const timerElem = document.getElementById('global-timer');
    if (timerElem) timerElem.style.display = 'none';
    
    let html = `<h2>Nabídka kvízů</h2><div class="quiz-grid">`;
    for (const [id, data] of Object.entries(ALL_QUIZZES)) {
        html += `
            <div class="quiz-card" onclick="startQuiz('${id}')">
                <div style="font-size: 2.5rem; margin-bottom:10px">${data.icon}</div>
                <h3>${data.title}</h3>
                <p>${data.description}</p>
            </div>
        `;
    }
    html += `</div>`;
    mount.innerHTML = html;
}

function startQuiz(quizId) {
    currentQuiz = JSON.parse(JSON.stringify(ALL_QUIZZES[quizId]));
    currentQuiz.questions = shuffle(currentQuiz.questions);
    
    currentIdx = 0;
    score = 0;
    userAnswers = [];
    
    const timerElem = document.getElementById('global-timer');
    if (timerElem) timerElem.style.display = 'block';
    
    startTime = new Date();
    timerInterval = setInterval(updateTimer, 1000);
    
    renderQuestion();
}

function renderQuestion() {
    const qData = currentQuiz.questions[currentIdx];
    const correctText = qData.a[qData.correct];
    const displayOptions = shuffle([...qData.a]);
    
    // Základní struktura otázky
    mount.innerHTML = `
        <div class="quiz-header-ui">
            <span class="progress-tag">Otázka ${currentIdx + 1} / ${currentQuiz.questions.length}</span>
        </div>
        <div class="question"><h3>${qData.q}</h3></div>
        <div class="options" id="options-container"></div>
    `;

    // Bezpečné přidání tlačítek bez nutnosti řešit uvozovky v onclick stringu
    const container = document.getElementById('options-container');
    displayOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.textContent = opt;
        btn.onclick = function() {
            handleAnswer(opt, correctText);
        };
        container.appendChild(btn);
    });
}

function handleAnswer(selected, correct) {
    const isCorrect = selected === correct;
    if (isCorrect) score++;
    
    userAnswers.push({ 
        q: currentQuiz.questions[currentIdx].q, 
        sel: selected, 
        cor: correct, 
        ok: isCorrect 
    });
    
    currentIdx++;
    if (currentIdx < currentQuiz.questions.length) {
        renderQuestion();
    } else {
        renderResults();
    }
}

function renderResults() {
    clearInterval(timerInterval);
    const timeElem = document.getElementById('time-display');
    const time = timeElem ? timeElem.innerText : "0:00";
    
    let html = `
        <div style="text-align:center; margin-bottom: 30px;">
            <h2>Kvíz dokončen! 🏁</h2>
            <div class="stats-container">
                <div class="stat-box"><span>Skóre</span><br><strong>${score} / ${currentQuiz.questions.length}</strong></div>
                <div class="stat-box"><span>Čas</span><br><strong>${time}</strong></div>
            </div>
            <button class="action-btn" onclick="renderCategoryMenu()">Zpět na výběr</button>
        </div>
        <div class="results-grid">
    `;
    
    userAnswers.forEach((item, i) => {
        html += `
            <div class="res-item ${item.ok ? 'correct' : 'incorrect'}">
                <div class="res-q">${i+1}. ${item.q}</div>
                <div class="res-info">
                    ${item.ok ? `✅ ${item.sel}` : `❌ Moje: ${item.sel} | ✔️ Správně: ${item.cor}`}
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    mount.innerHTML = html;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function updateTimer() {
    const diff = Math.floor((new Date() - startTime) / 1000);
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    const timeElem = document.getElementById("time-display");
    if (timeElem) {
        timeElem.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    }
}

renderCategoryMenu();