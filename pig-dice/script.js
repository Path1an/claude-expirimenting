const WINNING_SCORE = 100;
const DIE_FACES = ['\u2680', '\u2681', '\u2682', '\u2683', '\u2684', '\u2685'];

let scores, turnScore, activePlayer, gameOver;

const $ = (id) => document.getElementById(id);

function init() {
  scores = [0, 0];
  turnScore = 0;
  activePlayer = 0;
  gameOver = false;

  $('score0').textContent = '0';
  $('score1').textContent = '0';
  $('turn0').textContent = '0';
  $('turn1').textContent = '0';
  $('dice').textContent = '\uD83C\uDFB2';
  $('dice').classList.remove('rolling');
  $('msg').textContent = '';
  $('roll-btn').disabled = false;
  $('hold-btn').disabled = false;
  $('p0').classList.add('active');
  $('p1').classList.remove('active');
  $('p0').classList.remove('winner');
  $('p1').classList.remove('winner');
}

function switchPlayer() {
  $(`turn${activePlayer}`).textContent = '0';
  turnScore = 0;
  $(`p${activePlayer}`).classList.remove('active');
  activePlayer = 1 - activePlayer;
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

init();
