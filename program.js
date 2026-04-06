// Game state object
const gameState = {
    running: false,
    gameover: false,
    difficulty: 'easy',
    round: 0,
    answer: 0,
    currentRoundNumber: 0,
    currentRoundIsBlack: true,
    displayTimer: null,
    countdownTimer: null
};

// Custom alert function
function showAlert(message) {
    const modal = document.getElementById("alert-modal");
    const msgEl = document.getElementById("alert-message");
    if (modal && msgEl) {
        msgEl.innerHTML = message.replace(/\n/g, '<br>');
        modal.style.display = "flex";
    }
}

function closeAlert() {
    const modal = document.getElementById("alert-modal");
    if (modal) {
        modal.style.display = "none";
    }
}

// Difficulty settings (ms)
const DIFFICULTY_SETTINGS = {
    easy: { displayMs: 5000, name: 'Easy' },
    medium: { displayMs: 3000, name: 'Medium' },
    hard: { displayMs: 1500, name: 'Hard' }
};

// Create button elements for display
function createbutton(number = 0, isBlack = true, mixed = false) {
    const row = document.getElementById("buttonrow");
    // Clear previous buttons
    while (row.firstChild) {
        row.removeChild(row.firstChild);
    }
    const color = isBlack ? "black" : "white";

    for (let i = 0; i < number; i++) {
        const cell = document.createElement("td");
        const button = document.createElement("button");
        button.className = "box";
        if (mixed) {
            button.style.backgroundColor = Math.random() < 0.5 ? "black" : "white";
        } else {
        button.style.backgroundColor = color;
        }
        button.disabled = true;
        cell.appendChild(button);
        row.appendChild(cell);
    }
}

// Update UI to show current game info
function updateGameInfo() {
    const infoEl = document.getElementById("gameinfo");
    if (infoEl) {
        infoEl.textContent = `Round: ${gameState.round} `;
    }
}

// Display countdown timer while buttons are shown
function startCountdown(displayMs) {
    const timerCircle = document.getElementById("timer-progress");
    const timerText = document.getElementById("timer-text");
    if (!timerCircle || !timerText) return;

    const circumference = 2 * Math.PI * 50; // radius = 50
    const startTime = Date.now();
    const endTime = startTime + displayMs;

    gameState.countdownTimer = setInterval(() => {
        const remaining = Math.max(0, endTime - Date.now());
        const seconds = (remaining / 1000).toFixed(1);
        const progress = 1 - (remaining / displayMs); // 0 to 1 as time runs out
        const offset = progress * circumference;

        // Update circle progress
        timerCircle.style.strokeDashoffset = offset;
        
        // Update text
        timerText.textContent = `${seconds}s`;

        if (remaining <= 0) {
            clearInterval(gameState.countdownTimer);
            timerCircle.style.strokeDashoffset = circumference; // Hide circle
            timerText.textContent = '';
        }
    }, 100);
}

// Disable/enable difficulty buttons
function setDifficultyButtonsDisabled(disabled) {
    const buttons = document.querySelectorAll('[id="difficulty"]');
    buttons.forEach(btn => {
        btn.disabled = disabled;
    });
}

// Initialize next round
function nextRound() {
    gameState.round++;
    updateGameInfo();

    // Pick a random number 1-9 and operation
    let randomnumber = Math.floor(Math.random() * 9) + 1;
    let isBlack = Math.random() < 0.5;

    // Prevent negative totals
    if (!isBlack && randomnumber > gameState.answer) {
        if (gameState.answer === 0) {
            // Can't subtract, switch to add
            isBlack = true;
            randomnumber = Math.floor(Math.random() * 9) + 1;
        } else {
            // Reduce subtraction to current total
            randomnumber = gameState.answer;
        }
    }

    // Store for display
    gameState.currentRoundNumber = randomnumber;
    gameState.currentRoundIsBlack = isBlack;

    // Update running total
    if (isBlack) {
        gameState.answer += randomnumber;
    } else {
        gameState.answer -= randomnumber;
    }

    displayRound(randomnumber, isBlack);
}

// Display buttons and set timer to clear them
function displayRound(number, isBlack) {
    const settings = DIFFICULTY_SETTINGS[gameState.difficulty];
    const displayMs = settings.displayMs;

    // Show buttons
    createbutton(number, isBlack);
    if (settings.name === 'Medium') {
        // In medium mode, randomly mix black and white buttons
        createbutton(number, isBlack, true);
    }
    startCountdown(displayMs);

    // Clear buttons after displayMs and prompt for input
    gameState.displayTimer = setTimeout(() => {
        createbutton(0, true); // Clear buttons
        const answerInput = document.getElementById("answerbox");
        if (answerInput) {
            answerInput.focus();
        }

        // Hard mode: auto-fail if no answer given
        if (gameState.difficulty === 'hard') {
            const hardModeTimer = setTimeout(() => {
                if (!gameState.gameover && gameState.running) {
                    const el = document.getElementById("answerbox");
                    if (!el || el.value.trim() === "") {
                        // Auto-fail for hard mode
                        gameState.gameover = true;
                        gameState.running = false;

                        // Clear any remaining timers
                        if (gameState.displayTimer) clearTimeout(gameState.displayTimer);
                        if (gameState.countdownTimer) clearInterval(gameState.countdownTimer);

                        // Show game over message
                        showAlert(`Time's up! You didn't answer in time.\nThe answer was ${gameState.answer}.\n\nGame Over!`);
                        
                        const infoEl = document.getElementById("gameinfo");
                        if (infoEl) {
                            infoEl.textContent = 'Game Over! Choose a difficulty to restart.';
                            infoEl.style.fontSize = "1.2em";
                            infoEl.style.color = "#d9534f";
                        }
                        if (el) el.disabled = true;
                        
                        // Show intro section to allow difficulty selection
                        const introSection = document.getElementById("intro-section");
                        if (introSection) introSection.style.display = "block";
                        const tutorial = document.getElementById("tutorial");
                        if (tutorial) tutorial.style.display = "none";
                        const useranswer = document.getElementById("user-answer");
                        if (useranswer) useranswer.style.display = "none";
                        const timer = document.getElementById("timer");
                        if (timer) timer.style.display = "none";
                    }
                }
            }, 0); // Execute immediately after timer display ended
        }
    }, displayMs);
}

// Start game with chosen difficulty
function startGame(difficulty) {
    if (gameState.running) return; // Prevent multiple simultaneous games

    gameState.running = true;
    gameState.gameover = false;
    gameState.difficulty = difficulty;
    gameState.round = 0;
    gameState.answer = 0;
    const timer = document.getElementById("timer");
    if (timer) timer.style.display = "block";

    const useranswer = document.getElementById("user-answer");
    if(useranswer) useranswer.style.display = "block";

    // Hide intro section, show game section
    const introSection = document.getElementById("intro-section");
    const gameSection = document.getElementById("game-section");
    if (introSection) introSection.style.display = "none";
    if (gameSection) gameSection.style.display = "block";

    // Enable answer input
    const answerInput = document.getElementById("answerbox");
    if (answerInput) {
        answerInput.disabled = false;
        answerInput.value = "";
    }

    // Show "Ready Set Go" countdown
    const infoEl = document.getElementById("gameinfo");
    if (infoEl) {
        infoEl.style.fontSize = "3em";
        infoEl.style.fontWeight = "bold";
        infoEl.style.color = "#041526";
        infoEl.textContent = "Ready...";
    }

    // Ready countdown sequence
    setTimeout(() => {
        if (infoEl) infoEl.textContent = "Set...";
    }, 1000);

    setTimeout(() => {
        if (infoEl) infoEl.textContent = "Go!";
    }, 2000);

    // Start game after 3 seconds
    setTimeout(() => {
        if (infoEl) {
            infoEl.style.fontSize = "1.2em";
            infoEl.style.color = "initial";
        }
        nextRound();
        if (answerInput) answerInput.focus();
    }, 3000);
}

// Reset game to initial state
function resetGame() {
    gameState.running = false;
    gameState.gameover = false;
    gameState.round = 0;
    gameState.answer = 0;

    // Clear timers
    if (gameState.displayTimer) clearTimeout(gameState.displayTimer);
    if (gameState.countdownTimer) clearInterval(gameState.countdownTimer);

    // Clear UI
    createbutton(0, true);
    const timerCircle = document.getElementById("timer-progress");
    const timerText = document.getElementById("timer-text");
    if (timerCircle) timerCircle.style.strokeDashoffset = 0;
    if (timerText) timerText.textContent = '';
    const infoEl = document.getElementById("gameinfo");
    if (infoEl) infoEl.textContent = '';
    const answerInput = document.getElementById("answerbox");
    if (answerInput) {
        answerInput.disabled = true;
        answerInput.value = "";
    }

    // Re-enable difficulty buttons
    setDifficultyButtonsDisabled(false);
}

// Check answer on form submission
function handleAnswerSubmit(event) {
    event.preventDefault(); // Prevent form from refreshing page

    if (!gameState.running || gameState.gameover) return;

    const el = document.getElementById("answerbox");
    if (!el) return;

    const useranswer = el.value.trim();
    const userNum = parseInt(useranswer, 10);

    if (Number.isNaN(userNum) || userNum !== gameState.answer) {
        // Wrong answer
        showAlert(`Wrong Answer!\nThe correct answer is ${gameState.answer}.\n\nGame Over!`);
        gameState.gameover = true;
        gameState.running = false;

        // Clear timers
        if (gameState.displayTimer) clearTimeout(gameState.displayTimer);
        if (gameState.countdownTimer) clearInterval(gameState.countdownTimer);

        // Show restart option and re-enable difficulty buttons
        const infoEl = document.getElementById("gameinfo");
        if (infoEl) {
            infoEl.textContent = 'Game Over! Choose a difficulty to restart.';
            infoEl.style.fontSize = "1.2em";
            infoEl.style.color = "#d9534f";
        }
        if (el) el.disabled = true;
        
        // Show intro section to allow difficulty selection
        const introSection = document.getElementById("intro-section");
        if (introSection) introSection.style.display = "block";
        const tutorial = document.getElementById("tutorial");
        if (tutorial) tutorial.style.display = "none";
        const useranswer = document.getElementById("user-answer");
        if (useranswer) useranswer.style.display = "none";
        const timer = document.getElementById("timer");
        if (timer) timer.style.display = "none";
        
        return false;
    }

    // Correct answer
    el.value = "";
    createbutton(0, true); // Clear buttons immediately
    if (gameState.displayTimer) clearTimeout(gameState.displayTimer);
    if (gameState.countdownTimer) clearInterval(gameState.countdownTimer);
    
    // Reset timer circle
    const timerCircle = document.getElementById("timer-progress");
    const timerText = document.getElementById("timer-text");
    if (timerCircle) timerCircle.style.strokeDashoffset = 0;
    if (timerText) timerText.textContent = '';

    // Small delay before next round
    setTimeout(() => {
        nextRound();
    }, 500);

    return false;
}

// Set up form submission handler on page load
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (form) {
        form.onsubmit = handleAnswerSubmit;
    }
});

