/* Elements */
const board = document.getElementById("game-board");
const difficultySelect = document.getElementById("difficulty");
const startButton = document.getElementById("start-game");
const moveCount = document.getElementById("move-count");
const timerDisplay = document.getElementById("timer");
const gameOverText = document.getElementById("game-over");

const flipSound = document.getElementById("flip-sound");
const matchSound = document.getElementById("match-sound");
const wrongSound = document.getElementById("wrong-sound");

const symbols = ["🍎", "🍌", "🍇", "🍉", "🥝", "🍓", "🍒", "🍍", "🥑", "🍋"];
const difficulties = {
  easy: { pairs: 4, columns: 4 },
  medium: { pairs: 8, columns: 4 },
  hard: { pairs: 10, columns: 5 },
};

let cards = [];
let firstCard = null;
let secondCard = null;
let moves = 0;
let matches = 0;
let gameStarted = false;
let timer = 0;
let timerInterval = null;
let lockBoard = false;
let restoringFromSession = true;


startButton.addEventListener("click", startGame);
difficultySelect.addEventListener("change", initBoard);

/* Storage Keys */
const SESSION_KEY = "memoryGameState";
const LOCAL_TOTAL_MOVES_KEY = "memoryGameTotalMoves";

/* Create Board */
function initBoard() {
  const savedState = JSON.parse(sessionStorage.getItem(SESSION_KEY));

if (restoringFromSession && savedState?.difficulty) {
  difficultySelect.value = savedState.difficulty;
}

  stopTimer();
  timerInterval = null;
  gameStarted = false;

  const level = difficulties[difficultySelect.value];

  board.style.gridTemplateColumns = `repeat(${level.columns}, 100px)`;

  const selectedSymbols = symbols.slice(0, level.pairs);
  cards = [...selectedSymbols, ...selectedSymbols];
  shuffle(cards);

  board.innerHTML = "";

  if (savedState && savedState.difficulty === difficultySelect.value) {
    moves = savedState.moves;
    matches = savedState.matches;
    timer = savedState.timer;
    firstCard = null;
    secondCard = null;
    lockBoard = false;

    const cardElements = [];

    savedState.cards.forEach((cardData) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.dataset.symbol = cardData.symbol;

      if (cardData.flipped) {
        card.classList.add("flipped");
        card.textContent = cardData.symbol;
      }

      card.addEventListener("click", () => flipCard(card));
      board.appendChild(card);
      cardElements.push(card);
    });

      if (savedState.currentFlipped?.length === 1) {
    firstCard = cardElements.find(c => c.dataset.symbol === savedState.currentFlipped[0]);
  } else if (savedState.currentFlipped?.length === 2) {
    firstCard = cardElements.find(c => c.dataset.symbol === savedState.currentFlipped[0]);
    secondCard = cardElements.find(c => c.dataset.symbol === savedState.currentFlipped[1]);
    lockBoard = true; 
  }

  } else {
    cards.forEach((symbol) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.dataset.symbol = symbol;
      card.textContent = "";
      card.addEventListener("click", () => flipCard(card));
      board.appendChild(card);
    });

    moves = 0;
    matches = 0;
    timer = 0;
    gameStarted = false;
  }

  moveCount.textContent = moves;
  timerDisplay.textContent = formatTime(timer);
  gameOverText.style.display = "none";
  restoringFromSession = false;

}

function clearCurrentGameState() {
  sessionStorage.removeItem(SESSION_KEY);

  firstCard = null;
  secondCard = null;
  moves = 0;
  matches = 0;
  timer = 0;
  lockBoard = false;
  gameStarted = false;

  // Reset visuals
  moveCount.textContent = moves;
  timerDisplay.textContent = formatTime(timer);
  gameOverText.style.display = "none";
}

/* Start Game */
function startGame() {
  if (matches === cards.length && cards.length > 0) {
    clearCurrentGameState();
    initBoard();
  }

  // 🔑 Restore UI
  document.getElementById("moves-time-container").style.display = "flex";

  if (gameStarted) return;

  gameStarted = true;
  startTimer();
}


/* Card Logic */
function flipCard(card) {
  if (
    !gameStarted ||
    lockBoard ||
    card === firstCard ||
    card.classList.contains("flipped")
  )
    return;

  flipSound.currentTime = 0;
  flipSound.play();

  card.classList.add("flipped");
  card.textContent = card.dataset.symbol;

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  lockBoard = true;
  moves++;
  incrementTotalMoves();
  moveCount.textContent = moves;

  checkMatch();
  saveState();
}

function checkMatch() {
  if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
    matchSound.currentTime = 0;
    matchSound.play();
    matches += 2;
    resetTurn();
    lockBoard = false;
    checkGameOver();
    saveState();
  } else {
    wrongSound.currentTime = 0;
    wrongSound.play();
    setTimeout(() => {
      firstCard.textContent = "";
      secondCard.textContent = "";
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      resetTurn();
      lockBoard = false;
      saveState();
    }, 800);
  }
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
}

/* Timer */
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    timer++;
    timerDisplay.textContent = formatTime(timer);
    saveState();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/* Game Over */
function checkGameOver() {
  if (matches === cards.length) {
    gameStarted = false;
    stopTimer();
    gameStarted = false;
    timerInterval = null;

    document.getElementById("moves-time-container").style.display = "none";
    gameOverText.innerHTML = `☁️ Game Over ☁️ <br>Moves: ${moves}, Time: ${formatTime(timer)}`;
    gameOverText.style.display = "block";
    gameOverText.style.textAlign = "center";

    saveState();
  }
}

/* Reset */
function resetGame() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  gameStarted = false;

  moveCount.textContent = moves;
  timerDisplay.textContent = formatTime(timer);

  document.getElementById("moves-time-container").style.display = "flex";
  gameOverText.style.display = "none";

  saveState();
}

/* Shuffle */
const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

/* Session Storage */

function saveState() {
  const cardData = Array.from(document.querySelectorAll(".card")).map(
    (card) => ({
      symbol: card.dataset.symbol,
      flipped: card.classList.contains("flipped"),
    }),
  );

  const currentFlipped = [
    firstCard?.dataset.symbol,
    secondCard?.dataset.symbol,
  ].filter(Boolean);

  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      difficulty: difficultySelect.value,
      moves,
      matches,
      timer,
      cards: cardData,
      currentFlipped,
    }),
  );
}

/* Local Storage */
function incrementTotalMoves() {
  let total = parseInt(localStorage.getItem(LOCAL_TOTAL_MOVES_KEY) || "0");
  total++;
  localStorage.setItem(LOCAL_TOTAL_MOVES_KEY, total);
}

/* Init. */
initBoard();
