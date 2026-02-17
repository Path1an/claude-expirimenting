const WINNING_SCORE = 42;
const DIE_FACES = ['\u2680', '\u2681', '\u2682', '\u2683', '\u2684', '\u2685'];

let scores, turnScore, activePlayer, gameOver, numPlayers = 2;

const $ = (id) => document.getElementById(id);

function buildBoard(count) {
  const board = $('board');
  board.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const div = document.createElement('div');
    div.className = 'player';
    div.id = `p${i}`;
    div.innerHTML = `
      <h2>Player ${i + 1}</h2>
      <div class="score" id="score${i}">0</div>
      <div class="turn-score">Current: <span id="turn${i}">0</span></div>
    `;
    board.appendChild(div);
  }
}

function init() {
  scores = new Array(numPlayers).fill(0);
  turnScore = 0;
  activePlayer = 0;
  gameOver = false;

  buildBoard(numPlayers);
  $('p0').classList.add('active');
  $('dice').textContent = '\uD83C\uDFB2';
  $('dice').classList.remove('rolling');
  $('msg').textContent = '';
  $('roll-btn').disabled = false;
  $('hold-btn').disabled = false;
}

function switchPlayer() {
  $(`turn${activePlayer}`).textContent = '0';
  turnScore = 0;
  $(`p${activePlayer}`).classList.remove('active');
  activePlayer = (activePlayer + 1) % numPlayers;
  $(`p${activePlayer}`).classList.add('active');
}

function roll() {
  if (gameOver) return;

  $('roll-btn').disabled = true;
  $('hold-btn').disabled = true;
  $('dice').classList.add('rolling');

  setTimeout(() => {
    const die = Math.floor(Math.random() * 6) + 1;
    $('dice').textContent = DIE_FACES[die - 1];
    $('dice').classList.remove('rolling');

    if (die === 1) {
      $('msg').textContent = `Rolled a 1! Player ${activePlayer + 1} loses their turn.`;
      switchPlayer();
    } else {
      turnScore += die;
      $(`turn${activePlayer}`).textContent = turnScore;
      $('msg').textContent = '';
    }

    $('roll-btn').disabled = false;
    $('hold-btn').disabled = false;
  }, 350);
}

function hold() {
  if (gameOver) return;

  scores[activePlayer] += turnScore;
  $(`score${activePlayer}`).textContent = scores[activePlayer];
  $(`turn${activePlayer}`).textContent = '0';

  if (scores[activePlayer] >= WINNING_SCORE) {
    gameOver = true;
    $('msg').textContent = `Player ${activePlayer + 1} wins!`;
    $(`p${activePlayer}`).classList.add('winner');
    $('roll-btn').disabled = true;
    $('hold-btn').disabled = true;
    return;
  }

  switchPlayer();
}

$('roll-btn').addEventListener('click', roll);
$('hold-btn').addEventListener('click', hold);
$('new-btn').addEventListener('click', init);

document.querySelectorAll('.ps-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ps-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    numPlayers = parseInt(btn.dataset.players);
    init();
  });
});

init();
