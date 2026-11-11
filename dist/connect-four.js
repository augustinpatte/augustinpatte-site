(function () {
  'use strict';
  const game = document.querySelector('[data-c4]');
  if (!game) return;
  const engine = globalThis.ConnectFourEngine;
  const fr = document.documentElement.lang === 'fr';
  const text = (en, french) => fr ? french : en;
  const columns = [...game.querySelectorAll('[data-column]')];
  const status = game.querySelector('.c4-status');
  const starter = game.querySelector('[data-starter]');
  const resetButton = game.querySelector('[data-reset]');
  const levels = [...game.querySelectorAll('[data-level]')];
  let board, turn, finished, level = 'easy', worker = null, version = 0, winners = [], latest = -1;
  const legal = c => board[35 + c] === 0;
  function render() {
    game.dataset.turn = turn;
    game.dataset.finished = String(finished);
    game.setAttribute('aria-busy', String(!finished && turn === 2));
    columns.forEach((button, c) => {
      button.disabled = finished || turn !== 1 || !legal(c);
      const cells = [...button.querySelectorAll('.c4-cell')];
      for (let row = 0; row < 6; row++) {
        const i = (5 - row) * 7 + c, cell = cells[row];
        cell.dataset.player = board[i];
        cell.classList.toggle('c4-win', winners.includes(i));
        cell.classList.toggle('c4-last', i === latest);
        cell.style.setProperty('--fall', row + 1);
      }
      const discs = [];
      for (let r = 0; r < 6; r++) if (board[r * 7 + c]) discs.push(board[r * 7 + c] === 1 ? text('you', 'toi') : text('computer', 'ordinateur'));
      button.setAttribute('aria-label', `${text('Column', 'Colonne')} ${c + 1}. ${discs.length ? text('Bottom to top: ', 'De bas en haut : ') + discs.join(', ') : text('Empty', 'Vide')}. ${!legal(c) ? text('Full.', 'Pleine.') : text('Drop a disc.', 'Jouer un pion.')}`);
    });
  }
  function stopWorker() { if (worker) { worker.terminate(); worker = null; } }
  function play(c, player) {
    if (finished || player !== turn || !Number.isInteger(c) || c < 0 || c > 6 || !legal(c)) return;
    let row = 0;
    while (board[row * 7 + c]) row++;
    latest = row * 7 + c; board[latest] = player;
    winners = engine.winningCells(board, player);
    if (winners.length) {
      finished = true;
      status.textContent = player === 1 ? text('You win. Well played.', 'Tu as gagné. Bien joué.') : text('The computer wins. Rematch?', 'L’ordinateur gagne. Une revanche ?');
    } else if (!engine.legalMoves(board).length) {
      finished = true; status.textContent = text('A draw. One more?', 'Match nul. On remet ça ?');
    } else {
      turn = 3 - player;
      status.textContent = turn === 1 ? text('Your turn. Choose a column.', 'À toi. Choisis une colonne.') : text('The computer is thinking…', 'L’ordinateur réfléchit…');
    }
    render();
    if (!finished && turn === 2) computerTurn();
  }
  async function fallback(id, snapshot) {
    stopWorker();
    try {
      const answer = await engine.chooseMoveAsync(snapshot, { level }, () => version !== id);
      if (answer && version === id) play(answer.column, 2);
    } catch (error) {
      if (version !== id) return;
      finished = true;
      status.textContent = text('The game could not continue. Start a new game.', 'La partie n’a pas pu continuer. Lance une nouvelle partie.');
      render();
    }
  }
  function computerTurn() {
    const id = version, snapshot = board.slice();
    // Yield a frame so the placed disc and thinking state appear immediately.
    setTimeout(() => {
      if (version !== id) return;
      if (typeof Worker === 'undefined') { fallback(id, snapshot); return; }
      try {
        stopWorker();
        worker = new Worker('/connect-four-worker.js');
        worker.onmessage = event => {
          if (version !== id || event.data.id !== id) return;
          const { column, error } = event.data;
          if (error || !Number.isInteger(column) || column < 0 || column > 6 || !legal(column)) { fallback(id, snapshot); return; }
          stopWorker(); play(column, 2);
        };
        worker.onerror = event => { event.preventDefault(); if (version === id) fallback(id, snapshot); };
        worker.postMessage({ board: snapshot, level, id });
      } catch (error) { fallback(id, snapshot); }
    }, 120);
  }
  function reset() {
    version++; stopWorker();
    board = Array(42).fill(0); turn = Number(starter.value); finished = false; winners = []; latest = -1;
    levels.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.level === level)));
    status.textContent = turn === 1 ? text('Your turn. Choose a column.', 'À toi. Choisis une colonne.') : text('The computer is thinking…', 'L’ordinateur réfléchit…');
    render(); if (turn === 2) computerTurn();
  }
  columns.forEach((button, c) => button.addEventListener('click', () => play(c, 1)));
  game.querySelector('.c4-board').addEventListener('keydown', event => {
    if (finished || turn !== 1) return;
    if (/^[1-7]$/.test(event.key)) { event.preventDefault(); play(Number(event.key) - 1, 1); return; }
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const open = columns.filter(button => !button.disabled);
    const current = open.indexOf(document.activeElement);
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? open.length - 1 : (current + (event.key === 'ArrowLeft' ? -1 : 1) + open.length) % open.length;
    open[index]?.focus();
  });
  levels.forEach(button => button.addEventListener('click', () => { if (level !== button.dataset.level) { level = button.dataset.level; reset(); } }));
  starter.addEventListener('change', reset);
  resetButton.addEventListener('click', reset);
  window.addEventListener('pagehide', () => { version++; stopWorker(); });
  window.addEventListener('pageshow', event => { if (event.persisted && !finished && turn === 2) computerTurn(); });
  reset();
})();
