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

const symbols = ["🍎","🍌","🍇","🍉","🥝","🍓","🍒","🍍","🥑","🍋"];
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

startButton.addEventListener("click", startGame);
difficultySelect.addEventListener("change", initBoard);

/* Create Board */
function initBoard() {
  const level = difficulties[difficultySelect.value];
  board.style.gridTemplateColumns = `repeat(${level.columns}, 100px)`;

  const selectedSymbols = symbols.slice(0, level.pairs);
  cards = [...selectedSymbols, ...selectedSymbols];
  shuffle(cards);

  board.innerHTML = "";

  cards.forEach(symbol => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.symbol = symbol;
    card.textContent = "";
    board.appendChild(card);
  });

  resetGame();
}

/* Start Game*/
function startGame() {
  resetGame();
  gameStarted = true;
  startTimer(); 

  const allCards = document.querySelectorAll(".card");
  allCards.forEach(card => {
    card.addEventListener("click", () => flipCard(card));
  });
}

/* Card Logic */
function flipCard(card) {
  if (!gameStarted || card === firstCard || card.classList.contains("flipped")) return;

  flipSound.currentTime = 0;
  flipSound.play();

  card.classList.add("flipped");
  card.textContent = card.dataset.symbol;

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  moves++;
  moveCount.textContent = moves;

  checkMatch();
}

function checkMatch() {
  if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
    matchSound.currentTime = 0;
    matchSound.play();
    matches += 2;
    resetTurn();
    checkGameOver();
  } else {
    wrongSound.currentTime = 0;
    wrongSound.play();
    setTimeout(() => {
      firstCard.textContent = "";
      secondCard.textContent = "";
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      resetTurn();
    }, 800);
  }
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
}

/* Timer */
function startTimer() {
  timer = 0;
  timerDisplay.textContent = formatTime(timer);

  timerInterval = setInterval(() => {
    timer++;
    timerDisplay.textContent = formatTime(timer);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
}

/* Game Over */
function checkGameOver() {
  if (matches === cards.length) {
    gameStarted = false;
    stopTimer();

    const movesTime = document.getElementById("moves-time-container");
    movesTime.style.display = "none";

    gameOverText.innerHTML = `☁️ Game Over ☁️ <br>Moves: ${moves}, Time: ${formatTime(timer)}`;
    gameOverText.style.display = "block";
    gameOverText.style.textAlign = "center";
  }
}

/* Reset */
function resetGame() {
  firstCard = null;
  secondCard = null;
  moves = 0;
  matches = 0;
  moveCount.textContent = 0;
  timerDisplay.textContent = "00:00";
  stopTimer();

  const movesTime = document.getElementById("moves-time-container");
  movesTime.style.display = "flex";

  gameOverText.style.display = "none";
  gameStarted = false;
}

/* Shuffle */
const shuffle = array => {
  for (let i = array.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
initBoard();
