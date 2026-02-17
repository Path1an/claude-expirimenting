const WINNING_SCORE = 42;

function dieSVG(n) {
  const pips = {
    1: [[45,45]],
    2: [[65,25],[25,65]],
    3: [[65,25],[45,45],[25,65]],
    4: [[25,25],[65,25],[25,65],[65,65]],
    5: [[25,25],[65,25],[45,45],[25,65],[65,65]],
    6: [[25,25],[65,25],[25,45],[65,45],[25,65],[65,65]]
  };
  const dots = pips[n].map(([x,y]) =>
    `<circle cx="${x}" cy="${y}" r="7" fill="#222"/>`
  ).join('');
  return `<svg width="90" height="90" viewBox="0 0 90 90">
    <defs>
      <linearGradient id="dg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fff"/>
        <stop offset="100%" stop-color="#ccc"/>
      </linearGradient>
      <filter id="ds"><feDropShadow dx="3" dy="3" stdDeviation="3" flood-opacity="0.4"/></filter>
    </defs>
    <rect x="3" y="3" width="84" height="84" rx="14" fill="url(#dg)" filter="url(#ds)" stroke="#aaa" stroke-width="1"/>
    ${dots}
  </svg>`;
}

let scores, turnScore, activePlayer, gameOver, numPlayers = 2;

const $ = (id) => document.getElementById(id);

function launchConfetti() {
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#e94560', '#53d8fb', '#ffd369', '#0f3460', '#ff6b6b', '#48dbfb', '#ff9ff3', '#54a0ff'];
  const pieces = [];

  for (let i = 0; i < 150; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: Math.random() * 4 - 2,
      vy: Math.random() * 4 + 2,
      rot: Math.random() * 360,
      rv: Math.random() * 8 - 4
    });
  }

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of pieces) {
      p.x += p.vx;
      p.vy += 0.05;
      p.y += p.vy;
      p.rot += p.rv;
      if (p.y < canvas.height + 20) alive = true;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    frame++;
    if (alive && frame < 300) {
      requestAnimationFrame(draw);
    } else {
      canvas.remove();
    }
  }
  draw();
}

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
  $('dice').innerHTML = '🎲';
  $('dice').classList.remove('rolling');
  $('msg').textContent = '';
  $('msg').classList.remove('win-msg');
  const oldCanvas = document.querySelector('.confetti-canvas');
  if (oldCanvas) oldCanvas.remove();
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
    $('dice').innerHTML = dieSVG(die);
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
    $('msg').classList.add('win-msg');
    $(`p${activePlayer}`).classList.add('winner');
    $('roll-btn').disabled = true;
    $('hold-btn').disabled = true;
    launchConfetti();
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
