const board = document.getElementById('game-board');
const difficultySelect = document.getElementById('difficulty');
const startButton = document.getElementById('start-game');
const moveCount = document.getElementById('move-count');
const timerDisplay = document.getElementById('timer');
const gameOverText = document.getElementById('game-over');

const flipSound = document.getElementById('flip-sound');
const matchSound = document.getElementById('match-sound');
const wrongSound = document.getElementById('wrong-sound');

const symbols = ['🍎','🍌','🍇','🍉','🥝','🍓','🍒','🍍','🥑','🍋'];

const difficulties = {
  easy: { pairs: 4, columns: 4 },
  medium: { pairs: 8, columns: 4 },
  hard: { pairs: 10, columns: 5 }
};

let cards = [];
let firstCard = null;
let secondCard = null;
let moves = 0;
let matches = 0;
let timer = 0;
let timerInterval;

startButton.addEventListener('click', startGame);

/* Game Setup */
function startGame() {
  resetGame();

  const level = difficulties[difficultySelect.value];
  board.style.gridTemplateColumns = `repeat(${level.columns}, 100px)`;

  const selectedSymbols = symbols.slice(0, level.pairs);
  cards = [...selectedSymbols, ...selectedSymbols];

  shuffle(cards);
  createBoard();
  startTimer();
}

/* Board Creation */
function createBoard() {
  cards.forEach(symbol => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.symbol = symbol;
    card.textContent = '';
    card.addEventListener('click', () => flipCard(card));
    board.appendChild(card);
  });
}

/* Card Logic */
function flipCard(card) {
  if (card === firstCard || card.classList.contains('flipped')) return;

  flipSound.play();
  card.classList.add('flipped');
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
    matchSound.play();
    matches += 2;
    resetTurn();
    checkGameOver();
  } else {
    wrongSound.play();
    setTimeout(() => {
      firstCard.textContent = '';
      secondCard.textContent = '';
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      resetTurn();
    }, 800);
  }
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
}

/* Timer */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

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

/* Game Over Display */
function checkGameOver() {
  if (matches === cards.length) {
    stopTimer();
    gameOverText.textContent = `🎉 Game Over! Moves: ${moves}, Time: ${timer}s`;
    gameOverText.classList.remove('hidden');
  }
}

/* Reset */
function resetGame() {
  board.innerHTML = '';
  moves = 0;
  matches = 0;
  firstCard = null;
  secondCard = null;
  moveCount.textContent = 0;
  gameOverText.classList.add('hidden');
  stopTimer();
}

/* Game Schuffle */
const shuffle = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};
