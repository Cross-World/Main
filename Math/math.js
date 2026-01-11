let gameState = {
    level: 1,
    score: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    questionsForNextLevel: 3,
    currentQuestion: null,
    isAnswering: false
};

function generateQuestion(level) {
    let num1, num2, operation, correctAnswer;
    
    // Obtížnost se zvyšuje s úrovní
    const maxNumber = Math.min(10 + level * 2, 50);
    
    if (level <= 2) {
        // Sčítání pro začátečníky
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        operation = '+';
        correctAnswer = num1 + num2;
    } else if (level <= 5) {
        // Sčítání a odčítání
        num1 = Math.floor(Math.random() * maxNumber) + 1;
        num2 = Math.floor(Math.random() * maxNumber) + 1;
        if (Math.random() > 0.5) {
            operation = '+';
            correctAnswer = num1 + num2;
        } else {
            // Zajistíme kladný výsledek
            if (num1 < num2) [num1, num2] = [num2, num1];
            operation = '-';
            correctAnswer = num1 - num2;
        }
    } else {
        // Všechny operace
        num1 = Math.floor(Math.random() * maxNumber) + 1;
        num2 = Math.floor(Math.random() * Math.min(maxNumber, 12)) + 1;
        const operations = ['+', '-', '×'];
        operation = operations[Math.floor(Math.random() * operations.length)];
        
        switch(operation) {
            case '+':
                correctAnswer = num1 + num2;
                break;
            case '-':
                if (num1 < num2) [num1, num2] = [num2, num1];
                correctAnswer = num1 - num2;
                break;
            case '×':
                correctAnswer = num1 * num2;
                break;
        }
    }
    
    // Generování špatných odpovědí
    const wrongAnswers = [];
    while (wrongAnswers.length < 3) {
        let wrong = correctAnswer + Math.floor(Math.random() * 10) - 5;
        if (wrong !== correctAnswer && wrong > 0 && !wrongAnswers.includes(wrong)) {
            wrongAnswers.push(wrong);
        }
    }
    
    return {
        question: `${num1} ${operation} ${num2} = ?`,
        correctAnswer,
        wrongAnswers,
        allAnswers: [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5)
    };
}

function displayQuestion() {
    gameState.currentQuestion = generateQuestion(gameState.level);
    
    document.getElementById('question').textContent = gameState.currentQuestion.question;
    
    const answersContainer = document.getElementById('answers');
    answersContainer.innerHTML = '';
    
    gameState.currentQuestion.allAnswers.forEach(answer => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = answer;
        btn.onclick = () => selectAnswer(btn, answer === gameState.currentQuestion.correctAnswer);
        answersContainer.appendChild(btn);
    });
    
    document.getElementById('feedback').textContent = '';
    gameState.isAnswering = false;
}

function selectAnswer(button, isCorrect) {
    if (gameState.isAnswering) return;
    gameState.isAnswering = true;
    
    // Zvýrazní správnou/špatnou odpověď
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach(btn => {
        if (btn === button) {
            btn.classList.add(isCorrect ? 'correct' : 'wrong');
        } else if (btn.textContent == gameState.currentQuestion.correctAnswer) {
            btn.classList.add('correct');
        }
        btn.style.pointerEvents = 'none';
    });
    
    const feedback = document.getElementById('feedback');
    
    if (isCorrect) {
        gameState.correctAnswers++;
        gameState.score += gameState.level * 10;
        feedback.textContent = 'Správně! 🎉';
        feedback.className = 'feedback correct-feedback';
        
        // Kontrola postupu na další úroveň
        if (gameState.correctAnswers % gameState.questionsForNextLevel === 0) {
            gameState.level++;
            feedback.textContent = `Skvělé! Postupuješ na úroveň ${gameState.level}! 🚀`;
        }
    } else {
        gameState.wrongAnswers++;
        feedback.textContent = 'Špatně! 😞';
        feedback.className = 'feedback wrong-feedback';
        
        // Ztráta úrovně za chybu (ale minimálně úroveň 1)
        if (gameState.level > 1) {
            gameState.level--;
            feedback.textContent = `Chyba! Klesáš na úroveň ${gameState.level}! 📉`;
        }
        
        // Game Over po příliš mnoha chybách
        if (gameState.wrongAnswers >= 5 && gameState.level === 1) {
            setTimeout(endGame, 1500);
            return;
        }
    }
    
    updateDisplay();
    
    // Další otázka po 2 sekundách
    setTimeout(() => {
        buttons.forEach(btn => {
            btn.classList.remove('correct', 'wrong');
            btn.style.pointerEvents = 'auto';
        });
        displayQuestion();
    }, 2000);
}

function updateDisplay() {
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('correct').textContent = gameState.correctAnswers;
    document.getElementById('wrong').textContent = gameState.wrongAnswers;
    
    // Progress bar - pokrok k další úrovni
    const progress = (gameState.correctAnswers % gameState.questionsForNextLevel) / gameState.questionsForNextLevel * 100;
    document.getElementById('progress').style.width = progress + '%';
}

function endGame() {
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('finalLevel').textContent = gameState.level;
    document.getElementById('finalScore').textContent = gameState.score;
    document.querySelector('.question-area').style.display = 'none';
}

function restartGame() {
    gameState = {
        level: 1,
        score: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        questionsForNextLevel: 3,
        currentQuestion: null,
        isAnswering: false
    };
    
    document.getElementById('gameOver').style.display = 'none';
    document.querySelector('.question-area').style.display = 'block';
    updateDisplay();
    displayQuestion();
}

// Spuštění hry
updateDisplay();
displayQuestion();