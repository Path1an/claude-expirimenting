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
  return `<svg width="80" height="80" viewBox="5 5 80 80">
    ${dots}
  </svg>`;
}

let scores, turnScore, activePlayer, gameOver, numPlayers = 2, gameGen = 0;
let playerNames = [];
const botPlayers = new Set();

const $ = (id) => document.getElementById(id);

// --- Particle Background ---

function createParticles() {
  const canvas = document.createElement('canvas');
  canvas.id = 'particle-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = Array.from({ length: 40 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 1,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    alpha: Math.random() * 0.3 + 0.1
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(83, 216, 251, ${p.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
}

// --- 3D Dice Cube ---

const FACE_ROTATIONS = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: -90 },
  3: { x: -90, y: 0 },
  4: { x: 90, y: 0 },
  5: { x: 0, y: 90 },
  6: { x: 0, y: 180 },
};

function buildDiceCube() {
  const dice = $('dice');
  dice.innerHTML = '';
  dice.classList.remove('rolling');
  const cube = document.createElement('div');
  cube.className = 'dice-cube';
  cube.id = 'dice-cube';
  for (let i = 1; i <= 6; i++) {
    const face = document.createElement('div');
    face.className = `dice-face face-${i}`;
    face.innerHTML = dieSVG(i);
    cube.appendChild(face);
  }
  dice.appendChild(cube);
}

// Which faces are edge-on (perpendicular) for each landing face
const PERP_FACES = {
  1: [2, 3, 4, 5],
  2: [1, 3, 4, 6],
  3: [1, 2, 5, 6],
  4: [1, 2, 5, 6],
  5: [1, 3, 4, 6],
  6: [2, 3, 4, 5],
};

function showAllFaces() {
  for (let i = 1; i <= 6; i++) {
    const face = $('dice-cube').querySelector(`.face-${i}`);
    if (face) face.style.visibility = '';
  }
}

function hideEdgeFaces(n) {
  for (const f of PERP_FACES[n]) {
    const face = $('dice-cube').querySelector(`.face-${f}`);
    if (face) face.style.visibility = 'hidden';
  }
}

function showDiceFace(n) {
  const cube = $('dice-cube');
  const dice = $('dice');
  dice.classList.remove('rolling');
  // Force reflow so transition kicks in after animation removal
  void cube.offsetHeight;
  const { x, y } = FACE_ROTATIONS[n];
  const spinsX = (Math.floor(Math.random() * 2) + 2) * 360;
  const spinsY = (Math.floor(Math.random() * 2) + 2) * 360;
  cube.style.transform = `rotateX(${spinsX + x}deg) rotateY(${spinsY + y}deg)`;
  // Hide perpendicular faces after the transition finishes
  cube.addEventListener('transitionend', () => hideEdgeFaces(n), { once: true });
}

// --- Micro-Animations ---

function pulseElement(el) {
  el.style.transform = 'scale(1.2)';
  setTimeout(() => { el.style.transform = 'scale(1)'; }, 150);
}

// --- Confetti ---

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

// --- Stats (localStorage) ---

function loadStats() {
  try {
    return JSON.parse(localStorage.getItem('pigDiceStats')) || {};
  } catch { return {}; }
}

function saveStats(stats) {
  localStorage.setItem('pigDiceStats', JSON.stringify(stats));
}

function recordWin(winnerName) {
  const stats = loadStats();
  for (const key of Object.keys(stats)) {
    if (stats[key].lastWin) {
      stats[key].streak = 0;
    }
    stats[key].lastWin = false;
  }
  if (!stats[winnerName]) {
    stats[winnerName] = { wins: 0, streak: 0, lastWin: false };
  }
  stats[winnerName].wins++;
  stats[winnerName].streak++;
  stats[winnerName].lastWin = true;
  saveStats(stats);
}

function clearStats() {
  localStorage.removeItem('pigDiceStats');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderStats() {
  const stats = loadStats();
  const body = $('stats-body');
  const entries = Object.entries(stats).sort((a, b) => b[1].wins - a[1].wins);

  if (entries.length === 0) {
    body.innerHTML = '<p class="no-stats">No games played yet.</p>';
    return;
  }

  body.innerHTML = `<table>
    <thead><tr><th>Player</th><th>Wins</th><th>Streak</th></tr></thead>
    <tbody>${entries.map(([name, s]) =>
      `<tr><td>${escapeHtml(name)}</td><td>${s.wins}</td><td>${s.streak}</td></tr>`
    ).join('')}</tbody>
  </table>`;
}

// --- Bot Logic ---

function isBot(playerIndex) {
  return botPlayers.has(playerIndex);
}

function buildBotSelect() {
  const container = $('bot-select');
  container.innerHTML = '';
  for (let i = 0; i < numPlayers; i++) {
    const btn = document.createElement('button');
    btn.className = 'bot-btn' + (botPlayers.has(i) ? ' is-bot' : '');
    btn.textContent = botPlayers.has(i) ? `P${i + 1}: Bot` : `P${i + 1}: Human`;
    btn.addEventListener('click', () => {
      if (botPlayers.has(i)) {
        botPlayers.delete(i);
      } else {
        botPlayers.add(i);
      }
      // Update name if it was still a default
      const defaultHuman = `Player ${i + 1}`;
      const defaultBot = `Bot ${i + 1}`;
      if (playerNames[i] === defaultHuman || playerNames[i] === defaultBot) {
        playerNames[i] = botPlayers.has(i) ? defaultBot : defaultHuman;
      }
      buildBotSelect();
      init();
    });
    container.appendChild(btn);
  }
}

// --- Custom Player Names ---

function startNameEdit(h2) {
  const idx = parseInt(h2.dataset.index);
  const input = document.createElement('input');
  input.type = 'text';
  input.value = playerNames[idx];
  input.maxLength = 12;
  input.className = 'name-input';
  input.style.cssText = 'width:80%;font-size:1.1rem;text-align:center;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:6px;color:#eee;padding:0.2rem;outline:none;font-family:inherit;';

  h2.replaceWith(input);
  input.focus();
  input.select();

  function commit() {
    const val = input.value.trim() || (isBot(idx) ? `Bot ${idx + 1}` : `Player ${idx + 1}`);
    playerNames[idx] = val;
    const newH2 = document.createElement('h2');
    newH2.className = 'player-name';
    newH2.dataset.index = idx;
    newH2.textContent = val;
    newH2.addEventListener('click', () => startNameEdit(newH2));
    input.replaceWith(newH2);
  }

  input.addEventListener('blur', commit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') input.blur();
    if (e.key === 'Escape') { input.value = playerNames[idx]; input.blur(); }
  });
}

// --- Board ---

function buildBoard(count) {
  const board = $('board');
  board.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const div = document.createElement('div');
    div.className = 'player' + (isBot(i) ? ' bot' : '');
    div.id = `p${i}`;
    div.innerHTML = `
      <h2 class="player-name" data-index="${i}">${escapeHtml(playerNames[i])}</h2>
      <div class="score" id="score${i}">0</div>
      <div class="turn-score">Current: <span id="turn${i}">0</span></div>
    `;
    board.appendChild(div);
  }
  // Attach name edit listeners
  document.querySelectorAll('.player-name').forEach(h2 => {
    h2.addEventListener('click', () => startNameEdit(h2));
  });
}

// --- Game Init ---

function init() {
  gameGen++;
  scores = new Array(numPlayers).fill(0);
  turnScore = 0;
  activePlayer = 0;
  gameOver = false;

  // Populate default names if needed
  if (playerNames.length !== numPlayers) {
    playerNames = Array.from({ length: numPlayers }, (_, i) =>
      isBot(i) ? `Bot ${i + 1}` : `Player ${i + 1}`
    );
  }

  buildBoard(numPlayers);
  buildBotSelect();
  $('p0').classList.add('active');
  buildDiceCube();
  $('msg').textContent = '';
  $('msg').classList.remove('win-msg');
  const oldCanvas = document.querySelector('.confetti-canvas');
  if (oldCanvas) oldCanvas.remove();
  if (isBot(0)) {
    $('roll-btn').disabled = true;
    $('hold-btn').disabled = true;
    setTimeout(botTurn, 600);
  } else {
    $('roll-btn').disabled = false;
    $('hold-btn').disabled = false;
  }
}

// --- Turn Management ---

function switchPlayer() {
  $(`turn${activePlayer}`).textContent = '0';
  turnScore = 0;
  $(`p${activePlayer}`).classList.remove('active');
  activePlayer = (activePlayer + 1) % numPlayers;
  $(`p${activePlayer}`).classList.add('active');
  if (isBot(activePlayer) && !gameOver) {
    $('roll-btn').disabled = true;
    $('hold-btn').disabled = true;
    setTimeout(botTurn, 600);
  } else {
    $('roll-btn').disabled = false;
    $('hold-btn').disabled = false;
  }
}

function botTurn() {
  if (gameOver || !isBot(activePlayer)) return;
  const gen = gameGen;
  $('roll-btn').disabled = true;
  $('hold-btn').disabled = true;

  function botStep() {
    if (gameOver || gen !== gameGen || !isBot(activePlayer)) return;

    const gap = WINNING_SCORE - scores[activePlayer];
    const canWin = turnScore >= gap;
    const bestOpponent = Math.max(...scores.filter((_, i) => i !== activePlayer));
    const threshold = canWin ? 0 : Math.floor(Math.random() * 14) + 15 + Math.max(0, (bestOpponent - scores[activePlayer]) / 4);
    if (turnScore >= threshold || canWin) {
      scores[activePlayer] += turnScore;
      $(`score${activePlayer}`).textContent = scores[activePlayer];
      pulseElement($(`score${activePlayer}`));
      $(`turn${activePlayer}`).textContent = '0';

      if (scores[activePlayer] >= WINNING_SCORE) {
        gameOver = true;
        $('msg').textContent = `${playerNames[activePlayer]} wins!`;
        $('msg').classList.add('win-msg');
        $(`p${activePlayer}`).classList.add('winner');
        recordWin(playerNames[activePlayer]);
        launchConfetti();
        return;
      }

      switchPlayer();
      return;
    }

    showAllFaces();
  $('dice').classList.add('rolling');
    setTimeout(() => {
      if (gen !== gameGen || !isBot(activePlayer)) return;
      const die = Math.floor(Math.random() * 6) + 1;
      showDiceFace(die);

      if (die === 1) {
        $('msg').textContent = `${playerNames[activePlayer]} rolled a 1! Lost their turn.`;
        switchPlayer();
      } else {
        turnScore += die;
        $(`turn${activePlayer}`).textContent = turnScore;
        pulseElement($(`turn${activePlayer}`));
        $('msg').textContent = `${playerNames[activePlayer]} rolled a ${die}...`;
        setTimeout(botStep, 800);
      }
    }, 350);
  }

  $('msg').textContent = `${playerNames[activePlayer]} is thinking...`;
  setTimeout(botStep, 800);
}

// --- Human Actions ---

function roll() {
  if (gameOver || isBot(activePlayer)) return;

  $('roll-btn').disabled = true;
  $('hold-btn').disabled = true;
  showAllFaces();
  $('dice').classList.add('rolling');

  setTimeout(() => {
    const die = Math.floor(Math.random() * 6) + 1;
    showDiceFace(die);

    if (die === 1) {
      $('msg').textContent = `Rolled a 1! ${playerNames[activePlayer]} loses their turn.`;
      switchPlayer();
    } else {
      turnScore += die;
      $(`turn${activePlayer}`).textContent = turnScore;
      pulseElement($(`turn${activePlayer}`));
      $('msg').textContent = '';
      $('roll-btn').disabled = false;
      $('hold-btn').disabled = false;
    }
  }, 350);
}

function hold() {
  if (gameOver || isBot(activePlayer)) return;

  scores[activePlayer] += turnScore;
  $(`score${activePlayer}`).textContent = scores[activePlayer];
  pulseElement($(`score${activePlayer}`));
  $(`turn${activePlayer}`).textContent = '0';

  if (scores[activePlayer] >= WINNING_SCORE) {
    gameOver = true;
    $('msg').textContent = `${playerNames[activePlayer]} wins!`;
    $('msg').classList.add('win-msg');
    $(`p${activePlayer}`).classList.add('winner');
    $('roll-btn').disabled = true;
    $('hold-btn').disabled = true;
    recordWin(playerNames[activePlayer]);
    launchConfetti();
    return;
  }

  switchPlayer();
}

// --- Event Listeners ---

$('roll-btn').addEventListener('click', roll);
$('hold-btn').addEventListener('click', hold);
$('new-btn').addEventListener('click', init);

document.querySelectorAll('.ps-btn[data-players]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ps-btn[data-players]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    numPlayers = parseInt(btn.dataset.players);
    for (const id of [...botPlayers]) {
      if (id >= numPlayers) botPlayers.delete(id);
    }
    playerNames = []; // Reset names on player count change
    init();
  });
});

// Stats modal
$('stats-btn').addEventListener('click', () => {
  renderStats();
  $('stats-modal').classList.remove('hidden');
});

$('close-stats-btn').addEventListener('click', () => {
  $('stats-modal').classList.add('hidden');
});

$('clear-stats-btn').addEventListener('click', () => {
  clearStats();
  renderStats();
});

$('stats-modal').addEventListener('click', (e) => {
  if (e.target === $('stats-modal')) {
    $('stats-modal').classList.add('hidden');
  }
});

// --- Start ---

createParticles();
init();
